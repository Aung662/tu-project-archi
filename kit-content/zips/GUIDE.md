# Admin Dashboard / Analytics Panel — Step-by-Step Build Guide

> A data dashboard with tables, charts, auth and CRUD for an internal tool.
>
> **မြန်မာ:** table၊ chart၊ login နဲ့ CRUD ပါဝင်တဲ့ internal admin dashboard။

**Difficulty:** Advanced · **Est. time:** 3–5 days · **Stack:** Next.js, React, Tailwind CSS, Supabase, Recharts

---

## 0. Before you start (Prerequisites)

Install these once:

- **Node.js LTS** (v20+) — https://nodejs.org  → verify: `node -v`
- **Git** — https://git-scm.com  → verify: `git --version`
- **VS Code** — https://code.visualstudio.com
- A **GitHub** account (free) and a **Vercel** or **Netlify** account (free hosting)
- A **Supabase** project (free) for auth + data

> မြန်မာ: အထက်ပါ tool တွေကို အရင် install လုပ်ပါ။ terminal ထဲမှာ `node -v` ရိုက်ပြီး version ပေါ်ရင် အဆင်ပြေပါပြီ။

---

## 1. Plan the site (30 minutes, do NOT skip)

Write down, in one page:

1. **Goal** — what should a visitor be able to DO? (let an admin view metrics and manage records securely)
2. **Pages** — Login · Overview (KPIs + charts) · Records (table + CRUD) · Settings
3. **Content** — the real text/images you will show (gather them into a folder now).
4. **Brand** — 1 primary colour, 1 accent, 1 font. Keep it simple.

> Use **PROMPTS.md → Prompt 1** to have an AI turn this into a spec.

---

## 2. Create the project

```bash
npx create-next-app@latest my-dashboard --ts --tailwind --eslint --app
cd my-dashboard
npm install @supabase/supabase-js recharts
```

Open the folder in VS Code and run the dev server:

```bash
npm run dev
```

Visit **http://localhost:3000** — you should see the starter page.

---

## 3. Build the layout & pages

- Create the shared **layout** (header, nav, footer) first.
- Add each page from your plan as a route.
- Keep components small and reusable (a `Button`, a `Card`, a `Section`).

> Use **PROMPTS.md → Prompt 2 & 3** to scaffold the layout and each page.

- **Auth first:** protect every dashboard route; redirect anonymous users to login.
- **Overview:** KPI cards + a time-series chart + a distribution chart.
- **Records:** a searchable, paginated table with create/edit/delete modals.
- **Roles:** enforce permissions on the SERVER, not just by hiding UI.

---

## 4. Style it

- Start mobile-first; test at 375px width, then widen.
- Use the design tokens from your plan (one colour scale, consistent spacing).
- Add hover/focus states and smooth transitions — small touches read as "polished".

> Use **PROMPTS.md → Prompt 4** for a full styling pass.

---

## 5. Make it real (data & interactivity)

- Use **Supabase Auth** for login and **Row Level Security (RLS)** so users only see their rows.
- Fetch aggregates server-side; render charts with Recharts.

> Security: authorization must be enforced server-side. Hiding a button is not access control.

> Use **PROMPTS.md → Prompt 5** for the data/logic layer.

---

## 6. Quality pass (accessibility, SEO, performance)

- **Accessibility:** semantic HTML, alt text on images, labels on inputs, visible focus.
- **SEO:** a unique `<title>` + meta description per page; Open Graph tags for sharing.
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

```bash
git init && git add -A && git commit -m "first version"
# create an empty repo on GitHub, then:
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then import the repo on **Vercel** (set Supabase env vars in the dashboard). Every future `git push` auto-deploys.

> Use **PROMPTS.md → Prompt 7** for a deployment checklist and troubleshooting.

---

## 9. Launch checklist

- [ ] Custom domain connected (optional)
- [ ] Favicon + social share image set
- [ ] Analytics added (Plausible/Umami/GA)
- [ ] 404 page exists
- [ ] Contact route works and you receive a test message
- [ ] Lighthouse ≥ 90 across the board

🎉 **Done!** You have a live admin dashboard / analytics panel.

---

_This guide is part of the TU Project Archive Website Kit. See PROMPTS.md for the full AI prompt pack, TECH-STACK.md for alternatives, and CHECKLIST.md for a printable version._
