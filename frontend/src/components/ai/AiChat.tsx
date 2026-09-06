'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { tr, t } from '@/lib/i18n';

interface Source {
  id: string;
  title: string;
  year: number;
}
interface Msg {
  role: 'user' | 'assistant';
  text: string;
  sources?: Source[];
}

/**
 * Floating AI assistant. Self-hides entirely when the backend reports AI is not
 * configured (GET /api/ai/config → { enabled:false }), so there's no dead button
 * when no Gemini key is set.
 */
export function AiChat() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<{ enabled: boolean }>('/ai/config')
      .then((c) => setEnabled(Boolean(c.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, busy]);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: question }]);
    setBusy(true);
    try {
      const res = await api.post<{ answer: string; sources: Source[] }>('/ai/chat', { question });
      setMsgs((m) => [...m, { role: 'assistant', text: res.answer, sources: res.sources }]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', text: tr(t.aiChatError) }]);
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) return null;

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={tr(t.aiAssistant)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl text-white shadow-lg shadow-brand-900/40 transition hover:scale-105"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[560px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/15 bg-ink-900/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-bold text-slate-100">{tr(t.aiChatTitle)}</p>
              <p className="text-[11px] text-slate-400">Gemini AI</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.length === 0 && (
              <p className="rounded-lg bg-white/5 p-3 text-xs text-slate-300">{tr(t.aiChatIntro)}</p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-brand-500/30 text-slate-100'
                      : 'bg-white/8 text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {tr(t.aiChatSources)}
                    </p>
                    {m.sources.map((s) => (
                      <Link
                        key={s.id}
                        href={`/projects/${s.id}`}
                        onClick={() => setOpen(false)}
                        className="block truncate rounded-md bg-white/5 px-2 py-1 text-left text-xs text-brand-200 hover:bg-white/10"
                      >
                        📄 {s.title} ({s.year})
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="text-left">
                <span className="inline-block rounded-2xl bg-white/8 px-3 py-2 text-sm text-slate-400">
                  {tr(t.aiChatThinking)}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={tr(t.aiChatPlaceholder)}
                className="input flex-1 text-sm"
              />
              <button onClick={send} disabled={busy || !input.trim()} className="btn-primary shrink-0 px-4">
                {tr(t.aiChatSend)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
