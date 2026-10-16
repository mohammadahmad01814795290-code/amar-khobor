# আমার খবর — সংস্করণ ২ (বাংলা নিউজ/ব্লগ)

এতে আছে responsive homepage, category filter, search, Firebase-ভিত্তিক article database, admin login/editor, image upload, reader comments (moderation সহ), newsletter email collection, basic SEO metadata, robots.txt, sitemap.xml এবং privacy page।

## গুরুত্বপূর্ণ: ZIP খুললেই সব সার্ভার ফিচার চালু হবে না
এটি frontend + Firebase backend starter। নিরাপদে চালাতে Firebase project তৈরি, config বসানো এবং Security Rules-এ admin UID বসানো বাধ্যতামূলক। Firebase ছাড়া হোমপেজে শুধু নমুনা খবর দেখা যাবে; লগইন, আপলোড, মন্তব্য ও ইমেইল সংগ্রহ কাজ করবে না।

## বিনামূল্যে শুরু করার ধাপ

### 1) ফাইল খুলুন
ZIP Extract করুন। `index.html`-এ ডাবল-ক্লিক করলে কিছু ব্রাউজার ES modules ব্লক করতে পারে। সবচেয়ে সহজ স্থানীয় পরীক্ষা:
- VS Code ইনস্টল করে Live Server extension ব্যবহার করুন, অথবা
- সরাসরি Firebase Hosting/Netlify-এ ডেপ্লয় করে পরীক্ষা করুন।

### 2) Firebase project তৈরি
1. https://console.firebase.google.com/ খুলে Google account দিয়ে লগইন করুন।
2. Add project → নাম দিন `amar-khobor` (নামটি অন্য কেউ ব্যবহার করলে অন্য নাম দিন)।
3. Project overview → Web app (</>) যোগ করুন।
4. Firebase যে config দেখাবে সেটি `firebase-config.js` ফাইলে বসান।
5. Authentication → Sign-in method → Email/Password enable করুন।
6. Authentication → Users → Add user দিয়ে নিজের admin ইমেইল ও শক্ত পাসওয়ার্ড তৈরি করুন।
7. সেই user-এর UID কপি করুন।

### 3) Firestore database
1. Build → Firestore Database → Create database।
2. `firestore.rules`-এর `REPLACE_WITH_ADMIN_UID`-এর জায়গায় নিজের admin UID বসান।
3. Firebase Console → Firestore → Rules-এ ফাইলের নিয়মগুলো পেস্ট করে Publish করুন।
4. **Security rules ছাড়া public ডেটাবেস চালু করবেন না।** Rules-এ placeholder রেখে দিলে admin feature কাজ করবে না।

### 4) ছবি আপলোডের জন্য Storage
1. Firebase Console → Build → Storage → Get started।
2. `storage.rules`-এ একই admin UID বসান।
3. Storage → Rules-এ নিয়মগুলো Publish করুন।
4. Firebase project/plan অনুযায়ী Storage ব্যবহারের শর্ত বদলাতে পারে; Console-এ বর্তমান billing requirement দেখে নিন। ছবি URL দিয়ে খবর প্রকাশ করতে চাইলে আপলোড বাধ্যতামূলক নয়।

### 5) অ্যাডমিন প্যানেল ব্যবহার
1. `admin.html` খুলুন।
2. Firebase Authentication-এ তৈরি admin ইমেইল/পাসওয়ার্ড দিয়ে লগইন করুন।
3. শিরোনাম, বিভাগ, সংক্ষিপ্ত বিবরণ ও পুরো খবর লিখুন।
4. ছবি আপলোড করুন বা সরাসরি HTTPS image URL দিন।
5. প্রকাশ করুন। খবর homepage-এ দেখাবে।
6. Comments বিভাগে পাঠকের মন্তব্য অনুমোদন করুন।

### 6) বিনামূল্যে হোস্টিং
Firebase Hosting ব্যবহার করা যায়:
1. https://firebase.google.com/docs/hosting থেকে Firebase CLI ইনস্টল নির্দেশনা দেখুন।
2. Node.js ইনস্টল করে টার্মিনালে `npm install -g firebase-tools`
3. `firebase login`
4. এই ফোল্ডারে `firebase init hosting` চালান; বিদ্যমান project নির্বাচন করুন, public directory হিসেবে বর্তমান ফোল্ডার ব্যবহার করতে চাইলে সেটি নির্বাচন করুন।
5. `firebase.json`-এ hosting public হিসেবে `.` সেট করুন এবং `ignore`-এ `firebase.json`, `.*`, `node_modules` রাখুন।
6. `firebase deploy` চালান।
নতুনদের জন্য সহজ বিকল্প: GitHub-এ ফাইল আপলোড করে Netlify/Vercel-এর static hosting-এ deploy করা। Firebase config public frontend-এ থাকবেই; নিরাপত্তা আসে Authentication ও Security Rules থেকে, config লুকিয়ে রাখার মাধ্যমে নয়।

### 7) Google Search-এ খুঁজে পাওয়া (SEO)
1. `index.html`, `robots.txt`, `sitemap.xml`-এর `https://YOUR-DOMAIN.example/` আপনার live domain দিয়ে বদলান।
2. Google Search Console: https://search.google.com/search-console/ এ property যোগ করে ownership verify করুন।
3. Sitemaps-এ `sitemap.xml` submit করুন।
4. প্রতিটি খবরের নিজস্ব URL/পৃষ্ঠা, unique title/meta description, author, publish date, canonical URL এবং NewsArticle structured data যোগ করা ভালো। এই starter-এর article-গুলো homepage-এ dialog হিসেবে দেখায়; এটি SEO-র জন্য আদর্শ নয়। Google-এ প্রতিটি খবর আলাদাভাবে index করাতে পরবর্তী ধাপে per-article URL বা CMS/SSR ব্যবস্থা দরকার।
5. Google-এ দেখা যাওয়ার নিশ্চয়তা নেই; crawl/index হতে সময় লাগতে পারে।

### 8) নিউজলেটার ইমেইল
ফর্ম সাবস্ক্রাইবারদের ইমেইল Firestore-এ রাখে। এই starter নিজে থেকে newsletter email পাঠায় না। ইমেইল পাঠাতে সম্মতি, unsubscribe ব্যবস্থা ও email provider (যেমন Buttondown/Mailchimp-এর free tier availability যাচাই করে) বা Cloud Functions + email service যোগ করতে হবে। subscriber list গোপন রাখুন; rules-এ শুধু admin read করতে পারে।

## নিরাপত্তা/প্রকাশনার নোট
- Admin UID-কে `REPLACE_WITH_ADMIN_UID`-এর জায়গায় বসানো বাধ্যতামূলক।
- `published` article public read করা যায়; admin-ই create/update/delete করতে পারে।
- Public comment এবং newsletter forms spam-এর ঝুঁকিতে থাকে। বাস্তবে CAPTCHA/App Check, rate limit, email verification, retention policy এবং privacy notice যোগ করুন।
- Comments admin দ্বারা অনুমোদিত না হওয়া পর্যন্ত public-এ দেখানো হয় না।
- Firebase Spark/free tier-এ কিছু সুবিধা/কোটা/বিলিং শর্ত পরিবর্তিত হতে পারে; setup-এর আগে Firebase Console-এর বর্তমান পরিকল্পনা দেখুন।
- ডেমো নিবন্ধগুলো নমুনা; বাস্তব সংবাদ হিসেবে প্রকাশ করবেন না।
