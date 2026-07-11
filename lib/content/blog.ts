// Static blog/news content, bilingual. Swap for a CMS or Supabase table
// when editorial needs outgrow a code file.

export interface BlogPost {
  slug: string
  date: string // ISO
  minutes: number
  image: string
  title: { en: string; bn: string }
  excerpt: { en: string; bn: string }
  body: { en: string[]; bn: string[] }
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'why-a2-milk',
    date: '2026-06-12',
    minutes: 4,
    image: '/photos/scenic/pasture-mist.webp',
    title: {
      en: 'Why We Keep a Separate A2 Herd',
      bn: 'কেন আমরা আলাদা এ২ গাভীর পাল রাখি',
    },
    excerpt: {
      en: 'Our Sahiwal cows produce A2 milk the traditional way. Here is what that actually means for your glass.',
      bn: 'আমাদের শাহীওয়াল গাভীরা ঐতিহ্যবাহী পদ্ধতিতে এ২ দুধ দেয়। আপনার গ্লাসের জন্য এর মানে কী, জেনে নিন।',
    },
    body: {
      en: [
        'Walk past the far paddock at our Gazipur pasture and you will notice the herd looks different — humped backs, long ears, calm dark eyes. These are Sahiwal cows, one of the great indigenous dairy breeds of the subcontinent, and every drop of our A2 milk comes from them.',
        'Most commercial milk contains a mix of A1 and A2 beta-casein proteins. Older indigenous breeds like the Sahiwal naturally produce only the A2 type, which many families tell us they find gentler on digestion. We do not make medical claims — we simply keep the breed pure, test the herd, and label the bottle honestly.',
        'Keeping a separate A2 herd costs more. Sahiwals give less milk than Holstein crosses, and they graze rather than stand in stalls. We think the taste and the heritage are worth it, and judging by how quickly the morning batch sells out, many of you agree.',
        'A2 milk is bottled separately at dawn and delivered on the same routes as our regular fresh milk. If it is sold out online, ask your delivery rider about joining the standing-order list.',
      ],
      bn: [
        'গাজীপুর চারণভূমির শেষ মাঠটা পেরোলেই দেখবেন পালটা একটু আলাদা — কুঁজওয়ালা পিঠ, লম্বা কান, শান্ত কালো চোখ। এরা শাহীওয়াল গাভী, উপমহাদেশের সেরা দেশি দুগ্ধ জাতগুলোর একটি। আমাদের এ২ দুধের প্রতিটি ফোঁটা আসে এদের কাছ থেকেই।',
        'বাজারের বেশিরভাগ দুধে এ১ ও এ২ বিটা-কেসিন প্রোটিনের মিশ্রণ থাকে। শাহীওয়ালের মতো পুরনো দেশি জাত প্রাকৃতিকভাবে শুধু এ২ ধরনের প্রোটিন তৈরি করে — অনেক পরিবার বলেন এটি হজমে সহজ লাগে। আমরা কোনো চিকিৎসা-দাবি করি না — শুধু জাত খাঁটি রাখি, পাল পরীক্ষা করি, আর বোতলে সত্যি কথাটা লিখি।',
        'আলাদা এ২ পাল রাখা ব্যয়বহুল। হোলস্টেইন ক্রসের চেয়ে শাহীওয়াল দুধ দেয় কম, আর এরা গোয়ালে দাঁড়িয়ে থাকার বদলে মাঠে চরে। তবু স্বাদ আর ঐতিহ্যের জন্য এটুকু আমাদের কাছে সার্থক — সকালের ব্যাচ যত দ্রুত শেষ হয়, তাতে মনে হয় আপনারাও একমত।',
        'এ২ দুধ ভোরে আলাদাভাবে বোতলজাত হয়ে নিয়মিত রুটেই ডেলিভারি হয়। অনলাইনে শেষ হয়ে গেলে ডেলিভারি রাইডারকে স্ট্যান্ডিং-অর্ডার তালিকার কথা জিজ্ঞেস করুন।',
      ],
    },
  },
  {
    slug: 'monsoon-on-the-farm',
    date: '2026-07-01',
    minutes: 3,
    image: '/photos/scenic/rice-paddy.webp',
    title: {
      en: 'Monsoon on the Farm: How the Herd Weathers the Rains',
      bn: 'বর্ষায় খামার: বৃষ্টির দিনে পালের যত্ন',
    },
    excerpt: {
      en: 'Mud, fodder stores and very happy ducks — a look at what changes on a dairy farm when the monsoon arrives.',
      bn: 'কাদা, খাদ্যের মজুত আর মহাখুশি হাঁসের দল — বর্ষা এলে ডেইরি খামারে কী কী বদলায়, দেখে নিন।',
    },
    body: {
      en: [
        'The first proper downpour of the season changes everything on the farm. The cows shelter under the long barn eaves, the calves discover puddles, and the Napier grass at Manikganj grows so fast you can almost watch it.',
        'Monsoon is when the fodder planning of the dry season pays off. Silage pits dug in April are opened one by one, so the herd eats consistently even when the pastures are waterlogged. A cow whose diet swings wildly gives milk that swings wildly — consistency in the trough means consistency in your bottle.',
        'Hygiene work doubles in the wet months. Bedding is changed more often, hooves are checked weekly, and the milking parlor is washed down after every session. It is the least glamorous work on the farm and the most important.',
        'Delivery routes run as usual through the rain — our riders just swap to covered crates. If your lane floods, message us and we will hold your order at the nearest collection point.',
      ],
      bn: [
        'মৌসুমের প্রথম ভারী বৃষ্টি খামারের সবকিছু বদলে দেয়। গরুরা আশ্রয় নেয় গোশালার লম্বা ছাউনির নিচে, বাছুরেরা আবিষ্কার করে জলকাদা, আর মানিকগঞ্জের নেপিয়ার ঘাস এত দ্রুত বাড়ে যে চোখের সামনে বাড়তে দেখা যায়।',
        'শুকনো মৌসুমের খাদ্য পরিকল্পনার ফল মেলে বর্ষায়। এপ্রিলে কাটা সাইলেজ গর্তগুলো একে একে খোলা হয়, ফলে মাঠ ডুবে গেলেও পালের খাওয়া থাকে নিয়মিত। যে গরুর খাবার এলোমেলো, তার দুধও এলোমেলো — গামলায় নিয়ম মানেই বোতলে নিয়ম।',
        'ভেজা মাসগুলোতে পরিচ্ছন্নতার কাজ দ্বিগুণ। বিছানা বদলানো হয় ঘন ঘন, খুর পরীক্ষা সাপ্তাহিক, আর প্রতি দোহনের পরে মিল্কিং পার্লার ধোয়া হয়। খামারের সবচেয়ে সাদামাটা কাজ, অথচ সবচেয়ে জরুরি।',
        'বৃষ্টির মধ্যেও ডেলিভারি চলে যথারীতি — রাইডাররা শুধু ঢাকনাওয়ালা ক্রেটে বদলে নেন। আপনার গলি ডুবে গেলে মেসেজ করুন, নিকটবর্তী কালেকশন পয়েন্টে অর্ডার রেখে দেব।',
      ],
    },
  },
  {
    slug: 'ghee-the-slow-way',
    date: '2026-05-18',
    minutes: 5,
    image: 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783742543/products/pure-ghee-500g.webp',
    title: {
      en: 'Ghee, the Slow Way: From Cream to Gold in Nine Hours',
      bn: 'ধীরে বানানো ঘি: ননী থেকে সোনালি ঘি, ন’ঘণ্টার গল্প',
    },
    excerpt: {
      en: 'Our ghee is still made in small batches over a slow fire. Here is the whole process, start to finish.',
      bn: 'আমাদের ঘি আজও ছোট ব্যাচে, ঢিমে আঁচে তৈরি হয়। শুরু থেকে শেষ — পুরো প্রক্রিয়াটা জানুন।',
    },
    body: {
      en: [
        'Real ghee cannot be hurried. Ours starts as cream skimmed from the morning milk, cultured overnight into makkhan the way village households have always done it.',
        'The butter is then simmered in wide steel pans over a low flame for hours. The water cooks off, the milk solids settle and toast to a deep amber, and the kitchen fills with the nutty, caramel smell that tells the karigar it is time to strain.',
        'What goes into the jar is nothing but clarified butterfat with those toasted solids’ flavour — no colour, no essence, no vegetable oil. That is also why our ghee solidifies with a grainy texture in winter: that grain is the signature of slow-cooked, unadulterated ghee.',
        'A little goes a long way. A spoon over hot rice, a teaspoon to finish dal, or the traditional first taste for a weaning baby — this is the ghee our own family eats, made the way our grandmother insisted it must be.',
      ],
      bn: [
        'আসল ঘি তাড়াহুড়োয় হয় না। আমাদের ঘি শুরু হয় সকালের দুধ থেকে তোলা ননী দিয়ে — গ্রামের ঘরে যেমন হয়, সারারাত জমিয়ে তা থেকে হয় মাখন।',
        'সেই মাখন এরপর চওড়া স্টিলের কড়াইয়ে ঢিমে আঁচে ঘণ্টার পর ঘণ্টা জ্বাল দেওয়া হয়। পানি উড়ে যায়, দুধের কণা থিতিয়ে গাঢ় অ্যাম্বার রঙে ভাজা হয়, আর রান্নাঘর ভরে ওঠে সেই বাদামি-ক্যারামেল গন্ধে — কারিগর বুঝে যান, এবার ছাঁকার সময়।',
        'বয়ামে যা ঢোকে তা শুধুই পরিশোধিত দুগ্ধচর্বি আর সেই ভাজা কণার স্বাদ — কোনো রং নেই, এসেন্স নেই, ভেজিটেবল অয়েল নেই। এ কারণেই শীতে আমাদের ঘি দানাদার হয়ে জমে — সেই দানাই ধীরে জ্বাল দেওয়া খাঁটি ঘিয়ের স্বাক্ষর।',
        'অল্পেই অনেক। গরম ভাতে এক চামচ, ডালের শেষে আধা চামচ, কিংবা শিশুর মুখেভাতের প্রথম স্বাদ — এই ঘি আমাদের নিজেদের পরিবার খায়, দাদির শেখানো নিয়মেই বানানো।',
      ],
    },
  },
  {
    slug: 'choosing-a-dairy-cow',
    date: '2026-04-02',
    minutes: 6,
    image: '/photos/scenic/calves-field.webp',
    title: {
      en: 'Buying Your First Dairy Cow: A Farmer’s Checklist',
      bn: 'প্রথম দুধের গাভী কেনা: খামারির চেকলিস্ট',
    },
    excerpt: {
      en: 'Forty years of cattle-keeping distilled into the checks we run before any animal joins — or leaves — our farm.',
      bn: 'চল্লিশ বছরের গরু পালনের অভিজ্ঞতা থেকে — কোনো পশু আমাদের খামারে ঢোকা বা বেরোনোর আগে যে পরীক্ষাগুলো করি।',
    },
    body: {
      en: [
        'Every week farmers visit us to buy their first dairy cow, and every week we walk them through the same checklist we use ourselves. It fits on one page, and it can save you a year of losses.',
        'Health first: eyes bright and clean, nose moist, coat glossy, no limp, dung well-formed. Ask for the vaccination card — FMD and anthrax at minimum — and have any animal you are serious about examined by an independent vet. We provide health files for every animal we sell; walk away from any seller who will not.',
        'Then production: do not buy on promises, buy on a milking you watched. Visit at milking time, see the actual yield, and check the udder — four working quarters, soft after milking, no hard lumps. For a heifer, look at the mother’s records instead.',
        'Finally temperament and price. A calm cow that lets strangers handle her will save you daily struggle. Compare the asking price against roughly 100 days of her milk value — it is a crude rule, but it keeps emotion out of the deal.',
        'If you are starting out, our team is happy to help you choose from our own stock or inspect an animal you found elsewhere. Honest cattle trading builds the kind of neighbours we want to have.',
      ],
      bn: [
        'প্রতি সপ্তাহে খামারি ভাইয়েরা আসেন তাঁদের প্রথম দুধের গাভী কিনতে, আর প্রতি সপ্তাহে আমরা একই চেকলিস্ট ধরে এগোই — যেটা আমরা নিজেরাও ব্যবহার করি। এক পাতায় ধরে যায়, অথচ বাঁচিয়ে দিতে পারে এক বছরের লোকসান।',
        'আগে স্বাস্থ্য: চোখ উজ্জ্বল ও পরিষ্কার, নাক ভেজা, লোম চকচকে, খোঁড়ানো নেই, গোবর স্বাভাবিক। টিকার কার্ড চান — অন্তত এফএমডি ও অ্যানথ্রাক্স — আর পছন্দ হলে স্বাধীন ভেট দিয়ে পরীক্ষা করান। আমরা প্রতিটি বিক্রীত পশুর স্বাস্থ্য ফাইল দিই; যে বিক্রেতা দেবে না, তাকে এড়িয়ে চলুন।',
        'তারপর উৎপাদন: প্রতিশ্রুতিতে নয়, নিজের চোখে দেখা দোহনে কিনুন। দোহনের সময়ে যান, আসল ফলন দেখুন, ওলান পরীক্ষা করুন — চারটি কার্যকর বাঁট, দোহনের পরে নরম, শক্ত চাকা নেই। বকনা হলে বরং মায়ের রেকর্ড দেখুন।',
        'শেষে মেজাজ আর দাম। যে শান্ত গাভী অচেনা মানুষের হাতেও অস্থির হয় না, সে আপনার প্রতিদিনের কষ্ট বাঁচাবে। চাওয়া দামটা মিলিয়ে দেখুন তার প্রায় ১০০ দিনের দুধের দামের সাথে — মোটা দাগের হিসাব, কিন্তু আবেগকে দূরে রাখে।',
        'নতুন শুরু করলে আমাদের টিম আনন্দের সাথে সাহায্য করবে — আমাদের নিজস্ব পশু থেকে বাছাইয়ে, বা অন্য কোথাও পাওয়া পশুর পরিদর্শনে। সৎ গরুর বেচাকেনাই তৈরি করে সেই প্রতিবেশী, যাদের আমরা পাশে চাই।',
      ],
    },
  },
]

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug)
}
