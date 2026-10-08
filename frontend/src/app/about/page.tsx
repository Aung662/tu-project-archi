'use client';

import Link from 'next/link';
import { FOUNDERS } from '@/lib/founders';
import { telHref } from '@/lib/contact';
import { Reveal, StaggerGrid, StaggerItem, TiltCard, Magnetic } from '@/components/motion';

/**
 * "About this website" — the story and the people behind the archive.
 *
 * The purpose is presented in BOTH English and Burmese together (not toggled),
 * so any reader gets it in their language. Copy is written to read naturally,
 * not like machine translation.
 */

// The mission, told in two languages. Each block is one flowing paragraph.
const MISSION = [
  {
    icon: '🎯',
    title: { en: 'Why we built this', my: 'ဘာကြောင့် တည်ဆောက်ခဲ့သလဲ' },
    en: 'Every year, hundreds of final-year students at Myanmar’s Technological Universities pour months of work into their projects — and every year that knowledge quietly disappears into forgotten folders and dusty library shelves. We built TU Project Archive so none of it goes to waste. It is one shared home where past projects can be found, learned from, and built upon, instead of being reinvented from scratch.',
    my: 'မြန်မာနိုင်ငံ နည်းပညာတက္ကသိုလ်တွေမှာ နှစ်စဉ် နောက်ဆုံးနှစ် ကျောင်းသားရာနဲ့ချီ လသင့်လသန့် ကြိုးစားပြီး ပရောဂျက်တွေ လုပ်ဆောင်ကြပေမဲ့၊ အဲဒီ အသိပညာတွေဟာ မေ့ပျောက်သွားတဲ့ ဖိုင်တွဲတွေ၊ ဖုန်တက်နေတဲ့ စာကြည့်တိုက် စင်တွေထဲ တိတ်တဆိတ် ပျောက်ကွယ်သွားတတ်ပါတယ်။ TU Project Archive ကို တည်ဆောက်ရတဲ့ ရည်ရွယ်ချက်ကတော့ အဲဒီ အလုပ်တွေ အလဟဿ မဖြစ်စေချင်လို့ပါ။ ပြီးခဲ့တဲ့ ပရောဂျက်တွေကို တစ်နေရာတည်းမှာ ရှာဖွေ၊ လေ့လာ၊ ဆက်လက်တီထွင်နိုင်စေဖို့ မျှဝေအိမ်တစ်ခု ဖြစ်လာစေချင်ပါတယ်။',
  },
  {
    icon: '🔍',
    title: { en: 'Avoid duplicate titles', my: 'ခေါင်းစဉ်ထပ်ခြင်း ရှောင်ရှားရန်' },
    en: 'Choosing a title should not feel like a guessing game. Our title-similarity checker compares a proposed idea with projects already in the archive, so students can refine their topic and take a more informed proposal to their department.',
    my: 'ခေါင်းစဉ်ရွေးချယ်ခြင်းဟာ မှန်းဆရတဲ့အလုပ် မဖြစ်သင့်ပါဘူး။ ခေါင်းစဉ်ဆင်တူမှု စစ်ဆေးစနစ်က အဆိုပြုမယ့် ခေါင်းစဉ်ကို မှတ်တမ်းထဲရှိ project များနဲ့ နှိုင်းယှဉ်ပြပေးတာကြောင့်၊ ကျောင်းသားတွေက မိမိတို့ခေါင်းစဉ်ကို ပြန်လည်ပြင်ဆင်ပြီး ဌာနကို ပိုမိုသေချာတဲ့ အဆိုပြုချက် တင်ပြနိုင်ပါတယ်။',
  },
  {
    icon: '🌱',
    title: { en: 'Built to grow', my: 'ရေရှည်တိုးတက်ရန် တည်ဆောက်ထားခြင်း' },
    en: 'This began as our own final-year project, but it is designed to grow: the interface defaults to English with a Burmese language switch, and the archive can onboard more universities and features over time.',
    my: 'ဒီ project ကို ကျွန်ုပ်တို့ရဲ့ နောက်ဆုံးနှစ်ပရောဂျက်အဖြစ် စတင်ခဲ့ပေမဲ့ နောက်ထပ် တက္ကသိုလ်များနဲ့ လုပ်ဆောင်ချက်များ ထပ်တိုးနိုင်အောင် ဖန်တီးထားပါတယ်။ Interface ကို English ဖြင့် စတင်ပြသပြီး မြန်မာဘာသာသို့ ပြောင်းသုံးနိုင်ပါတယ်။',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {/* Hero */}
      <Reveal className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-200">
          <span aria-hidden>✦</span> About this website
        </span>
        <h1 className="text-3xl font-bold text-gradient-animated sm:text-4xl">
          TU Project Archive
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400">
          A centralized academic archive for Myanmar Technological Universities.
          <br className="hidden sm:block" />
          မြန်မာနိုင်ငံ နည်းပညာတက္ကသိုလ်များအတွက် ဗဟိုချုပ်ကိုင် ပရောဂျက် မှတ်တမ်းတိုက်။
        </p>
      </Reveal>

      {/* Mission — bilingual cards */}
      <section className="space-y-4">
        {MISSION.map((m, i) => (
          <Reveal key={m.title.en} delay={i * 0.06}>
            <div className="card glow-ring space-y-4 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-2xl ring-1 ring-white/10">
                  {m.icon}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{m.title.en}</h2>
                  <p className="text-sm font-semibold text-brand-200">{m.title.my}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{m.en}</p>
              <p className="border-t border-white/10 pt-4 text-sm leading-loose text-slate-300">
                {m.my}
              </p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Founders */}
      <section className="space-y-6">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold text-slate-100">Meet the team</h2>
          <p className="mt-1 text-sm text-slate-400">
            တည်ထောင်သူများ — the students behind the archive
          </p>
        </Reveal>

        <StaggerGrid className="grid gap-6 sm:grid-cols-2">
          {FOUNDERS.map((f) => (
            <StaggerItem key={f.name}>
              <TiltCard className="h-full">
                <article className="card card-interactive flex h-full flex-col overflow-hidden p-0">
                  {/* Portrait */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-800/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.photo}
                      alt={f.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="photo-gradient pointer-events-none absolute inset-x-0 bottom-0 h-24" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="media-overlay-text text-lg font-bold">{f.name}</h3>
                      <p className="media-overlay-accent text-xs font-semibold">{f.role.en}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-2.5 p-5 text-sm">
                    <p className="text-brand-200">{f.role.my}</p>
                    <dl className="space-y-2 text-slate-300">
                      <Row label="Student ID">
                        <span className="font-latin font-semibold text-slate-100">{f.studentId}</span>
                      </Row>
                      <Row label="Department">
                        <span>
                          {f.department.en}
                          <span className="block text-xs text-slate-400">{f.department.my}</span>
                        </span>
                      </Row>
                      {f.phone && (
                        <Row label="Phone">
                          <a
                            href={telHref(f.phone)}
                            className="font-latin font-semibold text-brand-300 hover:text-brand-200"
                          >
                            {f.phone}
                          </a>
                        </Row>
                      )}
                      {f.email && (
                        <Row label="Email">
                          <a
                            href={`mailto:${f.email}`}
                            className="break-all font-latin text-brand-300 hover:text-brand-200"
                          >
                            {f.email}
                          </a>
                        </Row>
                      )}
                    </dl>
                  </div>
                </article>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* CTA back */}
      <Reveal className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-8">
        <Magnetic strength={0.25}>
          <Link href="/" className="sheen btn-primary">
            Explore the archive →
          </Link>
        </Magnetic>
        <Magnetic strength={0.25}>
          <Link href="/contact" className="btn-secondary">
            Contact us
          </Link>
        </Magnetic>
      </Reveal>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
