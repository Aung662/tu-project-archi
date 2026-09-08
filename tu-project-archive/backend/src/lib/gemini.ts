import { createHash } from 'node:crypto';
import { env, geminiConfigured } from '../config/env.js';

/**
 * Minimal Google Gemini REST client (no SDK dependency — just fetch).
 *
 * Every function is a no-op when no API key is configured, so the whole app
 * runs fine without AI. Callers check `geminiConfigured` (re-exported) and/or
 * handle a null/empty return by falling back to non-AI behaviour.
 *
 * Free tier: get a key at https://aistudio.google.com/apikey (no credit card).
 */

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

export { geminiConfigured };

/** Stable hash of arbitrary text (used to avoid re-embedding unchanged content). */
export function textHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Embed a single piece of text into a numeric vector. Returns null when AI is
 * not configured or the request fails (caller falls back to trigram search).
 */
export async function embedText(text: string): Promise<number[] | null> {
  if (!geminiConfigured) return null;
  const clean = text.trim().slice(0, 8000);
  if (!clean) return null;
  try {
    const res = await fetch(
      `${BASE}/models/${env.GEMINI_EMBED_MODEL}:embedContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${env.GEMINI_EMBED_MODEL}`,
          content: { parts: [{ text: clean }] },
        }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { embedding?: { values?: number[] } };
    return json.embedding?.values ?? null;
  } catch {
    return null;
  }
}

/**
 * Generate text from a prompt (used for TLDR summaries and the chatbot).
 * Returns null when AI is not configured or the request fails.
 */
export async function generateText(
  prompt: string,
  opts: { system?: string; maxTokens?: number; temperature?: number } = {},
): Promise<string | null> {
  if (!geminiConfigured) return null;
  try {
    const res = await fetch(
      `${BASE}/models/${env.GEMINI_CHAT_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(opts.system
            ? { systemInstruction: { parts: [{ text: opts.system }] } }
            : {}),
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: opts.maxTokens ?? 512,
            temperature: opts.temperature ?? 0.4,
          },
        }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
    return text || null;
  } catch {
    return null;
  }
}

/** Cosine similarity between two equal-length vectors (0..1 for embeddings). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
