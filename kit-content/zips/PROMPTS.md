# Admin Dashboard / Analytics Panel — AI Prompt Pack

Copy each prompt into your AI assistant (ChatGPT, Claude, Gemini, or an in-editor
tool like Cursor/Copilot). Replace `{{...}}` placeholders with your real details.
Prompts are ordered to match the build guide steps.

> မြန်မာ: အောက်ပါ prompt တွေကို AI assistant ထဲ ကူးထည့်ပါ။ `{{...}}` နေရာတွေမှာ
> ကိုယ့်အချက်အလက် အစားထိုးပါ။ တစ်ဆင့်ချင်း အစဉ်လိုက် လုပ်သွားပါ။

---

## Prompt 1 — Turn my idea into a spec

```
You are a senior product designer. I am building a admin dashboard / analytics panel.
Goal: let an admin view metrics and manage records securely
Audience: {{who will use this}}
Must-have pages: Login, Overview (KPIs + charts), Records (table + CRUD), Settings
Brand feeling: {{e.g. modern, trustworthy, playful}}

Produce:
1. A one-paragraph product summary.
2. A sitemap (pages + what each contains).
3. A component list (reusable UI pieces).
4. A colour palette (hex) + font pairing suitable for the brand feeling.
5. The single most important call-to-action per page.
Keep it concise and practical.
```

## Prompt 2 — Scaffold the project & layout

```
Create a Next.js project structure for a admin dashboard / analytics panel using Next.js + React + Tailwind CSS + Supabase + Recharts.
Give me:
- the exact terminal commands to create it,
- the folder structure,
- a shared layout with a responsive header (logo + nav + mobile menu) and a footer,
- routing set up for these pages: Login, Overview (KPIs + charts), Records (table + CRUD), Settings.
Use accessible, semantic HTML and mobile-first CSS. Return complete file contents.
```

## Prompt 3 — Build a specific page

```
Build the "{{page name}}" page for my admin dashboard / analytics panel.
It should contain: {{list the sections/content}}.
Match this design language: {{paste palette + font from Prompt 1}}.
Requirements: responsive, accessible, fast. Reuse my existing components where possible.
Return the full page file plus any new components.
```

## Prompt 4 — Styling & polish pass

```
Here is my page code:
{{paste code}}
Improve the visual design WITHOUT changing the content or breaking functionality:
- consistent spacing scale and typography,
- clear visual hierarchy,
- hover/focus/active states and subtle transitions,
- dark-mode support if easy.
Explain each change briefly, then return the updated code.
```

## Prompt 5 — Auth guard + CRUD table + charts

```
Build a protected Next.js dashboard using Supabase Auth:
1. a server-side auth guard that redirects anonymous users,
2. an Overview page with KPI cards and a Recharts time-series,
3. a Records page with a paginated, searchable table and create/edit/delete
   backed by Supabase with Row Level Security.
Enforce authorization on the server. Return complete files with comments.
```

## Prompt 6 — Accessibility, SEO & performance audit

```
Audit this page for accessibility (WCAG AA), SEO, and performance:
{{paste code}}
Return a prioritised checklist (High/Medium/Low) with the exact code fix for each item.
Include per-page <title> and meta description suggestions and Open Graph tags.
```

## Prompt 7 — Deploy & troubleshoot

```
I want to deploy my Next.js app for free.
Walk me through deploying to Vercel step by step, including:
- connecting my GitHub repo,
- environment variables I need (if any),
- custom domain setup,
- and the 3 most common deploy errors for this stack with fixes.
```

## Prompt 8 — Content & copywriting

```
Write the on-page copy for my admin dashboard / analytics panel.
Business/subject: {{describe}}
Tone: {{friendly / professional / bold}}
Language: {{English / Burmese / both}}
For each page (Login, Overview (KPIs + charts), Records (table + CRUD), Settings) give: a headline, a supporting sentence,
and the primary button label. Keep it concrete and benefit-led.
```

## Bonus — RLS policy writer

```
Write Supabase Row Level Security policies so each user can read/write only
their own rows in table {{table}}, while an "admin" role can access all rows.
Return the SQL and explain each policy.
```

---

_Tip: after each prompt, paste the AI's output into your editor, run it, and fix
one error at a time. Never paste code you don't understand — ask the AI to explain._
