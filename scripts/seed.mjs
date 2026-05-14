// Run: node scripts/seed.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dir, '../.env'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// ── Products ──────────────────────────────────────────────────────────────────

const products = [
  // Dairy (30)
  { slug:'fresh-milk-1l',       name_bn:'তাজা দুধ ১ লিটার',           name_en:'Fresh Milk 1 Litre',               description_en:'Farm-fresh cow milk collected daily.',              type:'dairy',      price:80,    sale_price:null, unit:'litre',     stock:200, is_active:true, tags:['milk','fresh','halal'],         images:[] },
  { slug:'fresh-milk-500ml',    name_bn:'তাজা দুধ ৫০০ মিলি',          name_en:'Fresh Milk 500 ml',                description_en:'Ideal for small households.',                       type:'dairy',      price:45,    sale_price:null, unit:'500ml',     stock:300, is_active:true, tags:['milk','fresh','halal'],         images:[] },
  { slug:'fresh-milk-2l',       name_bn:'তাজা দুধ ২ লিটার',           name_en:'Fresh Milk 2 Litre',               description_en:'For large families and restaurants.',               type:'dairy',      price:155,   sale_price:150,  unit:'litre',     stock:120, is_active:true, tags:['milk','fresh','halal','bulk'],  images:[] },
  { slug:'a2-milk-1l',          name_bn:'এ২ দুধ ১ লিটার',             name_en:'A2 Milk 1 Litre',                  description_en:'Pure A2 milk from Sahiwal cows.',                   type:'dairy',      price:130,   sale_price:null, unit:'litre',     stock:80,  is_active:true, tags:['milk','a2','premium','halal'],  images:[] },
  { slug:'buffalo-milk-1l',     name_bn:'মহিষের দুধ ১ লিটার',         name_en:'Buffalo Milk 1 Litre',             description_en:'High-fat nutritious buffalo milk.',                 type:'dairy',      price:100,   sale_price:null, unit:'litre',     stock:60,  is_active:true, tags:['milk','buffalo','halal'],       images:[] },
  { slug:'mishti-doi-500g',     name_bn:'মিষ্টি দই ৫০০ গ্রাম',        name_en:'Mishti Doi 500g',                  description_en:'Traditional sweet yogurt.',                         type:'dairy',      price:120,   sale_price:null, unit:'500g',      stock:50,  is_active:true, tags:['yogurt','sweets','halal'],      images:[] },
  { slug:'mishti-doi-1kg',      name_bn:'মিষ্টি দই ১ কেজি',           name_en:'Mishti Doi 1 kg',                  description_en:'Family-size pack.',                                 type:'dairy',      price:230,   sale_price:220,  unit:'1kg',       stock:30,  is_active:true, tags:['yogurt','sweets','halal','bulk'],images:[] },
  { slug:'plain-yogurt-500g',   name_bn:'সাদা দই ৫০০ গ্রাম',          name_en:'Plain Yogurt 500g',                description_en:'Naturally set plain yogurt.',                       type:'dairy',      price:90,    sale_price:null, unit:'500g',      stock:80,  is_active:true, tags:['yogurt','plain','halal'],       images:[] },
  { slug:'pure-ghee-250g',      name_bn:'খাঁটি ঘি ২৫০ গ্রাম',         name_en:'Pure Ghee 250g',                   description_en:'100% pure clarified butter.',                       type:'dairy',      price:440,   sale_price:null, unit:'250g',      stock:40,  is_active:true, tags:['ghee','premium','halal'],       images:[] },
  { slug:'pure-ghee-500g',      name_bn:'খাঁটি ঘি ৫০০ গ্রাম',         name_en:'Pure Ghee 500g',                   description_en:'100% pure clarified butter.',                       type:'dairy',      price:850,   sale_price:null, unit:'500g',      stock:30,  is_active:true, tags:['ghee','premium','halal'],       images:[] },
  { slug:'pure-ghee-1kg',       name_bn:'খাঁটি ঘি ১ কেজি',            name_en:'Pure Ghee 1 kg',                   description_en:'Special ghee for cooking and rituals.',             type:'dairy',      price:1650,  sale_price:1600, unit:'1kg',       stock:20,  is_active:true, tags:['ghee','premium','halal','bulk'],images:[] },
  { slug:'butter-200g',         name_bn:'মাখন ২০০ গ্রাম',              name_en:'Butter 200g',                      description_en:'Made from fresh cream.',                            type:'dairy',      price:320,   sale_price:null, unit:'200g',      stock:60,  is_active:true, tags:['butter','halal'],               images:[] },
  { slug:'butter-500g',         name_bn:'মাখন ৫০০ গ্রাম',              name_en:'Butter 500g',                      description_en:'Ideal for baking and cooking.',                     type:'dairy',      price:780,   sale_price:750,  unit:'500g',      stock:25,  is_active:true, tags:['butter','halal','bulk'],        images:[] },
  { slug:'paneer-250g',         name_bn:'পনির ২৫০ গ্রাম',              name_en:'Paneer 250g',                      description_en:'Fresh cottage cheese from curdled milk.',           type:'dairy',      price:180,   sale_price:null, unit:'250g',      stock:70,  is_active:true, tags:['paneer','cheese','halal'],      images:[] },
  { slug:'paneer-500g',         name_bn:'পনির ৫০০ গ্রাম',              name_en:'Paneer 500g',                      description_en:'Large pack for cooking.',                           type:'dairy',      price:350,   sale_price:330,  unit:'500g',      stock:40,  is_active:true, tags:['paneer','cheese','halal','bulk'],images:[] },
  { slug:'fresh-cream-200ml',   name_bn:'তাজা ক্রিম ২০০ মিলি',        name_en:'Fresh Cream 200ml',                description_en:'For desserts and cooking.',                         type:'dairy',      price:140,   sale_price:null, unit:'200ml',     stock:55,  is_active:true, tags:['cream','fresh','halal'],        images:[] },
  { slug:'lassi-sweet-500ml',   name_bn:'মিষ্টি লাচ্ছি ৫০০ মিলি',    name_en:'Sweet Lassi 500ml',                description_en:'Chilled sweet yogurt drink.',                       type:'dairy',      price:70,    sale_price:null, unit:'500ml',     stock:90,  is_active:true, tags:['lassi','drink','halal'],        images:[] },
  { slug:'lassi-salty-500ml',   name_bn:'নোনতা লাচ্ছি ৫০০ মিলি',     name_en:'Salty Lassi 500ml',                description_en:'Traditional salted yogurt drink.',                  type:'dairy',      price:65,    sale_price:null, unit:'500ml',     stock:70,  is_active:true, tags:['lassi','drink','halal'],        images:[] },
  { slug:'milk-powder-500g',    name_bn:'গুঁড়া দুধ ৫০০ গ্রাম',        name_en:'Milk Powder 500g',                 description_en:'Full-fat spray-dried milk powder.',                 type:'dairy',      price:380,   sale_price:null, unit:'500g',      stock:100, is_active:true, tags:['powder','milk'],               images:[] },
  { slug:'milk-powder-1kg',     name_bn:'গুঁড়া দুধ ১ কেজি',           name_en:'Milk Powder 1 kg',                 description_en:'Large pack, long shelf-life.',                      type:'dairy',      price:740,   sale_price:700,  unit:'1kg',       stock:60,  is_active:true, tags:['powder','milk','bulk'],         images:[] },
  { slug:'chhana-500g',         name_bn:'ছানা ৫০০ গ্রাম',              name_en:'Chhana 500g',                      description_en:'Fresh curd for sweets and rosogolla.',              type:'dairy',      price:160,   sale_price:null, unit:'500g',      stock:45,  is_active:true, tags:['chhana','sweets','halal'],      images:[] },
  { slug:'khoya-200g',          name_bn:'খোয়া ২০০ গ্রাম',              name_en:'Khoya 200g',                       description_en:'Reduced milk solids for Indian sweets.',            type:'dairy',      price:220,   sale_price:null, unit:'200g',      stock:35,  is_active:true, tags:['khoya','sweets','halal'],       images:[] },
  { slug:'sour-cream-200g',     name_bn:'সাওয়ার ক্রিম ২০০ গ্রাম',    name_en:'Sour Cream 200g',                  description_en:'For sauces and dips.',                              type:'dairy',      price:150,   sale_price:null, unit:'200g',      stock:30,  is_active:true, tags:['cream','halal'],               images:[] },
  { slug:'colostrum-200ml',     name_bn:'শালদুধ ২০০ মিলি',             name_en:'Colostrum 200ml',                  description_en:'First milk from cow after calving, nutrient-rich.', type:'dairy',     price:250,   sale_price:null, unit:'200ml',     stock:20,  is_active:true, tags:['colostrum','premium','health'], images:[] },
  { slug:'mozzarella-250g',     name_bn:'মোজারেলা চিজ ২৫০ গ্রাম',    name_en:'Mozzarella Cheese 250g',           description_en:'For pizza and pasta.',                              type:'dairy',      price:280,   sale_price:null, unit:'250g',      stock:40,  is_active:true, tags:['cheese','mozzarella','halal'],  images:[] },
  { slug:'condensed-milk-400g', name_bn:'কনডেন্সড মিল্ক ৪০০ গ্রাম',   name_en:'Condensed Milk 400g',              description_en:'For dessert preparation.',                          type:'dairy',      price:130,   sale_price:null, unit:'400g',      stock:80,  is_active:true, tags:['condensed','milk','halal'],     images:[] },
  { slug:'whey-protein-1kg',    name_bn:'হোয়ে প্রোটিন ১ কেজি',        name_en:'Whey Protein 1 kg',                description_en:'Made from fresh farm whey.',                       type:'dairy',      price:1200,  sale_price:1100, unit:'1kg',       stock:25,  is_active:true, tags:['whey','protein','supplement'],  images:[] },
  { slug:'kefir-500ml',         name_bn:'কেফির ৫০০ মিলি',              name_en:'Kefir 500ml',                      description_en:'Probiotic-rich fermented milk drink.',              type:'dairy',      price:160,   sale_price:null, unit:'500ml',     stock:30,  is_active:true, tags:['kefir','probiotic','health'],   images:[] },
  { slug:'skimmed-milk-1l',     name_bn:'স্কিমড দুধ ১ লিটার',          name_en:'Skimmed Milk 1 Litre',             description_en:'Fat-free low-calorie milk.',                        type:'dairy',      price:75,    sale_price:null, unit:'litre',     stock:90,  is_active:true, tags:['milk','diet','halal'],          images:[] },
  { slug:'butter-milk-500ml',   name_bn:'ঘোল ৫০০ মিলি',                name_en:'Buttermilk 500ml',                 description_en:'Traditional buttermilk after churning.',            type:'dairy',      price:40,    sale_price:null, unit:'500ml',     stock:120, is_active:true, tags:['buttermilk','drink','halal'],   images:[] },

  // Feed (20)
  { slug:'cattle-feed-50kg',        name_bn:'গরুর খাবার ৫০ কেজি',          name_en:'Cattle Feed 50 kg',              description_en:'Balanced nutritious cattle feed.',                   type:'feed', price:1200, sale_price:null, unit:'50kg bag',  stock:100, is_active:true, tags:['feed','cattle'],                       images:[] },
  { slug:'dairy-concentrate-25kg',  name_bn:'ডেইরি কনসেন্ট্রেট ২৫ কেজি',  name_en:'Dairy Cow Concentrate 25 kg',    description_en:'Special feed to boost milk production.',              type:'feed', price:950,  sale_price:null, unit:'25kg bag',  stock:80,  is_active:true, tags:['feed','concentrate','dairy'],           images:[] },
  { slug:'calf-starter-20kg',       name_bn:'বাছুরের খাবার ২০ কেজি',       name_en:'Calf Starter Feed 20 kg',        description_en:'Nutritious starter for newborn calves.',              type:'feed', price:700,  sale_price:null, unit:'20kg bag',  stock:60,  is_active:true, tags:['feed','calf','starter'],               images:[] },
  { slug:'wheat-bran-50kg',         name_bn:'গমের ভুসি ৫০ কেজি',           name_en:'Wheat Bran 50 kg',               description_en:'Fiber-rich affordable feed ingredient.',              type:'feed', price:650,  sale_price:null, unit:'50kg bag',  stock:150, is_active:true, tags:['feed','bran','wheat'],                 images:[] },
  { slug:'rice-straw-bale',         name_bn:'ধানের খড় (এক বেল)',           name_en:'Rice Straw Bale',                description_en:'Dried rice straw bale.',                              type:'feed', price:250,  sale_price:null, unit:'bale',      stock:200, is_active:true, tags:['straw','roughage','cattle'],           images:[] },
  { slug:'maize-silage-25kg',       name_bn:'ভুট্টা সাইলেজ ২৫ কেজি',      name_en:'Maize Silage 25 kg',             description_en:'Fermented maize, high energy feed.',                 type:'feed', price:480,  sale_price:null, unit:'25kg bag',  stock:70,  is_active:true, tags:['silage','maize','energy'],             images:[] },
  { slug:'soybean-meal-50kg',       name_bn:'সয়াবিন খৈল ৫০ কেজি',         name_en:'Soybean Meal 50 kg',             description_en:'High-protein soybean meal.',                          type:'feed', price:1800, sale_price:1750, unit:'50kg bag',  stock:90,  is_active:true, tags:['feed','protein','soybean'],            images:[] },
  { slug:'cotton-cake-50kg',        name_bn:'তুলার খৈল ৫০ কেজি',           name_en:'Cotton Seed Cake 50 kg',         description_en:'Protein and fat rich cottonseed cake.',              type:'feed', price:1400, sale_price:null, unit:'50kg bag',  stock:60,  is_active:true, tags:['feed','protein','cotton'],             images:[] },
  { slug:'molasses-20l',            name_bn:'গুড় ২০ লিটার',                name_en:'Molasses 20 Litre',              description_en:'Energy source and palatability enhancer.',            type:'feed', price:900,  sale_price:null, unit:'20L drum',  stock:50,  is_active:true, tags:['molasses','energy','palatability'],     images:[] },
  { slug:'urea-block-5kg',          name_bn:'ইউরিয়া ব্লক ৫ কেজি',          name_en:'Urea Block 5 kg',                description_en:'Slow-release nitrogen supplement block.',             type:'feed', price:350,  sale_price:null, unit:'5kg',       stock:80,  is_active:true, tags:['urea','block','nitrogen'],             images:[] },
  { slug:'bypass-fat-25kg',         name_bn:'বাইপাস ফ্যাট ২৫ কেজি',        name_en:'Bypass Fat 25 kg',               description_en:'High energy, boosts milk production.',               type:'feed', price:2200, sale_price:null, unit:'25kg bag',  stock:40,  is_active:true, tags:['fat','energy','dairy'],                images:[] },
  { slug:'tmr-feed-50kg',           name_bn:'টিএমআর ফিড ৫০ কেজি',          name_en:'TMR Feed Mix 50 kg',             description_en:'Total mixed ration for dairy cows.',                 type:'feed', price:1350, sale_price:null, unit:'50kg bag',  stock:55,  is_active:true, tags:['tmr','mixed','balanced'],              images:[] },
  { slug:'mineral-mix-10kg',        name_bn:'মিনারেল মিশ্রণ ১০ কেজি',      name_en:'Mineral Mixture 10 kg',          description_en:'Calcium, phosphorus and trace mineral mix.',          type:'feed', price:550,  sale_price:null, unit:'10kg bag',  stock:100, is_active:true, tags:['mineral','supplement','feed'],         images:[] },
  { slug:'salt-block-2kg',          name_bn:'লবণের ব্লক ২ কেজি',            name_en:'Salt Block 2 kg',                description_en:'Mineral salt lick block.',                            type:'feed', price:120,  sale_price:null, unit:'2kg',       stock:150, is_active:true, tags:['salt','mineral','lick'],               images:[] },
  { slug:'hay-bale',                name_bn:'শুকনো ঘাসের বেল',              name_en:'Hay Bale',                       description_en:'Dried and baled hay.',                                type:'feed', price:400,  sale_price:null, unit:'bale',      stock:80,  is_active:true, tags:['hay','roughage','cattle'],             images:[] },
  { slug:'fish-meal-25kg',          name_bn:'মাছের খাবার ২৫ কেজি',          name_en:'Fish Meal 25 kg',                description_en:'High protein supplement from fish.',                  type:'feed', price:1600, sale_price:null, unit:'25kg bag',  stock:35,  is_active:true, tags:['fishmeal','protein','supplement'],      images:[] },
  { slug:'palm-kernel-50kg',        name_bn:'পাম কার্নেল কেক ৫০ কেজি',     name_en:'Palm Kernel Cake 50 kg',         description_en:'Energy and protein rich feed ingredient.',            type:'feed', price:1100, sale_price:null, unit:'50kg bag',  stock:70,  is_active:true, tags:['palm','energy','protein'],             images:[] },
  { slug:'sunflower-meal-25kg',     name_bn:'সূর্যমুখীর খৈল ২৫ কেজি',     name_en:'Sunflower Meal 25 kg',           description_en:'Medium protein and fat meal.',                        type:'feed', price:880,  sale_price:null, unit:'25kg bag',  stock:45,  is_active:true, tags:['sunflower','meal','protein'],          images:[] },
  { slug:'green-grass-bundle',      name_bn:'কাঁচা ঘাস (বান্ডিল)',          name_en:'Green Grass Bundle',             description_en:'Freshly cut green fodder.',                           type:'feed', price:80,   sale_price:null, unit:'bundle',    stock:250, is_active:true, tags:['grass','fresh','fodder'],              images:[] },
  { slug:'sugarcane-bagasse-50kg',  name_bn:'আখের ছোবড়া ৫০ কেজি',         name_en:'Sugarcane Bagasse 50 kg',        description_en:'High-fiber low-cost roughage.',                       type:'feed', price:300,  sale_price:null, unit:'50kg bag',  stock:120, is_active:true, tags:['bagasse','roughage','fiber'],          images:[] },

  // Cattle (15)
  { slug:'holstein-calf-f',     name_bn:'হলস্টেইন ফ্রিজিয়ান বাছুর (স্ত্রী)', name_en:'Holstein Friesian Heifer Calf',     description_en:'Healthy 3-month-old female calf.',                  type:'cattle', price:45000,  sale_price:null,   unit:'head', stock:5, is_active:true, tags:['calf','holstein','heifer'],      images:[] },
  { slug:'holstein-cow',        name_bn:'হলস্টেইন ফ্রিজিয়ান গাভী',            name_en:'Holstein Friesian Milking Cow',     description_en:'Gives 20-30 litres of milk per day.',               type:'cattle', price:180000, sale_price:160000, unit:'head', stock:3, is_active:true, tags:['cow','holstein','high-yield'],   images:[] },
  { slug:'sahiwal-cow',         name_bn:'সাহীওয়াল গাভী',                       name_en:'Sahiwal Cow',                       description_en:'Improved indigenous breed cow.',                     type:'cattle', price:90000,  sale_price:null,   unit:'head', stock:4, is_active:true, tags:['cow','sahiwal','indigenous'],    images:[] },
  { slug:'crossbred-heifer',    name_bn:'ক্রসব্রেড হেইফার',                     name_en:'Crossbred Heifer',                  description_en:'Heifer yet to calve for the first time.',           type:'cattle', price:65000,  sale_price:null,   unit:'head', stock:6, is_active:true, tags:['heifer','crossbred'],            images:[] },
  { slug:'jersey-cow',          name_bn:'জার্সি গাভী',                           name_en:'Jersey Cow',                        description_en:'High butterfat milk producer.',                      type:'cattle', price:120000, sale_price:110000, unit:'head', stock:2, is_active:true, tags:['cow','jersey','premium'],        images:[] },
  { slug:'breeding-bull',       name_bn:'প্রজনন ষাঁড়',                          name_en:'Breeding Bull',                     description_en:'High genetic merit breeding bull.',                  type:'cattle', price:200000, sale_price:null,   unit:'head', stock:1, is_active:true, tags:['bull','breeding','premium'],     images:[] },
  { slug:'murrah-buffalo',      name_bn:'মুরা মহিষ',                             name_en:'Murrah Buffalo',                    description_en:'High milk-yielding buffalo breed.',                  type:'cattle', price:150000, sale_price:null,   unit:'head', stock:2, is_active:true, tags:['buffalo','murrah','dairy'],      images:[] },
  { slug:'local-breed-cow',     name_bn:'দেশী গাভী',                             name_en:'Local Breed Cow',                   description_en:'Disease-resistant, easy to manage.',                 type:'cattle', price:40000,  sale_price:null,   unit:'head', stock:8, is_active:true, tags:['cow','local','indigenous'],      images:[] },
  { slug:'pregnant-heifer',     name_bn:'গর্ভবতী হেইফার',                       name_en:'Pregnant Heifer',                   description_en:'Expected to calve soon, good productivity.',         type:'cattle', price:85000,  sale_price:null,   unit:'head', stock:3, is_active:true, tags:['heifer','pregnant'],             images:[] },
  { slug:'high-yield-cow',      name_bn:'উচ্চ উৎপাদনশীল গাভী',                  name_en:'High-Yield Dairy Cow',              description_en:'Gives 30+ litres of milk per day.',                 type:'cattle', price:220000, sale_price:200000, unit:'head', stock:2, is_active:true, tags:['cow','high-yield','premium'],    images:[] },
  { slug:'calf-male-3mo',       name_bn:'বাছুর (পুরুষ, ৩ মাস)',                 name_en:'Male Calf 3 Months',                description_en:'Healthy 3-month-old male calf.',                    type:'cattle', price:18000,  sale_price:null,   unit:'head', stock:7, is_active:true, tags:['calf','male'],                   images:[] },
  { slug:'nili-ravi-buffalo',   name_bn:'নীলি-রাভি মহিষ',                       name_en:'Nili-Ravi Buffalo',                 description_en:'Gives high-fat milk.',                               type:'cattle', price:130000, sale_price:null,   unit:'head', stock:2, is_active:true, tags:['buffalo','nili-ravi','dairy'],   images:[] },
  { slug:'young-heifer-6mo',    name_bn:'তরুণ হেইফার (৬ মাস)',                  name_en:'Young Heifer 6 Months',             description_en:'Healthy 6-month-old heifer.',                       type:'cattle', price:30000,  sale_price:null,   unit:'head', stock:5, is_active:true, tags:['heifer','young'],                images:[] },
  { slug:'beef-bull',           name_bn:'গরু মোটাতাজাকরণ (ষাঁড়)',               name_en:'Beef Bull (Fattening)',             description_en:'Fattened bull for Eid/Qurbani.',                    type:'cattle', price:95000,  sale_price:null,   unit:'head', stock:4, is_active:true, tags:['bull','beef','qurbani'],         images:[] },
  { slug:'crossbred-bull-calf', name_bn:'ক্রসব্রেড বুল কাফ',                    name_en:'Crossbred Bull Calf',               description_en:'Good breed cross male calf.',                       type:'cattle', price:22000,  sale_price:null,   unit:'head', stock:6, is_active:true, tags:['calf','crossbred','bull'],       images:[] },

  // Equipment (20)
  { slug:'milking-machine-single', name_bn:'একক দোহন যন্ত্র',                    name_en:'Single Cluster Milking Machine', description_en:'Electric single-cluster milking machine.',           type:'equipment', price:18000,  sale_price:16500, unit:'piece', stock:10, is_active:true, tags:['milking','machine','electric'],  images:[] },
  { slug:'milking-machine-double', name_bn:'দ্বৈত দোহন যন্ত্র',                  name_en:'Double Cluster Milking Machine', description_en:'Milking machine with two clusters.',                 type:'equipment', price:32000,  sale_price:null,  unit:'piece', stock:5,  is_active:true, tags:['milking','machine','double'],   images:[] },
  { slug:'milk-tank-100l',         name_bn:'দুধ ঠান্ডা করার ট্যাংক ১০০ লিটার', name_en:'Milk Chilling Tank 100 L',       description_en:'Keeps milk chilled rapidly.',                        type:'equipment', price:85000,  sale_price:null,  unit:'piece', stock:3,  is_active:true, tags:['tank','chilling','milk'],       images:[] },
  { slug:'milk-tank-500l',         name_bn:'দুধ ঠান্ডা করার ট্যাংক ৫০০ লিটার', name_en:'Milk Chilling Tank 500 L',       description_en:'Bulk tank for large farms.',                         type:'equipment', price:320000, sale_price:null,  unit:'piece', stock:1,  is_active:true, tags:['tank','chilling','bulk'],       images:[] },
  { slug:'milk-can-20l-ss',        name_bn:'দুধের কেন ২০ লিটার (স্টেইনলেস)',    name_en:'Milk Can 20 L Stainless Steel', description_en:'Rust-resistant durable milk can.',                   type:'equipment', price:2800,   sale_price:2600, unit:'piece', stock:30, is_active:true, tags:['milk-can','stainless','storage'],images:[] },
  { slug:'milk-can-10l-al',        name_bn:'দুধের কেন ১০ লিটার (অ্যালুমিনিয়াম)',name_en:'Milk Can 10 L Aluminium',       description_en:'Lightweight aluminium milk can.',                    type:'equipment', price:1200,   sale_price:null, unit:'piece', stock:50, is_active:true, tags:['milk-can','aluminium','storage'],images:[] },
  { slug:'lactometer',             name_bn:'ল্যাকটোমিটার',                        name_en:'Milk Testing Lactometer',        description_en:'Measures milk density/adulteration.',               type:'equipment', price:350,    sale_price:null, unit:'piece', stock:40, is_active:true, tags:['lactometer','testing','quality'],images:[] },
  { slug:'fat-tester-gerber',      name_bn:'ফ্যাট টেস্টার (গার্বার)',              name_en:'Fat Tester Gerber Method',       description_en:'Determines fat content in milk.',                    type:'equipment', price:4500,   sale_price:null, unit:'piece', stock:8,  is_active:true, tags:['fat-tester','gerber','quality'],images:[] },
  { slug:'pasteurizer-50l',        name_bn:'পাস্তুরাইজার ৫০ লিটার',              name_en:'Milk Pasteurizer 50 L',          description_en:'Batch pasteurizer for milk.',                        type:'equipment', price:55000,  sale_price:null, unit:'piece', stock:4,  is_active:true, tags:['pasteurizer','hygiene','milk'],  images:[] },
  { slug:'cream-separator',        name_bn:'ক্রিম বিভাজক',                        name_en:'Cream Separator',                description_en:'Separates cream from milk.',                         type:'equipment', price:12000,  sale_price:11000,unit:'piece', stock:7,  is_active:true, tags:['cream','separator','dairy'],    images:[] },
  { slug:'butter-churn',           name_bn:'মাখন তৈরির যন্ত্র',                  name_en:'Butter Churn 10 L',              description_en:'10-litre capacity butter churn.',                    type:'equipment', price:3500,   sale_price:null, unit:'piece', stock:12, is_active:true, tags:['butter','churn','dairy'],       images:[] },
  { slug:'yogurt-incubator',       name_bn:'দই তৈরির ইনকিউবেটর',                 name_en:'Yogurt Incubator 20 L',          description_en:'Controlled temperature yogurt incubator.',           type:'equipment', price:6500,   sale_price:6000, unit:'piece', stock:6,  is_active:true, tags:['yogurt','incubator','dairy'],   images:[] },
  { slug:'feeding-trough',         name_bn:'খাবার পাত্র (গ্যালভানাইজড)',          name_en:'Galvanized Feeding Trough',      description_en:'Durable galvanized feed trough.',                    type:'equipment', price:2200,   sale_price:null, unit:'piece', stock:20, is_active:true, tags:['trough','feeding','cattle'],    images:[] },
  { slug:'water-trough-100l',      name_bn:'পানির পাত্র ১০০ লিটার',              name_en:'Water Trough 100 L',             description_en:'Large water trough for cattle.',                     type:'equipment', price:3800,   sale_price:null, unit:'piece', stock:15, is_active:true, tags:['trough','water','cattle'],      images:[] },
  { slug:'ear-tag-set-100',        name_bn:'কানের ট্যাগ সেট (১০০ পিস)',          name_en:'Ear Tag Set 100 pcs',            description_en:'Coloured plastic ear tags with applicator.',         type:'equipment', price:800,    sale_price:null, unit:'set',   stock:25, is_active:true, tags:['ear-tag','id','cattle'],        images:[] },
  { slug:'cattle-scale',           name_bn:'গরু মাপার দাঁড়িপাল্লা',              name_en:'Cattle Weighing Scale 2T',       description_en:'Digital scale up to 2 tonnes.',                      type:'equipment', price:28000,  sale_price:null, unit:'piece', stock:3,  is_active:true, tags:['scale','weighing','cattle'],    images:[] },
  { slug:'drenching-gun',          name_bn:'ড্রেঞ্চিং গান',                       name_en:'Drenching Gun 300 ml',           description_en:'Gun for administering liquid medicine.',             type:'equipment', price:650,    sale_price:null, unit:'piece', stock:30, is_active:true, tags:['drenching','vet','tool'],       images:[] },
  { slug:'teat-dip-cup',           name_bn:'টিট ডিপ কাপ',                         name_en:'Teat Dip Cup',                   description_en:'Post-milking teat disinfection cup.',                type:'equipment', price:280,    sale_price:null, unit:'piece', stock:45, is_active:true, tags:['teat','hygiene','milking'],     images:[] },
  { slug:'milking-bucket-20l',     name_bn:'দুধ সংগ্রহের বালতি ২০ লিটার',       name_en:'Milking Bucket 20 L SS',         description_en:'Stainless steel milking pail.',                      type:'equipment', price:1800,   sale_price:null, unit:'piece', stock:25, is_active:true, tags:['bucket','milking','stainless'], images:[] },
  { slug:'barn-cleaner-set',       name_bn:'গোয়ালঘর পরিষ্কারের সরঞ্জাম সেট',   name_en:'Barn Cleaning Equipment Set',    description_en:'Set with broom, scraper and hosepipe.',              type:'equipment', price:1500,   sale_price:1350, unit:'set',   stock:20, is_active:true, tags:['barn','cleaning','hygiene'],    images:[] },

  // Vet Supply (15)
  { slug:'mineral-block',         name_bn:'মিনারেল ব্লক',                    name_en:'Mineral Block',                     description_en:'Provides essential minerals.',                       type:'vet_supply', price:350,  sale_price:null, unit:'piece',     stock:40, is_active:true, tags:['vet','mineral','supplement'],      images:[] },
  { slug:'calcium-liquid-1l',     name_bn:'ক্যালসিয়াম সাপ্লিমেন্ট ১ লিটার',name_en:'Calcium Supplement 1 L',           description_en:'Effective against milk fever.',                      type:'vet_supply', price:420,  sale_price:null, unit:'1L bottle', stock:50, is_active:true, tags:['calcium','supplement','vet'],      images:[] },
  { slug:'vit-ade-injection',     name_bn:'ভিটামিন এডিই ইনজেকশন',           name_en:'Vitamin ADE Injection 100ml',       description_en:'Replenishes Vitamin A, D & E deficiency.',          type:'vet_supply', price:550,  sale_price:null, unit:'100ml vial', stock:30, is_active:true, tags:['vitamin','injection','vet'],       images:[] },
  { slug:'fmd-vaccine',           name_bn:'ক্ষুরারোগ টিকা',                  name_en:'FMD Vaccine 50ml',                  description_en:'50-dose foot-and-mouth disease vaccine.',            type:'vet_supply', price:800,  sale_price:null, unit:'50ml vial', stock:20, is_active:true, tags:['vaccine','fmd','prevention'],      images:[] },
  { slug:'brucellosis-vaccine',   name_bn:'ব্রুসেলোসিস টিকা',               name_en:'Brucellosis Vaccine',               description_en:'Prevents brucellosis/abortion disease.',             type:'vet_supply', price:650,  sale_price:null, unit:'vial',      stock:25, is_active:true, tags:['vaccine','brucellosis','prevention'],images:[] },
  { slug:'oxytet-injection',      name_bn:'অক্সিটেট্রাসাইক্লিন ইনজেকশন',   name_en:'Oxytetracycline Injection 100ml',   description_en:'Broad-spectrum antibiotic injection.',               type:'vet_supply', price:480,  sale_price:null, unit:'100ml vial', stock:40, is_active:true, tags:['antibiotic','injection','vet'],    images:[] },
  { slug:'dewormer-bolus',        name_bn:'কৃমিনাশক বোলাস',                  name_en:'Anthelmintic Bolus (10 pcs)',        description_en:'10-pack deworming bolus.',                           type:'vet_supply', price:320,  sale_price:null, unit:'10-pack',   stock:60, is_active:true, tags:['dewormer','parasite','vet'],       images:[] },
  { slug:'teat-dip-5l',           name_bn:'টিট ডিপ অ্যান্টিসেপটিক ৫ লিটার',name_en:'Teat Dip Antiseptic 5 L',          description_en:'Post-milking mastitis prevention solution.',         type:'vet_supply', price:750,  sale_price:null, unit:'5L can',    stock:30, is_active:true, tags:['teat-dip','antiseptic','mastitis'],images:[] },
  { slug:'udder-cream-500g',      name_bn:'আঁটের ক্রিম ৫০০ গ্রাম',          name_en:'Udder Cream 500g',                  description_en:'Prevents udder dryness and cracking.',               type:'vet_supply', price:380,  sale_price:null, unit:'500g',      stock:35, is_active:true, tags:['udder','cream','mastitis'],        images:[] },
  { slug:'mastitis-test-kit',     name_bn:'ম্যাস্টাইটিস টেস্ট কিট',         name_en:'Mastitis Test Kit (CMT)',           description_en:'Rapid California Mastitis Test kit.',               type:'vet_supply', price:550,  sale_price:null, unit:'kit',       stock:20, is_active:true, tags:['mastitis','test','diagnostic'],    images:[] },
  { slug:'pregnancy-test-kit',    name_bn:'গর্ভ পরীক্ষার কিট',               name_en:'Bovine Pregnancy Test Kit',         description_en:'Rapid bovine pregnancy detection kit.',              type:'vet_supply', price:1200, sale_price:null, unit:'kit',       stock:15, is_active:true, tags:['pregnancy','test','diagnostic'],   images:[] },
  { slug:'insecticide-spray-1l',  name_bn:'কীটনাশক স্প্রে ১ লিটার',         name_en:'Insecticide Spray 1 L',             description_en:'Controls flies and external parasites.',             type:'vet_supply', price:450,  sale_price:null, unit:'1L bottle', stock:40, is_active:true, tags:['insecticide','spray','parasite'],   images:[] },
  { slug:'wound-spray-200ml',     name_bn:'ক্ষত স্প্রে ২০০ মিলি',            name_en:'Wound Spray 200ml',                 description_en:'Keeps wounds disinfected and fly-free.',             type:'vet_supply', price:280,  sale_price:null, unit:'200ml',     stock:55, is_active:true, tags:['wound','spray','antiseptic'],      images:[] },
  { slug:'ors-sachets',           name_bn:'ওআরএস স্যাশেট (১০টি)',            name_en:'Oral Rehydration Salts (10 sachets)',description_en:'Prevents dehydration during diarrhea.',             type:'vet_supply', price:150,  sale_price:null, unit:'10-pack',   stock:80, is_active:true, tags:['ors','hydration','vet'],           images:[] },
  { slug:'liver-tonic-1l',        name_bn:'লিভার টনিক ১ লিটার',              name_en:'Liver Tonic 1 L',                   description_en:'Hepatoprotective and digestive tonic.',              type:'vet_supply', price:480,  sale_price:null, unit:'1L bottle', stock:45, is_active:true, tags:['liver','tonic','supplement'],      images:[] },
]

// ── Orders ────────────────────────────────────────────────────────────────────

const orders = [
  { status:'delivered',  total:240,   payment_method:'bkash',         payment_status:'paid',    notes:null,             address:{name:'রহিম উদ্দিন',         phone:'01711234567',address:'১২ মিরপুর রোড',      city:'ঢাকা',       district:'ঢাকা',          zip:'1216'}, created_at: daysAgo(30) },
  { status:'delivered',  total:850,   payment_method:'nagad',         payment_status:'paid',    notes:'দ্রুত ডেলিভারি দিবেন', address:{name:'করিম হোসেন',       phone:'01811234568',address:'৪৫ শান্তিনগর',        city:'ঢাকা',       district:'ঢাকা',          zip:'1217'}, created_at: daysAgo(28) },
  { status:'delivered',  total:1650,  payment_method:'cod',           payment_status:'paid',    notes:null,             address:{name:'ফারহানা বেগম',        phone:'01911234569',address:'৭ মুক্তিযোদ্ধা রোড', city:'চট্টগ্রাম',  district:'চট্টগ্রাম',     zip:'4000'}, created_at: daysAgo(25) },
  { status:'delivered',  total:360,   payment_method:'bkash',         payment_status:'paid',    notes:null,             address:{name:'জহিরুল ইসলাম',        phone:'01611234570',address:'২২ কেরানীগঞ্জ',       city:'ঢাকা',       district:'ঢাকা',          zip:'1310'}, created_at: daysAgo(22) },
  { status:'delivered',  total:2400,  payment_method:'bank_transfer', payment_status:'paid',    notes:'বাল্ক অর্ডার',   address:{name:'আমিনুল হক',          phone:'01511234571',address:'৯ সাভার রোড',         city:'সাভার',      district:'ঢাকা',          zip:'1340'}, created_at: daysAgo(20) },
  { status:'dispatched', total:500,   payment_method:'bkash',         payment_status:'paid',    notes:null,             address:{name:'নাসরিন আক্তার',       phone:'01711234572',address:'৩৪ উত্তরা',           city:'ঢাকা',       district:'ঢাকা',          zip:'1230'}, created_at: daysAgo(3)  },
  { status:'dispatched', total:1700,  payment_method:'nagad',         payment_status:'paid',    notes:null,             address:{name:'মো. শাহজাহান',        phone:'01811234573',address:'১৫ গাজীপুর সদর',      city:'গাজীপুর',    district:'গাজীপুর',       zip:'1700'}, created_at: daysAgo(2)  },
  { status:'processing', total:4200,  payment_method:'bkash',         payment_status:'paid',    notes:null,             address:{name:'রুবিনা খানম',         phone:'01911234574',address:'৫ নারায়ণগঞ্জ রোড',   city:'নারায়ণগঞ্জ', district:'নারায়ণগঞ্জ',  zip:'1400'}, created_at: daysAgo(1)  },
  { status:'processing', total:750,   payment_method:'cod',           payment_status:'pending', notes:null,             address:{name:'তানভীর আহমেদ',        phone:'01611234575',address:'২৮ কুমিল্লা বাইপাস',  city:'কুমিল্লা',   district:'কুমিল্লা',      zip:'3500'}, created_at: hoursAgo(12)},
  { status:'confirmed',  total:320,   payment_method:'nagad',         payment_status:'paid',    notes:null,             address:{name:'সালমা বেগম',          phone:'01711234576',address:'৬ রাজশাহী রোড',       city:'রাজশাহী',    district:'রাজশাহী',       zip:'6000'}, created_at: hoursAgo(6) },
  { status:'confirmed',  total:1700,  payment_method:'bkash',         payment_status:'paid',    notes:null,             address:{name:'আবুল কাসেম',          phone:'01811234577',address:'৩ সিলেট সদর',          city:'সিলেট',      district:'সিলেট',         zip:'3100'}, created_at: hoursAgo(5) },
  { status:'pending',    total:140,   payment_method:'cod',           payment_status:'pending', notes:null,             address:{name:'রোকেয়া খাতুন',       phone:'01911234578',address:'৭৭ ময়মনসিংহ রোড',    city:'ময়মনসিংহ',  district:'ময়মনসিংহ',     zip:'2200'}, created_at: hoursAgo(2) },
  { status:'pending',    total:770,   payment_method:'bkash',         payment_status:'pending', notes:null,             address:{name:'মাহবুব আলম',          phone:'01611234579',address:'১৩ বগুড়া সদর',        city:'বগুড়া',      district:'বগুড়া',        zip:'5800'}, created_at: hoursAgo(1) },
  { status:'pending',    total:3200,  payment_method:'nagad',         payment_status:'pending', notes:'জরুরি ডেলিভারি', address:{name:'ফারুক হোসেন',         phone:'01511234580',address:'৪৫ রংপুর রোড',        city:'রংপুর',      district:'রংপুর',         zip:'5400'}, created_at: minsAgo(45) },
  { status:'cancelled',  total:240,   payment_method:'cod',           payment_status:'refunded',notes:'ভুল অর্ডার',     address:{name:'জান্নাতুল ফেরদৌস',   phone:'01711234581',address:'২ খুলনা সদর',          city:'খুলনা',      district:'খুলনা',         zip:'9100'}, created_at: daysAgo(15) },
  { status:'delivered',  total:2160,  payment_method:'bkash',         payment_status:'paid',    notes:null,             address:{name:'মোস্তাফিজুর রহমান',  phone:'01811234582',address:'৩৩ বরিশাল রোড',       city:'বরিশাল',     district:'বরিশাল',        zip:'8200'}, created_at: daysAgo(18) },
  { status:'delivered',  total:700,   payment_method:'card',          payment_status:'paid',    notes:null,             address:{name:'তামান্না আক্তার',     phone:'01911234583',address:'৮ যশোর রোড',           city:'যশোর',       district:'যশোর',          zip:'7400'}, created_at: daysAgo(10) },
  { status:'delivered',  total:4800,  payment_method:'bank_transfer', payment_status:'paid',    notes:'খামারের বাল্ক অর্ডার', address:{name:'আনিসুর রহমান',  phone:'01611234584',address:'৫৬ পাবনা সদর',         city:'পাবনা',      district:'পাবনা',         zip:'6600'}, created_at: daysAgo(8)  },
  { status:'processing', total:960,   payment_method:'bkash',         payment_status:'paid',    notes:null,             address:{name:'শামীমা নাসরিন',       phone:'01511234585',address:'১৪ দিনাজপুর রোড',     city:'দিনাজপুর',   district:'দিনাজপুর',      zip:'5200'}, created_at: daysAgo(1)  },
  { status:'confirmed',  total:1480,  payment_method:'nagad',         payment_status:'paid',    notes:null,             address:{name:'খোরশেদ আলম',          phone:'01711234586',address:'২১ ফেনী সদর',          city:'ফেনী',       district:'ফেনী',          zip:'3900'}, created_at: hoursAgo(4) },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n)  { return new Date(Date.now() - n * 86400000).toISOString() }
function hoursAgo(n) { return new Date(Date.now() - n * 3600000).toISOString() }
function minsAgo(n)  { return new Date(Date.now() - n * 60000).toISOString() }

function ok(label, data, error) {
  if (error) { console.error(`✗ ${label}:`, error.message); process.exit(1) }
  console.log(`✓ ${label}`)
  return data
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log('Seeding', env.NEXT_PUBLIC_SUPABASE_URL, '\n')

// 1. Upsert products
const { data: upserted, error: prodErr } = await supabase
  .from('products')
  .upsert(products, { onConflict: 'slug' })
  .select('id, slug')

ok(`upsert ${products.length} products`, upserted, prodErr)

// Build slug → id map
const bySlug = Object.fromEntries(upserted.map(p => [p.slug, p.id]))

// 2. Insert orders (skip if any already exist to keep seed idempotent)
const { count: existingOrders } = await supabase
  .from('orders')
  .select('id', { count: 'exact', head: true })

if (existingOrders > 0) {
  console.log(`⚠ orders table already has ${existingOrders} rows — skipping order seed`)
} else {
  const orderRows = orders.map(o => ({
    user_id:        null,
    status:         o.status,
    total:          o.total,
    payment_method: o.payment_method,
    payment_status: o.payment_status,
    address:        o.address,
    notes:          o.notes,
    created_at:     o.created_at,
  }))

  const { data: insertedOrders, error: ordErr } = await supabase
    .from('orders')
    .insert(orderRows)
    .select('id')

  ok(`insert ${orders.length} orders`, insertedOrders, ordErr)

  // 3. Build order items — one row per order keyed by index
  const slugMap = [
    ['fresh-milk-1l',         3,  80,   240],   // order 0
    ['pure-ghee-500g',        1,  850,  850],   // order 1
    ['pure-ghee-1kg',         1,  1650, 1650],  // order 2
    ['mishti-doi-500g',       3,  120,  360],   // order 3
    ['cattle-feed-50kg',      2,  1200, 2400],  // order 4
    // order 5 — two items
    null,
    // order 6 — two items
    null,
    // order 7 — two items
    null,
    ['teat-dip-5l',           1,  750,  750],   // order 8
    ['dewormer-bolus',        1,  320,  320],   // order 9
    // order 10 — two items
    null,
    ['lassi-sweet-500ml',     2,  70,   140],   // order 11
    ['mineral-block',         1,  350,  350],   // order 12 (partial, +calcium below)
    ['dairy-concentrate-25kg',3,  950,  2850],  // order 13
    ['fresh-milk-1l',         3,  80,   240],   // order 14 (cancelled)
    ['pure-ghee-500g',        2,  850,  1700],  // order 15
    ['mineral-block',         2,  350,  700],   // order 16
    ['cattle-feed-50kg',      4,  1200, 4800],  // order 17
    ['dewormer-bolus',        3,  320,  960],   // order 18
    ['milk-powder-1kg',       2,  740,  1480],  // order 19
  ]

  const itemRows = []

  slugMap.forEach((row, i) => {
    const orderId = insertedOrders[i].id
    if (row) {
      const [slug, qty, unit_price, total] = row
      itemRows.push({ order_id: orderId, product_id: bySlug[slug], quantity: qty, unit_price, total })
    }
  })

  // Multi-item orders
  const multi = [
    // order 5: butter 200g + paneer 250g
    { idx:5,  items:[['butter-200g',1,320,320],['paneer-250g',1,180,180]] },
    // order 6: dairy concentrate + 2x mineral block
    { idx:6,  items:[['dairy-concentrate-25kg',1,950,950],['mineral-block',2,350,700]] },
    // order 7: 3x cattle feed + dairy concentrate
    { idx:7,  items:[['cattle-feed-50kg',3,1200,3600],['dairy-concentrate-25kg',1,950,950]] },
    // order 10: 2x ghee 500g + 2x fresh cream
    { idx:10, items:[['pure-ghee-500g',2,850,1700],['fresh-cream-200ml',2,140,280]] },
    // order 12: mineral block + calcium
    { idx:12, items:[['mineral-block',1,350,350],['calcium-liquid-1l',1,420,420]] },
  ]

  for (const { idx, items } of multi) {
    for (const [slug, qty, unit_price, total] of items) {
      itemRows.push({ order_id: insertedOrders[idx].id, product_id: bySlug[slug], quantity: qty, unit_price, total })
    }
  }

  const { error: itemErr } = await supabase.from('order_items').insert(itemRows)
  ok(`insert ${itemRows.length} order items`, true, itemErr)
}

console.log('\nDone.')
