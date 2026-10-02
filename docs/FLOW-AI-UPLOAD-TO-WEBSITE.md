# Flow ပုံ ၃၃၉ ပုံ → Website ပေါ် တင်နည်း (မြန်မာ)

Google Flow က ထုတ်ပေးတဲ့ wiring ပုံတွေက **ဖိုင်နာမည် ရှုပ်ပွနေ** (ဥပမာ
`Arduino_Mega_and_MPU-6050_wiring_20260909220202.jpeg`) ပြီး **အရွယ်ကြီး** တယ်။
Website က `arduino-mega__mpu6050.jpg` လို **သတ်မှတ် နာမည်** တွေ လိုတယ်။

ဒါကြောင့် **script တစ်ခု** ကို သင့် PC မှာ တစ်ခါ run လိုက်ရုံနဲ့ —
1. ဖိုင်နာမည်တွေ အလိုအလျောက် **ပြန်နာမည်ပေး** (board + module ကို ဉာဏ်နဲ့ ရှာလို့)
2. ပုံတွေ **compress** (width 1280px၊ quality 72 → size များစွာ ကျ)
3. `manifest.json` ဆောက် — website က ပုံတွေ ဘယ်မှာရှိလဲ သိအောင်

ပြီးရင် `git` နဲ့ push လိုက်ရုံ။

> ⏱️ **အချိန်ကုန်သက်သာဖို့:** ၃၃၉ ပုံ အားလုံး တစ်ခါတည်း လုပ်လို့ရ။ တစ်ပုံချင်း
> လက်နဲ့ လုပ်စရာ မလို။

---

## လိုအပ်ချက်
- **Node.js** (v18+) — https://nodejs.org မှာ install (`node --version` နဲ့ စစ်)
- Git (push လုပ်ဖို့)
- သင့် repo folder (frontend/ ပါတဲ့ folder — ဥပမာ `tu-project-archive`)

---

## အဆင့် ၁ — (ရွေးချယ်) compression enable (အထူးအကြံပြု)

ဒါက ပုံ size ကို ~၅–၁၀ ဆ လျှော့ချပေးတယ်။ တစ်ခါပဲ လုပ်ရ —

```bash
cd tu-project-archive/frontend
npm install          # dependencies (sharp ပါ package.json ထဲ ထည့်ပြီးသား)
```

`sharp` install မဖြစ်ရင်တောင် script က အလုပ်လုပ်တယ် — ပုံတွေကို compress မလုပ်ဘဲ
ကူးထည့်ပေးမယ် (size ကြီးနေမယ်ဆိုတာပဲ)။

---

## အဆင့် ၂ — script ကို run

Flow ပုံတွေ save ထားတဲ့ folder (ပုံမှန် `Downloads/GoogleFlowAutomator` သို့
`Downloads/ARduino`) နဲ့ repo path ၂ ခု ပေးရမယ်။

### Windows (Command Prompt / PowerShell)
```bat
cd tu-project-archive\frontend\scripts
node organize-wiring-images.mjs "C:\Users\YOU\Downloads\GoogleFlowAutomator" "C:\path\to\tu-project-archive"
```

### macOS / Linux
```bash
cd tu-project-archive/frontend/scripts
node organize-wiring-images.mjs ~/Downloads/GoogleFlowAutomator ~/tu-project-archive
```

- **arg 1** = Flow ပုံတွေ ရှိတဲ့ folder (subfolder တွေပါ အောက်ဆုံးထိ ရှာပေးမယ်)
- **arg 2** = သင့် repo root (frontend/ ရှိတဲ့ folder)

Script က `frontend/public/wiring/` ထဲ ပုံတွေ ပြန်နာမည်ပေးပြီး compress လုပ်ကာ
`manifest.json` ဆောက်ပေးမယ်။ သင့် **မူရင်း Flow ဖိုင်တွေ မထိ / မဖျက်** ဘူး —
copy ပဲ လုပ်တာ။

### ရလဒ် ဥပမာ
```
✓ sharp found — images will be compressed.
Found 339 image(s) in input folder.
  …processed 25
  …processed 50
  ...
✓ Organized 339 image(s) into: .../frontend/public/wiring
✓ Manifest: .../frontend/public/wiring/manifest.json (16 boards, 339 pairs)
! 0 file(s) could not be matched
```

**match မဖြစ်တဲ့ ဖိုင်ရှိရင်** → `frontend/public/wiring/unmatched-report.txt`
ထဲ စာရင်း ထွက်မယ်။ အဲဒါတွေကို ကိုယ်တိုင် `<board>__<component>.jpg` နာမည်ပေးပြီး
`frontend/public/wiring/` ထဲ ထည့်၊ manifest ထဲ ထည့်လိုက်ရုံ (သို့ ကျွန်တော့်ကို
ဖိုင်နာမည်တွေ ပြောရင် matcher ကို ချိန်ပေးမယ်)။

---

## အဆင့် ၃ — website မှာ စစ်ကြည့် (ရွေးချယ်)

```bash
cd tu-project-archive/frontend
npm run dev
```
Browser မှာ `http://localhost:3000/wiring` ဖွင့် → board (ဥပမာ **Arduino Mega**)
ရွေး → အပေါ်မှာ **📷 Photo** ခလုတ် ပေါ်လာမယ် → တကယ့်ပုံတွေ မြင်ရမယ်။
component detail modal ဖွင့်ရင်လည်း **"📷 Real wiring photos"** အပိုင်း ပေါ်မယ်။

---

## အဆင့် ၄ — Git နဲ့ push

```bash
cd tu-project-archive
git add frontend/public/wiring
git commit -m "feat(wiring): add real Flow-generated wiring photos + manifest"
git push
```

> remote မထည့်ရသေးရင် တစ်ခါတည်း —
> ```bash
> git remote add origin https://github.com/USERNAME/REPO.git
> git push -u origin main
> ```

Push ပြီးရင် host (Vercel/Netlify စသဖြင့်) က အလိုအလျောက် redeploy လုပ်ပြီး
website ပေါ် ပုံတွေ ပေါ်လာမယ်။

---

## မကြာခဏ မေးလေ့ရှိတဲ့ မေးခွန်း

**Q: ၃၃၉ ပဲ ရှိသေးတယ်၊ ၁၅၀၄ မပြည့်သေး — ရလား?**
A: ရတယ်။ website က **တစ်ဝက်တစ်ပျက်ကို ကောင်းကောင်း handle** လုပ်တယ် — ပုံရှိတဲ့
board×component က တကယ့်ပုံ ပြမယ်၊ ပုံမရှိသေးတာက အရင်လို auto-drawn Fritzing
diagram ပြနေမယ်။ နောက်ပုံတွေ ထပ်ထုတ်ပြီး script ပြန် run လိုက်ရုံ — manifest
အလိုအလျောက် update ဖြစ်မယ်။

**Q: file size ဘယ်လောက် ကျမလဲ?**
A: `sharp` နဲ့ဆို full-res JPEG (~1–3 MB) တစ်ခုကို ~150–350 KB ထိ ကျတတ်တယ်။
၃၃၉ ပုံ = ~1.5 GB → ~80–120 MB လောက်။

**Q: script က board/module မှားရင်?**
A: `unmatched-report.txt` ကြည့်၊ လက်နဲ့ ပြင်၊ သို့ ကျွန်တော့်ကို ပြောပါ — alias
ထပ်ထည့်ပေးမယ်။
