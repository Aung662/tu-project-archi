# Google Flow ပုံများကို အလိုအလျောက် Download လုပ်နည်း

**အရင်ဆုံး အမှန်တရား:** prompt (စာသား) က ပုံကို auto-save လုပ်လို့ မရပါ။ prompt က
ပုံ**ထဲမှာ** ဘာပါမလဲဆိုတာကိုပဲ ထိန်းလို့ရတယ် — ဖိုင် save တာက **browser ရဲ့ အလုပ်**၊
image model ရဲ့ အလုပ် မဟုတ်ပါ။ ဒါကြောင့် "auto-save" အတွက် အောက်က နည်း ၂ ခုထဲက
တစ်ခု လိုတယ် — prompt မဟုတ်ပါ။

---

## နည်း ၁ — Browser Console Script (အမြန်ဆုံး၊ install မလို)

Google Flow မှာ ပုံတွေ generate ပြီးသွားရင်၊ ဒီ script က **page ပေါ်က ပုံအားလုံးကို
တစ်ခါတည်း download** လုပ်ပေးပါတယ် — Downloads folder ထဲ၊ နံပါတ်နဲ့ အလိုအလျောက်။

### အဆင့်များ
၁။ Google Flow မှာ project page ကို အောက်အထိ scroll ချ၊ လိုချင်တဲ့ ပုံအားလုံး
   load ဖြစ်အောင် လုပ်ပါ (lazy-load ပုံတွေ တစ်ခါတော့ မြင်ရဖို့ လိုတယ်)။
၂။ **F12** နှိပ်ပါ (သို့ Ctrl+Shift+I / Cmd+Option+I) → **Console** tab ကို နှိပ်။
၃။ အောက်က script အားလုံးကို paste လုပ်ပြီး **Enter** နှိပ်ပါ။
၄။ browser က *"Download multiple files?"* မေးရင် **Allow** နှိပ်ပါ။
၅။ ဖိုင်တွေ `flow-0001.png`၊ `flow-0002.png`၊ … အဖြစ် တစ်ခုပြီးတစ်ခု save ဖြစ်မယ်။

```javascript
(async () => {
  // Collect candidate images: real <img> tags + CSS background images.
  const urls = new Set();
  document.querySelectorAll('img').forEach((img) => {
    const u = img.currentSrc || img.src;
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
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.warn('Skipped', url, e);
    }
  }
  console.log(`Done. Triggered ${n} downloads.`);
})();
```

### အကြံပြုချက်များ
- သတ်မှတ် folder ထဲ ချချင်ရင် အရင်ဆုံး `chrome://settings/downloads` မှာ
  *"Ask where to save"* ကို **OFF** လုပ်ပြီး Download location ကို သင်လိုချင်တဲ့
  folder ထားပါ။
- ပုံ တချို့ ပျောက်နေရင် page ကို အရင် အောက်အထိ scroll ချပါ (Flow က ပုံတွေ scroll
  လုပ်မှ load လုပ်တာမို့)၊ ပြီးရင် script ပြန် run ပါ။
- ဒီ script က **display resolution** ပုံ download လုပ်တယ်။ Flow ရဲ့ hi-res /
  upscale version လိုချင်ရင် အဲဒီပုံရဲ့ hi-res view ကို အရင်ဖွင့်ပါ (သို့ နည်း ၂
  သုံးပါ)။

---

## နည်း ၂ — Chrome Extension (အစအဆုံး auto: generate + auto-save)

**generate ပါ** အလိုအလျောက် လုပ်ချင်ရင် (prompt list အကုန် paste၊ ထွက်သွား၊ ပုံတိုင်း
folder ထဲ auto-download)၊ Google Flow automation extension သုံးပါ။ Chrome Web
Store မှာ အောက်ကထဲက တစ်ခု ရှာ install လုပ်ပါ —

- **Flow Bulk Gen** — prompt queue၊ auto-generate၊ `FlowBulkGen` folder ထဲ
  auto-download။
- **Google Flow Automator** — prompt queue + CSV import + auto-download + နာမည်
  custom။
- **Flow Image Automator** — bulk text-to-image + auto-download + CSV log။

### အဆင့်များ
၁။ Extension install၊ `labs.google/fx/tools/flow` ဖွင့်၊ extension side panel ဖွင့်။
၂။ `FLOW-AI-PROMPTS-ONELINE.txt` (သို့ `.csv`) ကို extension ထဲ ထည့်ပါ။
၃။ download folder + နာမည် ရွေး၊ **Start** နှိပ်ပါ။
၄။ prompt တစ်ခုချင်း submit၊ render စောင့်၊ ပြီးတိုင်း **auto-download** — လက်နဲ့
   သိမ်းစရာ မလို။

> download folder က Chrome Downloads ရဲ့ subfolder ပါ။ project အလိုက် extension
> ထဲမှာ နာမည်ပြောင်း (သို့ `chrome://settings/downloads` မှာ parent ပြောင်း)။

---

## ဘယ်နည်း သုံးမလဲ

| လိုအပ်ချက် | သုံးရမယ့်နည်း |
| --- | --- |
| ပုံ ထုတ်ပြီးသား၊ အမြန် အကုန် save ချင် | **နည်း ၁** (console script) |
| generate ရော save ရော အစအဆုံး auto | **နည်း ၂** (extension) |
| သတ်မှတ် folder ထဲ ချချင် | `chrome://settings/downloads` မှာ သတ်မှတ် (နည်း ၂ ခုလုံး) |
