# TU Project Archive — ပြီးမြောက်မှုနှင့် ကျန်ရှိလုပ်ငန်း စစ်ဆေးချက်

**စစ်ဆေးရက်:** ၂၀၂၆-၁၀-၀၂  
**စစ်ဆေးသည့်အမြင်:** product/lead engineer အမြင်ဖြင့် repository၊ automated checks နှင့် လက်ရှိ live website ကို ခွဲခြားစစ်ဆေးထားသည်။

## အနှစ်ချုပ်ဆုံးဖြတ်ချက်

ဒီ project ဟာ **thesis/demo MVP အနေနဲ့ နောက်ဆုံးအဆင့်နီးပါး ရောက်နေပြီ**။ Core feature များကို code လုပ်ပြီး backend စမ်းသပ်မှု **82/82 အောင်မြင်**၊ frontend build/type/lint အောင်မြင်ပါတယ်။ သို့သော် **တကယ့် paid-production service အဖြစ် ၁၀၀% မပြီးသေးပါ**။ အဓိက blocker က Render Free ရဲ့ temporary disk၊ live project file မရှိခြင်း၊ live website နဲ့ လက်ရှိ workspace code/data မတူခြင်း ဖြစ်ပါတယ်။

**ခန့်မှန်းပြီးမြောက်မှု (engineering estimate — တိုင်းတာထားသော metric မဟုတ်ပါ):**

| အပိုင်း | အခြေအနေ | ခန့်မှန်းချက် |
|---|---|---:|
| Thesis/MVP အတွက် application feature များ | Core workflow ပြီး၊ feature အများစု အလုပ်လုပ် | **85–90%** |
| Code quality / local verification | tests, build, lint, typecheck, npm audit အောင် | **90%+** |
| Live content ပြည့်စုံမှု | 14 project၊ paid project file 0; အချို့ content ထပ်တင်ရန်လို | **အလယ်အလတ်** |
| Paid-production readiness | private storage/data recovery မရှိ၊ release sync မသေချာ | **မပြီးသေး** |
| Thesis research evaluation | labeled data နှင့် accuracy metric မရှိသေး | **မပြီးသေး** |

**သေချာပြောရရင်:** Thesis demo အတွက် သင့်တော်တဲ့အဆင့်ဖြစ်တယ်။ လက်ရှိ Live site သည် ဖွင့်လို့ရပြီး core public routes တွေ အလုပ်လုပ်တယ်။ ဒါပေမယ့် paid project report တွေကို တကယ်ရောင်းမယ့်အဆင့်၊ backup/recovery သေချာတဲ့ production service အဆင့် မရောက်သေးပါ။

## ၁။ Project ရဲ့ ရည်ရွယ်ချက်

**Myanmar Technological Universities Project Archive & Intelligent Title Similarity Checker** ဖြစ်ပါတယ်။ ရည်ရွယ်ချက်က—

1. အရင်နှစ် university project ခေါင်းစဉ်များကို ရှာဖွေရလွယ်အောင် စုစည်းပေးရန်။
2. ကျောင်းသားက မိမိ project ခေါင်းစဉ်ကို အရင် record များနဲ့ တူ/ဆင်တူမှု ကြိုစစ်နိုင်ရန်။
3. University၊ department၊ year၊ level စတာတွေနဲ့ archive ကို စစ်ထုတ်ကြည့်နိုင်ရန်။
4. Public မှာ metadata/summary ကိုသာ ပြပြီး full project file ကို consent + payment verification + server-side permission နဲ့ ကာကွယ်ရန်။
5. Admin တွေက project၊ user/role၊ payment၊ file၊ audit log နဲ့ analytics ကို စီမံနိုင်ရန်။

Similarity engine က Unicode/စာလုံးပုံစံ normalization လုပ်ပြီး **trigram 55% + token overlap 30% + edit-distance 15%** ဖြင့် ရမှတ်ပေးတယ်။ **ခေါင်းစဉ်ကိုသာ နှိုင်းယှဉ်တယ်; report အပြည့်အစုံ plagiarism checker မဟုတ်ပါ။** Main title checker က deterministic lexical algorithm ဖြစ်တယ်။ Gemini AI semantic search/chat က သီးခြား optional feature ဖြစ်ပြီး လက်ရှိ live မှာ ပိတ်ထားတယ်။

အပိုဆောင်း feature များမှာ component toolkit၊ wiring diagrams၊ bookmark/library၊ project comparison/notes၊ paid Website Kits၊ optional Cloudinary video၊ PWA တို့ပါဝင်တယ်။ UI က **English ကို default** ပြပြီး Burmese သို့ runtime ပြောင်းနိုင်တယ်။

## ၂။ အမှန်တကယ် စမ်းသပ်ရရှိထားသောအချက်များ

### Local workspace (လက်ရှိစစ်ထားသော code)

- Backend: **82/82 tests**, production build/typecheck အောင်မြင်။
- Frontend: TypeScript အောင်မြင်၊ ESLint **warning/error မရှိ**၊ production build အောင်မြင်ပြီး 34 routes ထုတ်ပေးနိုင်။
- Backend/frontend `npm audit`: လက်ရှိ lockfile များတွင် **vulnerability 0**။
- အရင် audit မှ တွေ့ခဲ့သော dependency advisories များကို patch လုပ်ထားတယ်။ React Hook အမှား၊ lint setup နဲ့ `--accept-data-loss` deploy flag ကိုလည်း ပြင်ထားတယ်။
- Homepage ရဲ့ hardcoded `3 universities / 7 departments / 12+ projects / AI engine` ကို public stats API မှ dynamic ယူအောင် ပြင်ထားတယ်။ Main checker က lexical algorithm ဖြစ်တဲ့အတွက် “AI-powered” ဆိုတဲ့ မမှန်ကန်နိုင်တဲ့ public copy ကိုလည်း ဖယ်ထားတယ်။ English default/Burmese switch အကြောင်း documentation ကို အတိအကျ ပြင်ထားတယ်.

### လက်ရှိ live website (HTTP/API စမ်းသပ်မှု)

- Render backend `/health`: **200**။ Vercel home၊ `/wiring`၊ public browse/search proxy: **200**။ Title check API က စမ်းသပ်ခေါင်းစဉ်အတွက် `SIMILAR_EXISTS` ပြန်ပေးတယ်။
- Public stats API က လက်ရှိ **Projects 14 / Universities 5 / Departments 11 / Full project files 0** ပြန်ပေးတယ်။ ဆိုလိုသည်မှာ code မှာ payment/download flow ရှိပေမယ့် live archive ရဲ့ project file တွေ မတင်ရသေးပါ။
- Live homepage HTML ထဲမှာတော့ **3 / 7 / 12+ / AI** ဆိုတဲ့ အဟောင်း hardcoded metrics/copy တွေ ရှိနေသေးတယ်။ Workspace code မှာ API မှ dynamic ယူအောင် ပြင်ထားပေမယ့် live ထဲ အဲဒီပြင်ဆင်ချက် မရောက်သေးတာကို အတည်ပြုနိုင်တယ်.
- Website Kits: **8 ခုစာရင်းရှိပြီး 8 ခုလုံး `hasFile: true`**။
- Cloudinary video config: **enabled**။ Gemini AI config: **disabled** (`enabled:false`)။
- Live wiring `manifest.json`: **338 board×component pair**, board type **10** မျိုး. Board တစ်မျိုးချင်းစီမှ sample image တစ်ခုစီ စမ်းရာ HTTP 200 ပြန်တယ်။
- Live `/wiring/gallery.json`: **404**။ ထို့ကြောင့် live မှာ 338 mapped cards ရှိပေမယ့် generic/duplicate/extra photos အတွက် gallery မရှိသေးပါ။

### Live data နှင့် local workspace မတူသော အန္တရာယ်

- Reviewed workspace ရဲ့ `frontend/public/wiring/manifest.json` က `{}`၊ `gallery.json` က `[]` ဖြစ်ပြီး wiring JPG အစစ် မရှိပါ။
- Live site မှာတော့ manifest 338 pair ရှိနေတယ်။
- လက်ရှိ workspace မှာ Git remote မချိတ်ထားပါ။ Latest reviewed code commit က local ဖြစ်ပြီး live deploy revision နဲ့ အတူတူလို့ အတည်မပြုနိုင်ပါ။ Dynamic homepage statistics၊ မှန်ကန်သော AI copy နဲ့ wiring gallery code တို့ကို live deploy ထဲရောက်ပြီလို့ မဆိုနိုင်သေးပါ။

> **အရေးကြီး:** လက်ရှိ workspace ကို ပုံဖိုင်/338-entry manifest ပြန်မထည့်ဘဲ တိုက်ရိုက် deploy မလုပ်ပါနဲ့။ ဒီ workspace ကနေ deploy လုပ်ရင် live site မှာ ရှိပြီးသား wiring card များကို empty manifest က အစားထိုးဖျက်သလို ဖြစ်နိုင်ပါတယ်။

## ၃။ ပြီးပြီးသား feature များ

| Feature | အခြေအနေ |
|---|---|
| Public search, autocomplete, ranked similarity, duplicate-risk verdict | Code/test ပြီး; live API စမ်းသပ်အောင်မြင် |
| Browse filters, topic/stat pages, project details | Implemented |
| Registration/login/password reset, cookie auth, RBAC | Implemented; backend tests cover auth/role paths |
| Manual MMK payment → proof upload → admin approval → protected download | Code/tests ပြီး; live published project files မရှိသေး |
| Admin project/school/user/payment/audit/analytics | Implemented |
| Project media/gallery + optional video | Code ရှိ; Cloudinary video config live enabled |
| Website Kits payment/download | Live kit 8 ခု၊ file ရှိကြောင်း API ပြန်လည်အတည်ပြု |
| Component toolkit/wiring diagrams | Code/build OK; live wiring manifest 338 pair၊ gallery မရှိ |
| English-default/Burmese runtime switch + PWA | Implemented |
| Backend security suite and test coverage | 82 automated tests pass; local `npm audit` 0 |

## ၄။ နောက်တစ်ဆင့် မဖြစ်မနေ ဆောင်ရွက်ရမည့်အရာများ — ဦးစားပေးအစီအစဉ်

### P0 — Release နှင့် wiring data ကို အရင်ညှိပါ

1. Source/PC repo ထဲက wiring JPG **338 ခုနှင့် လက်ရှိ manifest** ကို reviewed repo ထဲ ပြန်ထည့်ပါ။
2. Original Flow/image folder ကို organizer script နဲ့ run ပြီး `manifest.json`, `gallery.json`, `gallery/` ကို ပြန်ထုတ်ပါ။ Extra image အရေအတွက်ကို script output မှ အတည်ပြုပါ။
3. JSON ထဲက file တိုင်း အမှန်တကယ် ရှိ/HTTP 200 ပြန်ကြောင်း စစ်ပါ။ Live 338 pair များ မပျောက်ကြောင်း ထပ်စစ်ပါ။
4. Intended Git remote ကို ချိတ်ပြီး tested commit ကို push/deploy လုပ်ပါ။ Live `/wiring/gallery.json` က 200 ဖြစ်ရမည်။
5. Deploy အပြီး screenshot/UI နဲ့ board group/card/gallery ကို browser မှာ စမ်းပါ။

### P1 — Project archive ကို content အပြည့်ဖြည့်ပါ

1. Live API က project 14 ခုသာ ပြပြီး **full project file 0 ခု** ပြနေသည်။ အသုံးပြုခွင့်/author consent ရှိသော report/file များကို upload လုပ်ပါ။
2. University၊ department၊ year၊ level၊ abstract၊ keywords၊ price၊ authors စသည့် metadata ကို တစ်ခုချင်း အတည်ပြုပါ။
3. Consent မရသေးသော project ကို publish မလုပ်ပါနှင့်။
4. Student payment → admin proof review → access grant → download ကို **staging user** များသုံးပြီး အစအဆုံး စမ်းသပ်ပါ။

### P1 — Paid files အတွက် မပျောက်နိုင်သော storage သုံးပါ

Render Free ရဲ့ local filesystem က restart/redeploy နောက်မှာ မတည်မြဲပါ။ Paid project file၊ Kit ZIP၊ payment proof တို့ကို persistent Render disk သို့မဟုတ် private S3-compatible storage (ဥပမာ R2/S3) သို့ ပြောင်းပြီး migration လုပ်ပါ။ Backup ပြုလုပ်ရုံမက **restore test** ပါ လုပ်ပါ။ Paid files ကို public static URL အဖြစ် မတင်ပါနှင့်။ လက်ရှိလို purchase permission စစ်ပြီး server က file stream ပေးတဲ့ endpoint ကိုသာ ဆက်သုံးပါ။

### P2 — Production schema နဲ့ release process ကို ခိုင်မာစေပါ

- `prisma db push` ကို Render startup မှာ run နေပြီး checked-in migrations က SQLite ပုံစံဖြစ်တယ်။ `--accept-data-loss` ဖယ်ထားတာက ပိုလုံခြုံလာပေမယ့် production အတွက် reviewed PostgreSQL migration set လိုတယ်။
- Release မလုပ်ခင် database backup၊ migration dry-run/staging၊ rollback plan ထည့်ပါ။
- Local commit SHA နဲ့ live deploy SHA ကို တစ်ခုတည်းဖြစ်အောင် Git remote/CI/CD ချိတ်ဆက်ပါ။

### P2 — Frontend end-to-end test နှင့် monitoring တိုးပါ

Backend test 82 ခုရှိပေမယ့် frontend `*.test`/`*.spec` နဲ့ Playwright/Cypress suite မတွေ့ပါ။ `.github/workflows` ထဲမှာ keep-alive workflow တစ်ခုသာရှိပြီး push/PR တိုင်း build/test/lint လုပ်မယ့် CI gate မရှိပါ။ GitHub Actions CI ကို ထည့်ပြီး backend tests/build၊ frontend lint/type/build ကို အလိုအလျောက်စစ်ပါ။ ထို့နောက် browser test အနည်းဆုံး browse/search၊ language switch၊ login၊ payment proof၊ admin approve၊ protected download၊ mobile navigation တို့အတွက် ထည့်ပါ။ Error logging/alerting နဲ့ database/storage backup status ကိုလည်း monitor လုပ်ပါ။

### P2 — Thesis အတွက် algorithm ကို ဒေတာနဲ့ အကဲဖြတ်ပါ

Myanmar project title pair များကို လူက အောက်ပါအတိုင်း label လုပ်ပါ—`duplicate / similar / unrelated`။ ထို့နောက် precision, recall, F1, false-positive/false-negative ကို တိုင်းပြီး 0.85/0.30 thresholds ကို ညှိပါ။ Burmese Unicode/စာလုံးပေါင်း၊ English/Burmese mix နဲ့ Zawgyi input ကိုပါ သီးခြားစမ်းပါ။

### P3 — Optional AI ကိုဆုံးဖြတ်ပါ

Gemini semantic search/chat code ရှိသော်လည်း live က `enabled:false` ဖြစ်တယ်။ Thesis scope မှာလိုအပ်ရင် server-only API key configure လုပ်၊ project embedding/summary backfill ပြီး cost/rate-limit စမ်းပါ။ မလိုအပ်ရင် AI-powered title checker လို့ မကြော်ငြာဘဲ optional/disabled လို့ပဲ ဖော်ပြပါ။ Main title checker က trigram/token/edit-distance lexical engine ဖြစ်ပါတယ်။

## ၅။ Final release အတွက် Definition of Done

Paid-production ready လို့ ကြေညာမီ အောက်ပါအချက်အားလုံး ပြည့်စုံရမည်—

- [ ] Live site က စမ်းသပ်ပြီးသော commit SHA ကို အသုံးပြုနေကြောင်း အတည်ပြုထားခြင်း။
- [ ] Live wiring manifest 338 pair မပျောက်ဘဲ extras အတွက် `gallery.json`/gallery images ရှိပြီး image URL တိုင်း 200 ဖြစ်ခြင်း။
- [ ] Archive အတွက် authorized project records နှင့် full files ရှိပြီး `/api/stats` မှ `withFile > 0` ပြခြင်း။
- [ ] Private files/proofs/kits မပျောက်နိုင်သော storage သို့ရွှေ့ပြီး restart/redeploy + backup restore စမ်းပြီးခြင်း။
- [ ] Payment approval/download access ကို staging မှာ အဆုံးမှအဆုံး စမ်းပြီးခြင်း။
- [ ] PostgreSQL migration နဲ့ rollback procedure ရှိခြင်း။
- [ ] Backend 82 tests, frontend lint/type/build, frontend E2E အောင်မြင်ခြင်း။
- [ ] Similarity engine အတွက် thesis evaluation dataset/metrics တင်ပြနိုင်ခြင်း။

## နောက်ဆုံးအမြင်

Project ကို “လုံးဝမပြီးသေး” လို့ ပြောတာ မမှန်ပါ — အဓိက software feature များ တည်ဆောက်ပြီး၊ live site အလုပ်လုပ်နေပြီး၊ tests များလည်း အောင်မြင်ထားပါတယ်။ သို့သော် “ပြီးပြီ၊ paid production-ready” လို့ ပြောရန်လည်း မမှန်ပါ။ **အခုအဆင့်က thesis/demo အတွက် late-stage MVP** ဖြစ်တယ်။ အရင်ဆုံး လုပ်သင့်တဲ့ သုံးချက်က—

1. **Live ရှိပြီးသား 338 wiring photo/manifest ကို local repo ထဲ မပျောက်အောင် sync လုပ်ပြီး gallery ကို တကယ် deploy လုပ်ခြင်း။**
2. **Project report/file များကို consent နဲ့ ထည့်သွင်းပြီး durable private storage သုံးခြင်း။**
3. **Git remote/CI/CD ချိတ်ကာ tested code ကိုမှ live ထုတ်ခြင်း။**

ပြီးမှ migration workflow၊ browser E2E နဲ့ thesis accuracy evaluation ကို ဆက်လုပ်ပါ။