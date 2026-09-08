'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { TopicBucket } from '@/lib/types';
import { Alert, Spinner, EmptyState } from '@/components/ui';
import { Reveal } from '@/components/motion';
import { tr, t } from '@/lib/i18n';

/**
 * "Explore by topic" — a keyword cloud aggregated from every published project.
 * Font size scales with how many projects use a keyword, so hot topics pop. Each
 * chip links to Browse pre-filtered by that term.
 */
export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicBucket[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<TopicBucket[]>('/stats/topics')
      .then(setTopics)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load topics'));
  }, []);

  if (error) return <Alert kind="error">{error}</Alert>;
  if (!topics) return <Spinner label={tr(t.topicsTitle)} />;

  const max = Math.max(1, ...topics.map((x) => x.value));
  // Map a count to a font size class between sm and 3xl.
  const sizeFor = (v: number) => {
    const r = v / max;
    if (r > 0.8) return 'text-3xl';
    if (r > 0.6) return 'text-2xl';
    if (r > 0.4) return 'text-xl';
    if (r > 0.2) return 'text-lg';
    return 'text-base';
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Reveal className="text-center">
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">{tr(t.topicsTitle)}</h1>
        <p className="mt-2 text-sm text-slate-400">{tr(t.topicsSubtitle)}</p>
      </Reveal>

      {topics.length === 0 ? (
        <EmptyState title={tr(t.bibEmpty)} />
      ) : (
        <Reveal delay={0.05}>
          <div className="card flex flex-wrap items-center justify-center gap-x-4 gap-y-3 p-6 sm:p-8">
            {topics.map((topic) => (
              <Link
                key={topic.label}
                href={`/browse?q=${encodeURIComponent(topic.label)}`}
                className={`sheen inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-brand-400/50 hover:bg-brand-500/15 hover:text-brand-100 ${sizeFor(
                  topic.value,
                )}`}
              >
                {topic.label}
                <span className="font-latin text-xs font-normal text-slate-500">{topic.value}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
