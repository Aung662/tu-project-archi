# Frontend color and first-visit review — 2026-10-08

## Scope and method

Reviewed the shared frontend palette and component styles; light/dark theme behavior; student-facing home/search page; responsive navigation; common status text; chart colors; project placeholder thumbnails; and first-visit path. Checked representative utility shades in context, including the filled Tailwind brand shades and inactive rating icons. This is a focused benchmark against authoritative guidance and established design systems—not a claim to have audited every website worldwide.

## Benchmarks consulted

- **W3C WCAG 2.2:** Success Criterion 1.4.3 sets a minimum 4.5:1 contrast ratio for normal text and 3:1 for large text; SC 1.4.11 sets 3:1 for meaningful UI component boundaries and graphical objects. These are measurable thresholds, not subjective impressions. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [SC 1.4.11 explanation](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- **Material Design 3:** uses semantic color roles and paired foreground/surface roles so hierarchy, light/dark adaptation, and contrast are designed as a system rather than improvised component by component. [Material color system](https://m3.material.io/styles/color/overview)
- **Nielsen Norman Group:** a homepage should state what the site does, surface the highest-priority tasks, show useful content, and avoid popup/splash barriers and competing emphasis. [113 homepage usability guidelines](https://www.nngroup.com/articles/113-design-guidelines-homepage-usability/) · [5 homepage design principles](https://www.nngroup.com/articles/homepage-design-principles/)
- **Apple Human Interface Guidelines:** make the most likely action prominent, keep prominent buttons to one or two per view, and use clear labels. [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)

## Findings before the changes

1. **Primary-action labels did not meet AA contrast.** White text over the old blue `#6d8bff` was **3.09:1**; over the old plum `#a56bff` it was **3.42:1**. Both are below 4.5:1 for normal-sized button text.
2. **The light theme inherited pale dark-theme text tints.** On the old `#f4f6fb` page, `brand-300 #a5b4fc` reached **1.84:1**, `brand-200 #c7d2fe` **1.38:1**, and `brand-100 #e0e7ff` **1.14:1**. Light-theme `slate-500 #64748b` was **4.40:1**; dark-theme `slate-500 #64748b` on `#070b16` was **4.13:1**. Several success/error/warning tints had the same light-on-light problem.
3. **A dark utility shade was too dim for meaningful icons.** Inactive review stars used `text-slate-600` (`#475569`) on a dark card, only about **2.21:1** against the surface; the icon boundary target is 3:1.
4. **The brand utility ramp was close to, or below, the dark-surface boundary target.** The old `brand-700 #3857b8` was **2.90:1** against the page and about **2.6:1** against a dark card. It was the end-stop of a floating action gradient. Several `brand-500`/`brand-600` filled active controls also fell just short of 3:1 against dark card surfaces.
5. **Project placeholder initials were difficult to read.** With the old bright eight-gradient palette, 92%-opaque white initials reached only **1.61:1 to 3.07:1** in a conservative sample that included the white decorative overlays. The additional emoji badges varied by operating system and made the tile language feel less consistent.
6. **The home page over-emphasized decoration.** Moving multicolor glows, glass effects, sheen, animated gradients, and two large beveled CTAs all competed with the actual first task: search the project archive.
7. **A full-screen welcome modal delayed access to the real product.** It showed randomized artwork, repeated a greeting, auto-dismissed after nine seconds, and did not need to exist to explain the service—the hero already describes the archive and its no-login search.
8. **Browser chrome always received a light theme color.** A static light `themeColor` disagreed with the dark theme on a first visit or when a saved dark preference was active.
9. **A mobile footer row overflowed.** Browser inspection measured a **488px** document width at a **390px** viewport because the footer link row could not wrap. The Burmese language control also relied on a system fallback font, and key emoji/glyph icons rendered inconsistently without emoji fonts.

## Changes implemented

- Replaced the neon blue/plum/mint action treatment with a **semantic blue primary, teal accent, readable neutral surfaces, and separate success/warning/error roles**. Updated the filled Tailwind brand ramp so brand-500/600/700 controls keep white labels above 4.5:1 and contrast their dark card surfaces above 3:1.
- Raised the dark primary fill to `#4164cf` and hover to `#466ce0`. The white labels measure **5.32:1** and **4.69:1**; the fills measure **3.15:1** and **3.57:1** against the dark surface token.
- Defined coordinated light/dark tokens for body text, secondary text, links, buttons, focus indicators, form fields, status colors, headlines, chart series, and muted icons. Added careful light-theme mappings for legacy Tailwind status/brand classes and white-alpha/dark-surface utilities.
- Replaced the dark inactive-star color with a semantic muted-icon role. It measures **4.33:1** on the dark surface and **7.58:1** in light mode.
- Rebuilt project placeholders with deep, restrained jewel-tone gradients and consistent department-code badges instead of platform-dependent emoji. The checker samples 101 points per gradient with a conservative 15% white decorative overlay; opaque title initials now measure **5.26:1–6.38:1**. Made SVG gradient IDs unique so repeated copies of the same project cannot collide.
- Increased form/control outlines and keyboard focus rings; raised shared buttons, theme/language switches, mobile menu control, and choice chips to a 44px minimum target.
- Made the theme follow the operating-system preference on a first visit, while retaining the user's saved manual choice and live toggle. The pre-hydration script applies both the page theme and browser `theme-color` before first paint; the theme provider keeps the browser chrome synchronized after toggles and OS changes.
- Replaced key navigation, search, and feature emoji/glyphs with inline SVG icons for consistent rendering. Applied the bundled Noto Sans Myanmar face to Burmese UI text and the runtime Burmese theme.
- Made footer links wrap on narrow screens; browser checks now show no horizontal overflow at 390px in either English or Burmese.
- Reworked the home hero into one clear search task, one prominent browse action, and one secondary title-check action. Replaced large 3D buttons and rainbow gradients with a restrained two-color headline and static ambient background.
- Removed the blocking welcome modal; first-time visitors now arrive directly at the archive search. Kept the existing no-login explanation and real recent/trending/new project content.
- Switched chart axes/series to theme-aware tokens so chart labels and lines do not disappear on light surfaces.
- Added `npm run check:colors`, a reusable contrast regression guard. It tests semantic token pairs in both themes, the filled brand utilities against page/card surfaces and white labels, the muted icon role, and sampled project-thumbnail gradients.

## Current automated contrast checks

`npm run check:colors` passes in both themes. Selected current ratios:

| Pair | Dark | Light | Minimum |
|---|---:|---:|---:|
| Main text / page | 17.11:1 | 14.97:1 | 4.5:1 |
| Secondary text / page | 10.11:1 | 5.70:1 | 4.5:1 |
| Link text / page | 11.21:1 | 7.00:1 | 4.5:1 |
| Primary button label / fill | 5.32:1 | 5.32:1 | 4.5:1 |
| Primary button label / hover fill | 4.69:1 | 7.32:1 | 4.5:1 |
| Primary button fill / card surface | 3.15:1 | 5.32:1 | 3:1 |
| Input border / input surface | 3.97:1 | 3.38:1 | 3:1 |
| Focus indicator / page | 10.34:1 | 7.47:1 | 3:1 |
| Muted icon / card surface | 4.33:1 | 7.58:1 | 3:1 |
| Lowest brand-500/600/700 fill / dark card | 3.09:1 | — | 3:1 |
| Lowest thumbnail-initial contrast (8 palettes) | 5.26:1 | — | 4.5:1 |

The lowest filled brand shade against the dark card is brand-700 at **3.09:1**; its white label measures **5.42:1**. Full individual pairs and values are printed by the checker.

## Validation and limits

- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run check:colors` pass; frontend tests: **8 passed**.
- `npm run build` completed successfully after the color and first-visit changes. Wiring build/quality gates also passed: 338 candidate hashes checked, 337 pending, 1 rejected, 0 approved, and 0 unreviewed public images.
- The live frontend and same-origin API proxy were smoke-tested: homepage and `/wiring` returned HTTP 200, and the home hero/API content loaded. The non-blocking welcome modal copy is absent from the rendered home response.
- Captured and inspected the production homepage in desktop dark/light and 390px mobile English/Burmese states. The mobile footer overflow was fixed; final document width equals the viewport in both languages. Theme toggles updated browser `theme-color` correctly, the Noto Sans Myanmar face loaded, and there were no uncaught browser page errors. Anonymous `/api/auth/me` checks returned the expected 401 response.
- This was a focused homepage visual inspection, not a page-by-page or assistive-technology audit; the production preview remains available for interactive review.
- `npm audit --omit=dev` found **zero production dependency vulnerabilities** in both frontend and backend. The full frontend install reported **9 audit advisories (2 moderate, 7 high)** in the complete dependency tree; these were not investigated or changed as part of this visual/accessibility pass.
- The script checks declared semantic pairs, selected filled utility shades, and sampled project-thumbnail gradients—not every rendered component, arbitrary image, user-uploaded image, CSS state, gradient pixel, browser state, or assistive-technology flow. It is a regression guard, **not a formal WCAG conformance claim**. Full accessibility still needs browser-level visual, keyboard, and screen-reader testing, especially on content pages that use imagery and project-specific colors.
