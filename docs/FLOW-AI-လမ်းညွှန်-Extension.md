# အလိုအလျောက် Generate + Save (Chrome Extension နည်းလမ်း)

သင် **အစအဆုံး အလိုအလျောက်** နည်းကို ရွေးထားတယ် — prompt list ကို တစ်ခါ paste၊
ထွက်သွား၊ ပုံတိုင်း folder ထဲ auto-download။ Google Flow automation extension
အများစုက **တစ်ကြောင်းလျှင် တစ် prompt** (`.txt`) (သို့) **CSV** ကို ဖတ်ပါတယ်။
ဒါကြောင့် အဲဒီအတွက် ဖန်တီးထားတဲ့ ဖိုင်ကို သုံးပါ — ဖတ်ရလွယ်တဲ့ pack မဟုတ်ပါ။

## သုံးရမယ့် ဖိုင်များ

| ဖိုင် | သုံးရမယ့် extension | ဘာလဲ |
| --- | --- | --- |
| `FLOW-AI-PROMPTS-ONELINE.txt` | Flow Bulk Gen၊ "prompt တစ်ကြောင်းချင်း" extension အများစု | **prompt ၁,၅၀၄ ခု၊ တစ်ကြောင်းလျှင် တစ်ခု အပြည့်အစုံ။** style ကို ကြောင်းတိုင်းထဲ ထည့်ပြီးသားမို့ သီးသန့် paste စရာ **မလို**။ |
| `FLOW-AI-PROMPTS.csv` | Google Flow Automator၊ Flow Image Automator (CSV import) | column ၂ ခု — `filename`၊ `prompt`။ `filename` (ဥပမာ `esp32__hc-sr04.png`) က ဖိုင်တစ်ခုချင်း နာမည် မှန်မှန် သိမ်းပေးတယ်။ |
| `FLOW-AI-WIRING-PROMPTS.txt` | လက်နဲ့ ဖတ်စစ်ဖို့ | ဖတ်ရလွယ်တဲ့ master pack (board အလိုက် ခွဲထား)။ Extension ထဲ paste ဖို့ မသင့်။ |

ဖိုင် ၃ ခုလုံးက prompt တိုင်းမှာ **verified pin-to-pin wiring အတိအကျ** ပါလို့ model
က pin ကို မှန်းလို့ မရပါ။

## အဆင့်ဆင့် (extension နည်း)

၁။ Chrome Web Store ကနေ Google Flow automation extension **install** လုပ်ပါ —
   ဥပမာ *Flow Bulk Gen*၊ *Google Flow Automator*၊ (သို့) *Flow Image Automator*။
၂။ **Save folder သတ်မှတ်ပါ**: `chrome://settings/downloads` ဖွင့် →
   *"Ask where to save each file"* ကို **OFF** → *Download location* ကို
   သင်လိုချင်တဲ့ folder ဆီ ညွှန်ပါ (သို့ extension ရဲ့ subfolder သုံးပါ)။
၃။ **`labs.google/fx/tools/flow`** ဖွင့်ပြီး extension ရဲ့ side panel ဖွင့်ပါ။
၄။ **prompt ထည့်ပါ:**
   - line-based extension → `FLOW-AI-PROMPTS-ONELINE.txt` ဖွင့်၊ အကုန် copy၊
     extension prompt box ထဲ paste။
   - CSV-import extension → *Import CSV* ရွေး၊ `FLOW-AI-PROMPTS.csv` ကို ရွေးပါ။
၅။ image model (Imagen 4 / Nano Banana)၊ aspect ratio **16:9**၊ **Auto-download**
   ဖွင့်ပါ။
၆။ **Start** နှိပ်ပါ။ Extension က prompt တစ်ခုချင်း Flow ထဲ ရိုက်၊ ပုံ ပြီးတဲ့အထိ
   စောင့်၊ ပြီးတော့ **ပုံတိုင်း auto-save** — နံပါတ်/နာမည် အလိုအလျောက်။ လက်နဲ့ သိမ်း
   စရာ မလို။

## အစုလိုက် (batch) လုပ်ခြင်း

ပုံ ၁,၅၀၄ က တစ်ခါတည်း များတယ်။ စီမံရ လွယ်အောင် board တစ်ခုစီ paste နိုင်တယ် —

- `FLOW-AI-PROMPTS-ONELINE.txt` ထဲမှာ board တစ်ခုစီ = **၉၄ ကြောင်း** အစဉ်လိုက်
  (Arduino Uno = 1–94၊ Arduino Nano = 95–188၊ … board အစဉ်: uno, nano, mega,
  pro-mini, esp32, esp32-cam, esp8266, nodemcu, pico, raspberry-pi, stm32, teensy,
  attiny85, micro:bit, jetson-nano, orange-pi)။
- (သို့) CSV ထဲမှာ `filename` prefix (`esp32__…`) နဲ့ filter/sort လုပ်ပြီး အဲဒီ
  board ရဲ့ row တွေပဲ paste ပါ။

## "prompt နဲ့ auto-save" အကြောင်း သတိရရန်

Flow ကို ဖိုင် save ခိုင်းတဲ့ prompt ဆိုတာ မရှိပါ — save လုပ်တာက browser ရဲ့ အလုပ်။
auto-download ကို extension (သို့ `FLOW-AI-BULK-DOWNLOAD.md` ထဲက console script) က
လုပ်ပေးတာ၊ prompt က ပုံကိုပဲ သတ်မှတ်ပေးတာပါ။
