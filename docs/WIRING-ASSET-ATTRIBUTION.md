# Wiring diagram sources and attribution

**Reviewed:** 2026-10-03  
**Purpose:** keep real component artwork, electrical sources, and publication permissions traceable.

## Published source-backed recipe

The currently published curated diagram is **Arduino Uno R3 ↔ HC-SR04**. Its pin selection is explicit in `frontend/src/data/verifiedWiring.json` and the generated diagram is self-contained at `frontend/public/wiring/verified/arduino-uno__hc-sr04.svg`.

- Arduino official UNO R3 datasheet: <https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf>
- HC-SR04 user guide (pin functions, supply range and trigger/echo behavior): <https://www.handsontec.com/dataspecs/HC-SR04-Ultrasonic.pdf>
- Version-pinned Fritzing part library commit: <https://github.com/fritzing/fritzing-parts/tree/27535f2fd02097be9bed229b75aa8e9be282a4a0>

The connection plan is 5V→VCC, GND→GND, D9→TRIG and D10←ECHO. It is for a 5V Arduino Uno R3 and the standard HC-SR04 interface; do not copy the direct ECHO connection to 3.3V-only GPIO boards.

## Embedded Fritzing artwork

The generated SVG embeds these part-library assets, with wires added by this project:

| Part | Fritzing part source | Artwork source | Original credit |
|---|---|---|---|
| Arduino Uno R3 | `core/arduino_Uno_Rev3(fix).fzp` | `svg/core/breadboard/arduino_Uno_Rev3_breadboard.svg` | althaus |
| HC-SR04 | `core/hc-sr04_bf8299a_002.fzp` | `svg/core/breadboard/hc-sr04_bf8299a_002.svg` | Richard Bruneau |

Source files, SHA-256 pins, commit metadata, and the upstream license notice are kept under `frontend/quality/wiring-review/fritzing-source/`, especially `source-metadata.json`. The upstream license notice states the graphics are licensed **Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)**. The generated combined diagram is published under the same license and contains attribution in its footer and this document. Fritzing is credited as the parts-library source; no endorsement is implied.

The asset repository revision pinned for these files is `27535f2fd02097be9bed229b75aa8e9be282a4a0` (2026-07-23). Source checksums are recorded by Git history; the generator also checks the actual connector IDs against the corresponding FZP definitions before producing the SVG.

## Candidate images are not verified source art

The 338 images retrieved from the live site were generated candidate illustrations, not genuine photographs or Fritzing parts. Their HTTP 200 response and SHA-256 only establish transfer integrity. They were visually screened, and the Arduino Uno/LDR sample is unsafe/inaccurate: it depicts a 4-pin module with two green wires, omits the required voltage-divider resistor/power/ground path for the catalogued bare LDR, and is not a valid wiring guide. All candidates therefore live outside `frontend/public` and are excluded from the website until individually reviewed.

See `frontend/quality/wiring-review/review-matrix.csv` and `frontend/quality/wiring-review/README.md` for the review policy. A status of `APPROVED` requires a source URL, exact board/module identification, pin-label and wire-endpoint checks, power/ground checks, voltage-safety checks, reviewer identity, date and notes.

## License / reuse note

Fritzing's own license notice requests attribution and ShareAlike for diagrams using its artwork. Before republishing the generated diagrams elsewhere, keep the CC BY-SA 3.0 credit and license link, and do not imply Arduino, Fritzing, or the component manufacturers endorse TU Project Archive.
