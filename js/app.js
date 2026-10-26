(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const load=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TITLES={brew:'Brew studio',origins:'Philippine origins',journal:'Kape journal',cafes:'Work-friendly cafes'};
const TIPS=['Rinse paper filters with hot water to remove papery taste.','Grind right before brewing for the best aroma.','Barako loves a coarse grind and a long steep.','Weigh your coffee. Scoops lie.','Use water just off the boil for dark roasts, cooler for light.'];
$('#tip').textContent=TIPS[new Date().getDate()%TIPS.length];
function route(){const v=TITLES[(location.hash||'#brew').slice(1)]?(location.hash||'#brew').slice(1):'brew';$$('.view').forEach(e=>e.classList.toggle('on',e.id===v));$$('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v===v));$('#title').textContent=TITLES[v]}
addEventListener('hashchange',route);route();
// ---- brew
const P=[{n:'Barako French Press',r:13,c:30,t:96,g:'Coarse',s:[['Add water',20],['Steep',210],['Plunge',20]]},
{n:'Sagada V60',r:16,c:20,t:93,g:'Medium-fine',s:[['Bloom',40],['Pour 60%',40],['Pour 100%',40],['Drawdown',60]]},
{n:'Mt. Apo AeroPress',r:15,c:17,t:90,g:'Medium',s:[['Add water',15],['Steep',60],['Press',30]]},
{n:'Iced Spanish Latte',r:12,c:20,t:95,g:'Fine (moka)',s:[['Heat moka',150],['Cool base',15],['Pour on milk + ice',30]]}];
let cur=0,t=null,idx=0,left=0,total=0,done=0;const CIRC=653.45;
$('#presets').innerHTML=P.map((p,i)=>`<button class="pc" data-i="${i}">${esc(p.n)}</button>`).join('');
function calc(){const c=+$('#coffee').value||0,r=+$('#ratio').value;$('#rv').textContent=r;$('#kc').textContent=c+' g';$('#water').textContent=Math.round(c*r)+' ml'}
function pick(i){cur=i;const p=P[i];$('#ratio').value=p.r;$('#coffee').value=p.c;$('#kt').textContent=p.t+' °C';$('#kg').textContent=p.g;calc();
$$('.pc').forEach((b,j)=>b.classList.toggle('on',j===i));total=p.s.reduce((a,s)=>a+s[1],0);
$('#steps').innerHTML=p.s.map((s,j)=>`<span class="p" id="s${j}">${esc(s[0])} ${s[1]}s</span>`).join('');reset()}
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();o.stop(a.currentTime+.25)}catch{}navigator.vibrate&&navigator.vibrate(200)}
const fmt=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
function show(){const p=P[cur];$('#clock').textContent=fmt(left);$('#ring').style.strokeDashoffset=CIRC*(1-done/total);$('#ring').classList.toggle('live',!!t);
$$('#steps .p').forEach((e,j)=>{e.classList.toggle('on',j===idx&&idx<p.s.length);e.classList.toggle('done',j<idx)});$('#stepNow').textContent=p.s[idx]?p.s[idx][0]:'Done. Enjoy your kape!'}
function reset(){clearInterval(t);t=null;idx=0;done=0;left=P[cur].s[0][1];show();$('#start').textContent='Start'}
function tick(){left--;done++;if(left<=0){beep();idx++;if(idx>=P[cur].s.length){clearInterval(t);t=null;left=0;show();$('#start').textContent='Start';return}left=P[cur].s[idx][1]}show()}
$('#start').onclick=()=>{if(t){clearInterval(t);t=null;$('#start').textContent='Resume';show()}else{if(idx>=P[cur].s.length)reset();t=setInterval(tick,1000);$('#start').textContent='Pause';show()}};
$('#reset').onclick=reset;$('#presets').onclick=e=>{if(e.target.dataset.i!==undefined)pick(+e.target.dataset.i)};$('#ratio').oninput=calc;$('#coffee').oninput=calc;pick(0);
// ---- origins (p = preset index)
const O=[{n:'Atok, Benguet',v:'Arabica',e:'1,200-2,300 m',l:2,t:['Citrus','Caramel','Floral'],p:1},
{n:'Sagada, Mt. Province',v:'Arabica',e:'1,200-1,600 m',l:3,t:['Red apple','Honey','Cocoa'],p:1},
{n:'Mt. Apo, Davao',v:'Arabica',e:'900-1,500 m',l:2,t:['Stone fruit','Brown sugar'],p:2},
{n:'Bukidnon',v:'Arabica',e:'600-1,200 m',l:3,t:['Nutty','Mild','Chocolate'],p:2},
{n:'Sultan Kudarat',v:'Robusta',e:'0-600 m',l:4,t:['Bold','Earthy','High caffeine'],p:3},
{n:'Cavite',v:'Robusta',e:'0-500 m',l:5,t:['Woody','Dark cocoa'],p:3},
{n:'Batangas (Kapeng Barako)',v:'Liberica',e:'300-800 m',l:4,t:['Jackfruit','Smoky','Dark cocoa'],p:0},
{n:'Batangas / Cavite',v:'Excelsa',e:'300-800 m',l:3,t:['Tart fruit','Dark berry'],p:0}];
let vf='';const V=['','Arabica','Robusta','Liberica','Excelsa'];
const MT='<svg class="ic" viewBox="0 0 24 24"><path d="M3 20l6-11 4 6 3-4 5 9z"/></svg>';
function drawO(){const q=$('#osearch').value.toLowerCase();$('#vfilter').innerHTML=V.map(v=>`<button class="chip ${v===vf?'on':''}" data-v="${v}">${v||'All'}</button>`).join('');
const l=O.filter(o=>(!vf||o.v===vf)&&(!q||(o.n+o.v+o.t.join(' ')).toLowerCase().includes(q)));
$('#ocards').innerHTML=l.length?l.map(o=>`<div class="card"><span class="vb ${o.v}">${o.v}</span><span class="loc">${MT} ${o.e}</span><h3>${esc(o.n)}</h3>
<div class="dots">Light ${[1,2,3,4,5].map(i=>`<i class="${i<=o.l?'f':''}"></i>`).join('')} Dark</div><div>${o.t.map(n=>`<span class="note">${esc(n)}</span>`).join('')}</div>
<p></p><button class="sm" data-b="${o.p}">Brew this origin</button></div>`).join(''):'<p>No origins match. Clear the search.</p>'}
$('#vfilter').onclick=e=>{if(e.target.dataset.v!==undefined){vf=e.target.dataset.v;drawO()}};$('#osearch').oninput=drawO;
$('#ocards').onclick=e=>{if(e.target.dataset.b!==undefined){pick(+e.target.dataset.b);location.hash='#brew'}};drawO();
// ---- journal (sample data uses dates relative to today)
const ago=n=>new Date(Date.now()-n*864e5).toISOString().slice(0,10);
let J=load('tk_beans',[{roaster:'Yardstick Coffee',origin:'Golden Ticket blend',variety:'Arabica',process:'Washed',roastDate:ago(3),price:520,rating:4,notes:'Sample entry. Edit or delete me.',sample:1},
{roaster:'Good Cup Coffee Co.',origin:'Mt. Apo',variety:'Arabica',process:'Natural',roastDate:ago(14),price:640,rating:5,notes:'Sample entry. Edit or delete me.',sample:1},
{roaster:'Kalsada Coffee',origin:'Sitio Belis, Benguet',variety:'Arabica',process:'Washed',roastDate:ago(45),price:580,rating:4,notes:'Sample entry. Edit or delete me.',sample:1}]);
function fresh(d){const n=Math.floor((Date.now()-new Date(d))/864e5);return n<7?['Resting: Days 1-6 ('+Math.max(n,0)+'d)','rest']:n<=28?['Peak Flavor: Days 7-28 ('+n+'d)','']:['Past Peak: '+n+'d','past']}
function drawJ(){$('#jlist').innerHTML=J.length?J.map((b,i)=>{const f=fresh(b.roastDate);return`<div class="card"><h3>${esc(b.roaster)}</h3><span class="badge ${f[1]}">${f[0]}</span><p>${esc(b.origin)} - ${esc(b.variety)} - ${esc(b.process)}<br>PHP ${esc(b.price||0)} <span class="star">${'★'.repeat(b.rating)}${'☆'.repeat(5-b.rating)}</span><br>${esc(b.notes)}</p><button class="ghost sm" data-d="${i}">Delete</button></div>`}).join(''):'<div class="card"><p>No bags yet. Log your first one.</p></div>'}
$('#jform').onsubmit=e=>{e.preventDefault();J.unshift(Object.fromEntries(new FormData(e.target)));save('tk_beans',J);e.target.reset();drawJ()};
$('#jlist').onclick=e=>{if(e.target.dataset.d){J.splice(e.target.dataset.d,1);save('tk_beans',J);drawJ()}};save('tk_beans',J);drawJ();
// ---- cafes (amenities sample data: verify before relying on it)
const AM=[['wifi','📶 Fast Wi-Fi'],['power','⚡ Power Sockets'],['parking','🚗 Parking'],['pets','🐾 Pet-Friendly']];
const cities=['Metro Manila','Cebu','Davao','Baguio','Iloilo','Pampanga','Other'];
$('#ccity').innerHTML=cities.map(c=>`<option>${c}</option>`).join('');$('#cfilter').innerHTML+=cities.map(c=>`<option>${c}</option>`).join('');
let C=load('tk_cafes',[{name:'Yardstick Legazpi',city:'Metro Manila',drink:'Flat white',wifi:1,power:1,sample:1},{name:'Commune Poblacion',city:'Metro Manila',drink:'Cold brew',wifi:1,pets:1,sample:1},
{name:'Habitual Coffee',city:'Metro Manila',drink:'Spanish latte',wifi:1,power:1,parking:1,sample:1},{name:'Good Cup Cebu',city:'Cebu',drink:'Pour-over',wifi:1,power:1,sample:1},
{name:'H Proper',city:'Davao',drink:'Iced mocha',wifi:1,parking:1,sample:1},{name:'Hatch Baguio',city:'Baguio',drink:'Benguet drip',wifi:1,power:1,sample:1}]);
let tg={};
function drawT(){$('#toggles').innerHTML=AM.map(([k,l])=>`<button type="button" class="p ${tg[k]?'on':''}" aria-pressed="${!!tg[k]}" data-k="${k}">${l}</button>`).join('')}
$('#toggles').onclick=e=>{const k=e.target.dataset.k;if(k){tg[k]=!tg[k];drawT()}};drawT();
function drawC(){const f=$('#cfilter').value,l=C.map((c,i)=>[c,i]).filter(([c])=>!f||c.city===f);
$('#clist').innerHTML=l.length?l.map(([c,i])=>`<div class="card"><h3>${esc(c.name)}</h3><span class="vb Arabica">${esc(c.city)}</span><p>Signature: ${esc(c.drink)||'-'}</p><div>${AM.filter(([k])=>c[k]).map(([,t])=>`<span class="note">${t}</span>`).join('')||'<span class="sample">No perks logged</span>'}</div>${c.sample?'<p class="sample">Sample entry: verify amenities before you go.</p>':''}<button class="ghost sm" data-d="${i}">Delete</button></div>`).join(''):'<div class="card"><p>No cafes saved here yet.</p></div>'}
$('#cform').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);C.unshift({name:d.get('name'),city:d.get('city'),drink:d.get('drink'),...Object.fromEntries(Object.entries(tg).filter(([,v])=>v).map(([k])=>[k,1]))});save('tk_cafes',C);e.target.reset();tg={};drawT();drawC()};
$('#clist').onclick=e=>{if(e.target.dataset.d){C.splice(e.target.dataset.d,1);save('tk_cafes',C);drawC()}};$('#cfilter').onchange=drawC;save('tk_cafes',C);drawC();
// ---- network, install, SW
function net(){const o=navigator.onLine,p=$('#net');p.textContent=o?'Online':'Offline';p.className='pill '+(o?'on':'off')}
addEventListener('online',net);addEventListener('offline',net);net();
let dp=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#installBtn').hidden=false});
$('#installBtn').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('#installBtn').hidden=true}};
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!navigator.standalone&&!matchMedia('(display-mode: standalone)').matches;
if(ios&&!localStorage.getItem('tk_ios'))$('#ios').hidden=false;$('#iosClose').onclick=()=>{$('#ios').hidden=true;localStorage.setItem('tk_ios','1')};
if('serviceWorker'in navigator){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>{
const ask=w=>{$('#toast').hidden=false;$('#reload').onclick=()=>w.postMessage({type:'SKIP_WAITING'})};
if(r.waiting&&navigator.serviceWorker.controller)ask(r.waiting);
r.addEventListener('updatefound',()=>{const w=r.installing;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)ask(w)})})}));
let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!rl){rl=true;location.reload()}})}
})();
