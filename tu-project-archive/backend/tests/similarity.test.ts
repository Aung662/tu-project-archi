import { describe, it, expect } from 'vitest';
import { normalizeTitle, contentTokens } from '../src/modules/search/normalize.js';
import { trigrams, levenshtein, scoreNormalized } from '../src/modules/search/similarity.js';

describe('normalizeTitle', () => {
  it('lowercases, trims, collapses whitespace, strips punctuation', () => {
    expect(normalizeTitle('  IoT-Based   Smart, Agriculture!  ')).toBe('iot based smart agriculture');
  });

  it('is Unicode NFC safe and keeps Myanmar characters', () => {
    const out = normalizeTitle('စမ်းသပ် Project');
    expect(out).toContain('project');
    expect(out.length).toBeGreaterThan(0);
  });

  it('is idempotent', () => {
    const once = normalizeTitle('Web Based Student Attendance System');
    expect(normalizeTitle(once)).toBe(once);
  });
});

describe('contentTokens', () => {
  it('drops stopwords and 1-char tokens', () => {
    const toks = contentTokens(normalizeTitle('A System for the Design of X'));
    expect(toks).not.toContain('a');
    expect(toks).not.toContain('the');
    expect(toks).not.toContain('system'); // in stopword list
    expect(toks).not.toContain('x'); // 1 char
  });
});

describe('levenshtein', () => {
  it('returns 0 for identical', () => expect(levenshtein('abc', 'abc')).toBe(0));
  it('counts single edits', () => expect(levenshtein('kitten', 'sitting')).toBe(3));
  it('handles empty', () => expect(levenshtein('', 'abc')).toBe(3));
});

describe('trigrams', () => {
  it('produces padded 3-grams', () => {
    const g = trigrams('ab');
    expect(g.size).toBeGreaterThan(0);
  });
});

describe('scoreNormalized', () => {
  const n = normalizeTitle;

  it('scores identical titles ~1.0 (EXACT range)', () => {
    const s = scoreNormalized(n('Smart Agriculture Monitoring System'), n('Smart Agriculture Monitoring System'));
    expect(s.score).toBeGreaterThanOrEqual(0.85);
  });

  it('scores reordered / paraphrased titles as SIMILAR', () => {
    const s = scoreNormalized(
      n('IoT Based Smart Agriculture Monitoring System'),
      n('Smart Agriculture Monitoring System Using IoT and Machine Learning'),
    );
    expect(s.score).toBeGreaterThanOrEqual(0.3);
    expect(s.score).toBeLessThan(0.85);
  });

  it('scores unrelated titles low', () => {
    const s = scoreNormalized(n('Solar Powered Irrigation System'), n('Sentiment Analysis of Facebook Comments'));
    expect(s.score).toBeLessThan(0.3);
  });

  it('is symmetric', () => {
    const a = n('Face Recognition Attendance System');
    const b = n('Attendance System with Face Recognition');
    expect(scoreNormalized(a, b).score).toBeCloseTo(scoreNormalized(b, a).score, 5);
  });
});
