(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function route(){const v=(location.hash||'#brew').slice(1);$$('.view').forEach(e=>e.classList.toggle('on',e.id===v));$$('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v===v))}
addEventListener('hashchange',route);route();
const P=[{n:'Batangas Kapeng Barako - French Press',r:13,c:30,s:[['Add coffee, pour all water',20],['Steep (immersion)',210],['Plunge and serve',20]]},
{n:'Benguet / Sagada Arabica - V60',r:16,c:20,s:[['Bloom 2x coffee weight',40],['Pour to 60%',40],['Pour to 100%',40],['Drawdown',60]]},
{n:'Mt. Apo Single-Origin - AeroPress',r:15,c:17,s:[['Add water, stir',15],['Steep',60],['Press slowly',30]]},
{n:'Pinoy Iced Spanish Latte - Moka Pot',r:12,c:20,s:[['Heat moka pot',150],['Remove from heat, cool base',15],['Pour over condensed milk and ice',30]]}];
$('#preset').innerHTML=P.map((p,i)=>`<option value="${i}">${esc(p.n)}</option>`).join('');
let cur=P[0],t=null,idx=0,left=0;
function calc(){$('#rv').textContent=$('#ratio').value;$('#water').textContent=Math.round($('#coffee').value*$('#ratio').value)}
function pick(){cur=P[$('#preset').value];$('#ratio').value=cur.r;$('#coffee').value=cur.c;calc();$('#steps').innerHTML=cur.s.map((s,i)=>`<li>${esc(s[0])} (${s[1]}s)</li>`).join('');reset()}
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();o.stop(a.currentTime+.25)}catch{}navigator.vibrate&&navigator.vibrate(200)}
const fmt=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
function show(){$('#clock').textContent=fmt(left);$$('#steps li').forEach((l,i)=>l.classList.toggle('on',i===idx));$('#stepNow').textContent=cur.s[idx]?cur.s[idx][0]:'Done. Enjoy your kape!'}
function reset(){clearInterval(t);t=null;idx=0;left=cur.s[0][1];show();$('#start').textContent='Start'}
function tick(){left--;if(left<=0){beep();idx++;if(idx>=cur.s.length){clearInterval(t);t=null;left=0;show();$('#start').textContent='Start';return}left=cur.s[idx][1]}show()}
$('#start').onclick=()=>{if(t){clearInterval(t);t=null;$('#start').textContent='Resume'}else{if(idx>=cur.s.length)reset();t=setInterval(tick,1000);$('#start').textContent='Pause'}};
$('#reset').onclick=reset;$('#preset').onchange=pick;$('#ratio').oninput=calc;$('#coffee').oninput=calc;pick();
const O=[{n:'Atok, Benguet',v:'Arabica',e:'1,200-2,300 m',r:'Light to medium',t:'Citrus, caramel, floral'},
{n:'Sagada, Mt. Province',v:'Arabica',e:'1,200-1,600 m',r:'Medium',t:'Red apple, honey, cocoa'},
{n:'Mt. Apo, Davao',v:'Arabica',e:'900-1,500 m',r:'Light to medium',t:'Stone fruit, brown sugar'},
{n:'Bukidnon',v:'Arabica',e:'600-1,200 m',r:'Medium',t:'Nutty, mild, chocolatey'},
{n:'Sultan Kudarat',v:'Robusta',e:'0-600 m',r:'Medium to dark',t:'Bold, earthy, high caffeine'},
{n:'Cavite',v:'Robusta',e:'0-500 m',r:'Dark',t:'Woody, bitter cocoa'},
{n:'Batangas (Kapeng Barako)',v:'Liberica',e:'300-800 m',r:'Medium to dark',t:'Jackfruit, smoky, bold'},
{n:'Batangas / Cavite',v:'Excelsa',e:'300-800 m',r:'Medium',t:'Tart fruit, dark berry'}];
let vf='';const V=['','Arabica','Robusta','Liberica','Excelsa'];
function drawO(){$('#vfilter').innerHTML=V.map(v=>`<button class="${v===vf?'on':''}" data-v="${v}">${v||'All'}</button>`).join('');
$('#ocards').innerHTML=O.filter(o=>!vf||o.v===vf).map(o=>`<div class="card"><h3>${esc(o.n)}</h3><p>${o.v}<br>Elevation: ${o.e}<br>Roast: ${o.r}<br>Notes: ${o.t}</p></div>`).join('')}
$('#vfilter').onclick=e=>{if(e.target.dataset.v!==undefined){vf=e.target.dataset.v;drawO()}};drawO();
let J=load('tk_beans',[]);
function fresh(d){const n=Math.floor((Date.now()-new Date(d))/864e5);return n<7?['Resting: Days 1-6 ('+Math.max(n,0)+'d)','rest']:n<=28?['Peak Flavor: Days 7-28 ('+n+'d)','']:['Past Peak: '+n+'d','past']}
function drawJ(){$('#jlist').innerHTML=J.length?J.map((b,i)=>{const f=fresh(b.roastDate);return`<div class="card"><h3>${esc(b.roaster)}</h3><span class="badge ${f[1]}">${f[0]}</span><p>${esc(b.origin)} - ${esc(b.variety)} - ${esc(b.process)}<br>PHP ${esc(b.price||0)} - ${'★'.repeat(b.rating)}${'☆'.repeat(5-b.rating)}<br>${esc(b.notes)}</p><button class="ghost" data-d="${i}">Delete</button></div>`}).join(''):'<p>No bags yet. Log your first one above.</p>'}
$('#jform').onsubmit=e=>{e.preventDefault();J.unshift(Object.fromEntries(new FormData(e.target)));save('tk_beans',J);e.target.reset();drawJ()};
$('#jlist').onclick=e=>{if(e.target.dataset.d){J.splice(e.target.dataset.d,1);save('tk_beans',J);drawJ()}};drawJ();
let C=load('tk_cafes',[]);
const cities=['Metro Manila','Cebu','Davao','Baguio','Iloilo','Pampanga','Other'];$('#cfilter').innerHTML+=cities.map(c=>`<option>${c}</option>`).join('');
function drawC(){const f=$('#cfilter').value,l=C.map((c,i)=>[c,i]).filter(([c])=>!f||c.city===f);
$('#clist').innerHTML=l.length?l.map(([c,i])=>`<div class="card"><h3>${esc(c.name)}</h3><p>${esc(c.city)}<br>${[c.wifi&&'Wi-Fi',c.power&&'Power',c.parking&&'Parking',c.pets&&'Pet-friendly'].filter(Boolean).join(', ')||'No perks logged'}<br>Signature: ${esc(c.drink)}</p><button class="ghost" data-d="${i}">Delete</button></div>`).join(''):'<p>No cafes saved here yet.</p>'}
$('#cform').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);C.unshift({name:d.get('name'),city:d.get('city'),drink:d.get('drink'),wifi:d.has('wifi'),power:d.has('power'),parking:d.has('parking'),pets:d.has('pets')});save('tk_cafes',C);e.target.reset();drawC()};
$('#clist').onclick=e=>{if(e.target.dataset.d){C.splice(e.target.dataset.d,1);save('tk_cafes',C);drawC()}};$('#cfilter').onchange=drawC;drawC();
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
