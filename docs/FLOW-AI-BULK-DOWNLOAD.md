# Auto-downloading your Google Flow images

**Important truth first:** a text *prompt* can never make Flow auto-save files.
A prompt only controls what is *inside* the picture — saving the file is the
**browser's** job, not the image model's. So "auto-save" needs one of the two
methods below, not a prompt.

---

## Method 1 — Browser console script (fastest, no install)

After you've generated a page full of images in Google Flow, this script finds
**every image on the page and downloads them all at once** into your Downloads
folder, numbered automatically.

### Steps
1. In Google Flow, scroll through the whole project page so **all** the images
   you want have loaded (lazy-loaded images must be visible at least once).
2. Press **F12** (or Ctrl+Shift+I / Cmd+Option+I) to open DevTools → click the
   **Console** tab.
3. Paste the whole script below and press **Enter**.
4. If the browser asks *"Download multiple files?"* click **Allow**.
5. The files save one after another as `flow-0001.png`, `flow-0002.png`, …

```javascript
(async () => {
  // Collect candidate images: real <img> tags + CSS background images.
  const urls = new Set();
  document.querySelectorAll('img').forEach((img) => {
    const u = img.currentSrc || img.src;
    // Skip tiny icons / avatars; keep real generated images.
    if (u && (img.naturalWidth > 256 || u.startsWith('blob:') || u.startsWith('data:'))) urls.add(u);
  });
  document.querySelectorAll('*').forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    const m = bg && bg.match(/url\("?(.+?)"?\)/);
    if (m && m[1] && !m[1].startsWith('data:image/svg')) urls.add(m[1]);
  });

  const list = [...urls];
  console.log(`Found ${list.length} images. Starting download…`);

  let n = 0;
  for (const url of list) {
    n++;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `flow-${String(n).padStart(4, '0')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      // Small pause so the browser doesn't block the burst of downloads.
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.warn('Skipped', url, e);
    }
  }
  console.log(`Done. Triggered ${n} downloads.`);
})();
```

### Tips
- To save into a specific folder, first set it in
  `chrome://settings/downloads` (turn *"Ask where to save"* OFF and point the
  Download location at your target folder).
- If some images are missing, scroll the page fully first (Flow loads images
  only when they scroll into view), then re-run the script.
- The script downloads the **display-resolution** image. If you need Flow's
  upscaled/hi-res version, open that image's hi-res view first, or use Method 2.

---

## Method 2 — Chrome extension (fully hands-free: generate + auto-save)

If you also want the **generation** automated (paste the whole prompt list, walk
away, every image auto-downloads to a named folder), use a Google-Flow automation
extension. Search the Chrome Web Store for one of these and install it:

- **Flow Bulk Gen** — queue prompts, auto-generate, auto-download to a
  `FlowBulkGen` folder.
- **Google Flow Automator** — prompt queue + CSV import + auto-download + custom
  file names.
- **Flow Image Automator** — bulk text-to-image + auto-download + CSV log.

### Steps
1. Install the extension, open `labs.google/fx/tools/flow`, open the extension
   side panel.
2. Paste the **STYLE INSTRUCTION** block from `FLOW-AI-WIRING-PROMPTS.txt` into
   Flow once (so the style is fixed).
3. Paste the prompts into the extension's queue box (it reads one prompt per
   block/line), pick a download folder + naming, hit **Start**.
4. It submits each prompt, waits for the render, and **auto-downloads** every
   result — no manual saving.

> The download folder is a subfolder of your Chrome Downloads folder; rename it
> per project in the extension, or change the parent in `chrome://settings/downloads`.

---

## Which should I use?

| Need | Use |
| --- | --- |
| I already generated the images, just save them all fast | **Method 1** (console script) |
| I want generation **and** saving fully automated end-to-end | **Method 2** (extension) |
| I want a specific save folder | Set it in `chrome://settings/downloads` (both methods) |
