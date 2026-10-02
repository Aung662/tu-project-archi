# Hands-free image generation + auto-save (Chrome extension workflow)

You picked the **fully automated** route: paste the prompt list once, walk away,
and every image auto-downloads to a folder. Most Google-Flow automation
extensions read **one prompt per line** (a `.txt`) or import a **CSV**. So use the
files made for exactly that — not the human-readable pack.

## Files to use

| File | Use with | What it is |
| --- | --- | --- |
| `FLOW-AI-PROMPTS-ONELINE.txt` | Flow Bulk Gen, most "paste prompts, one per line" extensions | **1,504 prompts, one complete prompt per line.** The fixed art style is already baked into every line, so there is **nothing else to paste first**. |
| `FLOW-AI-PROMPTS.csv` | Google Flow Automator, Flow Image Automator (CSV import) | Two columns: `filename`, `prompt`. The `filename` (e.g. `esp32__hc-sr04.png`) lets the extension name each saved file correctly. |
| `FLOW-AI-WIRING-PROMPTS.txt` | reading/checking by hand | The human-readable master pack (nicely formatted, section per board). Not ideal for pasting into an extension. |

Every prompt in all three files contains the **exact, verified pin-to-pin wiring**
so the model cannot invent pins.

## Step-by-step (extension route)

1. **Install** a Google-Flow automation extension from the Chrome Web Store, e.g.
   *Flow Bulk Gen*, *Google Flow Automator*, or *Flow Image Automator*.
2. **Set the save folder:** open `chrome://settings/downloads`, turn *"Ask where
   to save each file"* **OFF**, and point *Download location* at the folder you
   want (or let the extension use its own named subfolder — check its settings).
3. Open **`labs.google/fx/tools/flow`** and open the extension's side panel.
4. **Load the prompts:**
   - Line-based extension → open `FLOW-AI-PROMPTS-ONELINE.txt`, copy all, paste
     into the extension's prompt box.
   - CSV-import extension → choose *Import CSV* and select `FLOW-AI-PROMPTS.csv`.
5. Pick the image model (Imagen 4 / Nano Banana), aspect ratio **16:9**, and
   enable **Auto-download**.
6. Hit **Start**. The extension submits each prompt, waits for the render, and
   **auto-saves every image** — numbered/named automatically. No manual saving.

## Doing it in batches

1,504 images is a lot in one run. To keep it manageable you can paste one board's
worth at a time:

- Each board is **94 consecutive lines** in `FLOW-AI-PROMPTS-ONELINE.txt`
  (Arduino Uno = lines 1–94, Arduino Nano = 95–188, and so on, in the board order:
  uno, nano, mega, pro-mini, esp32, esp32-cam, esp8266, nodemcu, pico, raspberry-pi,
  stm32, teensy, attiny85, micro:bit, jetson-nano, orange-pi).
- Or, in the CSV, filter/sort by the `filename` prefix (`esp32__…`) and paste just
  that board's rows.

## Reminder about "auto-save via prompt"

There is no prompt that makes Flow save files — saving is the browser's job. The
extension (or the console script in `FLOW-AI-BULK-DOWNLOAD.md`) is what performs
the auto-download; the prompt only defines the picture.
