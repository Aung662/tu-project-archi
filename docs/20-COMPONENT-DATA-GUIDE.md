# 20 — Component Toolkit: Data Model & How to Add Things Cleanly

This guide keeps the **Components Toolkit** (`/toolkit`) easy to extend without
clutter or confusion. Read it before adding a new component, photo, spec, or
test sketch.

## Where each piece lives (one job per file)

| File | Responsibility | Keyed by |
| --- | --- | --- |
| `frontend/src/data/components.ts` | Identity: `id`, `name`, `glyph`, `category`, `blurb`, `tags`. Also the `CATEGORIES` list (hardware vs software groups). | array of `ComponentItem` |
| `frontend/src/data/componentSpecs.ts` | Datasheet-style spec rows (label → value). | `id` → `SpecRow[]` |
| `frontend/src/data/componentGuide.ts` | Usage guide: `whatFor`, `useCases`, `pinout`, `wiring`, **`code` (test/starter sketch)**, `cautions`, `price`, `alternatives`, `libraries`, `difficulty`. | `id` → `ComponentGuide` |
| `frontend/src/data/componentPhotos.ts` | Optional real product photo path. Falls back to the generated SVG glyph. | `id` → photo URL |
| `frontend/src/data/glyphs.ts` | The brand-neutral SVG glyph shapes. | glyph name |

**Rule:** the `id` is the single join key across all five files. Never rename an
`id` without updating every file — otherwise specs/guide/photo silently detach.

## Adding a new component (checklist)

1. Add the entry to `components.ts` with a **unique kebab-case `id`** and a
   `category` that already exists in `CATEGORIES`.
2. (Optional but encouraged) Add spec rows in `componentSpecs.ts`.
3. Add a guide block in `componentGuide.ts`. Use the `L(my, en)` helper for
   every human-readable string so it stays bilingual (Burmese-first).
4. (Optional) Register a photo in `componentPhotos.ts`; otherwise the glyph is
   used automatically.
5. Run `./node_modules/.bin/tsc --noEmit` in `frontend/` — it must exit 0.

## The `code` field — Arduino / native test sketches

Every **hardware** component ships a runnable test/verify sketch so a student can
confirm the part works on the bench. Convention:

```ts
code: {
  lang: 'Arduino C++',           // language label shown above the block
  code: `// short comment: what this verifies + wiring
void setup(){ Serial.begin(9600); }
void loop(){ /* ... */ }`,
},
```

Guidelines:
- **Hardware parts → `lang: 'Arduino C++'`** with a real wiring comment at the
  top (pins used, resistor values, common GND). Keep it copy-paste runnable.
- **Boards that aren't Arduino** (Raspberry Pi, Pico, micro:bit, Jetson) keep
  their native language: `Python`, `MicroPython`, etc.
- **Industrial / non-programmable parts** (PLC, VFD, contactor) use a descriptive
  `lang` (`Ladder / ST`, `Modbus`, `Wiring`) — not fake C++.
- Passive/power parts (resistor, capacitor, diode, battery, breadboard…) use an
  Arduino sketch that **measures or tests** the part (RC timing, voltage divider,
  continuity), which is the honest "test code" for something with no firmware.

Coverage today: **120/120 hardware components have a `code` block.** Keep it 100%.

## Q&A presentation + in-modal language toggle

The component detail modal presents every field as a plain-language **question**
so a student can scan it like an FAQ:

- *What is it? What is it for?* → `whatFor`
- *Where can you use it?* → `useCases`
- *How do you connect it? (Pinout)* → `pinout`
- *How do you wire it? (Diagram)* → auto wiring SVG
- *How do you use it? (Test code)* → `code`
- *How much does it cost?* → `price`
- *What can you use instead?* → `alternatives`
- *Which libraries do you need?* → `libraries`
- *What should you watch out for?* → `cautions`

The modal has its **own 🌐 မြန်မာ/ENG toggle** (top-right of the header). It sets a
local `viewLang` and every guide string is read through a local `tr()` bound to
it — so a reader flips a single component's language **without** the global
switcher (which would remount the app and close the modal). The choice persists
as you page between components with ‹ / ›.

## The detail view (how data renders)

- `frontend/src/app/toolkit/page.tsx` owns the grid **and** the single shared
  detail modal. Cards are presentational (`ComponentCard`) and report clicks via
  `onOpen`; the page tracks `selectedId` and derives prev/next from the ordered,
  filtered list (hardware first, then software).
- `frontend/src/components/ComponentDetail.tsx` renders one component with:
  arrow (‹ ›) + keyboard (←/→) navigation, a Back button, right-swipe-to-go-back
  and left-swipe-to-next on touch, a position counter (`n/total`), and a
  mobile-first layout (height-capped visual — **no giant blank square** on
  phones; true square only on `md+`).

Because navigation is derived from the filtered list, it always matches exactly
what the user sees after searching/filtering — no extra state to keep in sync.

## Wiring diagrams (auto-generated)

`frontend/src/lib/wiring.ts` + `frontend/src/components/WiringDiagram.tsx` render
a *typical* Arduino-UNO connection diagram for every non-board hardware component
that has `pinout` data — **no hand-drawn SVGs to maintain**. The mapping is
heuristic and honestly labelled "example":

- power (VCC/VDD/VIN/5V/3V3) → `5V`
- ground (GND/-) → `GND`
- `SDA`→`A4`, `SCL`→`A5` (I²C)
- analog (`AO`/`A`/`PO`) → `A0, A1…`
- digital (`DO`/`DATA`/`OUT`/`TRIG`/`ECHO`/…) → `D2, D3…` (TRIG/ECHO pinned to
  D9/D10 to match the HC-SR04 starter sketch)

To improve a specific diagram, refine the token classification in
`lib/wiring.ts` (add the token to the right `classify()` bucket). The diagram
appears automatically in `ComponentDetail` above the starter code; boards are
skipped because they *are* the Arduino.

## Downloadable test sketches (per component)

Every component's authored `code` sample can be saved to a real file, not just
copied. In `ComponentDetail` the code panel offers **⧉ Copy** *and* **⬇ Download
file**. The download path lives in `frontend/src/lib/codeDownload.ts`:

- `extForLang(lang)` maps the catalogue's human `code.lang` label to a file
  extension — `Arduino C++`→`.ino`, `MicroPython`/`Python`→`.py`,
  `TypeScript`→`.ts`, `Node-RED / config`/`Workflow`→`.json`, etc.; anything
  unrecognised falls back to `.txt` (always safe).
- `codeFilename(name, lang)` slugifies the component name; Arduino sketches get a
  `_test` suffix (`dht22_test.ino`) so it's obvious this is a bring-up sketch and
  the base name is a valid Arduino sketch/folder name.
- `downloadCode()` streams a Blob → anchor download (client-side, offline-safe).

So a student browsing a sensor can grab `component_test.ino`, open it in the
Arduino IDE, and verify the hardware immediately.

## Parts-list / BOM export (from favourites)

`frontend/src/lib/bomExport.ts` turns a student's starred components into a
spreadsheet-ready **Bill of Materials CSV** (`⬇ Export parts list (CSV)` next to
the ★ Favourites chip on `/toolkit`). Columns: `#, Component, Category, Qty,
Est. price, Notes`. It reuses `lib/csv.ts` for identical quoting to the admin
import, follows catalogue order (stable output), and prefixes a UTF-8 BOM so
Excel renders Burmese/price text correctly. The price comes from each guide's
`price` field. Filename: `parts-list-YYYY-MM-DD.csv`.

## Wiring hub — every connection in one place (`/wiring`)

`frontend/src/app/wiring/page.tsx` is a dedicated **"Wiring & Pin Connections"**
page (nav: 🔌 ချိတ်ဆက်ပုံများ / Wiring) that gathers EVERY Arduino ↔ component
connection into one browsable place — instead of only inside each component's
detail modal.

- Source set: all hardware components with pinout data **except boards** (a board
  *is* the Arduino), computed once at module scope from `buildWiring()` — **95
  diagrams** across sensors, displays/LCD, actuators, comms, power, io,
  industrial, robotics.
- Each card shows the auto-generated **diagram** (reuses `<WiringDiagram/>`) OR a
  **pin-to-pin connection table** (Arduino pin ↔ component pin ↔ wire type),
  toggled by a page-level **Diagram / List** switch.
- Search box + category chips (only categories that actually have wiring show).
- Per-card **⬇ Download diagram (SVG)** via `frontend/src/lib/wiringSvg.ts`
  (`buildWiringSvg` mirrors the React diagram as a standalone string; Noto Sans
  Myanmar in the font stack so Burmese labels render in the saved file).
- Page-level 🌐 language toggle (independent of global) + **🔍 View full details**
  opens the same `ComponentDetail` modal.
- Honest footer note: diagrams are auto-generated examples — confirm against the
  datasheet + sketch pin numbers.

No new component data was authored or modified — the hub is a new *view* over the
existing `pinout` data, so original data is untouched.
