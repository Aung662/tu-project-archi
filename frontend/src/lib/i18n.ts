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

export const t = {
  // Brand / chrome
  brandTitle: L('မြန်မာနည်းပညာတက္ကသိုလ် စီမံကိန်းမှတ်တမ်း', 'Project Archive'),
  brandSubtitle: L('ခေါင်းစဉ်တူ စစ်ဆေးရေးစနစ်', '& Title Similarity Checker'),

  // Nav
  navSearch: L('ရှာဖွေရန်', 'Search'),
  navBrowse: L('လှော်လှန်ကြည့်ရန်', 'Browse'),
  navCheck: L('ခေါင်းစဉ်စစ်ဆေးရန်', 'Title Check'),
  navLibrary: L('ကျွန်ုပ်၏စာကြည့်တိုက်', 'My Library'),
  navAdmin: L('စီမံခန့်ခွဲမှု', 'Admin'),
  navAdminDashboard: L('စီမံခန့်ခွဲမှု ဒက်ရှ်ဘုတ်', 'Admin Dashboard'),
  navLogin: L('အကောင့်ဝင်ရန်', 'Login'),
  navLogout: L('ထွက်ရန်', 'Logout'),

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
