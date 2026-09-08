# ၁၈ — သုတေသနကျမ်း အနှစ်ချုပ် (မြန်မာဘာသာ)

**စနစ်အမည်:** မြန်မာနိုင်ငံ နည်းပညာတက္ကသိုလ်များအတွက် ကျောင်းသားစီမံကိန်း မှတ်တမ်းသိုလှောင်မှုနှင့်
ခေါင်းစဉ်တူညီမှု စစ်ဆေးရေးစနစ် (TU Project Archive & Intelligent Title Similarity Checker)

> ဤအနှစ်ချုပ်ကို သုတေသနကျမ်း (thesis) အတွက် တိုက်ရိုက်ထည့်သွင်းနိုင်ရန် တရားဝင် ပညာရပ်ဆိုင်ရာ
> မြန်မာစကားပြေဖြင့် ရေးသားထားပြီး နည်းပညာဆိုင်ရာ အင်္ဂလိပ်ဝေါဟာရများ (technical terms) ကို
> လက်ခံအသုံးများသည့်အတိုင်း ဆက်လက်ထားရှိထားပါသည်။

---

## အပိုင်း ၁ — နိဒါန်း (Introduction)

မြန်မာနိုင်ငံရှိ နည်းပညာတက္ကသိုလ် (Technological Universities) များတွင် ကျောင်းသားတို့၏
နောက်ဆုံးနှစ် စီမံကိန်း (final-year projects) မှတ်တမ်းများသည် ဌာနအလိုက် သီးခြားစီ၊ စာရွက်စာတမ်း
အသွင်ဖြင့်သာ သိမ်းဆည်းလေ့ရှိသဖြင့် စနစ်တကျ ရှာဖွေ၍မရနိုင်ဘဲ ဖြစ်နေပါသည်။ ဤစီမံကိန်းသည်
ထိုမှတ်တမ်းများကို ဗဟိုချုပ်ကိုင်မှုရှိသော web application တစ်ခုအဖြစ် စုစည်းပေးပြီး၊ ခေါင်းစဉ်
ရှာဖွေခြင်း၊ တူညီမှု စစ်ဆေးခြင်း၊ အမျိုးအစားခွဲ၍ လှော်လှန်ကြည့်ရှုခြင်း (browse) နှင့် ငွေပေးချေမှုဖြင့်
စီမံကိန်းဖိုင်များ ဝယ်ယူရယူခြင်းတို့ကို ဆောင်ရွက်နိုင်စေပါသည်။

## အပိုင်း ၂ — ပြဿနာ ဖော်ထုတ်ချက် (Problem Statement)

လက်ရှိအခြေအနေတွင် အဓိက ပြဿနာ သုံးရပ် ရှိပါသည်။ ပထမအချက်မှာ ကျောင်းသားများသည် ယခင်က
ရှိပြီးသား ခေါင်းစဉ်များနှင့် တူညီသည်ကို မသိဘဲ ထပ်မံတင်ပြမိခြင်း (duplicate topics) ဖြစ်သည်။
ဒုတိယအချက်မှာ စုစည်းထားသော မှတ်တမ်းမရှိသဖြင့် ရှာဖွေတွေ့ရှိရန် ခက်ခဲခြင်း (poor discoverability)
ဖြစ်သည်။ တတိယအချက်မှာ စီမံကိန်းဖိုင် အပြည့်အစုံများကို စာရေးသူ၏ ခွင့်ပြုချက် (consent) မရှိဘဲ
ထိန်းချုပ်မှုကင်းစွာ ဖြန့်ဝေခြင်း သို့မဟုတ် လုံးဝမရရှိနိုင်ခြင်း ဖြစ်ပါသည်။

## အပိုင်း ၃ — ရည်ရွယ်ချက်များ (Objectives)

- login မလိုဘဲ အခမဲ့ ခေါင်းစဉ်ရှာဖွေမှု (title search) ကို ပေးရန်။
- တင်ပြမည့် ခေါင်းစဉ်အသစ်ကို `LIKELY_UNIQUE` / `SIMILAR_EXISTS` / `DUPLICATE_RISK` ဟူ၍
  အမျိုးအစားခွဲပေးသည့် တူညီမှု စစ်ဆေးရေး (duplicate checker) ဖန်တီးရန်။
- တက္ကသိုလ် → ဌာန၊ ခုနှစ်၊ ပညာရေးအဆင့် (academic level) အလိုက် စစ်ထုတ် လှော်လှန်ကြည့်ရှုနိုင်ရန်။
- အများပြည်သူအား metadata/အနှစ်ချုပ်သာ ပြသ၍ ဖိုင်အပြည့်အစုံကို လုံခြုံစွာ ထိန်းသိမ်းရန်။
- MMK (မြန်မာကျပ်ငွေ) ဖြင့် manual ငွေပေးချေမှု စစ်ဆေးရေး လုပ်ငန်းစဉ် တည်ဆောက်ရန်။
- production အဆင့် လုံခြုံရေး (security) စံနှုန်းများ ပြည့်မီ၍ သုတေသနကျမ်း ခုခံနိုင်လောက်သော
  architecture ဖြစ်စေရန်။

## အပိုင်း ၄ — နယ်ပယ်နှင့် ကန့်သတ်ချက် (Scope)

**ပါဝင်သည်များ:** ခေါင်းစဉ်ရှာဖွေမှုနှင့် တူညီမှုစစ်ဆေးမှု၊ faceted browse နှင့် စီမံကိန်း
အသေးစိတ်စာမျက်နှာ၊ အကောင့်ဖွင့်/ဝင်ရောက်မှု၊ proof upload ပါဝင်သော manual MMK ဝယ်ယူမှု
လုပ်ငန်းစဉ်၊ ဝယ်ယူပြီးမှသာ ရယူနိုင်သော ဖိုင် download၊ admin dashboard (project/file/payment/user
စီမံခန့်ခွဲမှု)၊ audit log၊ search analytics နှင့် မြန်မာဘာသာဦးစားပေး UI တို့ ဖြစ်သည်။

**ပါဝင်ခြင်းမရှိသည်များ (ရည်ရွယ်ချက်ရှိရှိ ချန်လှပ်ချက်):** အလိုအလျောက် online payment gateway
ချိတ်ဆက်မှု (ပတ်ဝန်းကျင်အရ manual စစ်ဆေးမှုသာ လိုအပ်သည်)၊ ဖိုင်အတွင်းရှိ စာသားအပြည့်အစုံ
ရှာဖွေမှု (full-text)၊ စာတမ်းကိုယ်ထည် ခိုးချမှု စစ်ဆေးခြင်း (ခေါင်းစဉ်သာ နှိုင်းယှဉ်သည်) တို့ ဖြစ်သည်။

## အပိုင်း ၅ — စနစ်ဖွဲ့စည်းပုံ (System Architecture)

စနစ်ကို decoupled two-tier ပုံစံဖြင့် တည်ဆောက်ထားသည်။ ရှေ့ပိုင်း (frontend) မှာ Next.js 15
(App Router) ဖြင့် server-rendered UI ဖြစ်ပြီး၊ browser သည် `/api/*` ကို relative URL ဖြင့်
credentials ပါ၀င်စွာ ခေါ်ဆိုသည်။ နောက်ပိုင်း (backend) မှာ Node.js + Express + TypeScript (ESM)
ဖြင့် stateless JSON API ဖြစ်သည်။ trust ဆိုင်ရာ ဆုံးဖြတ်ချက်များ (authentication, RBAC, purchase
စစ်ဆေးမှု, ဖိုင် streaming) အားလုံးကို server ဘက်တွင်သာ ထားရှိသဖြင့် client ဘက်မှ ကျော်လွှား၍
မရနိုင်ပါ။ Data layer အနေဖြင့် Prisma ORM ကို အသုံးပြုပြီး development တွင် SQLite၊ production
တွင် PostgreSQL + `pg_trgm` extension ကို runtime (`DB_PROVIDER`) အလိုက် ရွေးချယ်သည်။

## အပိုင်း ၆ — ဒေတာဘေ့စ် ဒီဇိုင်း (Database Design)

အဓိက entity များမှာ **University**, **Department**, **Project**, **User**, **PaymentOrder**,
**PurchaseAccess**, **AuditLog** နှင့် **SearchLog** တို့ ဖြစ်သည်။ `Project` တွင် ရှာဖွေမှု
မြန်ဆန်စေရန် `normalizedTitle` ကို ကြိုတင်တွက်ချက်၍ သိမ်းဆည်းထားပြီး၊ ဖိုင်ဆိုင်ရာ field များ
(`fileStorageKey` အပါအဝင်) ကို အများပြည်သူ client သို့ လုံးဝ မထုတ်ပြန်ပါ။ `hasConsent` field က
ထုတ်ဝေခြင်း (publish) ကို ထိန်းချုပ်သည်။ `PurchaseAccess` ကို `PaymentOrder` နှင့် သီးခြားခွဲထားခြင်းက
"ဤအသုံးပြုသူ ဤဖိုင်ကို download ခွင့်ရှိ/မရှိ" ကို တစ်ခုတည်းသော အမှန်တရား (source of truth) အဖြစ်
ထားရှိစေပြီး approval ကို idempotent ဖြစ်စေသည်။

## အပိုင်း ၇ — ခေါင်းစဉ်တူညီမှု အယ်လ်ဂိုရီသမ် (Similarity Algorithm)

ခေါင်းစဉ်များကို ဦးစွာ normalize (NFC → lowercase → non-alphanumeric များကို space ဖြင့်အစားထိုး →
space များ ပေါင်းစည်း) ပြုလုပ်သည်။ ထို့နောက် blended score ကို အောက်ပါအတိုင်း တွက်ချက်သည်—

```
score = 0.55 · trigramJaccard + 0.30 · tokenOverlap + 0.15 · (1 − normalizedLevenshtein)
```

- **Trigram Jaccard (0.55):** စာလုံး trigram set overlap — PostgreSQL `pg_trgm` တိုင်းတာသည့်
  သဘောတရားအတိုင်း ဖြစ်၍ dev engine နှင့် prod extension ရလဒ် သဘောသဘာဝ ကိုက်ညီစေသည်။
- **Token overlap (0.30):** စကားလုံးအဆင့် Jaccard — စကားလုံး နေရာပြောင်းလဲမှုကို ခံနိုင်သည်။
- **Edit distance (0.15):** `1 − normalizedLevenshtein` — စာလုံးပေါင်း အနည်းငယ်မှားမှု/
  အလွန်ဆင်တူသော ခေါင်းစဉ်များကို ဖမ်းဆုပ်သည်။

`score ≥ 0.85` ဆိုလျှင် `EXACT`၊ မဟုတ်လျှင် `SIMILAR` ဟု အမျိုးအစားခွဲပြီး `0.30` အောက် ရလဒ်များကို
ဖယ်ထုတ်သည်။ Production တွင် `pg_trgm` ၏ GIN index ဖြင့် candidate များကို ကြိုတင်စစ်ထုတ်ပြီးမှ
တူညီသော score ဖြင့် ပြန်လည်အဆင့်သတ်မှတ်သဖြင့် မြန်ဆန်၍ တိကျသည်။

## အပိုင်း ၈ — အထောက်အထားစိစစ်ခြင်းနှင့် ခွင့်ပြုချက် (Authentication & Authorization)

Password များကို **bcrypt (cost 12)** ဖြင့် hash လုပ်သည်။ login အောင်မြင်လျှင် **HS256** ဖြင့်
လက်မှတ်ရေးထိုးထားသော JWT ကို **HttpOnly, SameSite=Lax cookie** (`tu_token`, သက်တမ်း ၆ နာရီ) အဖြစ်
ထားရှိပြီး JavaScript မှ ရယူ၍မရပါ။ admin route အားလုံးကို `requireAuth, requireAdmin` ဖြင့်
ကာကွယ်ထားပြီး role ကို request တိုင်း database မှ ပြန်ဖတ်သဖြင့် token အဟောင်းဖြင့် အခွင့်အာဏာ
မြှင့်တင်၍ မရနိုင်ပါ။ production တွင် `JWT_SECRET` အားနည်းလျှင် server စတင်ခြင်းကို ငြင်းပယ်သည်။

## အပိုင်း ၉ — ငွေပေးချေမှု လုပ်ငန်းစဉ် (Manual MMK Payment Workflow)

ပတ်ဝန်းကျင်တွင် online gateway မရှိသဖြင့် ငွေပေးချေမှုကို manual ဖြင့် စစ်ဆေးသည်။ ကျောင်းသားသည်
order တင်သည် (`method ∈ {KBZPay, WavePay, AYAPay, CBPay, BankTransfer}`) → ငွေလွှဲပြီး screenshot
(proof) ကို upload တင်သည် → admin သည် queue တွင် proof ကို ကြည့်ရှုစစ်ဆေးသည် → approve လုပ်လျှင်
`PurchaseAccess` တစ်ကြောင်း ဖန်တီးပေးပြီး (idempotent, transactional) ဖိုင်ကို download ရယူနိုင်သည်၊
reject လုပ်လျှင် မှတ်ချက်ဖြင့် ငြင်းပယ်၍ ဖိုင်ရယူခွင့် မပေးပါ။ proof ၏ storage key ကို client သို့
လုံးဝ ပြန်မပို့ဘဲ `hasProof` (boolean) သာ ပြသသည်။

## အပိုင်း ၁၀ — လုံခြုံရေး (Security)

Helmet + CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), HSTS,
`X-Content-Type-Options: nosniff` စသည့် header များ ထည့်သွင်းထားသည်။ CORS ကို origin allowlist
ဖြင့်သာ ခွင့်ပြုသည်။ input အားလုံးကို Zod ဖြင့် validate လုပ်သည်။ ဖိုင် upload ကို extension/MIME
သာမက **magic-byte** အထိ စစ်ဆေးသဖြင့် အယောင်ဆောင်ဖိုင် (ဥပမာ GIF ကို `.pdf` အမည်ပြောင်း) ကို
ငြင်းပယ်သည်။ paid ဖိုင်များကို static route လုံးဝ မထားဘဲ `PurchaseAccess` စစ်ဆေးမှုဖြင့်သာ stream
ချသည်။ rate limiting (global/auth/search/upload) နှင့် audit log များလည်း ထည့်သွင်းထားသည်။
`npm audit` = vulnerability 0 ခု ဖြစ်သည်။

## အပိုင်း ၁၁ — စမ်းသပ်မှု၊ ကန့်သတ်ချက်နှင့် အနာဂတ်လုပ်ငန်း (Testing, Limitations & Future Work)

**စမ်းသပ်မှု:** အလိုအလျောက် test **၃၉/၃၉** အောင်မြင်သည် (algorithm unit test ၁၂ ခု +
integration test ၂၇ ခု)။ backend/frontend နှစ်ခုစလုံး `tsc` error = 0။ completeness (၃၂ ချက်) နှင့်
QA/security (၁၆ ချက်) checklist များကို လက်တွေ့ run နေသော server ဖြင့် စစ်ဆေးအတည်ပြုထားသည်။

**ကန့်သတ်ချက်:** manual payment စစ်ဆေးမှုသည် လူသား latency ရှိသည်၊ ခေါင်းစဉ်အဆင့်သာ တူညီမှု
စစ်ဆေးသဖြင့် စာတမ်းကိုယ်ထည် ခိုးချမှုကို မဖော်ထုတ်နိုင်ပါ၊ normalization သည် အင်္ဂလိပ်ခေါင်းစဉ်
များအတွက် အားကောင်းဆုံး ဖြစ်သည်။

**အနာဂတ်လုပ်ငန်း:** online payment gateway ချိတ်ဆက်မှု၊ abstract/document-body အထိ တူညီမှု
စစ်ဆေးမှု တိုးချဲ့ခြင်း၊ မြန်မာစာလုံး tokenization/stemming၊ တက္ကသိုလ်အလိုက် admin role ခွဲခြားခြင်း
နှင့် ငွေပေးချေမှု အတည်ပြု email/SMS အကြောင်းကြားချက် စသည်တို့ ဖြစ်သည်။
