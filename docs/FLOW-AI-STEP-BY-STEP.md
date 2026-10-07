# Step-by-step: generate wiring images for ALL controllers

Your prompt files already cover **16 controllers**, not just Arduino — each with
65 component wiring diagrams (1,040 images total):

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

`FLOW-AI-PROMPTS-ONELINE.txt` is grouped by board, **65 lines per board**, in this
exact order:

| Board | Line range |
| --- | --- |
| Arduino Uno R3 | 1 – 65 |
| Arduino Nano | 66 – 130 |
| Arduino Mega 2560 | 131 – 195 |
| Arduino Pro Mini | 196 – 260 |
| ESP32 DevKit V1 | 261 – 325 |
| ESP32-CAM | 326 – 390 |
| ESP8266 | 391 – 455 |
| NodeMCU | 456 – 520 |
| Raspberry Pi Pico | 521 – 585 |
| Raspberry Pi 4 | 586 – 650 |
| STM32 Blue Pill | 651 – 715 |
| Teensy 4.0 | 716 – 780 |
| ATtiny85 | 781 – 845 |
| BBC micro:bit v2 | 846 – 910 |
| Jetson Nano | 911 – 975 |
| Orange Pi | 976 – 1040 |

> Note: parts with no meaningful "connect to a board pin" diagram are
> intentionally **excluded** — inline discretes (resistor, capacitor, diode,
> crystal, inductor, fuse, transistor), power supplies/converters/cells
> (buck, boost, TP4056, AMS1117, batteries…), bare motors/mechanicals driven
> through a driver, and industrial mains gear (PLC, VFD, contactor…). Drawing an
> "IN+ → D2" wire for those would be misleading, so only the 65 genuinely
> MCU-wireable components per board are generated.

(In the CSV, each row's `filename` starts with the board id, e.g. `esp32__…`,
`raspberry-pi-pico__…` — filter by that prefix to grab one board.)

---

## PART C — Generate, one controller at a time (recommended)

Doing 1,040 at once is a lot, so run it **board by board**:

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
(Ctrl+A), copy, paste, Start**. It will run all 1,040 in sequence. A board-by-board
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
