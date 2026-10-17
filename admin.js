import { firebaseConfig, firebaseReady } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let auth,db,storage,currentUser=null;
function toast(t){$('toast').textContent=t;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',4000)}
function status(t){$('authStatus').textContent=t}
function setEditorVisible(show){['editorSection','manageSection','commentsSection','subscribersSection','logoutBtn'].forEach(id=>$(id).classList.toggle('hidden',!show))}
if(!firebaseReady){status('Firebase কনফিগার করা হয়নি। README.md খুলে Firebase সেটআপ সম্পন্ন করুন।')}
else{try{const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);onAuthStateChanged(auth,user=>{currentUser=user;setEditorVisible(!!user);if(user){status('লগইন হয়েছে: '+user.email);refreshAll()}else status('লগইন করুন।')})}catch(e){status('Firebase চালু হয়নি: '+e.message)}}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!auth){status('আগে Firebase সেটআপ করুন।');return}try{await signInWithEmailAndPassword(auth,$('loginEmail').value,$('loginPassword').value)}catch(err){status('লগইন ব্যর্থ: ইমেইল/পাসওয়ার্ড পরীক্ষা করুন। '+err.message)}});
$('logoutBtn').addEventListener('click',()=>signOut(auth));
$('resetBtn').addEventListener('click',resetForm);
function resetForm(){$('articleForm').reset();$('articleId').value='';$('editorTitle').textContent='নতুন খবর লিখুন';$('publishBtn').textContent='প্রকাশ করুন';$('uploadStatus').textContent=''}
$('articleForm').addEventListener('submit',async e=>{e.preventDefault();if(!currentUser){toast('আগে লগইন করুন।');return}
 $('publishBtn').disabled=true;$('uploadStatus').textContent='সংরক্ষণ হচ্ছে…';
 try{
  let image=$('imageUrl').value.trim();const file=$('imageFile').files[0];
  if(file){if(file.size>5*1024*1024)throw new Error('ছবি ৫ MB-এর কম হতে হবে।');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('শুধু JPG, PNG বা WebP ছবি আপলোড করুন।');const path=`article-images/${currentUser.uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const uploaded=await uploadBytes(ref(storage,path),file,{contentType:file.type});image=await getDownloadURL(uploaded.ref)}
  const payload={title:$('title').value.trim(),category:$('category').value,summary:$('summary').value.trim(),body:$('body').value.trim(),image,updatedAt:serverTimestamp(),authorUid:currentUser.uid};
  if(!payload.title||!payload.summary||!payload.body)throw new Error('সব প্রয়োজনীয় ঘর পূরণ করুন।');
  const id=$('articleId').value;
  if(id){await updateDoc(doc(db,'articles',id),payload)}else{await addDoc(collection(db,'articles'),{...payload,createdAt:serverTimestamp(),views:0,published:true})}
  toast('খবর সংরক্ষণ হয়েছে।');resetForm();await refreshAll();
 }catch(err){console.error(err);$('uploadStatus').textContent='সমস্যা: '+err.message;toast('খবর সংরক্ষণ করা যায়নি।')}
 finally{$('publishBtn').disabled=false}
});
async function refreshAll(){await Promise.all([loadArticles(),loadComments(),loadSubscribers()])}
async function loadArticles(){try{const snap=await getDocs(query(collection(db,'articles'),orderBy('createdAt','desc')));$('adminArticles').innerHTML=snap.empty?'<p>এখনো খবর নেই।</p>':snap.docs.map(d=>`<div class="admin-row"><div><b>${esc(d.data().title)}</b><div class="status">${esc(d.data().category||'')}</div></div><div class="admin-actions"><button data-edit="${d.id}">সম্পাদনা</button><button class="danger" data-delete="${d.id}">মুছুন</button></div></div>`).join('')}catch(e){$('adminArticles').textContent='খবর লোড হয়নি: '+e.message}}
$('adminArticles').addEventListener('click',async e=>{const edit=e.target.closest('[data-edit]')?.dataset.edit,del=e.target.closest('[data-delete]')?.dataset.delete;if(edit){const d=await getDocs(collection(db,'articles'));const found=d.docs.find(x=>x.id===edit);if(!found)return;const a=found.data();$('articleId').value=edit;$('title').value=a.title||'';$('category').value=a.category||'জাতীয়';$('summary').value=a.summary||'';$('body').value=a.body||'';$('imageUrl').value=a.image||'';$('editorTitle').textContent='খবর সম্পাদনা';$('publishBtn').textContent='পরিবর্তন সংরক্ষণ';window.scrollTo({top:0,behavior:'smooth'})}if(del&&confirm('এই খবরটি স্থায়ীভাবে মুছবেন?')){try{await deleteDoc(doc(db,'articles',del));toast('খবর মুছে ফেলা হয়েছে।');refreshAll()}catch(err){toast('মুছতে ব্যর্থ: '+err.message)}}});
async function loadComments(){try{const arts=await getDocs(collection(db,'articles'));let all=[];for(const a of arts.docs){const cs=await getDocs(query(collection(db,'articles',a.id,'comments'),orderBy('createdAt','desc')));cs.docs.forEach(c=>all.push({id:c.id,articleId:a.id,title:a.data().title,...c.data()}))}const pending=all.filter(c=>!c.approved);$('adminComments').innerHTML=pending.length?pending.map(c=>`<div class="admin-row"><div><b>${esc(c.name)}</b> — ${esc(c.title)}<p>${esc(c.text)}</p></div><button data-approve="${c.articleId}|${c.id}">অনুমোদন</button></div>`).join(''):'<p>অনুমোদনের অপেক্ষায় কোনো মন্তব্য নেই।</p>'}catch(e){$('adminComments').textContent='মন্তব্য লোড হয়নি: '+e.message}}
$('adminComments').addEventListener('click',async e=>{const val=e.target.closest('[data-approve]')?.dataset.approve;if(!val)return;const [articleId,commentId]=val.split('|');try{await updateDoc(doc(db,'articles',articleId,'comments',commentId),{approved:true});toast('মন্তব্য অনুমোদিত হয়েছে।');loadComments()}catch(err){toast('অনুমোদন করা যায়নি: '+err.message)}});
async function loadSubscribers(){try{const snap=await getDocs(query(collection(db,'newsletterSubscribers'),orderBy('createdAt','desc')));$('adminSubscribers').innerHTML=snap.empty?'<p>এখনো কোনো সাবস্ক্রাইবার নেই।</p>':snap.docs.map(d=>`<div class="admin-row"><span>${esc(d.data().email)}</span><button data-subdel="${d.id}">মুছুন</button></div>`).join('')}catch(e){$('adminSubscribers').textContent='ইমেইল লোড হয়নি: '+e.message}}
$('adminSubscribers').addEventListener('click',async e=>{const id=e.target.closest('[data-subdel]')?.dataset.subdel;if(!id)return;try{await deleteDoc(doc(db,'newsletterSubscribers',id));loadSubscribers()}catch(err){toast('মুছতে ব্যর্থ: '+err.message)}});
