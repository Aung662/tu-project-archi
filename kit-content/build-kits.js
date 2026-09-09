/**
 * Website-Kit content generator.
 *
 * Emits one folder per website TYPE, each a complete step-by-step build guide
 * plus a full set of copy-paste AI prompts (English + Burmese notes). Everything
 * is written under ./out/<slug>/ and then zipped by the shell wrapper.
 *
 * Run:  node build-kits.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');

// ── Shared building blocks ───────────────────────────────────────────────────
const GENERIC_STEPS = (k) => `# ${k.title} — Step-by-Step Build Guide

> ${k.summary}
>
> **မြန်မာ:** ${k.summaryMy}

**Difficulty:** ${k.difficulty} · **Est. time:** ${k.time} · **Stack:** ${k.stack.join(', ')}

---

## 0. Before you start (Prerequisites)

Install these once:

- **Node.js LTS** (v20+) — https://nodejs.org  → verify: \`node -v\`
- **Git** — https://git-scm.com  → verify: \`git --version\`
- **VS Code** — https://code.visualstudio.com
- A **GitHub** account (free) and a **Vercel** or **Netlify** account (free hosting)
${k.extraPrereq.map((p) => `- ${p}`).join('\n')}

> မြန်မာ: အထက်ပါ tool တွေကို အရင် install လုပ်ပါ။ terminal ထဲမှာ \`node -v\` ရိုက်ပြီး version ပေါ်ရင် အဆင်ပြေပါပြီ။

---

## 1. Plan the site (30 minutes, do NOT skip)

Write down, in one page:

1. **Goal** — what should a visitor be able to DO? (${k.goal})
2. **Pages** — ${k.pages.join(' · ')}
3. **Content** — the real text/images you will show (gather them into a folder now).
4. **Brand** — 1 primary colour, 1 accent, 1 font. Keep it simple.

> Use **PROMPTS.md → Prompt 1** to have an AI turn this into a spec.

---

## 2. Create the project

\`\`\`bash
${k.createCmds.join('\n')}
\`\`\`

Open the folder in VS Code and run the dev server:

\`\`\`bash
${k.devCmd}
\`\`\`

Visit **${k.devUrl}** — you should see the starter page.

---

## 3. Build the layout & pages

- Create the shared **layout** (header, nav, footer) first.
- Add each page from your plan as a route.
- Keep components small and reusable (a \`Button\`, a \`Card\`, a \`Section\`).

> Use **PROMPTS.md → Prompt 2 & 3** to scaffold the layout and each page.

${k.sectionsGuide}

---

## 4. Style it

- Start mobile-first; test at 375px width, then widen.
- Use the design tokens from your plan (one colour scale, consistent spacing).
- Add hover/focus states and smooth transitions — small touches read as "polished".

> Use **PROMPTS.md → Prompt 4** for a full styling pass.

---

## 5. Make it real (data & interactivity)

${k.dataGuide}

> Use **PROMPTS.md → Prompt 5** for the data/logic layer.

---

## 6. Quality pass (accessibility, SEO, performance)

- **Accessibility:** semantic HTML, alt text on images, labels on inputs, visible focus.
- **SEO:** a unique \`<title>\` + meta description per page; Open Graph tags for sharing.
- **Performance:** compress images (WebP), lazy-load below-the-fold media, avoid huge JS.
- Run **Lighthouse** in Chrome DevTools → aim for 90+ on all four scores.

> Use **PROMPTS.md → Prompt 6** for an automated audit checklist.

---

## 7. Test

- Click every link and button. Submit every form with good AND bad input.
- Test on a real phone (open your dev URL on the same Wi-Fi, or deploy a preview).
- Ask one person who has never seen it to complete the main task.

---

## 8. Deploy (free)

\`\`\`bash
git init && git add -A && git commit -m "first version"
# create an empty repo on GitHub, then:
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
\`\`\`

Then import the repo on **Vercel** (${k.hostNote}). Every future \`git push\` auto-deploys.

> Use **PROMPTS.md → Prompt 7** for a deployment checklist and troubleshooting.

---

## 9. Launch checklist

- [ ] Custom domain connected (optional)
- [ ] Favicon + social share image set
- [ ] Analytics added (Plausible/Umami/GA)
- [ ] 404 page exists
- [ ] Contact route works and you receive a test message
- [ ] Lighthouse ≥ 90 across the board

🎉 **Done!** You have a live ${k.title.toLowerCase()}.

---

_This guide is part of the TU Project Archive Website Kit. See PROMPTS.md for the full AI prompt pack, TECH-STACK.md for alternatives, and CHECKLIST.md for a printable version._
`;

const PROMPTS = (k) => `# ${k.title} — AI Prompt Pack

Copy each prompt into your AI assistant (ChatGPT, Claude, Gemini, or an in-editor
tool like Cursor/Copilot). Replace \`{{...}}\` placeholders with your real details.
Prompts are ordered to match the build guide steps.

> မြန်မာ: အောက်ပါ prompt တွေကို AI assistant ထဲ ကူးထည့်ပါ။ \`{{...}}\` နေရာတွေမှာ
> ကိုယ့်အချက်အလက် အစားထိုးပါ။ တစ်ဆင့်ချင်း အစဉ်လိုက် လုပ်သွားပါ။

---

## Prompt 1 — Turn my idea into a spec

\`\`\`
You are a senior product designer. I am building a ${k.title.toLowerCase()}.
Goal: ${k.goal}
Audience: {{who will use this}}
Must-have pages: ${k.pages.join(', ')}
Brand feeling: {{e.g. modern, trustworthy, playful}}

Produce:
1. A one-paragraph product summary.
2. A sitemap (pages + what each contains).
3. A component list (reusable UI pieces).
4. A colour palette (hex) + font pairing suitable for the brand feeling.
5. The single most important call-to-action per page.
Keep it concise and practical.
\`\`\`

## Prompt 2 — Scaffold the project & layout

\`\`\`
Create a ${k.stack[0]} project structure for a ${k.title.toLowerCase()} using ${k.stack.join(' + ')}.
Give me:
- the exact terminal commands to create it,
- the folder structure,
- a shared layout with a responsive header (logo + nav + mobile menu) and a footer,
- routing set up for these pages: ${k.pages.join(', ')}.
Use accessible, semantic HTML and mobile-first CSS. Return complete file contents.
\`\`\`

## Prompt 3 — Build a specific page

\`\`\`
Build the "{{page name}}" page for my ${k.title.toLowerCase()}.
It should contain: {{list the sections/content}}.
Match this design language: {{paste palette + font from Prompt 1}}.
Requirements: responsive, accessible, fast. Reuse my existing components where possible.
Return the full page file plus any new components.
\`\`\`

## Prompt 4 — Styling & polish pass

\`\`\`
Here is my page code:
{{paste code}}
Improve the visual design WITHOUT changing the content or breaking functionality:
- consistent spacing scale and typography,
- clear visual hierarchy,
- hover/focus/active states and subtle transitions,
- dark-mode support if easy.
Explain each change briefly, then return the updated code.
\`\`\`

## Prompt 5 — ${k.prompt5Title}

\`\`\`
${k.prompt5Body}
\`\`\`

## Prompt 6 — Accessibility, SEO & performance audit

\`\`\`
Audit this page for accessibility (WCAG AA), SEO, and performance:
{{paste code}}
Return a prioritised checklist (High/Medium/Low) with the exact code fix for each item.
Include per-page <title> and meta description suggestions and Open Graph tags.
\`\`\`

## Prompt 7 — Deploy & troubleshoot

\`\`\`
I want to deploy my ${k.stack[0]} app for free.
Walk me through deploying to ${k.host} step by step, including:
- connecting my GitHub repo,
- environment variables I need (if any),
- custom domain setup,
- and the 3 most common deploy errors for this stack with fixes.
\`\`\`

## Prompt 8 — Content & copywriting

\`\`\`
Write the on-page copy for my ${k.title.toLowerCase()}.
Business/subject: {{describe}}
Tone: {{friendly / professional / bold}}
Language: {{English / Burmese / both}}
For each page (${k.pages.join(', ')}) give: a headline, a supporting sentence,
and the primary button label. Keep it concrete and benefit-led.
\`\`\`

${k.bonusPrompts || ''}

---

_Tip: after each prompt, paste the AI's output into your editor, run it, and fix
one error at a time. Never paste code you don't understand — ask the AI to explain._
`;

const TECH = (k) => `# ${k.title} — Tech Stack & Alternatives

## Recommended (in this kit)
${k.stack.map((s) => `- **${s}**`).join('\n')}

## Why this stack
${k.stackWhy}

## Beginner-friendly alternative
${k.altBeginner}

## Scale-up alternative
${k.altScale}

## Free services you'll likely use
- **Hosting:** Vercel, Netlify, or Cloudflare Pages (all have generous free tiers)
- **Database (if needed):** Supabase, Neon, or Firebase (free tiers)
- **Forms/email:** Formspree, Resend, or EmailJS
- **Analytics:** Plausible (self-host), Umami, or Google Analytics
- **Images:** Cloudinary or built-in image optimisation

> မြန်မာ: အခမဲ့ tier တွေနဲ့ စတင်နိုင်ပါတယ်။ Traffic များလာမှ paid သို့ တိုးမြှင့်ပါ။
`;

const CHECKLIST = (k) => `# ${k.title} — Printable Checklist

## Plan
- [ ] Goal written in one sentence
- [ ] Page list finalised: ${k.pages.join(', ')}
- [ ] Real content gathered (text + images)
- [ ] Colour + font chosen

## Build
- [ ] Project created and dev server runs
- [ ] Shared layout (header/nav/footer)
- [ ] Every page built
- [ ] Styled, mobile-first
- [ ] Data/interactivity working

## Quality
- [ ] Accessible (alt text, labels, focus, semantic HTML)
- [ ] SEO (titles, meta, Open Graph)
- [ ] Images compressed
- [ ] Lighthouse ≥ 90 ×4
- [ ] Tested on a real phone

## Launch
- [ ] Deployed to ${k.host}
- [ ] Custom domain (optional)
- [ ] Favicon + social image
- [ ] Analytics installed
- [ ] 404 page
- [ ] Main task tested by a stranger
`;

// ── Per-kit specifics ────────────────────────────────────────────────────────
const KITS = [
  {
    slug: 'portfolio-website',
    title: 'Personal Portfolio Website',
    summary: 'A fast, elegant personal/portfolio site to showcase your projects, CV and contact.',
    summaryMy: 'ကိုယ်ပိုင် project၊ CV နဲ့ ဆက်သွယ်ရန် အချက်အလက်တွေ ပြသဖို့ လှပမြန်ဆန်တဲ့ portfolio site။',
    difficulty: 'Beginner', time: '1–2 days',
    stack: ['Next.js', 'React', 'Tailwind CSS'],
    goal: 'let a visitor understand who you are and see/contact you within 30 seconds',
    pages: ['Home', 'Projects', 'About', 'Contact'],
    extraPrereq: [],
    createCmds: ['npx create-next-app@latest my-portfolio --ts --tailwind --eslint --app', 'cd my-portfolio'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:3000',
    sectionsGuide: '- **Home:** hero (name + tagline + CTA), featured projects, skills.\n- **Projects:** a grid of cards; each links to a detail page or live demo.\n- **About:** photo, short bio, downloadable CV (PDF).\n- **Contact:** a form (Formspree) + your links.',
    dataGuide: '- Keep projects in a typed array/JSON file (`data/projects.ts`) — no database needed.\n- Wire the contact form to **Formspree** or **Resend** so messages reach your inbox.',
    host: 'Vercel', hostNote: 'zero config for Next.js',
    prompt5Title: 'Projects data + contact form',
    prompt5Body: 'Create a typed projects data file for my portfolio with 6 example entries\n(title, description, tech tags, image, live URL, source URL). Then build a\nProjects grid that renders them as accessible cards, and a Contact form that\nposts to Formspree endpoint {{your endpoint}} with client-side validation and a\nsuccess/error state. Return complete files.',
    stackWhy: 'Next.js gives instant page loads, easy routing and free Vercel hosting. Tailwind makes consistent styling fast.',
    altBeginner: 'Plain **HTML + CSS + a little JavaScript** — perfect if you want zero build tools. Host on GitHub Pages.',
    altScale: 'Add **MDX** for a blog, or **Astro** if the site is mostly content and you want the lightest possible output.',
    bonusPrompts: '## Bonus — Case study writer\n\n```\nWrite a project case study for my portfolio using the STAR format\n(Situation, Task, Action, Result) for: {{project name + what you did}}.\nKeep it to ~150 words, results-focused, with 3 highlight metrics.\n```',
  },
  {
    slug: 'business-landing-page',
    title: 'Business / Startup Landing Page',
    summary: 'A high-converting one-page site to explain a product or service and capture leads.',
    summaryMy: 'ကုန်ပစ္စည်း/ဝန်ဆောင်မှုကို ရှင်းပြပြီး customer lead တွေ ဖမ်းယူဖို့ one-page landing site။',
    difficulty: 'Beginner', time: '1 day',
    stack: ['Next.js', 'React', 'Tailwind CSS'],
    goal: 'convince a visitor to sign up / contact / buy',
    pages: ['Hero', 'Features', 'Pricing', 'FAQ', 'Contact / CTA'],
    extraPrereq: [],
    createCmds: ['npx create-next-app@latest my-landing --ts --tailwind --eslint --app', 'cd my-landing'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:3000',
    sectionsGuide: '- **Hero:** one clear promise + primary CTA + supporting visual.\n- **Features/Benefits:** 3–6 benefit blocks (icon + headline + one line).\n- **Social proof:** logos, testimonials, or numbers.\n- **Pricing:** simple tiers with one recommended.\n- **FAQ + final CTA:** handle objections, then ask again.',
    dataGuide: '- Content lives in typed arrays (features, tiers, faqs).\n- Lead capture: an email form → Formspree/Resend, or a "Book a call" Calendly embed.',
    host: 'Vercel', hostNote: 'zero config for Next.js',
    prompt5Title: 'Lead capture + pricing data',
    prompt5Body: 'Build a pricing section with 3 tiers (data-driven) and a lead-capture email\nform that validates input and posts to {{Formspree endpoint}}. Include a\nsuccess state and basic spam protection (honeypot field). Return complete files.',
    stackWhy: 'One page, blazing fast, great SEO, and free hosting — ideal for ads/landing traffic.',
    altBeginner: 'A no-build **HTML + Tailwind CDN** single file. Great for a quick campaign page.',
    altScale: 'Add **A/B testing** (Vercel/PostHog) and a CMS (Sanity) so marketing can edit copy without code.',
    bonusPrompts: '## Bonus — Headline generator\n\n```\nGive me 10 landing-page headlines for {{product}} aimed at {{audience}}.\nMix benefit-led, curiosity, and outcome styles. Keep each under 10 words.\n```',
  },
  {
    slug: 'ecommerce-store',
    title: 'E-Commerce Store',
    summary: 'An online store with a product catalog, cart and checkout.',
    summaryMy: 'ကုန်ပစ္စည်းစာရင်း၊ cart နဲ့ checkout ပါဝင်တဲ့ online ဆိုင်။',
    difficulty: 'Advanced', time: '3–5 days',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Stripe', 'Supabase'],
    goal: 'let a customer find a product, add it to a cart, and pay',
    pages: ['Home', 'Catalog', 'Product detail', 'Cart', 'Checkout', 'Order confirmation'],
    extraPrereq: ['A **Stripe** account (test mode is free)', 'A **Supabase** project (free) for products & orders'],
    createCmds: ['npx create-next-app@latest my-store --ts --tailwind --eslint --app', 'cd my-store', 'npm install @supabase/supabase-js stripe'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:3000',
    sectionsGuide: '- **Catalog:** filterable/paginated product grid from the database.\n- **Product detail:** gallery, price, variants, add-to-cart.\n- **Cart:** stored in local storage + server validation.\n- **Checkout:** Stripe Checkout (never handle raw card data yourself).',
    dataGuide: '- Model `products`, `orders`, `order_items` in Supabase.\n- Use **Stripe Checkout** for payment — it is PCI-compliant and free to start.\n- Verify the order server-side via a **Stripe webhook** before marking it paid.\n\n> Security: keep the Stripe **secret key** on the server only (env var). Never in client code.',
    host: 'Vercel', hostNote: 'add your env vars in the Vercel dashboard',
    prompt5Title: 'Catalog + cart + Stripe checkout',
    prompt5Body: 'Using Supabase for a `products` table and Stripe Checkout, build:\n1. a server function to fetch products,\n2. a cart (React context + localStorage),\n3. a checkout route that creates a Stripe Checkout Session server-side,\n4. a webhook handler that marks the order paid.\nKeep all secret keys server-side. Return complete, secure files with comments.',
    stackWhy: 'Next.js server routes keep payment secrets safe; Stripe handles compliance; Supabase gives a free Postgres DB with auth.',
    altBeginner: 'Use **Shopify** or **Gumroad** if you want to sell fast without building checkout. Or a static store with **Snipcart**.',
    altScale: 'Move to **Medusa** or **Saleor** (open-source commerce engines) when you outgrow a single Stripe flow.',
    bonusPrompts: '## Bonus — Product description writer\n\n```\nWrite 5 product descriptions for {{product type}}. Each: a punchy title,\n2-sentence description, 3 bullet features, and SEO keywords. Tone: {{tone}}.\n```\n\n## Bonus — Security review\n\n```\nReview my checkout code for security issues (exposed secrets, missing webhook\nsignature verification, price tampering). {{paste code}} Return prioritised fixes.\n```',
  },
  {
    slug: 'blog-cms',
    title: 'Blog / Content Website',
    summary: 'A content site or blog with articles, categories and SEO built in.',
    summaryMy: 'ဆောင်းပါး၊ category နဲ့ SEO ပါဝင်တဲ့ blog / content website။',
    difficulty: 'Intermediate', time: '2–3 days',
    stack: ['Astro', 'Markdown/MDX', 'Tailwind CSS'],
    goal: 'publish readable, discoverable articles quickly',
    pages: ['Home (post list)', 'Post detail', 'Category/Tag', 'About', 'RSS feed'],
    extraPrereq: [],
    createCmds: ['npm create astro@latest my-blog', 'cd my-blog', 'npx astro add tailwind mdx sitemap'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:4321',
    sectionsGuide: '- Write posts as **Markdown/MDX** files with frontmatter (title, date, tags, cover).\n- Generate the post list, tag pages, and RSS automatically from the files.\n- Add a reading-time estimate and a table of contents for long posts.',
    dataGuide: '- No database — posts are files in `src/content/`. Astro type-checks the frontmatter.\n- Optionally connect a headless CMS (**Sanity**, **Decap/Netlify CMS**) so non-devs can write.',
    host: 'Netlify or Vercel', hostNote: 'Astro outputs static files — deploys anywhere',
    prompt5Title: 'Content collection + RSS',
    prompt5Body: 'Set up an Astro content collection for blog posts with a typed frontmatter\nschema (title, description, date, tags, cover, draft). Generate: the post list\nsorted by date, individual post pages, tag archive pages, and an RSS feed.\nReturn complete files.',
    stackWhy: 'Astro ships almost no JavaScript, so content sites are extremely fast and SEO-friendly, and Markdown is the easiest way to write.',
    altBeginner: 'Use **Hashnode** or **WordPress.com** if you just want to write and not maintain code.',
    altScale: 'Switch to **Next.js + a headless CMS** if you need dynamic features (comments, member areas, search).',
    bonusPrompts: '## Bonus — Outline + draft\n\n```\nWrite a blog post outline then a first draft on "{{topic}}" for {{audience}}.\nInclude an SEO title, meta description, H2/H3 structure, and a key-takeaways box.\nTarget ~{{word count}} words. Language: {{English/Burmese}}.\n```',
  },
  {
    slug: 'admin-dashboard',
    title: 'Admin Dashboard / Analytics Panel',
    summary: 'A data dashboard with tables, charts, auth and CRUD for an internal tool.',
    summaryMy: 'table၊ chart၊ login နဲ့ CRUD ပါဝင်တဲ့ internal admin dashboard။',
    difficulty: 'Advanced', time: '3–5 days',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Recharts'],
    goal: 'let an admin view metrics and manage records securely',
    pages: ['Login', 'Overview (KPIs + charts)', 'Records (table + CRUD)', 'Settings'],
    extraPrereq: ['A **Supabase** project (free) for auth + data'],
    createCmds: ['npx create-next-app@latest my-dashboard --ts --tailwind --eslint --app', 'cd my-dashboard', 'npm install @supabase/supabase-js recharts'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:3000',
    sectionsGuide: '- **Auth first:** protect every dashboard route; redirect anonymous users to login.\n- **Overview:** KPI cards + a time-series chart + a distribution chart.\n- **Records:** a searchable, paginated table with create/edit/delete modals.\n- **Roles:** enforce permissions on the SERVER, not just by hiding UI.',
    dataGuide: '- Use **Supabase Auth** for login and **Row Level Security (RLS)** so users only see their rows.\n- Fetch aggregates server-side; render charts with Recharts.\n\n> Security: authorization must be enforced server-side. Hiding a button is not access control.',
    host: 'Vercel', hostNote: 'set Supabase env vars in the dashboard',
    prompt5Title: 'Auth guard + CRUD table + charts',
    prompt5Body: 'Build a protected Next.js dashboard using Supabase Auth:\n1. a server-side auth guard that redirects anonymous users,\n2. an Overview page with KPI cards and a Recharts time-series,\n3. a Records page with a paginated, searchable table and create/edit/delete\n   backed by Supabase with Row Level Security.\nEnforce authorization on the server. Return complete files with comments.',
    stackWhy: 'Next.js server components keep queries and auth on the server; Supabase gives auth + Postgres + RLS for free; Recharts is simple and responsive.',
    altBeginner: 'Use **Retool** or **Appsmith** to drag-and-drop an internal tool with no frontend code.',
    altScale: 'Adopt **tRPC** or a typed API layer and a dedicated Postgres (Neon) as data and team size grow.',
    bonusPrompts: '## Bonus — RLS policy writer\n\n```\nWrite Supabase Row Level Security policies so each user can read/write only\ntheir own rows in table {{table}}, while an "admin" role can access all rows.\nReturn the SQL and explain each policy.\n```',
  },
  {
    slug: 'restaurant-website',
    title: 'Restaurant / Cafe Website',
    summary: 'A menu-driven site with photos, hours, location and online reservations.',
    summaryMy: 'menu၊ ဓာတ်ပုံ၊ ဖွင့်ချိန်၊ တည်နေရာ နဲ့ online booking ပါတဲ့ စားသောက်ဆိုင် website။',
    difficulty: 'Beginner', time: '1–2 days',
    stack: ['Next.js', 'React', 'Tailwind CSS'],
    goal: 'help a hungry visitor see the menu and book/visit',
    pages: ['Home', 'Menu', 'Gallery', 'Reservations', 'Contact / Map'],
    extraPrereq: [],
    createCmds: ['npx create-next-app@latest my-restaurant --ts --tailwind --eslint --app', 'cd my-restaurant'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:3000',
    sectionsGuide: '- **Home:** appetising hero image, hours, and a "Book a table" CTA.\n- **Menu:** categorised items with prices (data-driven, easy to update).\n- **Gallery:** an optimised photo grid with a lightbox.\n- **Reservations:** a form (name, date, time, party size) → email/WhatsApp.\n- **Contact:** an embedded map + phone + address.',
    dataGuide: '- Menu items in a typed array/JSON so the owner can edit prices easily.\n- Reservation form → Formspree/Resend, or a "Message on WhatsApp" deep link.',
    host: 'Vercel', hostNote: 'zero config for Next.js',
    prompt5Title: 'Menu data + reservation form',
    prompt5Body: 'Create a typed menu data file (categories → items with name, description,\nprice, tags like vegetarian/spicy) and render it as an accessible menu.\nThen build a reservation form (name, phone, date, time, party size) with\nvalidation that posts to {{Formspree endpoint}} and offers a WhatsApp fallback\nlink. Return complete files.',
    stackWhy: 'Fast, image-friendly, and free to host — perfect for a mostly-static local business site.',
    altBeginner: 'A single-page **HTML + Tailwind CDN** site, or a **Google Sites** page for the absolute simplest option.',
    altScale: 'Add an ordering/payment flow (Stripe) or a CMS so staff can update the menu without code.',
    bonusPrompts: '## Bonus — Menu descriptions\n\n```\nWrite mouth-watering 1-sentence descriptions for these dishes: {{list}}.\nInclude key ingredients and flavour, keep each under 15 words. Language: {{lang}}.\n```',
  },
  {
    slug: 'saas-web-app',
    title: 'SaaS Web App (Auth + Subscriptions)',
    summary: 'A subscription web app with user accounts, a dashboard and billing.',
    summaryMy: 'user account၊ dashboard နဲ့ subscription billing ပါတဲ့ SaaS web app။',
    difficulty: 'Advanced', time: '5–7 days',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Stripe'],
    goal: 'let users sign up, use a gated feature, and pay a recurring subscription',
    pages: ['Marketing home', 'Sign up / Login', 'App dashboard', 'Billing', 'Account settings'],
    extraPrereq: ['A **Supabase** project (auth + DB)', 'A **Stripe** account with a subscription Product/Price'],
    createCmds: ['npx create-next-app@latest my-saas --ts --tailwind --eslint --app', 'cd my-saas', 'npm install @supabase/supabase-js stripe'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:3000',
    sectionsGuide: '- **Auth:** email/OAuth login via Supabase; protect all `/app` routes server-side.\n- **Gating:** check subscription status before serving paid features.\n- **Billing:** Stripe Checkout for subscriptions + a Customer Portal for self-service.\n- **Webhooks:** sync subscription status from Stripe → your DB.',
    dataGuide: '- Tables: `profiles`, `subscriptions`. Update `subscriptions` from Stripe webhooks.\n- Gate features by reading the current subscription server-side (never trust the client).\n\n> Security: verify Stripe webhook signatures; keep secret keys server-side; enforce plan limits on the server.',
    host: 'Vercel', hostNote: 'configure Supabase + Stripe env vars and the webhook URL',
    prompt5Title: 'Auth + subscription gating + Stripe billing',
    prompt5Body: 'Build the core of a SaaS app with Next.js, Supabase Auth and Stripe subscriptions:\n1. server-side auth guard for /app routes,\n2. Stripe Checkout to start a subscription and a Customer Portal link,\n3. a webhook that upserts subscription status into a `subscriptions` table,\n4. a server helper `getActiveSubscription(userId)` used to gate a paid feature.\nVerify webhook signatures and keep secrets server-side. Return complete files.',
    stackWhy: 'This is the standard modern SaaS stack: Next.js app + Supabase (auth/DB) + Stripe (subscriptions), all with free starting tiers.',
    altBeginner: 'Start from an open-source **SaaS starter** (e.g. a Next.js + Supabase + Stripe template) and customise.',
    altScale: 'Introduce a queue (Inngest), transactional email (Resend), and per-tenant Postgres schemas as you grow.',
    bonusPrompts: '## Bonus — Pricing strategy\n\n```\nSuggest a 3-tier pricing model for {{product}} targeting {{audience}}.\nFor each tier: name, monthly price, included limits, and the one feature that\njustifies upgrading. Explain the psychology briefly.\n```\n\n## Bonus — Webhook security check\n\n```\nReview my Stripe webhook handler for missing signature verification, replay\nprotection, and idempotency. {{paste code}} Return exact fixes.\n```',
  },
  {
    slug: 'event-conference-website',
    title: 'Event / Conference Website',
    summary: 'A site for an event: schedule, speakers, tickets/registration and venue info.',
    summaryMy: 'အစီအစဉ်၊ speaker များ၊ ticket/registration နဲ့ venue အချက်အလက် ပါတဲ့ event website။',
    difficulty: 'Intermediate', time: '2–3 days',
    stack: ['Next.js', 'React', 'Tailwind CSS'],
    goal: 'get a visitor to register/buy a ticket and know when/where to show up',
    pages: ['Home', 'Schedule/Agenda', 'Speakers', 'Register/Tickets', 'Venue & FAQ'],
    extraPrereq: ['(Optional) a **Stripe** account if you sell paid tickets'],
    createCmds: ['npx create-next-app@latest my-event --ts --tailwind --eslint --app', 'cd my-event'],
    devCmd: 'npm run dev', devUrl: 'http://localhost:3000',
    sectionsGuide: '- **Home:** date, place, one-line pitch, countdown timer, register CTA.\n- **Schedule:** a day/track agenda built from data.\n- **Speakers:** cards with photo, bio, talk title.\n- **Register:** free RSVP form OR Stripe ticket checkout.\n- **Venue/FAQ:** map, travel info, common questions.',
    dataGuide: '- Keep schedule, speakers and FAQs in typed arrays for easy edits.\n- Free events: RSVP form → Formspree/Google Sheet. Paid: Stripe Checkout per ticket type.',
    host: 'Vercel', hostNote: 'zero config for Next.js',
    prompt5Title: 'Schedule/speakers data + registration',
    prompt5Body: 'Create typed data for an event: speakers (name, title, photo, bio) and a\nmulti-track schedule (day, time, track, session, speakerId). Render an\naccessible agenda and a speakers grid. Then build a registration form\n(name, email, ticket type) that posts to {{Formspree endpoint}}; include an\noptional Stripe Checkout path for paid tickets. Return complete files.',
    stackWhy: 'Content is mostly fixed until the event, so a fast static-ish Next.js site is cheap, reliable under launch-day traffic, and free to host.',
    altBeginner: 'Use **Luma** or **Eventbrite** for registration + a simple one-page site linking to them.',
    altScale: 'Add a CMS (Sanity) so organisers update the agenda live, and a check-in app for the door.',
    bonusPrompts: '## Bonus — Speaker outreach email\n\n```\nWrite a warm invitation email asking {{name}} to speak at {{event}} on {{date}}.\nInclude the ask, audience size, topic fit, and what we provide. Keep it under 150 words.\n```',
  },
];

// ── Emit files ───────────────────────────────────────────────────────────────
function writeKit(k) {
  const dir = path.join(OUT, k.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'README.md'), `# ${k.title}\n\n${k.summary}\n\n**မြန်မာ:** ${k.summaryMy}\n\nThis folder contains everything you need to build this website type:\n\n- **GUIDE.md** — the full step-by-step build guide\n- **PROMPTS.md** — copy-paste AI prompts for every step\n- **TECH-STACK.md** — the recommended stack + alternatives\n- **CHECKLIST.md** — a printable build & launch checklist\n\nStart with **GUIDE.md**, and keep **PROMPTS.md** open beside it.\n`);
  fs.writeFileSync(path.join(dir, 'GUIDE.md'), GENERIC_STEPS(k));
  fs.writeFileSync(path.join(dir, 'PROMPTS.md'), PROMPTS(k));
  fs.writeFileSync(path.join(dir, 'TECH-STACK.md'), TECH(k));
  fs.writeFileSync(path.join(dir, 'CHECKLIST.md'), CHECKLIST(k));
}

function writeTopLevel() {
  fs.mkdirSync(OUT, { recursive: true });
  const list = KITS.map((k, i) => `${i + 1}. **${k.title}** \`/${k.slug}\` — ${k.summary}`).join('\n');
  fs.writeFileSync(
    path.join(OUT, 'README.md'),
    `# 🌐 TU Project Archive — Website Building Kit\n\nA complete, beginner-friendly toolkit for building ${KITS.length} common website types.\nEach type has a step-by-step guide **and** a full pack of copy-paste AI prompts, so\nyou can go from idea to a deployed site — even if you are new to web development.\n\n> မြန်မာ: ဒီ kit ထဲမှာ website အမျိုးအစား ${KITS.length} မျိုးအတွက် အစအဆုံး လမ်းညွှန်ချက်တွေနဲ့\n> AI prompt အပြည့်အစုံ ပါဝင်ပါတယ်။ web development အသစ်စတင်သူတွေလည်း အသုံးပြုနိုင်ပါတယ်။\n\n## What's inside\n\n${list}\n\n## How to use this kit\n\n1. Pick the website type closest to what you want to build.\n2. Open that folder and read **GUIDE.md** top to bottom.\n3. Keep **PROMPTS.md** open — paste each prompt into your AI assistant as you reach that step.\n4. Use **CHECKLIST.md** to make sure you didn't miss anything before launch.\n\n## What you need (all free to start)\n\n- A computer with **Node.js** and **Git** installed\n- **VS Code** (or any editor)\n- A **GitHub** account and a **Vercel/Netlify** account for free hosting\n- An **AI assistant** (ChatGPT, Claude, Gemini, or Cursor/Copilot in your editor)\n\n## Golden rules\n\n- **Ship small, ship often.** Get one page live, then improve.\n- **Never paste code you don't understand** — ask the AI to explain it.\n- **Keep secrets server-side.** API keys never belong in client code or Git.\n- **Test on a real phone** before you call it done.\n\n---\n\n_© TU Project Archive Website Kit. For personal & educational use by the purchaser._\n`,
  );
  fs.writeFileSync(
    path.join(OUT, 'START-HERE.md'),
    `# 👋 Start Here\n\nWelcome! You just unlocked the **TU Project Archive Website Kit**.\n\n**Step 1:** Open **README.md** for the full index of ${KITS.length} website types.\n\n**Step 2:** Not sure which to pick?\n\n| If you want to… | Build this |\n|---|---|\n| Show your work / get hired | Personal Portfolio Website |\n| Launch a product & collect leads | Business / Startup Landing Page |\n| Sell products online | E-Commerce Store |\n| Publish articles | Blog / Content Website |\n| Manage data internally | Admin Dashboard |\n| Promote a restaurant/cafe | Restaurant / Cafe Website |\n| Charge a monthly subscription | SaaS Web App |\n| Run an event | Event / Conference Website |\n\n**Step 3:** Open that folder → read **GUIDE.md** → keep **PROMPTS.md** beside it.\n\nHappy building! 🚀\n`,
  );
}

writeTopLevel();
KITS.forEach(writeKit);
console.log(`Generated ${KITS.length} kits into ${OUT}`);
