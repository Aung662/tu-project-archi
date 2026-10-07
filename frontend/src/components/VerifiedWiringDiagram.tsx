'use client';

import type { VerifiedWiringRecipe } from '@/lib/verifiedWiring';
import type { Lang } from '@/lib/i18n';

export function VerifiedWiringDiagram({ recipe, lang }: { recipe: VerifiedWiringRecipe; lang: Lang }) {
  const my = lang === 'my';

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-400/25 bg-slate-950">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
          <span aria-hidden="true">✓</span>
          {my ? 'ရင်းမြစ်နှင့် pin နေရာ တိုက်စစ်ပြီး' : 'Source-checked pin map'}
        </span>
      </div>

      <a
        href={`/wiring/verified/${recipe.diagramFile}`}
        target="_blank"
        rel="noreferrer"
        className="block bg-slate-50"
        aria-label={my ? `${recipe.displayName} ချိတ်ဆက်ပုံကို အပြည့်ကြည့်ရန်` : `Open the full ${recipe.displayName} wiring diagram`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/wiring/verified/${recipe.diagramFile}`}
          alt={`${recipe.displayName} verified pin-to-pin wiring diagram`}
          loading="lazy"
          className="h-auto w-full"
        />
      </a>

      <div className="space-y-3 border-t border-white/10 p-3">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
            {my ? 'Pin ချိတ်ဆက်မှု' : 'Pin connections'}
          </h4>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[330px] text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">{my ? 'Board pin' : 'Board pin'}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{my ? 'Sensor/module pin' : 'Sensor/module pin'}</th>
                  <th scope="col" className="px-3 py-2 font-medium">{my ? 'ကြိုးအရောင်' : 'Wire'}</th>
                </tr>
              </thead>
              <tbody>
                {recipe.connections.map((connection) => (
                  <tr key={connection.id} className="border-t border-white/5">
                    <td className="px-3 py-2 font-mono font-semibold text-slate-100">{connection.boardPin}</td>
                    <td className="px-3 py-2 font-mono text-slate-100">{connection.componentPin}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-slate-300">
                        <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/30" style={{ backgroundColor: connection.color }} aria-hidden="true" />
                        {connection.kind === 'power' ? (my ? 'ပါဝါ' : 'Power') : connection.kind === 'ground' ? (my ? 'မြေ' : 'Ground') : (my ? 'Signal' : 'Signal')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {recipe.connectionsNotes.map((note, index) => (
          <p
            key={index}
            className={index === 0
              ? 'rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-slate-300'
              : 'rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2 text-[11px] leading-relaxed text-amber-100/90'}
          >
            {index > 0 && <span className="mr-1" aria-hidden="true">⚠</span>}
            {my ? note.my : note.en}
          </p>
        ))}

        <details className="group rounded-lg border border-white/10 bg-white/[0.02]">
          <summary className="cursor-pointer list-none px-3 py-2 text-[11px] font-semibold text-slate-300 marker:hidden">
            <span className="mr-1" aria-hidden="true">ⓘ</span>
            {my ? 'ရင်းမြစ်နှင့် artwork attribution' : 'Sources & artwork attribution'}
          </summary>
          <div className="space-y-2 border-t border-white/10 px-3 py-2">
            <ul className="list-disc space-y-1 pl-4 text-[10px] leading-relaxed text-slate-400">
              {recipe.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer" className="underline decoration-slate-600 underline-offset-2 hover:text-white">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-[10px] leading-relaxed text-slate-500">
              {recipe.attribution} {my ? 'လိုင်စင်:' : 'License:'} {recipe.license}.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
