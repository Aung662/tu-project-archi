# အဆင့်ဆင့် လမ်းညွှန် — Controller အားလုံးအတွက် ချိတ်ဆက်ပုံ Generate လုပ်နည်း

သင့် prompt ဖိုင်တွေမှာ **controller ၁၆ မျိုးလုံး** ပါပြီးသားပါ (Arduino တစ်ခုတည်း
မဟုတ်ပါ)။ တစ်ခုစီ component ၉၄ ခုစီ — **စုစုပေါင်း ပုံ ၁,၅၀၄ ပုံ**။

Arduino Uno R3 · Arduino Nano · Arduino Mega 2560 · Arduino Pro Mini · ESP32
DevKit V1 · ESP32-CAM · ESP8266 · NodeMCU · Raspberry Pi Pico · Raspberry Pi 4 ·
STM32 Blue Pill · Teensy 4.0 · ATtiny85 · BBC micro:bit v2 · Jetson Nano ·
Orange Pi

prompt တစ်ခုချင်းစီမှာ အဲဒီ board ရဲ့ **pin အစစ်** တွေ ထည့်ပြီးသားမို့ — သင်
ကိုယ်တိုင် ဘာမှ ပြင်စရာ **မလိုပါ**။ list ကို ထည့်ပြီး run ရုံပါပဲ။

---

## ဘယ်ဖိုင်ကို သုံးမလဲ

| သင်လုပ်ချင်တာ | ဖွင့်ရမယ့်ဖိုင် |
| --- | --- |
| "တစ်ကြောင်းလျှင် တစ် prompt" extension ထဲ paste | `FLOW-AI-PROMPTS-ONELINE.txt` |
| CSV import extension (ဖိုင်နာမည် အတိအကျ ရ) | `FLOW-AI-PROMPTS.csv` |
| မျက်စိနဲ့ ဖတ်စစ်ဖို့ (board အလိုက် ခွဲထား) | `FLOW-AI-WIRING-PROMPTS.txt` |

---

## အပိုင်း (က) — တစ်ကြိမ်တည်း ပြင်ဆင်ခြင်း (တစ်ခါပဲ လုပ်ရန်)

၁။ Chrome Web Store ကနေ Google Flow automation extension တစ်ခု **install** လုပ်ပါ
   (ဥပမာ — *Flow Bulk Gen*၊ *Google Flow Automator*၊ (သို့) *Flow Image Automator*)။
၂။ **Download folder သတ်မှတ်ပါ**: `chrome://settings/downloads` ဖွင့် →
   *"Ask where to save each file"* ကို **OFF** လုပ် → *Download location* ကို
   သင်ဖန်တီးထားတဲ့ folder (ဥပမာ `Wiring-Images`) ဆီ ညွှန်ပါ။
၃။ **`labs.google/fx/tools/flow`** ဖွင့်ပြီး sign in ဝင်ပါ။
၄။ Extension ရဲ့ **side panel** ကို ဖွင့်ပါ (extension icon ကို နှိပ်)။
၅။ Extension ထဲမှာ ရွေးပါ — image model (**Imagen 4 / Nano Banana**)၊
   **aspect ratio 16:9**၊ ပြီးတော့ **Auto-download ON**။

သီးသန့် "style" block paste စရာ မလိုပါ — style ကို prompt တစ်ကြောင်းချင်းထဲ
ထည့်ပြီးသားပါ။

---

## အပိုင်း (ခ) — prompt list ရဲ့ ဖွဲ့စည်းပုံ (controller ရွေးလို့ရအောင်)

`FLOW-AI-PROMPTS-ONELINE.txt` ကို board အလိုက် စီထားပြီး **board တစ်ခုလျှင်
၉၄ ကြောင်း**၊ အောက်ပါ အစီအစဉ်အတိုင်း —

| Board | Line အပိုင်းအခြား |
| --- | --- |
| Arduino Uno R3 | 1 – 94 |
| Arduino Nano | 95 – 188 |
| Arduino Mega 2560 | 189 – 282 |
| Arduino Pro Mini | 283 – 376 |
| ESP32 DevKit V1 | 377 – 470 |
| ESP32-CAM | 471 – 564 |
| ESP8266 | 565 – 658 |
| NodeMCU | 659 – 752 |
| Raspberry Pi Pico | 753 – 846 |
| Raspberry Pi 4 | 847 – 940 |
| STM32 Blue Pill | 941 – 1034 |
| Teensy 4.0 | 1035 – 1128 |
| ATtiny85 | 1129 – 1222 |
| BBC micro:bit v2 | 1223 – 1316 |
| Jetson Nano | 1317 – 1410 |
| Orange Pi | 1411 – 1504 |

(CSV ထဲမှာ row တစ်ခုချင်းရဲ့ `filename` က board id နဲ့ စတယ် — ဥပမာ `esp32__…`၊
`raspberry-pi-pico__…` — အဲဒီ prefix နဲ့ filter လုပ်ပြီး board တစ်ခု ယူနိုင်တယ်။)

---

## အပိုင်း (ဂ) — controller တစ်ခုချင်းစီ Generate လုပ်ခြင်း (အကြံပြု)

၁,၅၀၄ ပုံ တစ်ခါတည်း လုပ်ရင် များတဲ့အတွက် — **board တစ်ခုချင်း** run ပါ —

၁။ `FLOW-AI-PROMPTS-ONELINE.txt` ကို ဖွင့်ပါ။
၂။ လိုချင်တဲ့ board ရဲ့ **line အပိုင်းအခြားကို select** လုပ်ပါ (အပေါ်ဇယား ကြည့်) —
   ဥပမာ **ESP32** အတွက် line **377–470**။
၃။ အဲဒီ lines တွေကို **Copy** လုပ်ပါ။
၄။ Extension ရဲ့ prompt box ထဲ **paste** လုပ်ပါ။
၅။ **Start / Run** ကို နှိပ်ပါ။
၆။ Extension က line တစ်ကြောင်းချင်းစီအတွက် —
   - prompt ကို Flow ထဲ ရိုက်ထည့်၊
   - ပုံ ပြီးတဲ့အထိ စောင့်၊
   - သင့် folder ထဲ **auto-download**၊
   - နောက်တစ်ကြောင်းကို ဆက်သွား — လက်နဲ့ ဘာမှ လုပ်စရာ မလို။
၇။ အဲဒီ board ပြီးရင် ပြန်လာပြီး **နောက် board** ရဲ့ line range ကို select →
   paste → Start ထပ်နှိပ်။ လိုချင်တဲ့ controller တိုင်းအတွက် ဒီအတိုင်း ထပ်လုပ်ပါ။

> 💡 အကြံ — checklist လေး တစ်ခု လုပ်ထားပါ။ board တစ်ခု ပြီးတိုင်း အမှတ်ခြစ်ထားရင်
> ဘယ်ကနေ ဆက်ရမလဲ သိပါလိမ့်မယ်။

### အကုန်လုံး တစ်ခါတည်း (optional)
Extension နဲ့ Flow quota က ခံနိုင်ရင် — ဖိုင်တစ်ခုလုံး **(Ctrl+A) → Copy → Paste
→ Start** လုပ်လိုက်ရုံပါ။ ၁,၅၀၄ လုံး အစဉ်လိုက် run ပါလိမ့်မယ်။ board-by-board က
quota limit / browser နှေးမှု အတွက် ပိုစိတ်ချရုံပါ။

---

## အပိုင်း (ဃ) — Generate ပြီးနောက်

- ဖိုင်တွေ သင်ရွေးထားတဲ့ folder ထဲ ဆင်းလာမယ်။ **CSV** နည်းဆိုရင် `esp32__hc-sr04.png`
  လို အတိအကျ နာမည်နဲ့၊ ရိုးရိုး line နည်းဆိုရင် extension က အစဉ်လိုက် နံပါတ်ပေးမယ်
  (အပေါ်ဇယား အစဉ်အတိုင်း — sort လုပ်ရ လွယ်ပါတယ်)။
- website ရဲ့ **/wiring** page ကို ဖွင့်၊ တူညီတဲ့ board ရွေး၊ pin တွေ ကိုက်မကိုက်
  ပြန်စစ်ကြည့်ပါ (ကိုက်ပါလိမ့်မယ် — data တစ်ခုတည်းကနေ ထုတ်ထားလို့)။

---

## သတိရရန်

- **prompt နဲ့ auto-save လုပ်လို့ မရပါ** — save လုပ်တာက extension (သို့)
  `FLOW-AI-BULK-DOWNLOAD.md` ထဲက console script ရဲ့ အလုပ်ပါ။ prompt က ပုံကိုပဲ
  သတ်မှတ်ပေးတာပါ။
- prompt တိုင်းမှာ ပါတဲ့ pin တွေက အဲဒီ board အတွက် မှန်ပြီးသား — လက်နဲ့ မပြင်ပါနဲ့။
