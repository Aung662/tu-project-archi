# Monetization Guide — TU Project Archive

How to earn long-term, sustainable revenue from this website. Ordered from
easiest/fastest to set up → highest potential. The site already has the
technical hooks built in (ad slots, paid downloads, contact/sponsor system).

---

## 1. Display ads (Google AdSense) — passive, easiest

The site has ad slots ready (`AdSlot` component) on the Browse page and the
project detail sidebar. To turn them on:

1. Create a Google AdSense account: https://adsense.google.com (free).
2. Add your site `tu-project-archi.vercel.app` and get approved (needs some
   real content + traffic; approval can take days–weeks).
3. In AdSense, create ad units and copy: your **client id** (`ca-pub-...`) and
   each **slot id**.
4. In **Vercel → Project → Settings → Environment Variables**, add:
   ```
   NEXT_PUBLIC_ADS_ENABLED      = true
   NEXT_PUBLIC_ADSENSE_CLIENT   = ca-pub-xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_AD_SLOT_BROWSE   = 1234567890   (your leaderboard slot)
   NEXT_PUBLIC_AD_SLOT_SIDEBAR  = 0987654321   (your sidebar slot)
   ```
5. Redeploy. Ads appear automatically.

**Realistic income:** AdSense pays per 1,000 views (RPM). For a student niche in
Myanmar, expect a low RPM — this works only at real scale (tens of thousands of
monthly visits). Treat it as a bonus, not the main earner.

> Tip: don't overload pages with ads — it hurts UX and AdSense can penalize you.
> Two well-placed units (already set up) is the right amount.

---

## 2. Direct sponsor / "Advertise here" — higher value than AdSense

When AdSense isn't configured, the same ad slots show an **"Advertise here"**
house banner linking to your Contact page. Sell that space directly:

- Tutoring centers, engineering bookshops, printing/binding services, laptop &
  component sellers, internship/recruiting companies all want to reach TU
  students.
- Charge a **flat monthly fee** per banner (far better margin than AdSense).
- To place a sold banner, edit `AdSlot` usage or drop a `<Link>`/`<img>` into the
  slot — one file, no ad network cut.

**This is usually the best ad revenue for a focused niche audience.**

---

## 3. Paid project downloads — already built in ⭐

The core earner is already implemented: projects can have a **price (MMK)** and
the full file is sold via the manual KBZPay/Wave + proof-upload flow, with admin
approval. Grow it by:

- Adding more high-quality, in-demand projects (past theses, reports, code).
- Tiered pricing: cheap for abstracts/summaries, more for full report + code.
- Bundles: "all Final-Year EC projects 2025" at a discount.
- Time-limited promos to drive urgency.

**This scales with content quality, not just traffic — your strongest lever.**

---

## 4. Premium membership / subscription (future)

Offer a monthly plan (e.g. via the same manual payment flow, later automated):

- Unlimited downloads, or N downloads/month.
- Early access to newly added projects.
- Ad-free browsing (hide `AdSlot` for logged-in members).
- "Similarity check + AI summary" priority.

Recurring revenue is the most valuable long term. Start manual (approve members
like payments), automate once volume justifies it.

---

## 5. Value-added academic services

Your audience is students working on projects — sell services around that:

- **Title-similarity / plagiarism report** as a paid PDF (you already compute
  similarity + AI semantic search).
- **Proposal review / formatting** service (link from Contact).
- **Custom project guidance / consulting** (list packages on a Services page).
- **Printing & binding** partnership (referral fee).

---

## 6. Affiliate links

Add affiliate links (Shopee/Lazada/Amazon/local sellers) for tools students buy
— Arduino kits, sensors, laptops, software. Place them contextually (e.g. on IoT
project pages). You earn a commission per sale.

---

## Recommended rollout order

1. **Now:** keep adding paid projects (#3) — this already works and earns today.
2. **Now:** sell 1–2 direct sponsor banners (#2) using the built-in slot.
3. **Soon:** apply for AdSense (#1); enable once approved.
4. **Later:** launch a membership tier (#4) and academic services (#5).
5. **Ongoing:** sprinkle affiliate links (#6) where relevant.

## Keeping traffic (so ads/sales actually earn)

- The keep-alive workflow keeps the site instant (no cold starts).
- Good SEO: real titles, abstracts, and the AI summaries help search ranking.
- Share new projects to student Facebook/Telegram groups regularly.
- The AI assistant + semantic search are strong "come back again" hooks.
