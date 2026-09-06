import { prisma } from '../../lib/prisma.js';
import {
  embedText,
  generateText,
  cosineSimilarity,
  textHash,
  geminiConfigured,
} from '../../lib/gemini.js';

/**
 * AI features for the project archive, all backed by Google Gemini and all
 * degrading gracefully when no API key is set:
 *   - semantic search (meaning-based, complements the trigram engine)
 *   - one-sentence TLDR summaries of a project abstract
 *   - a grounded chatbot that answers using ONLY the archive's own projects
 */

/** The text we embed / summarize for a project. */
function embeddingSource(p: { title: string; abstract: string; keywords?: string }): string {
  return [p.title, p.keywords, p.abstract].filter(Boolean).join('. ').slice(0, 8000);
}

/**
 * Ensure a PUBLISHED project has an up-to-date embedding + AI summary cached.
 * Cheap no-op when AI is off, when nothing changed, or on API failure.
 * Returns whether anything was (re)computed.
 */
export async function indexProject(projectId: string): Promise<boolean> {
  if (!geminiConfigured) return false;
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, title: true, abstract: true, keywords: true, embeddingHash: true, aiSummary: true },
  });
  if (!p) return false;

  const source = embeddingSource(p);
  const hash = textHash(source);
  if (p.embeddingHash === hash && p.aiSummary) return false; // already fresh

  const vector = await embedText(source);
  const summary =
    (await generateText(
      `Summarize this student thesis/project in ONE concise sentence (max 30 words), plain and factual:\n\nTitle: ${p.title}\nAbstract: ${p.abstract}`,
      { maxTokens: 80, temperature: 0.3 },
    )) ?? p.aiSummary ?? null;

  await prisma.project.update({
    where: { id: p.id },
    data: {
      ...(vector ? { embedding: JSON.stringify(vector), embeddingHash: hash } : {}),
      ...(summary ? { aiSummary: summary } : {}),
    },
  });
  return Boolean(vector || summary);
}

/**
 * Backfill embeddings/summaries for all PUBLISHED projects that lack them.
 * Sequential + best-effort to stay within free-tier rate limits. Returns count.
 */
export async function indexAllProjects(limit = 200): Promise<number> {
  if (!geminiConfigured) return 0;
  const pending = await prisma.project.findMany({
    where: { status: 'PUBLISHED', OR: [{ embedding: null }, { aiSummary: null }] },
    select: { id: true },
    take: limit,
  });
  let done = 0;
  for (const { id } of pending) {
    // eslint-disable-next-line no-await-in-loop
    if (await indexProject(id)) done++;
  }
  return done;
}

export interface SemanticHit {
  score: number; // 0..100
  project: {
    id: string;
    title: string;
    year: number;
    level: string;
    abstract: string;
    aiSummary: string | null;
    university: { id: string; name: string; shortName: string };
    department: { id: string; name: string; code: string };
    priceMmk: number;
    hasFile: boolean;
  };
}

/**
 * Meaning-based search over PUBLISHED projects with cached embeddings.
 * Returns null (not empty) when AI is unavailable so the caller can fall back
 * to the trigram search engine and keep the feature working.
 */
export async function semanticSearch(query: string, limit = 20): Promise<SemanticHit[] | null> {
  if (!geminiConfigured) return null;
  const qVec = await embedText(query);
  if (!qVec) return null;

  const projects = await prisma.project.findMany({
    where: { status: 'PUBLISHED', embedding: { not: null } },
    select: {
      id: true, title: true, year: true, level: true, abstract: true, aiSummary: true,
      priceMmk: true, fileStorageKey: true, embedding: true,
      university: { select: { id: true, name: true, shortName: true } },
      department: { select: { id: true, name: true, code: true } },
    },
    take: 2000,
  });

  const scored = projects
    .map((p) => {
      let vec: number[] = [];
      try {
        vec = JSON.parse(p.embedding as string) as number[];
      } catch {
        vec = [];
      }
      return { p, score: cosineSimilarity(qVec, vec) };
    })
    .filter((s) => s.score > 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ p, score }) => ({
    score: Math.round(score * 100),
    project: {
      id: p.id,
      title: p.title,
      year: p.year,
      level: p.level,
      abstract: p.abstract,
      aiSummary: p.aiSummary,
      university: p.university,
      department: p.department,
      priceMmk: p.priceMmk,
      hasFile: Boolean(p.fileStorageKey),
    },
  }));
}

/** Semantically related projects for a given project (for "Related" section). */
export async function relatedProjects(projectId: string, limit = 5): Promise<SemanticHit[] | null> {
  if (!geminiConfigured) return null;
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { title: true, abstract: true, keywords: true },
  });
  if (!p) return null;
  const hits = await semanticSearch(embeddingSource(p), limit + 1);
  if (!hits) return null;
  return hits.filter((h) => h.project.id !== projectId).slice(0, limit);
}

export interface ChatSource {
  id: string;
  title: string;
  year: number;
}

/**
 * Grounded chatbot: retrieves the most relevant projects for the question, then
 * asks Gemini to answer using ONLY those as context (so it can't hallucinate
 * projects that don't exist). Returns the answer plus the sources it used.
 */
export async function chatAnswer(
  question: string,
): Promise<{ answer: string; sources: ChatSource[] } | null> {
  if (!geminiConfigured) return null;

  // Retrieve context: prefer semantic, fall back to keyword contains.
  let hits = await semanticSearch(question, 6);
  if (!hits || hits.length === 0) {
    const kw = await prisma.project.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: question } },
          { abstract: { contains: question } },
          { keywords: { contains: question } },
        ],
      },
      select: {
        id: true, title: true, year: true, level: true, abstract: true, aiSummary: true,
        priceMmk: true, fileStorageKey: true,
        university: { select: { id: true, name: true, shortName: true } },
        department: { select: { id: true, name: true, code: true } },
      },
      take: 6,
    });
    hits = kw.map((p) => ({
      score: 0,
      project: {
        id: p.id, title: p.title, year: p.year, level: p.level, abstract: p.abstract,
        aiSummary: p.aiSummary, university: p.university, department: p.department,
        priceMmk: p.priceMmk, hasFile: Boolean(p.fileStorageKey),
      },
    }));
  }

  const context = hits
    .map(
      (h, i) =>
        `[${i + 1}] "${h.project.title}" (${h.project.year}, ${h.project.department.name}) — ${h.project.abstract.slice(0, 400)}`,
    )
    .join('\n\n');

  const system =
    'You are the helpful assistant for a university project archive. Answer ONLY from the provided projects. ' +
    'If the projects do not contain the answer, say you could not find a matching project. ' +
    'Be concise. You may reply in the same language as the question (English or Burmese). ' +
    'When you mention a project, refer to it by its title.';

  const prompt = `Question: ${question}\n\nProjects you may use:\n${context || '(none found)'}\n\nAnswer:`;

  const answer =
    (await generateText(prompt, { system, maxTokens: 500, temperature: 0.3 })) ??
    'Sorry, the AI assistant is temporarily unavailable.';

  return {
    answer,
    sources: hits.slice(0, 5).map((h) => ({ id: h.project.id, title: h.project.title, year: h.project.year })),
  };
}
