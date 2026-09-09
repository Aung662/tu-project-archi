/**
 * Burmese-first UI labels.
 *
 * The product is built for final-year IT students at Myanmar Technological
 * Universities, so Burmese (Myanmar) is the PRIMARY language of the interface.
 * Every entry here is a `{ my, en }` pair: `my` is what users read first, `en`
 * is kept as a secondary/helper string (shown small under key headings, and as
 * a fallback). Centralizing labels here keeps copy consistent and makes a full
 * second-language pass trivial later.
 */
export interface Label {
  my: string; // Burmese — primary
  en: string; // English — secondary/helper
}

const L = (my: string, en: string): Label => ({ my, en });

/** Supported UI languages. English is the default; Burmese is a full toggle. */
export type Lang = 'en' | 'my';

/**
 * Module-level "current language". Kept outside React on purpose: every label
 * read goes through `tr()`, and the LanguageProvider forces a remount of the
 * app subtree whenever the language changes, so components simply re-read this
 * value — no per-component hook wiring required. Defaults to English so the
 * server render and first client render agree (no hydration mismatch).
 */
let _lang: Lang = 'en';

export const LANG_STORAGE_KEY = 'tu-lang';

export function getLang(): Lang {
  return _lang;
}

export function setLangModule(lang: Lang): void {
  _lang = lang;
}

/**
 * Translate a label to the current language. Accepts `undefined` (e.g. a lookup
 * miss like `levelLabel[unknownKey]`) and returns '' so callers can keep their
 * `tr(x) || fallback` idiom.
 */
export function tr(label: Label | undefined | null): string {
  if (!label) return '';
  return label[_lang] ?? label.en;
}

export const t = {
  // Brand / chrome
  brandTitle: L('မြန်မာနည်းပညာတက္ကသိုလ် စီမံကိန်းမှတ်တမ်း', 'Project Archive'),

  // Welcome overlay
  welcomeGreeting: L('ကျွန်ုပ်၏ Project Library သို့ ကြိုဆိုပါသည်', 'Welcome To My Project Library'),
  welcomeGreetingBack: L('ပြန်လည်ကြိုဆိုပါသည်', 'Welcome back'),
  welcomeBody: L(
    'စီမံကိန်းဟောင်းများ ရှာဖွေခြင်း၊ သင့်ခေါင်းစဉ် ထပ်တူဖြစ်မဖြစ် စစ်ဆေးခြင်းနှင့် မှတ်တမ်းများကို လေ့လာနိုင်ပါသည်။ အတူတကွ အကောင်းဆုံးကို ရှာဖွေကြရအောင်!',
    'Search past projects, check your title for duplicates, and explore the archive. Let’s find something great together!',
  ),
  welcomeCta: L('စတင်ရန် →', 'Let’s go →'),
  brandSubtitle: L('ခေါင်းစဉ်တူ စစ်ဆေးရေးစနစ်', '& Title Similarity Checker'),

  // Nav
  navSearch: L('ရှာဖွေရန်', 'Search'),
  navBrowse: L('လှော်လှန်ကြည့်ရန်', 'Browse'),
  navCheck: L('ခေါင်းစဉ်စစ်ဆေးရန်', 'Title Check'),
  navTitles: L('ခေါင်းစဉ်စာရင်း', 'All Titles'),
  navLibrary: L('ကျွန်ုပ်၏စာကြည့်တိုက်', 'My Library'),
  navAdmin: L('စီမံခန့်ခွဲမှု', 'Admin'),
  navAdminDashboard: L('စီမံခန့်ခွဲမှု ဒက်ရှ်ဘုတ်', 'Admin Dashboard'),
  navLogin: L('အကောင့်ဝင်ရန်', 'Login'),
  navLogout: L('ထွက်ရန်', 'Logout'),
  navContact: L('ဆက်သွယ်ရန်', 'Contact'),
  navAbout: L('ဤဝဘ်ဆိုက်အကြောင်း', 'About this website'),
  navStats: L('စာရင်းအင်း', 'Statistics'),
  navTopics: L('ခေါင်းစဉ်များ', 'Topics'),
  navNew: L('အသစ်များ', 'New'),
  navToolkit: L('ကွန်ပိုနင့်များ', 'Components'),
  navKits: L('ဝဘ်ဆိုက် Kit များ', 'Website Kits'),
  navNotes: L('မှတ်စုများ', 'Notes'),
  navCompare: L('နှိုင်းယှဉ်ရန်', 'Compare'),
  navCollections: L('စုစည်းမှုများ', 'Collections'),
  navHistory: L('မှတ်တမ်း', 'History'),
  // ── Collections ────────────────────────────────────────
  collectionsTitle: L('ကျွန်ုပ်၏ စုစည်းမှုများ', 'My Collections'),
  collectionsSubtitle: L('ပရောဂျက်များကို အမည်ပေးထားသော အဖွဲ့များအဖြစ် စုစည်းသိမ်းဆည်းပါ — ဤစက်ပေါ်တွင်သာ သိမ်းသည်', 'Organise projects into named folders — saved privately on this device'),
  collectionsEmpty: L('စုစည်းမှု မရှိသေးပါ', 'No collections yet'),
  collectionsEmptyHint: L('ပရောဂျက်စာမျက်နှာတွင် “စုစည်းမှုသို့ ထည့်ရန်” ကို နှိပ်၍ စတင်ပါ', 'Tap “Save to collection” on a project to start'),
  collectionCreate: L('စုစည်းမှုအသစ်', 'New collection'),
  collectionCreatePlaceholder: L('စုစည်းမှု အမည် (ဥပမာ − Thesis refs)', 'Collection name (e.g. Thesis refs)'),
  collectionCreateBtn: L('ဖန်တီးရန်', 'Create'),
  collectionRename: L('အမည်ပြောင်းရန်', 'Rename'),
  collectionDelete: L('ဖျက်ရန်', 'Delete'),
  collectionDeleteConfirm: L('ဤစုစည်းမှုကို ဖျက်မှာ သေချာပါသလား။', 'Delete this collection?'),
  collectionCount: L('ပရောဂျက်', 'projects'),
  collectionOpen: L('ဖွင့်ကြည့်ရန်', 'Open'),
  collectionEmptyItems: L('ဤစုစည်းမှုတွင် ပရောဂျက် မရှိသေးပါ', 'This collection is empty'),
  collectionBack: L('စုစည်းမှုများသို့ ပြန်သွားရန်', 'Back to collections'),
  collectionSaveTo: L('စုစည်းမှုသို့ ထည့်ရန်', 'Save to collection'),
  collectionSaved: L('သိမ်းပြီး', 'Saved'),
  collectionRemoveItem: L('ဖယ်ရှားရန်', 'Remove'),
  collectionNewInline: L('+ စုစည်းမှုအသစ် ဖန်တီးရန်', '+ Create new collection'),
  collectionDone: L('ပြီးပါပြီ', 'Done'),
  // ── Download history ───────────────────────────────────
  historyTitle: L('ဒေါင်းလုဒ် မှတ်တမ်း', 'Download history'),
  historySubtitle: L('သင် ဒေါင်းလုဒ်ဆွဲခဲ့သော ဖိုင်များ — ဤစက်ပေါ်တွင်သာ သိမ်းသည်', 'Files you have downloaded — saved privately on this device'),
  historyEmpty: L('ဒေါင်းလုဒ် မှတ်တမ်း မရှိသေးပါ', 'No downloads yet'),
  historyEmptyHint: L('ပရောဂျက်ဖိုင်တစ်ခု ဒေါင်းလုဒ်ဆွဲပါက ဤနေရာတွင် ပေါ်လာမည်', 'Files you download will appear here'),
  historyClear: L('မှတ်တမ်း ရှင်းရန်', 'Clear history'),
  historyClearConfirm: L('ဒေါင်းလုဒ် မှတ်တမ်းအားလုံး ရှင်းမှာ သေချာပါသလား။', 'Clear all download history?'),
  historyRemove: L('ဖယ်ရှားရန်', 'Remove'),
  historyTimes: L('ကြိမ်', '×'),
  historyView: L('ပရောဂျက် ကြည့်ရန်', 'View project'),
  // ── Saved searches ─────────────────────────────────────
  saveSearchBtn: L('ဤရှာဖွေမှုကို သိမ်းရန်', 'Save this search'),
  savedSearchesTitle: L('သိမ်းထားသော ရှာဖွေမှုများ', 'Saved searches'),
  savedSearchEmpty: L('သိမ်းထားသော ရှာဖွေမှု မရှိသေးပါ', 'No saved searches yet'),
  savedSearchSaved: L('သိမ်းပြီးပါပြီ', 'Saved!'),
  savedSearchRemove: L('ဖယ်ရှားရန်', 'Remove'),
  savedSearchRun: L('ပြန်ရှာရန်', 'Run'),
  // ── Compare ────────────────────────────────────────────
  compareTitle: L('ပရောဂျက်များ နှိုင်းယှဉ်ခြင်း', 'Compare projects'),
  compareSubtitle: L('ပရောဂျက် ၂-၃ ခုကို ဘေးချင်းယှဉ် ကြည့်ပါ', 'View 2–3 projects side by side'),
  compareAdd: L('နှိုင်းယှဉ်ရန် ထည့်ရန်', 'Add to compare'),
  compareRemove: L('နှိုင်းယှဉ်မှုမှ ဖယ်ရန်', 'Remove from compare'),
  compareAdded: L('နှိုင်းယှဉ်ရန် ထည့်ပြီး', 'Added to compare'),
  compareEmpty: L('နှိုင်းယှဉ်ရန် ပရောဂျက် မရွေးရသေးပါ', 'No projects selected to compare'),
  compareEmptyHint: L('ပရောဂျက်များရှိ "နှိုင်းယှဉ်ရန် ထည့်ရန်" ကို နှိပ်ပါ (အများဆုံး ၃ ခု)', 'Tap "Add to compare" on projects (up to 3)'),
  compareClear: L('အားလုံး ရှင်းရန်', 'Clear all'),
  compareBarLabel: L('နှိုင်းယှဉ်ရန်', 'Compare'),
  compareFull: L('အများဆုံး ၃ ခုသာ', 'Max 3 projects'),
  // ── Research notes ─────────────────────────────────────
  notesTitle: L('ကျွန်ုပ်၏ သုတေသန မှတ်စုများ', 'My research notes'),
  notesSubtitle: L('ပရောဂျက်များအတွက် ကိုယ်ပိုင် မှတ်စုများ (ဤစက်တွင်သာ သိမ်းသည်)', 'Your private notes on projects (stored on this device only)'),
  noteLabel: L('မှတ်စု', 'Note'),
  notePlaceholder: L('ဤပရောဂျက်အတွက် မှတ်စု ရေးပါ…', 'Write a note about this project…'),
  noteSave: L('မှတ်စု သိမ်းရန်', 'Save note'),
  noteSaved: L('သိမ်းပြီး', 'Saved'),
  noteEmpty: L('မှတ်စု မရှိသေးပါ', 'No notes yet'),
  noteEmptyHint: L('ပရောဂျက်စာမျက်နှာများတွင် မှတ်စုရေးလျှင် ဤနေရာတွင် စုစည်းပေါ်လာမည်', 'Notes you write on project pages will collect here'),
  noteDelete: L('ဖျက်ရန်', 'Delete'),
  noteView: L('ပရောဂျက် ကြည့်ရန်', 'View project'),
  noteChars: L('စာလုံး', 'chars'),
  // ── Components Toolkit ─────────────────────────────────
  toolkitTitle: L('ကွန်ပိုနင့် ကိရိယာတန်ဆာ', 'Components Toolkit'),
  toolkitSubtitle: L('ယနေ့ခေတ် ကျောင်းသားပရောဂျက်များတွင် သုံးလေ့ရှိသော Hardware နှင့် Software ကွန်ပိုနင့်များ — icon များ ဒေါင်းလုဒ်ဆွဲနိုင်သည်', 'Hardware & software building blocks used in modern student projects — download any icon'),
  toolkitSearch: L('ကွန်ပိုနင့် ရှာရန်… (ဥပမာ ESP32, sensor, Python)', 'Search components… (e.g. ESP32, sensor, Python)'),
  toolkitHardware: L('Hardware ကွန်ပိုနင့်များ', 'Hardware components'),
  toolkitSoftware: L('Software ကွန်ပိုနင့်များ', 'Software & tools'),
  toolkitAll: L('အားလုံး', 'All'),
  toolkitCount: L('ကွန်ပိုနင့်', 'components'),
  toolkitEmpty: L('ကိုက်ညီသော ကွန်ပိုနင့် မတွေ့ပါ', 'No matching components'),
  toolkitDownloadSvg: L('SVG ဒေါင်းလုဒ်', 'Download SVG'),
  toolkitDownloadPng: L('PNG ဒေါင်းလုဒ်', 'Download PNG'),
  toolkitDownload: L('Icon ဒေါင်းလုဒ်', 'Download icon'),
  toolkitSpecs: L('အသေးစိတ် အချက်အလက်', 'Specifications'),
  toolkitViewDetails: L('အသေးစိတ် ကြည့်ရန်', 'View details'),
  toolkitClose: L('ပိတ်ရန်', 'Close'),
  toolkitBack: L('နောက်သို့', 'Back'),
  toolkitPrev: L('ယခင် ကွန်ပိုနင့်', 'Previous component'),
  toolkitNext: L('နောက် ကွန်ပိုနင့်', 'Next component'),
  toolkitSwipeHint: L('ဘေးတိုက် ပွတ်ဆွဲ၍ ပြောင်းနိုင်သည် • ညာဘက်သို့ ပွတ်၍ ပြန်ထွက်နိုင်သည်', 'Swipe sideways to switch • swipe right to go back'),
  toolkitCategory: L('အမျိုးအစား', 'Category'),
  toolkitNoSpecs: L('အသေးစိတ် အချက်အလက် မရရှိသေးပါ', 'No specifications available yet'),
  toolkitPhotoNote: L('* သရုပ်ဖော် ထုတ်ကုန်ဓာတ်ပုံ', '* Representative product photo'),
  // ── Components: usage guide sections ───────────────────
  guideWhatFor: L('ဘာအတွက် သုံးသလဲ', 'What it’s for'),
  guideUseCases: L('အသုံးများသော ပရောဂျက်များ', 'Common projects'),
  guidePinout: L('Pin ချိတ်ဆက်ပုံ', 'Pinout & connections'),
  guidePinCol: L('Pin', 'Pin'),
  guidePinDescCol: L('ဖော်ပြချက်', 'Description'),
  guideWiring: L('ချိတ်ဆက်ရန် မှတ်ချက်', 'Wiring note'),
  guideCode: L('နမူနာ ကုဒ်', 'Starter code'),
  guideCodeCopy: L('ကုဒ် ကူးရန်', 'Copy code'),
  guideCodeCopied: L('ကူးပြီး', 'Copied!'),
  guidePrice: L('ခန့်မှန်း ဈေးနှုန်း', 'Est. price'),
  guideAlternatives: L('အစားထိုးနိုင်သည့် အရာများ', 'Alternatives'),
  guideCautions: L('သတိပြုရန်', 'Watch out for'),
  guideLibraries: L('Library / Framework', 'Libraries & frameworks'),
  guideDifficulty: L('အဆင့်', 'Difficulty'),
  guideDiffBeginner: L('စတင်သူ', 'Beginner'),
  guideDiffIntermediate: L('အလယ်အလတ်', 'Intermediate'),
  guideDiffAdvanced: L('ကျွမ်းကျင်', 'Advanced'),
  // ── New arrivals ───────────────────────────────────────
  newArrivalsTitle: L('အသစ်တင်ထားသော ပရောဂျက်များ', 'New arrivals'),
  newArrivalsSubtitle: L('မှတ်တမ်းတိုက်ထဲ အသစ်ဆုံး ထည့်သွင်းထားသော ပရောဂျက်များ', 'The most recently added projects in the archive'),
  newArrivalsViewAll: L('အသစ်များ အားလုံး ကြည့်ရန်', 'View all new'),
  newBadge: L('အသစ်', 'NEW'),
  newArrivalsEmpty: L('ပရောဂျက်အသစ် မရှိသေးပါ', 'No new projects yet'),
  // ── Topics / explore ───────────────────────────────────
  topicsTitle: L('ခေါင်းစဉ်အလိုက် ရှာဖွေရန်', 'Explore by topic'),
  topicsSubtitle: L('ရေပန်းစားသော သော့ချက်စကားလုံးများ — တစ်ခုကို နှိပ်ပြီး ကြည့်ပါ', 'Popular keywords across the archive — tap one to browse'),
  // ── Bibliography export (Library) ──────────────────────
  bibTitle: L('ကိုးကားစာရင်း ထုတ်ယူရန်', 'Export bibliography'),
  bibHint: L('သိမ်းထားသော ပရောဂျက်များအားလုံးကို ကိုးကားစာရင်းအဖြစ်', 'All your saved projects as a reference list'),
  bibCopy: L('စာရင်းအားလုံး ကူးယူရန်', 'Copy all'),
  bibDownload: L('.txt ဒေါင်းလုဒ်', 'Download .txt'),
  bibCopied: L('ကူးယူပြီးပါပြီ', 'Copied!'),
  bibEmpty: L('သိမ်းထားသော ပရောဂျက် မရှိသေးပါ', 'No saved projects yet'),
  // ── Print ──────────────────────────────────────────────
  printLabel: L('ပရင့်/PDF', 'Print / PDF'),
  savedProjects: L('သိမ်းထားသော ပရောဂျက်များ', 'Saved projects'),
  savedEmptyTitle: L('သိမ်းထားသော ပရောဂျက် မရှိသေးပါ', 'No saved projects yet'),
  savedEmptyHint: L('ပရောဂျက်တစ်ခုခုရှိ ♥ ကို နှိပ်ပြီး ဤနေရာတွင် သိမ်းထားနိုင်ပါသည်။', 'Tap the ♥ on any project to save it here for later.'),
  // ── Stats page ─────────────────────────────────────────
  statsTitle: L('မှတ်တမ်းတိုက် စာရင်းအင်းများ', 'Archive statistics'),
  statsSubtitle: L('မှတ်တမ်းတိုက်ထဲရှိ အရာအားလုံး တစ်နေရာတည်းတွင်', 'A transparent snapshot of everything in the archive'),
  statsProjects: L('ပရောဂျက်များ', 'Projects'),
  statsUniversities: L('တက္ကသိုလ်များ', 'Universities'),
  statsDepartments: L('ဌာနများ', 'Departments'),
  statsWithFile: L('ဖိုင်ပါသည့် ပရောဂျက်', 'With full file'),
  statsByYear: L('နှစ်အလိုက်', 'Projects by year'),
  statsByLevel: L('အဆင့်အလိုက်', 'By academic level'),
  statsByDept: L('ဌာနအလိုက်', 'By department'),
  statsByUni: L('တက္ကသိုလ်အလိုက်', 'By university'),
  statsTopViewed: L('အကြည့်အများဆုံး', 'Most viewed'),
  statsViews: L('ကြည့်ရှုမှု', 'views'),
  // ── Trending ───────────────────────────────────────────
  trendingTitle: L('ခေတ်စားနေသော ပရောဂျက်များ', 'Trending projects'),
  // ── Reviews ────────────────────────────────────────────
  reviewsTitle: L('အဆင့်သတ်မှတ်ချက် နှင့် သုံးသပ်ချက်များ', 'Ratings & reviews'),
  reviewsNone: L('သုံးသပ်ချက် မရှိသေးပါ — ပထမဆုံး ဖြစ်လိုက်ပါ', 'No reviews yet — be the first'),
  reviewsAverage: L('ပျမ်းမျှ', 'average'),
  reviewsCount: L('သုံးသပ်ချက်', 'reviews'),
  reviewYours: L('သင့်အဆင့်သတ်မှတ်ချက်', 'Your rating'),
  reviewComment: L('မှတ်ချက် (ရွေးချယ်နိုင်)', 'Comment (optional)'),
  reviewSubmit: L('တင်သွင်းရန်', 'Submit review'),
  reviewUpdate: L('ပြင်ဆင်ရန်', 'Update review'),
  reviewDelete: L('ဖျက်ရန်', 'Delete'),
  reviewLoginPrompt: L('သုံးသပ်ချက်ပေးရန် အကောင့်ဝင်ပါ', 'Log in to leave a review'),
  reviewThanks: L('သုံးသပ်ချက်အတွက် ကျေးဇူးတင်ပါသည်', 'Thanks for your review!'),
  contactAboutValue: L('ရည်ရွယ်ချက် နှင့် တည်ထောင်သူများ', 'Our purpose & the team'),
  contactAboutCta: L('ကြည့်ရန်', 'View'),

  // AI features
  aiAssistant: L('AI လက်ထောက်', 'AI Assistant'),
  aiChatTitle: L('AI လက်ထောက်ကို မေးမြန်းရန်', 'Ask the AI Assistant'),
  aiChatIntro: L(
    'စီမံကိန်းမှတ်တမ်းအကြောင်း မေးမြန်းနိုင်ပါသည်။ ဥပမာ — "ဆိုလာစွမ်းအင်နဲ့ ပတ်သက်တဲ့ project ဘာတွေရှိလဲ။"',
    'Ask about the project archive. e.g. "What projects are there about solar energy?"',
  ),
  aiChatPlaceholder: L('သင့်မေးခွန်းကို ရိုက်ထည့်ပါ…', 'Type your question…'),
  aiChatSend: L('ပို့ရန်', 'Send'),
  aiChatThinking: L('စဉ်းစားနေသည်…', 'Thinking…'),
  aiChatSources: L('ကိုးကားချက်များ', 'Sources'),
  aiChatError: L('တောင်းပန်ပါသည်၊ ပြဿနာတစ်ခု ဖြစ်ပွားခဲ့သည်။', 'Sorry, something went wrong.'),
  aiSmartSearch: L('AI ဖြင့် အဓိပ္ပာယ်ရှာဖွေမှု', 'AI Smart Search'),
  aiSmartSearchHint: L(
    'စကားလုံးအတိအကျ မတူညီသော်လည်း အဓိပ္ပာယ်တူ project များကို ရှာဖွေပေးသည်။',
    'Finds projects by meaning, even when the exact words differ.',
  ),
  aiSummaryLabel: L('AI အနှစ်ချုပ်', 'AI Summary'),
  aiRelatedTitle: L('ဆက်စပ်သော စီမံကိန်းများ (AI)', 'Related projects (AI)'),
  aiMatch: L('ကိုက်ညီမှု', 'match'),

  // Contact page
  contactTitle: L('ဆက်သွယ်ရန်', 'Contact Us'),
  contactIntro: L(
    'စီမံကိန်းများ ဝယ်ယူလိုခြင်း၊ ငွေပေးချေမှုအတွက် အကူအညီလိုခြင်း သို့မဟုတ် မေးမြန်းစရာရှိပါက အောက်ပါလမ်းကြောင်းများမှ ဆက်သွယ်နိုင်ပါသည်။',
    'Want to buy a project, need help with payment, or have a question? Reach us through any of the channels below.',
  ),
  contactPhone: L('ဖုန်း', 'Phone'),
  contactViber: L('Viber', 'Viber'),
  contactMessenger: L('Facebook Messenger', 'Facebook Messenger'),
  contactTelegram: L('Telegram', 'Telegram'),
  contactEmail: L('အီးမေးလ်', 'Email'),
  contactHours: L('ဆက်သွယ်ချိန်', 'Available hours'),
  contactHoursValue: L('တနင်္လာ – စနေ၊ နံနက် ၉ နာရီ – ညနေ ၅ နာရီ', 'Mon – Sat, 9:00 AM – 5:00 PM'),
  contactBuyNote: L(
    'ဝယ်ယူလိုသော စီမံကိန်း၏ ခေါင်းစဉ်ကို ဆက်သွယ်စဉ် ထည့်သွင်းပေးပါ။',
    'Please include the title of the project you want when you contact us.',
  ),
  contactChatCta: L('စာပို့ရန်', 'Message us'),
  contactCallCta: L('ခေါ်ဆိုရန်', 'Call now'),
  purchaseContactHeading: L('တိုက်ရိုက်ဆက်သွယ်၍ ဝယ်ယူရန်', 'Prefer to buy directly? Contact us'),
  purchaseContactBody: L(
    'အွန်လိုင်းငွေပေးချေမှုအဆင်မပြေပါက ကျွန်ုပ်တို့ကို တိုက်ရိုက်ဆက်သွယ်နိုင်ပါသည်။',
    'If online payment is inconvenient, you can reach us directly.',
  ),

  // Home / hero
  heroTitle: L(
    'သင့်စီမံကိန်းခေါင်းစဉ် ရှိပြီးသားလားဆိုတာ ရှာဖွေပါ',
    'Find out if your project title already exists',
  ),
  heroSubtitle: L(
    'မြန်မာနည်းပညာတက္ကသိုလ်များ၏ စီမံကိန်းမှတ်တမ်းများကို ရှာဖွေပါ။ သင့်ခေါင်းစဉ်မတင်သွင်းမီ တူညီသော သို့မဟုတ် ဆင်တူသော ခေါင်းစဉ်ဟောင်းများကို စစ်ဆေးနိုင်သည် — အကောင့်ဝင်ရန်မလိုပါ။',
    'Search the archive of Myanmar Technological University projects. Detect exact and similar previous titles before you propose yours — no login required.',
  ),
  searchPlaceholder: L(
    'ဥပမာ — IoT အခြေခံ စိုက်ပျိုးရေး စောင့်ကြည့်စနစ်',
    'e.g. IoT based smart agriculture monitoring system',
  ),
  searchBtn: L('ရှာဖွေရန်', 'Search'),
  browseCta: L('ခုနှစ် နှင့် တက္ကသိုလ်အလိုက် လှော်လှန်ကြည့်ရန်', 'Browse by year & university'),
  checkCta: L('ခေါင်းစဉ်တူ အပြည့်အစုံ စစ်ဆေးရန်', 'Run a full duplicate check'),
  projectLibraryCta: L('စီမံကိန်း စာကြည့်တိုက်', 'Project Library'),
  searchSameTitlesCta: L('ခေါင်းစဉ်တူများ ရှာဖွေရန်', 'Search Same Titles'),
  backToDashboard: L('Dashboard သို့ ပြန်သွားရန်', 'Back to Dashboard'),
  scrollTop: L('အပေါ်သို့ ပြန်တက်ရန်', 'Back to top'),
  allTitlesTitle: L('စီမံကိန်း ခေါင်းစဉ် စာရင်းအားလုံး', 'All Project Titles'),
  allTitlesSubtitle: L(
    'မှတ်တမ်းရှိ စီမံကိန်းခေါင်းစဉ် အားလုံးကို နံပါတ်စဉ်ဖြင့် တစ်နေရာတည်းတွင် ကြည့်ရှုပါ။',
    'Every project title in the archive, numbered, in one place.',
  ),
  allTitlesLink: L('ခေါင်းစဉ်စာရင်း အားလုံးကြည့်ရန်', 'View all titles'),
  titlesCount: L('ခေါင်းစဉ်', 'titles'),
  titlesSearchPlaceholder: L('ခေါင်းစဉ်ဖြင့် စစ်ထုတ်ရန်…', 'Filter by title…'),
  searching: L('မှတ်တမ်းများကို ရှာဖွေနေသည်…', 'Searching the archive…'),
  searchFailed: L('ရှာဖွေမှု မအောင်မြင်ပါ', 'Search failed'),
  matchesFor: L('ကိုက်ညီမှု', 'matches for'),
  matchFor: L('ကိုက်ညီမှု', 'match for'),
  normalized: L('စံပြုထားသည်', 'normalized'),
  duplicateRiskLead: L('ထပ်တူဖြစ်နိုင်ခြေ —', 'Duplicate risk:'),
  duplicateRiskBody: L(
    'အလွန်ဆင်တူသော ခေါင်းစဉ်များ ရှိနှင့်ပြီးဖြစ်သည်။ သင့်ခေါင်းစဉ်ကို ကွဲပြားစေရန် ပြန်လည်ပြင်ဆင်ရန် စဉ်းစားပါ။',
    'very similar titles already exist. Consider refining your topic to make it distinct.',
  ),
  noSimilarTitle: L('ဆင်တူသော ခေါင်းစဉ်များ မတွေ့ပါ', 'No similar titles found'),
  noSimilarHint: L(
    'သင်အဆိုပြုသော ခေါင်းစဉ်သည် မှတ်တမ်းတွင် ထူးခြားပုံရသည်။ သင့်ဌာနနှင့် အမြဲအတည်ပြုပါ။',
    'Your proposed title looks unique in the archive. Always confirm with your department.',
  ),

  // Home feature cards
  featSearchTitle: L('ခေါင်းစဉ်များ ရှာဖွေရန်', 'Search titles'),
  featSearchDesc: L(
    'သင့်အကြံကို စီမံကိန်းဟောင်းများနှင့် ချက်ချင်း နှိုင်းယှဉ်ပါ။',
    'Instantly compare your idea against past projects.',
  ),
  featRankTitle: L('အဆင့်ခွဲ ဆင်တူမှု', 'Ranked similarity'),
  featRankDesc: L(
    'Trigram + token + edit-distance ရမှတ် ၀–၁၀၀%။',
    'Trigram + token + edit-distance scoring, 0–100%.',
  ),
  featBuyTitle: L('ဖိုင်အပြည့်အစုံ ဝယ်ယူရန်', 'Buy full files'),
  featBuyDesc: L(
    'MMK ကို ကိုယ်တိုင်စစ်ဆေး၍ ဖိုင်ဝယ်ယူနိုင်သည်။',
    'Purchase access with manual MMK verification.',
  ),

  // Browse
  browseTitle: L('စီမံကိန်းများ လှော်လှန်ကြည့်ရန်', 'Browse projects'),
  browseSubtitle: L(
    'ခုနှစ်၊ တက္ကသိုလ်၊ ဌာန နှင့် အဆင့်အလိုက် စစ်ထုတ်ပါ။',
    'Filter by year, university, department and level.',
  ),
  fKeyword: L('သော့ချက်စကားလုံး', 'Keyword'),
  fKeywordPlaceholder: L('ခေါင်းစဉ် သို့ သော့ချက်စကားလုံး', 'title or keyword'),
  fUniversity: L('တက္ကသိုလ်', 'University'),
  fDepartment: L('ဌာန', 'Department'),
  fYear: L('ခုနှစ်', 'Year'),
  fAll: L('အားလုံး', 'All'),
  fAllLevels: L('အဆင့်အားလုံး', 'All levels'),
  projectsFound: L('စီမံကိန်း တွေ့ရှိသည်', 'projects found'),
  loadingProjects: L('စီမံကိန်းများ ဖွင့်နေသည်…', 'Loading projects…'),
  noProjectsTitle: L('ဤစစ်ထုတ်မှုနှင့် ကိုက်ညီသော စီမံကိန်း မရှိပါ', 'No projects match these filters'),
  noProjectsHint: L('စစ်ထုတ်မှုများကို ကျယ်ပြန့်စွာ ပြန်စမ်းကြည့်ပါ။', 'Try widening your filters.'),
  loadFailed: L('ဖွင့်၍မရပါ', 'Failed to load'),
  prevPage: L('ယခင်', 'Previous'),
  nextPage: L('နောက်', 'Next'),
  pageOf: L('စာမျက်နှာ', 'Page'),
  ofWord: L('/', 'of'),

  // Title check
  checkTitle: L('ခေါင်းစဉ်တူ စစ်ဆေးခြင်း', 'Title duplicate check'),
  checkSubtitle: L(
    'အဆိုပြုစီမံကိန်းခေါင်းစဉ်ကို ရိုက်ထည့်၍ မတင်သွင်းမီ ထပ်တူဖြစ်နိုင်ခြေကို စစ်ဆေးပါ။',
    'Paste a proposed project title to get a duplicate-risk verdict before you submit it.',
  ),
  proposedTitle: L('အဆိုပြု ခေါင်းစဉ်', 'Proposed title'),
  proposedPlaceholder: L(
    'သင့် နောက်ဆုံးနှစ် စီမံကိန်းခေါင်းစဉ်ကို ရိုက်ထည့်ပါ…',
    'Type your proposed final-year project title…',
  ),
  checking: L('စစ်ဆေးနေသည်…', 'Checking…'),
  checkBtn: L('ခေါင်းစဉ် စစ်ဆေးရန်', 'Check title'),
  checkFailed: L('စစ်ဆေးမှု မအောင်မြင်ပါ', 'Check failed'),
  closestTitles: L('အနီးစပ်ဆုံး ရှိပြီးသား ခေါင်းစဉ်များ', 'Closest existing titles'),
  verdictDuplicate: L('ထပ်တူဖြစ်နိုင်ခြေ မြင့်မားသည်', 'High duplicate risk'),
  verdictSimilar: L('ဆင်တူခေါင်းစဉ်များ ရှိနေသည်', 'Similar titles exist'),
  verdictUnique: L('ထူးခြားနိုင်ဖွယ်ရှိသည်', 'Likely unique'),
  verdictDuplicateBody: L(
    'အလွန်ဆင်တူသော သို့မဟုတ် တူညီသော ခေါင်းစဉ် ရှိနှင့်ပြီးဖြစ်သည်။ ကွဲပြားစေရန် ခေါင်းစဉ်ကို ပြန်ပြင်ပါ။',
    'A very similar or identical title already exists. Revise your topic to make it distinct.',
  ),
  verdictSimilarBody: L(
    'ဆက်စပ်သော ခေါင်းစဉ်များ ရှိသည်။ နယ်ပယ်ကွဲပြားပါက လက်ခံနိုင်ပေမည် — ကြီးကြပ်ဆရာနှင့် အတည်ပြုပါ။',
    'Related titles exist. Your topic may still be acceptable if the scope differs — confirm with your supervisor.',
  ),
  verdictUniqueBody: L(
    'မှတ်တမ်းတွင် အနီးစပ်ကိုက်ညီမှု မတွေ့ပါ။ သင့်ဌာနနှင့် အမြဲ အတည်ပြုပါ။',
    'No close matches were found in the archive. Always confirm with your department.',
  ),

  // Project detail
  back: L('နောက်သို့', 'Back'),
  abstract: L('အကျဉ်းချုပ်', 'Abstract / Summary'),
  keywords: L('သော့ချက်စကားလုံးများ', 'Keywords'),
  // ── Cite this project ──────────────────────────────────
  citeTitle: L('ဤပရောဂျက်ကို ကိုးကားရန်', 'Cite this project'),
  citeHint: L('ပုံစံရွေးပြီး ကူးယူပါ — thesis/proposal အတွက်', 'Pick a style and copy it for your thesis or proposal'),
  citeCopy: L('ကူးယူရန်', 'Copy'),
  citeCopied: L('ကူးယူပြီးပါပြီ', 'Copied!'),
  // ── Share ──────────────────────────────────────────────
  shareLabel: L('မျှဝေရန်', 'Share'),
  shareCopied: L('လင့်ခ် ကူးယူပြီးပါပြီ', 'Link copied!'),
  // ── Recently viewed ────────────────────────────────────
  recentlyViewed: L('မကြာသေးမီက ကြည့်ရှုခဲ့သည်', 'Recently viewed'),
  recentlyViewedClear: L('ရှင်းလင်းရန်', 'Clear'),
  metaUniversity: L('တက္ကသိုလ်', 'University'),
  metaDepartment: L('ဌာန', 'Department'),
  metaLevel: L('ပညာရေးအဆင့်', 'Academic level'),
  metaYear: L('ခုနှစ်', 'Year'),
  metaAuthors: L('ရေးသားသူများ', 'Authors'),
  metaSupervisor: L('ကြီးကြပ်ဆရာ', 'Supervisor'),
  fullFile: L('စီမံကိန်း ဖိုင်အပြည့်အစုံ', 'Full project file'),
  free: L('အခမဲ့', 'Free'),
  fileNotAvailable: L('ဤစီမံကိန်း၏ ဖိုင်အပြည့်အစုံကို မရရှိသေးပါ။', 'The full file for this project is not yet available.'),
  youHaveAccess: L('ဤဖိုင်ကို သင်ရယူခွင့်ရှိသည်။', 'You have access to this file.'),
  downloadFile: L('ဖိုင်အပြည့်အစုံ ဒေါင်းလုဒ်ဆွဲရန်', 'Download full file'),
  loginToBuyInfo: L('ဖိုင်အပြည့်အစုံ ဝယ်ယူရန် အကောင့်ဝင်ပါ။', 'Log in to purchase access to the full file.'),
  loginToBuyBtn: L('ဝယ်ယူရန် အကောင့်ဝင်ပါ', 'Login to purchase'),
  loadingProject: L('စီမံကိန်း ဖွင့်နေသည်…', 'Loading project…'),
  notFound: L('မတွေ့ပါ', 'Not found'),
  loadProjectFailed: L('စီမံကိန်း ဖွင့်၍မရပါ', 'Failed to load project'),
  dlNotApproved: L('သင့်ဝယ်ယူမှုကို အတည်မပြုရသေးပါ။', 'Your purchase has not been approved yet.'),
  dlSessionExpired: L('သင့် session သက်တမ်းကုန်သွားပါပြီ။ ပြန်လည်ဝင်ရောက်ပါ။', 'Your session expired. Please log in again.'),
  dlFailed: L('ဒေါင်းလုဒ် မအောင်မြင်ပါ။ ထပ်စမ်းကြည့်ပါ။', 'Download failed. Please try again.'),

  // Auth
  authAdminTitle: L('ဝန်ထမ်း / စီမံခန့်ခွဲသူ ဝင်ရောက်ခြင်း', 'Staff / Admin Access'),
  authWelcome: L('ပြန်လည်ကြိုဆိုပါသည်', 'Welcome back'),
  authCreate: L('အကောင့်အသစ် ဖွင့်ရန်', 'Create account'),
  authAdminHint: L(
    'သင့်အခွင့်အာဏာရှိအကောင့်ဖြင့် ဝင်ပါ။ ခွင့်ပြုချက်ကို ဤစာမျက်နှာမှမဟုတ်ဘဲ role အလိုက် ပေးသည်။',
    'Sign in with your privileged account. Access is granted by role, not by this page.',
  ),
  authStudentHint: L(
    'လှော်လှန်ကြည့်ခြင်းသည် အခမဲ့ဖြစ်သည် — ဖိုင်အပြည့်အစုံ ဝယ်ယူရန်သာ အကောင့်လိုအပ်သည်။',
    'Browsing is free — you only need an account to purchase full files.',
  ),
  fullName: L('အမည်အပြည့်အစုံ', 'Full name'),
  email: L('အီးမေးလ်', 'Email'),
  password: L('စကားဝှက်', 'Password'),
  pleaseWait: L('ခဏစောင့်ပါ…', 'Please wait…'),
  logIn: L('အကောင့်ဝင်ရန်', 'Log in'),
  register: L('အကောင့်ဖွင့်ရန်', 'Register'),
  noAccount: L('အကောင့်မရှိသေးဘူးလား? ', "Don't have an account? "),
  haveAccount: L('အကောင့်ရှိပြီးသားလား? ', 'Already registered? '),
  somethingWrong: L('တစ်ခုခု မှားယွင်းသွားသည်', 'Something went wrong'),

  // Cards / badges
  fullFileAvailable: L('ဖိုင်အပြည့်အစုံ ရရှိနိုင်', 'Full file available'),
  summaryOnly: L('အကျဉ်းချုပ်သာ', 'Summary only'),
  similarLabel: L('ဆင်တူ', 'Similar'),
  duplicateRiskLabel: L('ထပ်တူဖြစ်နိုင်ခြေ', 'Duplicate risk'),

  // Footer
  footerRights: L(
    'မြန်မာနည်းပညာတက္ကသိုလ်များ စီမံကိန်းမှတ်တမ်း။',
    'Myanmar Technological Universities Project Archive.',
  ),
  footerNote: L(
    'နောက်ဆုံးနှစ် ဘွဲ့ကျမ်းစီမံကိန်း · လှော်လှန်ကြည့်ခြင်း အခမဲ့ · ဖိုင်အပြည့်အစုံ ဝယ်ယူရန်လိုသည်။',
    'Final-year thesis project · Browsing is free · Full files require purchase.',
  ),

  // Purchase panel (manual MMK flow)
  howToPay: L('ငွေပေးချေနည်း', 'How to pay'),
  paymentMethod: L('ငွေပေးချေမှုနည်းလမ်း', 'Payment method'),
  txnRef: L('ငွေလွှဲ အကိုးအကား', 'Transaction reference'),
  txnRefPlaceholder: L('ဥပမာ — 210398475', 'e.g. 210398475'),
  txnRefRequired: L('သင့်ငွေပေးချေမှုမှ ငွေလွှဲအကိုးအကားကို ထည့်ပါ။', 'Enter the transaction reference from your payment.'),
  submitOrder: L('ငွေပေးချေမှု တင်သွင်းရန်', 'Submit payment order'),
  submitting: L('တင်သွင်းနေသည်…', 'Submitting…'),
  orderCreated: L('အော်ဒါ ဖန်တီးပြီးပါပြီ။ ငွေပေးချေမှု မှတ်တမ်းပုံ (screenshot) တင်ပါ။', 'Order created. Now upload your payment screenshot.'),
  orderFailed: L('မအောင်မြင်ပါ', 'Failed'),
  pendingVerify: L('ဤစီမံကိန်းအတွက် သင့်ငွေပေးချေမှုကို စီမံခန့်ခွဲသူက စစ်ဆေးဆဲဖြစ်သည်။ အတည်ပြုပြီးပါက ဖိုင်ရယူခွင့် ရရှိမည်။', "Your payment for this project is pending admin verification. You'll get access once approved."),
  uploadProofLabel: L('ငွေပေးချေမှု အထောက်အထား တင်ရန် / ပြောင်းရန်', 'Upload / replace payment proof'),
  uploadProofBtn: L('အထောက်အထား တင်ရန်', 'Upload proof'),
  uploading: L('တင်နေသည်…', 'Uploading…'),
  proofUploaded: L('အထောက်အထား တင်ပြီးပါပြီ။ စီမံခန့်ခွဲသူက စစ်ဆေးပြီး ဖိုင်ရယူခွင့် ပေးပါမည်။', 'Proof uploaded. An admin will verify and grant access shortly.'),
  uploadFailed: L('တင်၍မရပါ', 'Upload failed'),

  // My library
  libraryTitle: L('ကျွန်ုပ်၏ စာကြည့်တိုက်', 'My Library'),
  librarySubtitle: L('သင်ဝယ်ယူထားသော စီမံကိန်းများနှင့် ငွေပေးချေမှု မှတ်တမ်း။', 'Your purchased projects and payment history.'),
  loadingLibrary: L('သင့်စာကြည့်တိုက်ကို ဖွင့်နေသည်…', 'Loading your library…'),
  purchasedProjects: L('ဝယ်ယူထားသော စီမံကိန်းများ', 'Purchased projects'),
  noPurchasesTitle: L('ဝယ်ယူထားခြင်း မရှိသေးပါ', 'No purchases yet'),
  noPurchasesHint: L('စီမံကိန်းတစ်ခု၏ ဖိုင်ကို ဝယ်ယူပါက ဤနေရာတွင် မြင်ရမည်။', 'Buy access to a project to see it here.'),
  download: L('ဒေါင်းလုဒ်', 'Download'),
  paymentHistory: L('ငွေပေးချေမှု မှတ်တမ်း', 'Payment history'),
  noOrders: L('ငွေပေးချေမှု အော်ဒါ မရှိသေးပါ။', 'No payment orders yet.'),
  colProject: L('စီမံကိန်း', 'Project'),
  colAmount: L('ပမာဏ', 'Amount'),
  colMethod: L('နည်းလမ်း', 'Method'),
  colDate: L('ရက်စွဲ', 'Date'),
  colStatus: L('အခြေအနေ', 'Status'),
  dlNoLonger: L('ဤဖိုင်ကို ရယူခွင့် မရှိတော့ပါ။', 'Access to this file is no longer available.'),
  dlFailedRetry: L('ဒေါင်းလုဒ် မအောင်မြင်ပါ။ ထပ်စမ်းကြည့်ပါ။', 'Download failed. Please try again.'),

  // ── Admin ──────────────────────────────────────────────────────────────────
  adminDashboard: L('စီမံခန့်ခွဲမှု ဒက်ရှ်ဘုတ်', 'Admin Dashboard'),
  adminSignedInAs: L('ဝင်ရောက်ထားသူ', 'Signed in as'),
  adminCheckingAccess: L('ဝင်ခွင့် စစ်ဆေးနေသည်…', 'Checking access…'),
  adminOnly: L('စီမံခန့်ခွဲသူများသာ။ ပြန်ညွှန်းနေသည်…', 'Admins only. Redirecting…'),
  tabOverview: L('ခြုံငုံ', 'Overview'),
  tabProjects: L('စီမံကိန်းများ', 'Projects'),
  tabSchools: L('တက္ကသိုလ် / ဌာန', 'Universities'),
  tabPayments: L('ငွေပေးချေမှုများ', 'Payments'),
  tabUsers: L('အသုံးပြုသူများ', 'Users'),
  tabAudit: L('စစ်ဆေးမှတ်တမ်း', 'Audit Log'),

  // Dashboard cards
  statTotalProjects: L('စီမံကိန်း စုစုပေါင်း', 'Total projects'),
  statPublished: L('ထုတ်ဝေပြီး', 'published'),
  statPendingPayments: L('စောင့်ဆိုင်းဆဲ ငွေပေးချေမှု', 'Pending payments'),
  statNeedReview: L('စစ်ဆေးရန် လိုအပ်', 'need review'),
  statUsers: L('စာရင်းသွင်း အသုံးပြုသူ', 'Registered users'),
  statAccessGrants: L('ဖိုင်ရယူခွင့်', 'Access grants'),
  statFilesUnlocked: L('ဖိုင်များ ဖွင့်ပေးထား', 'files unlocked'),

  // Admin projects table
  aNewProject: L('+ စီမံကိန်းအသစ်', '+ New project'),
  aSearchPlaceholder: L('ခေါင်းစဉ် / သော့ချက် ရှာရန်…', 'Search title/keyword…'),
  aAllStatuses: L('အခြေအနေ အားလုံး', 'All statuses'),
  aColTitle: L('ခေါင်းစဉ်', 'Title'),
  aColYear: L('ခုနှစ်', 'Year'),
  aColUniDept: L('တက္ကသိုလ်/ဌာန', 'Uni/Dept'),
  aColStatus: L('အခြေအနေ', 'Status'),
  aColConsent: L('ခွင့်ပြုချက်', 'Consent'),
  aColFile: L('ဖိုင်', 'File'),
  aColActions: L('လုပ်ဆောင်ချက်', 'Actions'),
  aEdit: L('ပြင်ရန်', 'Edit'),
  aDelete: L('ဖျက်ရန်', 'Delete'),
  aYes: L('ရှိ', 'Yes'),
  aNo: L('မရှိ', 'No'),
  aDeleted: L('စီမံကိန်း ဖျက်ပြီးပါပြီ။', 'Project deleted.'),
  aSaved: L('သိမ်းဆည်းပြီးပါပြီ။', 'Saved.'),
  aConfirmDelete: L('ဤစီမံကိန်းကို အပြီးအပိုင် ဖျက်မလား?', 'Delete this project permanently?'),
  aNoProjects: L('စီမံကိန်း မရှိပါ', 'No projects'),
  aNoProjectsHint: L('ပထမဆုံး စီမံကိန်းမှတ်တမ်းကို ဖန်တီးပါ။', 'Create your first project record.'),
  aPrev: L('ရှေ့', 'Prev'),
  aNext: L('နောက်', 'Next'),

  // Project form
  fEditProject: L('စီမံကိန်း ပြင်ဆင်ရန်', 'Edit project'),
  fNewProject: L('စီမံကိန်းအသစ်', 'New project'),
  fCancel: L('မလုပ်တော့ပါ', 'Cancel'),
  fTitle: L('ခေါင်းစဉ်', 'Title'),
  fAbstract: L('အကျဉ်းချုပ်', 'Abstract / Summary'),
  fKeywordsComma: L('သော့ချက်စကားလုံးများ (ကော်မာဖြင့် ခြားပါ)', 'Keywords (comma separated)'),
  fLevel: L('ပညာရေးအဆင့်', 'Academic level'),
  fAdvanced: L('အဆင့်မြင့် စစ်ထုတ်မှု', 'Advanced filters'),
  fHideAdvanced: L('စစ်ထုတ်မှု ဖျောက်ရန်', 'Hide filters'),
  fPrice: L('စျေးနှုန်း (ကျပ်)', 'Price (MMK)'),
  fAuthors: L('ရေးသားသူများ', 'Authors'),
  fSupervisor: L('ကြီးကြပ်ဆရာ', 'Supervisor'),
  fSelect: L('ရွေးပါ…', 'Select…'),
  fProjectFile: L('စီမံကိန်း ဖိုင်အပြည့်အစုံ (pdf/doc/docx/zip)', 'Full project file (pdf/doc/docx/zip)'),
  fFileAttached: L('ဖိုင်တစ်ခု တွဲထားပြီးဖြစ်သည်။ အစားထိုးရန် အသစ်တင်ပါ။', 'A file is already attached; upload to replace it.'),
  fStatus: L('အခြေအနေ', 'Status'),
  fConsentLabel: L('ရေးသားသူ ခွင့်ပြုချက် မှတ်တမ်းရှိသည် (ထုတ်ဝေရန် မဖြစ်မနေလို)', 'Author consent recorded (required to publish)'),
  fConsentBlocked: L('ရေးသားသူ ခွင့်ပြုချက် မမှတ်တမ်းမချင်း ဤစီမံကိန်းကို ထုတ်ဝေ၍မရပါ။', 'You cannot publish this project until author consent is recorded.'),
  fConsentError: L('ခွင့်ပြုချက်မရှိဘဲ ထုတ်ဝေ၍မရပါ။ "ရေးသားသူ ခွင့်ပြုချက်" ကို အရင်အမှန်ခြစ်ပါ။', 'Cannot publish without author consent. Tick "Author consent" first.'),
  fSaving: L('သိမ်းနေသည်…', 'Saving…'),
  fSaveProject: L('စီမံကိန်း သိမ်းရန်', 'Save project'),
  fSaveFailed: L('သိမ်း၍မရပါ', 'Save failed'),

  // Admin payments
  pApprove: L('အတည်ပြုရန်', 'Approve'),
  pReject: L('ငြင်းပယ်ရန်', 'Reject'),
  pRejectReason: L('ငြင်းပယ်ရသည့် အကြောင်းရင်း (ရွေးချယ်နိုင်):', 'Reason for rejection (optional):'),
  pColUser: L('အသုံးပြုသူ', 'User'),
  pColMethodRef: L('နည်းလမ်း / အကိုးအကား', 'Method / Ref'),
  pNoOrders: L('ဤအခြေအနေတွင် အော်ဒါ မရှိပါ', 'No orders in this state'),
  pAll: L('အားလုံး', 'All'),
  pActionFailed: L('လုပ်ဆောင်ချက် မအောင်မြင်ပါ', 'Action failed'),
  pApproved: L('အော်ဒါကို အတည်ပြုပြီးပါပြီ။', 'Order approved.'),
  pRejected: L('အော်ဒါကို ငြင်းပယ်ပြီးပါပြီ။', 'Order rejected.'),
  pColProof: L('ငွေပေးချေမှု အထောက်အထား', 'Proof'),
  pViewProof: L('အထောက်အထား ကြည့်ရန်', 'View proof'),
  pNoProof: L('အထောက်အထား မရှိသေးပါ', 'No proof uploaded'),
  pConfirmApprove: L('ဤအော်ဒါကို အတည်ပြုမည်မှာ သေချာပါသလား။ အသုံးပြုသူ ဖိုင်ရယူခွင့် ရရှိပါမည်။', 'Approve this order? The user will be granted file access.'),
  pRejectTitle: L('အော်ဒါ ငြင်းပယ်ရန်', 'Reject order'),
  pRejectPlaceholder: L('ငြင်းပယ်ရသည့် အကြောင်းရင်း (ရွေးချယ်နိုင်)', 'Reason for rejection (optional)'),
  pCancel: L('ပယ်ဖျက်ရန်', 'Cancel'),
  pConfirm: L('အတည်ပြုရန်', 'Confirm'),

  // Admin schools (university/department CRUD)
  scTitle: L('တက္ကသိုလ်များ နှင့် ဌာနများ', 'Universities & Departments'),
  scSubtitle: L('တက္ကသိုလ်နှင့် ဌာနမှတ်တမ်းများကို ထည့်ခြင်း၊ ပြင်ခြင်း၊ ဖျက်ခြင်း။', 'Create, edit and delete university and department records.'),
  scNewUni: L('+ တက္ကသိုလ်အသစ်', '+ New university'),
  scUniName: L('တက္ကသိုလ်အမည်', 'University name'),
  scUniShort: L('အတိုကောက်', 'Short name'),
  scUniCity: L('မြို့', 'City'),
  scDepartments: L('ဌာနများ', 'Departments'),
  scDeptName: L('ဌာနအမည်', 'Department name'),
  scDeptCode: L('ကုဒ်', 'Code'),
  scAddDept: L('+ ဌာနထည့်ရန်', '+ Add department'),
  scSave: L('သိမ်းရန်', 'Save'),
  scSaving: L('သိမ်းနေသည်…', 'Saving…'),
  scCancel: L('မလုပ်တော့ပါ', 'Cancel'),
  scEdit: L('ပြင်ရန်', 'Edit'),
  scDelete: L('ဖျက်ရန်', 'Delete'),
  scConfirmDeleteUni: L('ဤတက္ကသိုလ်ကို ဖျက်မလား? (စီမံကိန်းရှိပါက ဖျက်၍မရပါ)', 'Delete this university? (blocked if projects exist)'),
  scConfirmDeleteDept: L('ဤဌာနကို ဖျက်မလား?', 'Delete this department?'),
  scNoUnis: L('တက္ကသိုလ် မရှိသေးပါ', 'No universities yet'),
  scNoDepts: L('ဌာန မရှိသေးပါ', 'No departments'),
  scActionFailed: L('လုပ်ဆောင်ချက် မအောင်မြင်ပါ', 'Action failed'),
  scSaved: L('သိမ်းဆည်းပြီးပါပြီ။', 'Saved.'),

  // Admin users
  uColName: L('အမည်', 'Name'),
  uColEmail: L('အီးမေးလ်', 'Email'),
  uColRole: L('အခန်းကဏ္ဍ', 'Role'),
  uColJoined: L('ဝင်ရောက်သည့်ရက်', 'Joined'),
  uRoleChanged: L('အခန်းကဏ္ဍ ပြောင်းပြီးပါပြီ။', 'Role updated.'),
  uColScope: L('ဌာန အခွင့်အာဏာ', 'Admin scope'),
  uScopeSuper: L('စနစ်တစ်ခုလုံး (Super)', 'Whole platform (Super)'),
  uScopeAllDepts: L('ဌာနအားလုံး (Super admin)', 'All departments (Super admin)'),
  uScopePick: L('ဌာနတစ်ခု ရွေးပါ', 'Pick a department'),
  uScopeHint: L(
    'Admin တစ်ဦးကို ဌာနတစ်ခုသတ်မှတ်ပါက ထိုဌာန၏ project များကိုသာ ပြင်/ဖျက်နိုင်ပြီး မိမိ dashboard ကိုသာ မြင်ရပါမည်။ "Super" ရွေးလျှင် စနစ်တစ်ခုလုံးကို စီမံနိုင်သည်။',
    'Binding an admin to a department lets them edit/delete only that department\u2019s projects and see only their own dashboard. "Super" grants full platform control.',
  ),
  uScopeSaved: L('Admin အခွင့်အာဏာ ပြောင်းပြီးပါပြီ။', 'Admin scope updated.'),

  // ── Website Kits (storefront + checkout) ──────────────────────────────────
  kitsTitle: L('ဝဘ်ဆိုက် တည်ဆောက်ရေး Kit များ', 'Website Building Kits'),
  kitsSubtitle: L(
    'website အမျိုးအစားတစ်ခုစီအတွက် အစအဆုံး လမ်းညွှန်ချက်များနှင့် AI prompt အပြည့်အစုံ — zip ဖိုင်အဖြစ် ဒေါင်းလုဒ်ရယူပါ။',
    'Step-by-step guides + full AI prompt packs for each website type — delivered as a downloadable zip.',
  ),
  kitBuyNow: L('ဝယ်ယူ ဒေါင်းလုဒ်ရန်', 'Buy & Download'),
  kitDownload: L('ဒေါင်းလုဒ် (zip)', 'Download (zip)'),
  kitOwned: L('ဝယ်ယူပြီး', 'Purchased'),
  kitFree: L('အခမဲ့', 'Free'),
  kitWhatsInside: L('ထဲတွင် ဘာပါသလဲ', 'What\u2019s inside'),
  kitIncludesGuide: L('တစ်ဆင့်ချင်း တည်ဆောက်နည်း လမ်းညွှန်', 'Step-by-step build guide'),
  kitIncludesPrompts: L('ကူးထည့်ရုံ AI prompt အပြည့်အစုံ', 'Copy-paste AI prompt pack'),
  kitIncludesStack: L('Tech stack + အခြားရွေးချယ်စရာများ', 'Tech stack + alternatives'),
  kitIncludesChecklist: L('ထုတ်ဝေရေး checklist', 'Launch checklist'),

  // Checkout modal
  kitCheckoutTitle: L('KPay ဖြင့် ပေးချေရန်', 'Pay with KPay'),
  kitPayTo: L('ငွေလွှဲရန် KPay', 'KPay account'),
  kitPayName: L('အမည်', 'Name'),
  kitPayAmount: L('ပေးချေရမည့် ပမာဏ', 'Amount to pay'),
  kitStep1: L('၁။ အထက်ပါ KPay နံပါတ်သို့ ငွေလွှဲပါ။', '1. Transfer the amount to the KPay number above.'),
  kitStep2: L('၂။ ငွေလွှဲ Transaction ID ကို ရိုက်ထည့်ပါ။', '2. Enter your transfer Transaction ID.'),
  kitStep3: L('၃။ ပြေစာ (screenshot) ကို upload လုပ်ပါ။', '3. Upload your payment screenshot.'),
  kitStep4: L('၄။ Admin အတည်ပြုပြီးပါက ဒေါင်းလုဒ်ရနိုင်ပါမည်။', '4. After admin approval you can download.'),
  kitTxnRef: L('Transaction ID', 'Transaction ID'),
  kitTxnRefPlaceholder: L('ဥပမာ - 0091234567890', 'e.g. 0091234567890'),
  kitUploadProof: L('ပြေစာ (screenshot) တင်ရန်', 'Upload payment proof'),
  kitSubmitOrder: L('အော်ဒါ တင်ရန်', 'Submit order'),
  kitOrderPending: L('သင့်အော်ဒါကို Admin စစ်ဆေးနေပါသည်။ အတည်ပြုပြီးပါက ဒေါင်းလုဒ်ရနိုင်ပါမည်။', 'Your order is awaiting admin review. You can download once it is approved.'),
  kitOrderApproved: L('ငွေပေးချေမှု အတည်ပြုပြီးပါပြီ — ဒေါင်းလုဒ်ဆွဲနိုင်ပါပြီ။', 'Payment approved — you can download now.'),
  kitLoginToBuy: L('ဝယ်ယူရန် အကောင့်ဝင်ပါ', 'Log in to buy'),
  kitProofUploaded: L('ပြေစာ တင်ပြီးပါပြီ။ Admin အတည်ပြုမှုကို စောင့်ပါ။', 'Proof uploaded. Please wait for admin approval.'),
  kitCancel: L('ပိတ်ရန်', 'Close'),

  // Admin kits
  tabKits: L('ဝဘ်ဆိုက် Kit များ', 'Website Kits'),
  kaTitle: L('ဝဘ်ဆိုက် Kit စီမံခန့်ခွဲမှု', 'Website Kit management'),
  kaOrders: L('Kit အော်ဒါများ', 'Kit orders'),
  kaUploadZip: L('Zip ဖိုင် တင်ရန်', 'Upload zip'),
  kaApprove: L('အတည်ပြု', 'Approve'),
  kaReject: L('ပယ်ချ', 'Reject'),
  kaViewProof: L('ပြေစာ ကြည့်ရန်', 'View proof'),

  // Dashboard scope banner (shown to department admins)
  dashScopedBadge: L('ဌာန အလိုက် မြင်ကွင်း', 'Department view'),
  dashScopedNote: L(
    'ဤ dashboard သည် သင့်ဌာန၏ အချက်အလက်များကိုသာ ပြသပါသည်။',
    'This dashboard shows only your department\u2019s data.',
  ),

  // Admin audit
  auColWhen: L('အချိန်', 'When'),
  auColActor: L('လုပ်ဆောင်သူ', 'Actor'),
  auColAction: L('လုပ်ဆောင်ချက်', 'Action'),
  auColEntity: L('အရာဝတ္ထု', 'Entity'),
  auEmpty: L('စစ်ဆေးမှတ်တမ်း မရှိသေးပါ', 'No audit entries yet'),

  // Admin search analytics
  tabAnalytics: L('ရှာဖွေမှုစာရင်း', 'Search Analytics'),
  anTotalSearches: L('ရှာဖွေမှု စုစုပေါင်း', 'Total Searches'),
  anTotalChecks: L('ထပ်တူစစ်ဆေးမှု စုစုပေါင်း', 'Duplicate Checks'),
  anDuplicateRisks: L('ထပ်တူဖြစ်နိုင်ခြေ', 'Duplicate Risks'),
  anColKind: L('အမျိုးအစား', 'Kind'),
  anColQuery: L('ရှာဖွေစကားစု', 'Query'),
  anColResults: L('ရလဒ်', 'Results'),
  anColScore: L('ရမှတ်', 'Top Score'),
  anColVerdict: L('ဆုံးဖြတ်ချက်', 'Verdict'),
  anColWhen: L('အချိန်', 'When'),
  anEmpty: L('ရှာဖွေမှုမှတ်တမ်း မရှိသေးပါ', 'No search activity yet'),
  anFilterAll: L('အားလုံး', 'All'),

  // PWA / offline / error / not-found states
  offlineTitle: L('အင်တာနက် ချိတ်ဆက်မှု မရှိပါ', 'You are offline'),
  offlineBody: L(
    'ဤစာမျက်နှာကို ပြသရန် အင်တာနက် ချိတ်ဆက်မှု လိုအပ်ပါသည်။ ချိတ်ဆက်မှု ပြန်လည်ရရှိသည့်အခါ ထပ်မံကြိုးစားပါ။',
    'An internet connection is required to view this page. Please reconnect and try again.',
  ),
  offlineRetry: L('ထပ်မံကြိုးစားရန်', 'Try again'),
  notFoundTitle: L('စာမျက်နှာ မတွေ့ပါ', 'Page not found'),
  notFoundBody: L(
    'သင်ရှာဖွေနေသော စာမျက်နှာသည် ရွှေ့ပြောင်းသွားခြင်း သို့မဟုတ် မရှိတော့ခြင်း ဖြစ်နိုင်ပါသည်။',
    'The page you are looking for may have moved or no longer exists.',
  ),
  errorTitle: L('တစ်ခုခု မှားယွင်းသွားပါသည်', 'Something went wrong'),
  errorBody: L(
    'မမျှော်လင့်ထားသော အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားပါ။',
    'An unexpected error occurred. Please try again.',
  ),
  errorRetry: L('ထပ်မံကြိုးစားရန်', 'Try again'),
  backHome: L('ပင်မစာမျက်နှာသို့ ပြန်သွားရန်', 'Back to home'),
  installApp: L('အက်ပ် ထည့်သွင်းရန်', 'Install app'),
  installDismiss: L('ပိတ်ရန်', 'Dismiss'),

  // Media tabs / video
  mediaPhotos: L('ဓာတ်ပုံများ', 'Photos'),
  media360: L('၃၆၀° ကြည့်ရှုရန်', '360° View'),
  mediaVideo: L('ဗီဒီယို', 'Video'),
  videoUploadLabel: L('ဗီဒီယို (short clip) တင်ရန်', 'Upload video (short clip)'),
  videoUploading: L('ဗီဒီယို တင်နေသည်…', 'Uploading video…'),
  videoDisabled: L(
    'ဤဆာဗာတွင် ဗီဒီယို ဝန်ဆောင်မှု မဖွင့်ရသေးပါ (Cloudinary မသတ်မှတ်ရသေးပါ)။',
    'Video hosting is not enabled on this server (Cloudinary not configured).',
  ),
  videoHint: L(
    'MP4, WebM သို့ MOV — အများဆုံး ၅၀MB။ Cloudinary CDN ပေါ်တွင် သိမ်းဆည်းသည်။',
    'MP4, WebM or MOV — up to 50MB. Stored on the Cloudinary CDN.',
  ),
} as const;

/** Level enum → Burmese-first label. */
export const levelLabel: Record<string, Label> = {
  YEAR_3: L('တတိယနှစ်', '3rd Year'),
  YEAR_5: L('ပဉ္စမနှစ်', '5th Year'),
  FINAL_YEAR: L('နောက်ဆုံးနှစ်', 'Final Year'),
  OTHER: L('အခြား', 'Other'),
};

/** Status enum → Burmese-first label (projects + payments). */
export const statusLabel: Record<string, Label> = {
  DRAFT: L('မူကြမ်း', 'Draft'),
  PUBLISHED: L('ထုတ်ဝေပြီး', 'Published'),
  ARCHIVED: L('သိမ်းဆည်းပြီး', 'Archived'),
  PENDING: L('စောင့်ဆိုင်းဆဲ', 'Pending'),
  APPROVED: L('အတည်ပြုပြီး', 'Approved'),
  REJECTED: L('ငြင်းပယ်ပြီး', 'Rejected'),
};
