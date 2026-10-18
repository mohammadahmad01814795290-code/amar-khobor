import { firebaseConfig, firebaseReady } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy, where, addDoc, serverTimestamp, doc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const $ = id => document.getElementById(id);
const date = new Date();
$('todayDate').textContent = new Intl.DateTimeFormat('bn-BD',{dateStyle:'full'}).format(date);
$('year').textContent = new Intl.DateTimeFormat('bn-BD',{year:'numeric'}).format(date);
$('menuBtn').addEventListener('click',()=> $('nav').classList.toggle('open'));
const fallback = [
 {id:'demo1',title:'বাংলাদেশের খবর জানতে নির্ভরযোগ্য তথ্য কেন জরুরি',category:'জাতীয়',summary:'খবর প্রকাশের আগে তথ্য যাচাই করা এবং নির্ভরযোগ্য সূত্র ব্যবহার করার গুরুত্ব।',body:'এটি একটি নমুনা লেখা। আপনার ওয়েবসাইটে প্রকৃত খবর প্রকাশের আগে তথ্য ও সূত্র যাচাই করুন।',image:'https://images.unsplash.com/photo-1591025207163-942350e47db2?auto=format&fit=crop&w=1200&q=80',createdAt:null},
 {id:'demo2',title:'নতুনদের জন্য প্রযুক্তি শেখার সহজ পথ',category:'প্রযুক্তি',summary:'নিয়মিত অনুশীলন ও ছোট প্রকল্প দিয়ে প্রযুক্তি শেখা শুরু করুন।',body:'এটি একটি ডেমো নিবন্ধ। নিজের লেখা দিয়ে এটি প্রতিস্থাপন করুন।',image:'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',createdAt:null},
 {id:'demo3',title:'শিক্ষার্থীদের জন্য পড়াশোনার কার্যকর অভ্যাস',category:'শিক্ষা',summary:'পরিকল্পনা, বিরতি এবং নিয়মিত পুনরাবৃত্তি পড়াশোনায় সাহায্য করে।',body:'এটি একটি নমুনা লেখা।',image:'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80',createdAt:null},
 {id:'demo4',title:'বিশ্বের খবর পড়ার সময় সূত্র যাচাই করুন',category:'আন্তর্জাতিক',summary:'একাধিক বিশ্বাসযোগ্য সূত্র মিলিয়ে তথ্যের নির্ভুলতা যাচাই করুন।',body:'এটি একটি নমুনা লেখা।',image:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',createdAt:null},
 {id:'demo5',title:'খেলাধুলা: দলগত কাজ ও অনুশীলনের গুরুত্ব',category:'খেলাধুলা',summary:'খেলাধুলা থেকে শৃঙ্খলা ও দলগত কাজ শেখা যায়।',body:'এটি একটি নমুনা লেখা।',image:'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=900&q=80',createdAt:null}
];
let db = null, articles = [...fallback], activeFilter = 'সব', searchTerm = '';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeImage = value => { try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
function toast(message){$('toast').textContent=message;$('toast').style.display='block';setTimeout(()=>{$('toast').style.display='none'},3800)}
function formatDate(value){if(!value)return 'নমুনা';const d=value.toDate?value.toDate():new Date(value);return new Intl.DateTimeFormat('bn-BD',{day:'numeric',month:'short',year:'numeric'}).format(d)}
function card(a){return `<article class="article-card"><img loading="lazy" src="${escapeHTML(safeImage(a.image)||'')}" alt="${escapeHTML(a.title)}" onerror="this.style.display='none'"><div class="article-body"><span class="tag">${escapeHTML(a.category||'অন্যান্য')}</span><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.summary||'')}</p><div class="meta">${formatDate(a.createdAt)} · ${Number(a.views||0).toLocaleString('bn-BD')} বার দেখা</div><button class="readmore" data-open="${escapeHTML(a.id)}">বিস্তারিত পড়ুন →</button></div></article>`}
function render(){
 let visible=articles.filter(a=>(activeFilter==='সব'||a.category===activeFilter)&&`${a.title} ${a.summary} ${a.body} ${a.category}`.toLocaleLowerCase('bn').includes(searchTerm.toLocaleLowerCase('bn')));
 $('resultCount').textContent=`${visible.length.toLocaleString('bn-BD')}টি খবর`;
 $('articleList').innerHTML=visible.map(card).join('');
 $('noResults').hidden=visible.length!==0;
 const lead=visible[0];
 $('featured').innerHTML=lead?`<article class="hero-card"><img src="${escapeHTML(safeImage(lead.image)||'')}" alt="" onerror="this.style.display='none'"><div class="hero-copy"><span class="tag">${escapeHTML(lead.category||'বিশেষ')}</span><h2>${escapeHTML(lead.title)}</h2><p>${escapeHTML(lead.summary||'')}</p><button class="readmore" style="color:#fff" data-open="${escapeHTML(lead.id)}">পুরো খবর পড়ুন →</button></div></article>`:'';
}
async function loadArticles(){
 if(!firebaseReady){render();return}
 try{
  
const snap = await getDocs(query(
  collection(db, 'articles'),
  where('published', '==', true),
  orderBy('createdAt', 'desc')
));

  const live=snap.docs.map(d=>({id:d.id,...d.data()}));
  articles=live.length?live:fallback;render();
 }catch(err){console.error(err);articles=[...fallback];render();toast('Firebase ডেটা পড়া যায়নি। সেটআপ ও Firestore Rules পরীক্ষা করুন।')}
}
$('categoryFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()});
$('searchForm').addEventListener('submit',e=>{e.preventDefault();searchTerm=$('searchInput').value.trim();render()});
$('searchInput').addEventListener('input',()=>{searchTerm=$('searchInput').value.trim();render()});
$('articleList').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openArticle(b.dataset.open)});
$('featured').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openArticle(b.dataset.open)});
async function openArticle(id){
 const a=articles.find(x=>x.id===id);if(!a)return;
 const detail=$('articleDetail');
 detail.innerHTML=`<span class="tag">${escapeHTML(a.category||'অন্যান্য')}</span><h1 class="detail-title">${escapeHTML(a.title)}</h1><p class="meta">${formatDate(a.createdAt)}</p>${safeImage(a.image)?`<img class="detail-img" src="${escapeHTML(safeImage(a.image))}" alt="${escapeHTML(a.title)}">`:''}<p>${escapeHTML(a.summary||'')}</p><div class="detail-text">${escapeHTML(a.body||'')}</div><section class="comment-section"><h2>পাঠকের মন্তব্য</h2><div id="comments"><p class="status">মন্তব্য লোড হচ্ছে…</p></div><form id="commentForm" class="comment-form"><input name="name" maxlength="60" placeholder="আপনার নাম" required><textarea name="text" maxlength="1200" placeholder="মন্তব্য লিখুন (সর্বোচ্চ ১২০০ অক্ষর)" required></textarea><button class="primary">মন্তব্য পাঠান</button><small class="status">মন্তব্য প্রকাশের আগে যাচাই করা হতে পারে।</small></form></section>`;
 $('articleDialog').showModal();
 if(firebaseReady&&db&& !id.startsWith('demo')){
  try{await updateDoc(doc(db,'articles',id),{views:increment(1)}).catch(()=>{});const snap=await getDocs(query(collection(db,'articles',id,'comments'),where('approved','==',true),orderBy('createdAt','desc')));$('comments').innerHTML=snap.empty?'<p class="status">এখনো কোনো মন্তব্য নেই।</p>':snap.docs.map(d=>{const c=d.data();return `<div class="comment"><b>${escapeHTML(c.name)}</b><p>${escapeHTML(c.text)}</p><small>${formatDate(c.createdAt)}</small></div>`}).join('')}
  catch(e){$('comments').innerHTML='<p class="status">মন্তব্য দেখানো যাচ্ছে না। Firebase সেটআপ পরীক্ষা করুন।</p>'}
 }else $('comments').innerHTML='<p class="status">মন্তব্য সক্রিয় করতে Firebase সেটআপ প্রয়োজন।</p>';
 $('commentForm').addEventListener('submit',async e=>{e.preventDefault();if(!firebaseReady||!db||id.startsWith('demo')){toast('মন্তব্য চালু করতে আগে Firebase সেটআপ করুন।');return}
  const form=new FormData(e.currentTarget),name=String(form.get('name')).trim(),text=String(form.get('text')).trim();
  if(!name||!text)return;
  try{await addDoc(collection(db,'articles',id,'comments'),{name,text,createdAt:serverTimestamp(),approved:false});e.currentTarget.reset();toast('মন্তব্য জমা হয়েছে। প্রকাশের আগে অনুমোদন প্রয়োজন।');}
  catch(err){console.error(err);toast('মন্তব্য পাঠানো যায়নি। Firebase Rules পরীক্ষা করুন।')}
 });
}
$('closeDialog').addEventListener('click',()=>$('articleDialog').close());
$('newsletterForm').addEventListener('submit',async e=>{e.preventDefault();if(!firebaseReady||!db){toast('ইমেইল সংগ্রহ চালু করতে Firebase সেটআপ করুন।');return}
 const email=$('newsletterEmail').value.trim().toLowerCase();try{await addDoc(collection(db,'newsletterSubscribers'),{email,createdAt:serverTimestamp(),source:'website'});$('newsletterStatus').textContent='সাবস্ক্রিপশনের অনুরোধ গ্রহণ করা হয়েছে।';e.currentTarget.reset();toast('ধন্যবাদ! আপনার অনুরোধ গ্রহণ করা হয়েছে।')}
 catch(err){console.error(err);toast('সাবস্ক্রাইব করা যায়নি। Firebase Rules পরীক্ষা করুন।')}
});
if(firebaseReady){try{const app=initializeApp(firebaseConfig);db=getFirestore(app)}catch(e){console.error(e)}}
render();loadArticles();
