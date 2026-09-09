# /public/wiring — real wiring photos

Real Google-Flow-generated wiring photos live here as
`<boardId>__<componentId>.jpg` (e.g. `arduino-mega__mpu6050.jpg`), indexed by
`manifest.json`.

**Do not add files here by hand.** Run the helper on your PC instead:

```bash
node frontend/scripts/organize-wiring-images.mjs <flow-downloads-folder> <repo-root>
```

It renames + compresses the Flow downloads and rewrites `manifest.json`.
See `docs/FLOW-AI-UPLOAD-TO-WEBSITE.md` for the full walkthrough.

`manifest.json` shape:
```json
{ "arduino-mega": { "mpu6050": "arduino-mega__mpu6050.jpg" } }
```

An empty `{}` manifest is valid — the site falls back to auto-drawn Fritzing
diagrams for any pair without a photo, so a partial set never breaks the UI.
