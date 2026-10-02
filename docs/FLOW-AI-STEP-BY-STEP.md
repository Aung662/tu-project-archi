# Step-by-step: generate wiring images for ALL controllers

Your prompt files already cover **16 controllers**, not just Arduino — each with
94 component wiring diagrams (1,504 images total):

Arduino Uno R3 · Arduino Nano · Arduino Mega 2560 · Arduino Pro Mini · ESP32
DevKit V1 · ESP32-CAM · ESP8266 · NodeMCU · Raspberry Pi Pico · Raspberry Pi 4 ·
STM32 Blue Pill · Teensy 4.0 · ATtiny85 · BBC micro:bit v2 · Jetson Nano ·
Orange Pi.

Every prompt already has that board's **real, verified pins** baked in, so you do
NOT edit anything — you just feed the list in and let it run.

---

## Which file to open

| You want… | Open this file |
| --- | --- |
| Paste into a "one prompt per line" extension | `FLOW-AI-PROMPTS-ONELINE.txt` |
| Import into a CSV extension (keeps exact filenames) | `FLOW-AI-PROMPTS.csv` |
| Read/verify by eye, section per board | `FLOW-AI-WIRING-PROMPTS.txt` |

---

## PART A — One-time setup (do this once)

1. **Install** a Google-Flow automation extension from the Chrome Web Store
   (e.g. *Flow Bulk Gen*, *Google Flow Automator*, or *Flow Image Automator*).
2. **Set the download folder:** open `chrome://settings/downloads` →
   turn **OFF** *"Ask where to save each file"* → set *Download location* to a
   folder you make for this, e.g. `Wiring-Images`.
3. Open **`labs.google/fx/tools/flow`** and sign in.
4. Open the extension's **side panel** (click its icon).
5. In the extension, choose: image model (**Imagen 4 / Nano Banana**),
   **aspect ratio 16:9**, and turn **Auto-download ON**.

You never need to paste a separate "style" block — the style is already inside
every prompt line.

---

## PART B — The layout of the prompt list (so you can pick any controller)

`FLOW-AI-PROMPTS-ONELINE.txt` is grouped by board, **94 lines per board**, in this
exact order:

| Board | Line range |
| --- | --- |
| Arduino Uno R3 | 1 – 94 |
| Arduino Nano | 95 – 188 |
| Arduino Mega 2560 | 189 – 282 |
| Arduino Pro Mini | 283 – 376 |
| ESP32 DevKit V1 | 377 – 470 |
| ESP32-CAM | 471 – 564 |
| ESP8266 | 565 – 658 |
| NodeMCU | 659 – 752 |
| Raspberry Pi Pico | 753 – 846 |
| Raspberry Pi 4 | 847 – 940 |
| STM32 Blue Pill | 941 – 1034 |
| Teensy 4.0 | 1035 – 1128 |
| ATtiny85 | 1129 – 1222 |
| BBC micro:bit v2 | 1223 – 1316 |
| Jetson Nano | 1317 – 1410 |
| Orange Pi | 1411 – 1504 |

(In the CSV, each row's `filename` starts with the board id, e.g. `esp32__…`,
`raspberry-pi-pico__…` — filter by that prefix to grab one board.)

---

## PART C — Generate, one controller at a time (recommended)

Doing 1,504 at once is a lot, so run it **board by board**:

1. Open `FLOW-AI-PROMPTS-ONELINE.txt`.
2. **Select the line range for the board you want** (see the table above) — e.g.
   for **ESP32**, select lines **377–470**.
3. **Copy** those lines.
4. In the extension's prompt box, **paste** them.
5. Click **Start / Run**.
6. The extension now, for each line:
   - types the prompt into Flow,
   - waits for the image to finish,
   - **auto-downloads** it to your folder,
   - moves to the next line — hands-free.
7. When that board's batch finishes, come back, select the **next** board's line
   range, paste, Start again. Repeat for every controller you need.

> Tip: keep a simple checklist — tick each board as its batch completes, so you
> know where to resume.

### Doing ALL of it in one go (optional)
If your extension and Flow quota can handle it, just **select the whole file
(Ctrl+A), copy, paste, Start**. It will run all 1,504 in sequence. A board-by-board
run is only safer against quota limits / browser slow-downs.

---

## PART D — After generation

- Files land in your chosen folder. With the **CSV** route they are named exactly
  like `esp32__hc-sr04.png`; with the plain line route the extension numbers them
  in order — same order as the table above, so they're still easy to sort.
- Spot-check a few against the site: open the project's **/wiring** page, pick the
  same board, and confirm the pins match (they will — both come from the same
  verified data).

---

## Reminder

- **A prompt cannot auto-save a file** — saving is done by the extension (or the
  console script in `FLOW-AI-BULK-DOWNLOAD.md`). The prompt only defines the
  picture.
- The pins in every prompt are already correct for that specific board — do not
  hand-edit them.
