'use client';

import { tr, t } from '@/lib/i18n';
import { CONTACT, telHref, viberHref } from '@/lib/contact';

/**
 * Public contact page. Every channel reads from src/lib/contact.ts, so the
 * site owner edits real details in one place. Empty-string channels are hidden.
 */
export default function ContactPage() {
  const channels = [
    CONTACT.phone && {
      icon: '📞',
      label: tr(t.contactPhone),
      value: CONTACT.phone,
      href: telHref(CONTACT.phone),
      cta: tr(t.contactCallCta),
    },
    CONTACT.viber && {
      icon: '💜',
      label: tr(t.contactViber),
      value: CONTACT.viber,
      href: viberHref(CONTACT.viber),
      cta: tr(t.contactChatCta),
    },
    CONTACT.messenger && {
      icon: '💬',
      label: tr(t.contactMessenger),
      value: CONTACT.messenger.replace(/^https?:\/\//, ''),
      href: CONTACT.messenger,
      cta: tr(t.contactChatCta),
    },
    CONTACT.telegram && {
      icon: '✈️',
      label: tr(t.contactTelegram),
      value: CONTACT.telegram.replace(/^https?:\/\//, ''),
      href: CONTACT.telegram,
      cta: tr(t.contactChatCta),
    },
    CONTACT.email && {
      icon: '✉️',
      label: tr(t.contactEmail),
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      cta: tr(t.contactChatCta),
    },
  ].filter(Boolean) as {
    icon: string;
    label: string;
    value: string;
    href: string;
    cta: string;
  }[];

  const external = (href: string) => /^https?:\/\//.test(href);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{tr(t.contactTitle)}</h1>
        <p className="mt-2 text-slate-300">{tr(t.contactIntro)}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={external(c.href) ? '_blank' : undefined}
            rel={external(c.href) ? 'noopener noreferrer' : undefined}
            className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-brand-400/50 hover:bg-white/10"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-2xl">
              {c.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                {c.label}
              </span>
              <span className="block truncate text-sm font-semibold text-slate-100">{c.value}</span>
            </span>
            <span className="shrink-0 rounded-lg bg-brand-500/20 px-3 py-1.5 text-xs font-semibold text-brand-100 transition group-hover:bg-brand-500/30">
              {c.cta}
            </span>
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
        <p className="text-sm text-amber-100/90">💡 {tr(t.contactBuyNote)}</p>
      </div>

      <div className="text-sm text-slate-400">
        <span className="font-semibold text-slate-300">{tr(t.contactHours)}: </span>
        {tr(t.contactHoursValue)}
      </div>
    </div>
  );
}
