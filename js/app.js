(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const load=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TITLES={brew:'Brew studio',origins:'Philippine origins',journal:'Kape journal',cafes:'Work-friendly cafes'};
const SUBS={brew:'Pick a Philippine preset or set your own ratio, then press Start for timed pour cues.',origins:'Browse Philippine coffee regions (elevations are approximate), then load one into the Brew timer.',journal:'Log bags from local roasters and track how fresh each one is.',cafes:'Save cafes and filter by city and the amenities you need to work.'};
function toast(m,undo){const t=document.createElement('div');t.className='t';t.textContent=m;if(undo){const b=document.createElement('button');b.textContent='Undo';b.className='sm';b.style.marginLeft='12px';b.onclick=()=>{undo();t.remove()};t.append(b)}$('#msgs').append(t);setTimeout(()=>t.remove(),undo?5000:2800)}
if(!localStorage.getItem('tk_welcome'))$('#welcome').hidden=false;$('#wclose').onclick=()=>{$('#welcome').hidden=true;localStorage.setItem('tk_welcome','1')};
const TIPS=['Rinse paper filters with hot water to remove papery taste.','Grind right before brewing for the best aroma.','Barako loves a coarse grind and a long steep.','Weigh your coffee. Scoops lie.','Use water just off the boil for dark roasts, cooler for light.'];
$('#tip').textContent=TIPS[new Date().getDate()%TIPS.length];
function route(){const v=TITLES[(location.hash||'#brew').slice(1)]?(location.hash||'#brew').slice(1):'brew';$$('.view').forEach(e=>e.classList.toggle('on',e.id===v));$$('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v===v));$('#title').textContent=TITLES[v];$('#sub').textContent=SUBS[v]}
addEventListener('hashchange',route);route();
// ---- brew
const P=[{n:'Barako French Press',r:13,c:30,t:96,g:'Coarse',s:[['Add water',20],['Steep',210],['Plunge',20]]},
{n:'Sagada V60',r:16,c:20,t:93,g:'Medium-fine',s:[['Bloom',40],['Pour 60%',40],['Pour 100%',40],['Drawdown',60]]},
{n:'Mt. Apo AeroPress',r:15,c:17,t:90,g:'Medium',s:[['Add water',15],['Steep',60],['Press',30]]},
{n:'Iced Spanish Latte',r:12,c:20,t:95,g:'Fine (moka)',s:[['Heat moka',150],['Cool base',15],['Pour on milk + ice',30]]}];
load('tk_recipes',[]).forEach(r=>P.push(r));
let cur=0,t=null,idx=0,left=0,total=0,done=0,st=[],muted=localStorage.getItem('tk_mute')==='1';const tot=()=>st.reduce((a,s)=>a+s[1],0);const CIRC=653.45;
function drawP(){$('#presets').innerHTML=P.map((p,i)=>`<button class="pc" data-i="${i}">${esc(p.n)}</button>`).join('')}drawP();
function calc(){const c=+$('#coffee').value||0,r=+$('#ratio').value;$('#rv').textContent=r;$('#kc').textContent=c+' g';$('#water').textContent=Math.round(c*r)+' ml'}
function pick(i){cur=i;const p=P[i];$('#ratio').value=p.r;$('#coffee').value=p.c;$('#kt').textContent=p.t+' °C';$('#kg').textContent=p.g;calc();
$$('.pc').forEach((b,j)=>b.classList.toggle('on',j===i));st=p.s.map(x=>[...x]);
$('#steps').innerHTML=st.map((s,j)=>`<label class="p">${esc(s[0])} <input class="sd" type="number" min="5" max="600" value="${s[1]}" data-j="${j}" aria-label="${esc(s[0])} seconds">s</label>`).join('');reset()}
function beep(){if(muted)return;try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();o.stop(a.currentTime+.25)}catch{}navigator.vibrate&&navigator.vibrate(200)}
const fmt=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
function show(){const p=P[cur];$('#clock').textContent=fmt(left);$('#ring').style.strokeDashoffset=CIRC*(1-done/total);$('#ring').classList.toggle('live',!!t);
$$('#steps .p').forEach((e,j)=>{e.classList.toggle('on',j===idx&&idx<st.length);e.classList.toggle('done',j<idx)});$('#stepNow').textContent=st[idx]?st[idx][0]:'Done. Enjoy your kape!'}
function reset(){clearInterval(t);t=null;idx=0;done=0;total=tot();left=st[0][1];show();$('#start').textContent='Start'}
function tick(){left--;done++;if(left<=0){beep();idx++;if(idx>=st.length){clearInterval(t);t=null;left=0;show();$('#start').textContent='Start';return}left=st[idx][1]}show()}
$('#start').onclick=()=>{if(t){clearInterval(t);t=null;$('#start').textContent='Resume';show()}else{if(idx>=st.length)reset();t=setInterval(tick,1000);$('#start').textContent='Pause';show()}};
$('#saveRec').onclick=()=>{const n=(prompt('Name your recipe')||'').trim();if(!n)return;const b=P[cur],r={n:n.slice(0,40),r:+$('#ratio').value,c:+$('#coffee').value||b.c,t:b.t,g:b.g,s:st.map(x=>[...x])};const R=load('tk_recipes',[]);R.push(r);save('tk_recipes',R);P.push(r);drawP();pick(P.length-1);toast('✓ Recipe saved')};
$('#steps').oninput=e=>{const j=e.target.dataset.j;if(j===undefined||t)return;st[j][1]=Math.max(5,Math.min(600,+e.target.value||5));reset()};
const mt=()=>$('#mute').textContent=muted?'🔇 Sound off':'🔔 Sound on';mt();$('#mute').onclick=()=>{muted=!muted;localStorage.setItem('tk_mute',muted?'1':'0');mt()};
$('#reset').onclick=reset;$('#presets').onclick=e=>{if(e.target.dataset.i!==undefined)pick(+e.target.dataset.i)};$('#ratio').oninput=calc;$('#coffee').oninput=calc;pick(0);
// ---- origins (p = preset index)
const O=[{n:'Atok, Benguet',v:'Arabica',e:'~1,200-2,300 m',l:2,t:['Citrus','Caramel','Floral'],p:1},
{n:'Sagada, Mt. Province',v:'Arabica',e:'~1,200-1,600 m',l:3,t:['Red apple','Honey','Cocoa'],p:1},
{n:'La Trinidad, Benguet',v:'Arabica',e:'~1,200-1,500 m',l:2,t:['Sweet','Nutty','Mild'],p:1},
{n:'Kalinga',v:'Arabica',e:'~600-1,200 m',l:3,t:['Chocolate','Mild fruit'],p:2},
{n:'Mt. Apo, Davao',v:'Arabica',e:'~900-1,500 m',l:2,t:['Stone fruit','Brown sugar'],p:2},
{n:'Bansalan, Davao del Sur',v:'Arabica',e:'~800-1,300 m',l:3,t:['Cocoa','Nutty'],p:2},
{n:'Lantapan, Bukidnon',v:'Arabica',e:'~800-1,300 m',l:3,t:['Nutty','Mild','Chocolate'],p:2},
{n:'Bukidnon',v:'Arabica',e:'~600-1,200 m',l:3,t:['Nutty','Mild','Chocolate'],p:2},
{n:'Sultan Kudarat',v:'Robusta',e:'~0-600 m',l:4,t:['Bold','Earthy','High caffeine'],p:3},
{n:'Cotabato',v:'Robusta',e:'~0-600 m',l:4,t:['Earthy','Bold'],p:3},
{n:'Alfonso, Cavite',v:'Robusta',e:'~300-800 m',l:5,t:['Woody','Dark cocoa'],p:3},
{n:'Amadeo, Cavite',v:'Robusta',e:'~300-700 m',l:5,t:['Woody','Bitter cocoa'],p:3},
{n:'Batangas (Kapeng Barako)',v:'Liberica',e:'~300-800 m',l:4,t:['Jackfruit','Smoky','Dark cocoa'],p:0},
{n:'Lipa, Batangas',v:'Liberica',e:'~300-700 m',l:4,t:['Jackfruit','Smoky'],p:0},
{n:'Batangas / Cavite',v:'Excelsa',e:'~300-800 m',l:3,t:['Tart fruit','Dark berry'],p:0}];
let rf='',vf='';const V=['','Arabica','Robusta','Liberica','Excelsa'];
const MT='<svg class="ic" viewBox="0 0 24 24"><path d="M3 20l6-11 4 6 3-4 5 9z"/></svg>';
function drawO(){const q=$('#osearch').value.toLowerCase();$('#rfilter').innerHTML=['','Light','Medium','Dark'].map(v=>`<button class="chip ${v===rf?'on':''}" data-r="${v}">${v?v+' roast':'Any roast'}</button>`).join('');$('#vfilter').innerHTML=V.map(v=>`<button class="chip ${v===vf?'on':''}" data-v="${v}">${v||'All'}</button>`).join('');
const l=O.filter(o=>(!vf||o.v===vf)&&(!rf||(rf==='Light'?o.l<=2:rf==='Medium'?o.l===3:o.l>=4))&&(!q||(o.n+o.v+o.t.join(' ')).toLowerCase().includes(q)));
$('#ocards').innerHTML=l.length?l.map(o=>`<div class="card"><span class="vb ${o.v}">${o.v}</span><span class="loc">${MT} ${o.e}</span><h3>${esc(o.n)}</h3>
<div class="dots">Light ${[1,2,3,4,5].map(i=>`<i class="${i<=o.l?'f':''}"></i>`).join('')} Dark</div><div>${o.t.map(n=>`<span class="note">${esc(n)}</span>`).join('')}</div>
<p></p><button class="sm" data-b="${o.p}" data-n="${esc(o.n)}">Brew this origin</button></div>`).join(''):'<p>No origins match. Clear the search.</p>'}
$('#vfilter').onclick=e=>{if(e.target.dataset.v!==undefined){vf=e.target.dataset.v;drawO()}};$('#rfilter').onclick=e=>{if(e.target.dataset.r!==undefined){rf=e.target.dataset.r;drawO()}};$('#osearch').oninput=drawO;
$('#ocards').onclick=e=>{if(e.target.dataset.b!==undefined){pick(+e.target.dataset.b);location.hash='#brew';scrollTo({top:0,behavior:'smooth'});const r=$('#brew .glass');r.classList.add('hl');setTimeout(()=>r.classList.remove('hl'),1600);toast('Loaded '+e.target.dataset.n+' into Brew Studio ☕')}};drawO();
// ---- journal (sample data uses dates relative to today)
const ago=n=>new Date(Date.now()-n*864e5).toISOString().slice(0,10);
let J=load('tk_beans',[{roaster:'Yardstick Coffee',origin:'Golden Ticket blend',variety:'Arabica',process:'Washed',roastDate:ago(3),price:520,rating:4,notes:'Sample entry. Edit or delete me.',sample:1},
{roaster:'Good Cup Coffee Co.',origin:'Mt. Apo',variety:'Arabica',process:'Natural',roastDate:ago(14),price:640,rating:5,notes:'Sample entry. Edit or delete me.',sample:1},
{roaster:'Kalsada Coffee',origin:'Sitio Belis, Benguet',variety:'Arabica',process:'Washed',roastDate:ago(45),price:580,rating:4,notes:'Sample entry. Edit or delete me.',sample:1}]);
function fresh(d){const n=Math.floor((Date.now()-new Date(d))/864e5);return n<7?['Resting: Days 1-6 ('+Math.max(n,0)+'d)','rest']:n<=28?['Peak Flavor: Days 7-28 ('+n+'d)','']:['Past Peak: '+n+'d','past']}
function drawJ(){$('#jlist').innerHTML=J.length?J.map((b,i)=>{const f=fresh(b.roastDate);return`<div class="card"><h3>${esc(b.roaster)}</h3><span class="badge ${f[1]}">${f[0]}</span><p>${esc(b.origin)} - ${esc(b.variety)} - ${esc(b.process)}<br>PHP ${esc(b.price||0)} <span class="star">${'★'.repeat(b.rating)}${'☆'.repeat(5-b.rating)}</span><br>${esc(b.notes)}</p><button class="ghost sm" data-sb="${i}">🔗 Share</button> <button class="ghost sm" data-d="${i}">Delete</button></div>`}).join(''):'<div class="card"><p>No bags yet — log your first local bag.</p><button class="sm" data-f="jform">Log a bag</button></div>'}
$('#jform').onsubmit=e=>{e.preventDefault();J.unshift(Object.fromEntries(new FormData(e.target)));save('tk_beans',J);e.target.reset();drawJ();toast('✓ Bag logged. Saved offline on this device')};
$('#jlist').onclick=e=>{if(e.target.dataset.d){const i=+e.target.dataset.d,[x]=J.splice(i,1);save('tk_beans',J);drawJ();toast('Coffee bag deleted',()=>{J.splice(i,0,x);save('tk_beans',J);drawJ()})}};save('tk_beans',J);drawJ();
// ---- cafes (amenities sample data: verify before relying on it)
const AM=[['wifi','📶 Fast Wi-Fi'],['power','⚡ Power Sockets'],['parking','🚗 Parking'],['pets','🐾 Pet-Friendly']];
const cities=['Metro Manila','Cebu','Davao','Baguio','Iloilo','Pampanga','Other'];
$('#ccity').innerHTML=cities.map(c=>`<option>${c}</option>`).join('');$('#cfilter').innerHTML+=cities.map(c=>`<option>${c}</option>`).join('');
const cf=(name,city,area,drink,lat,lng,o,cl,fl)=>({name,city,area,drink,lat,lng,o,cl,sample:1,...fl});
const SEED=[cf('Yardstick Legazpi','Metro Manila','Makati','Flat white',14.5547,121.0244,7,21,{wifi:1,power:1}),cf('Commune Poblacion','Metro Manila','Makati','Cold brew',14.565,121.03,8,22,{wifi:1,pets:1}),cf('Habitual Coffee','Metro Manila','','Spanish latte',14.5995,120.9842,7,22,{wifi:1,power:1,parking:1}),cf('Harlan + Holden','Metro Manila','','Pour-over',14.5995,120.9842,8,20,{wifi:1,power:1}),cf('Hatch','Baguio','Baguio','Benguet drip',16.4023,120.596,8,21,{wifi:1,power:1}),cf('Hot Cat','Baguio','Baguio','Latte',16.4023,120.596,8,22,{wifi:1}),cf('El Union','Other','San Juan, La Union','Iced latte',16.6685,120.3285,7,22,{wifi:1,parking:1}),cf('Good Cup Cebu','Cebu','Cebu City','Pour-over',10.3157,123.8854,7,21,{wifi:1,power:1}),cf('Tightrope Coffee','Cebu','Cebu City','Espresso tonic',10.3157,123.8854,8,22,{wifi:1,power:1}),cf('Madge Cafe','Iloilo','Iloilo City','Iced coffee',10.7202,122.5621,7,21,{wifi:1,power:1}),cf('H Proper','Davao','Davao City','Iced mocha',7.0731,125.6128,8,21,{wifi:1,parking:1}),cf('Purge Coffee Roasters','Davao','Davao City','Pour-over',7.0731,125.6128,8,22,{wifi:1,power:1}),cf('H Proper CDO','Other','Cagayan de Oro','Latte',8.4542,124.6319,8,21,{wifi:1,parking:1}),cf('Spotted Pig Siargao','Other','General Luna, Siargao','Iced latte',9.8482,126.0458,7,21,{wifi:1})];
let C=load('tk_cafes4',SEED.concat(load('tk_cafes',[]).filter(c=>!c.sample)));
let tg={};
function drawT(){$('#toggles').innerHTML=AM.map(([k,l])=>`<button type="button" class="p ${tg[k]?'on':''}" aria-pressed="${!!tg[k]}" data-k="${k}">${l}</button>`).join('')}
$('#toggles').onclick=e=>{const k=e.target.dataset.k;if(k){tg[k]=!tg[k];drawT()}};drawT();
const HF=[['early','🕒 Opens before 8am'],['late','🌙 Open past 9pm']];
let pos=null;const CITYC={'Metro Manila':[14.5995,120.9842],Cebu:[10.3157,123.8854],Davao:[7.0731,125.6128],Baguio:[16.4023,120.596],Iloilo:[10.7202,122.5621],Pampanga:[15.0794,120.62]};
const hav=(a,b,c,d)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const km=c=>c.lat==null?9e9:hav(pos.lat,pos.lng,c.lat,c.lng),hr=h=>{h%=24;return((h+11)%12+1)+(h<12?'am':'pm')},openNow=c=>{const n=new Date(),h=n.getHours()+n.getMinutes()/60;return h>=c.o&&h<c.cl},mu=c=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(c.name+' '+(c.area||c.city)+' Philippines');
async function share(t,u){try{if(navigator.share)await navigator.share({title:'TalaKape PH',text:t,url:u});else{await navigator.clipboard.writeText(t+'\n'+u);toast('✓ Copied to clipboard')}}catch{}}
let af={};function drawA(){$('#afilter').innerHTML=AM.concat(HF).map(([k,l])=>`<button type="button" class="p ${af[k]?'on':''}" aria-pressed="${!!af[k]}" data-k="${k}">${l}</button>`).join('')}
$('#afilter').onclick=e=>{const k=e.target.dataset.k;if(k){af[k]=!af[k];drawA();drawC()}};
function drawC(){const f=$('#cfilter').value,l=C.map((c,i)=>[c,i]).filter(([c])=>(!f||c.city===f)&&AM.every(([k])=>!af[k]||c[k])&&(!af.early||(c.o!=null&&c.o<8))&&(!af.late||(c.cl!=null&&c.cl>=21)));if(pos)l.sort((a,b)=>km(a[0])-km(b[0]));$('#ccount').textContent='Showing '+l.length+' of '+C.length+' cafes';
$('#clist').innerHTML=l.length?l.map(([c,i])=>`<div class="card"><h3>${esc(c.name)}</h3><span class="vb Arabica">${esc(c.city)}</span>${c.area?`<span class="loc">${esc(c.area)}</span>`:''}${pos&&c.lat!=null?`<p class="dist">📍 ~${km(c).toFixed(1)} km away</p>`:''}<p>Signature: ${esc(c.drink)||'-'}</p><div>${AM.filter(([k])=>c[k]).map(([,t])=>`<span class="note">${t}</span>`).join('')||'<span class="sample">No perks logged</span>'}</div>${c.o==null?'':`<p><span class="badge ${openNow(c)?'':'past'}">${openNow(c)?'Open now':'Closed now'}</span> <span class="sample">typically ${hr(c.o)}-${hr(c.cl)}</span></p>`}${c.sample?'<p class="sample">Sample data: location, hours and amenities are approximate. Verify before you go.</p>':''}<div class="row2"><a class="btn" target="_blank" rel="noopener" href="${mu(c)}">🗺️ Open in Google Maps</a><button class="ghost sm" data-sc="${i}">🔗 Share</button><button class="ghost sm" data-d="${i}">Delete</button></div></div>`).join(''):'<div class="card"><p>No cafes found. Clear a filter or add your own.</p><button class="sm" data-f="cform">Add a cafe</button></div>'}
$('#cform').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const cc=CITYC[d.get('city')];C.unshift({name:d.get('name'),city:d.get('city'),...(cc?{lat:cc[0],lng:cc[1]}:{}),drink:d.get('drink'),...Object.fromEntries(Object.entries(tg).filter(([,v])=>v).map(([k])=>[k,1]))});save('tk_cafes4',C);e.target.reset();tg={};drawT();drawC();toast('✓ Cafe added. Saved offline on this device')};
$('#clist').onclick=e=>{if(e.target.dataset.d){const i=+e.target.dataset.d,[x]=C.splice(i,1);save('tk_cafes4',C);drawC();toast('Cafe deleted',()=>{C.splice(i,0,x);save('tk_cafes4',C);drawC()})}};$('#cfilter').onchange=drawC;save('tk_cafes4',C);drawA();drawC();
$('#near').onclick=()=>{if(!navigator.geolocation){$('#nearmsg').textContent='Location is not available here. Use the City filter instead.';return}$('#nearmsg').textContent='Finding you...';navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};$('#nearmsg').textContent='Sorted by distance (approximate)';drawC()},()=>{$('#nearmsg').textContent='Location is off, so cafes are not sorted by distance. Allow location in your browser settings, or use the City filter.'},{timeout:10000})};
document.addEventListener('click',e=>{const d=e.target.dataset;if(d.f){const f=document.getElementById(d.f);f.scrollIntoView({behavior:'smooth'});f.querySelector('input').focus()}if(d.sc!==undefined){const c=C[+d.sc];share('☕ '+c.name+' ('+(c.area||c.city)+') - '+(c.drink||'great coffee')+'. Found on TalaKape PH.',mu(c))}if(d.sb!==undefined){const b=J[+d.sb];share('☕ '+b.roaster+' - '+b.origin+' ('+b.variety+'), rated '+b.rating+'/5. Logged on TalaKape PH.',location.href.split('#')[0])}});
document.addEventListener('click',e=>{const b=e.target;if(b.dataset.x){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'talakape',beans:J,cafes:C},null,2)],{type:'application/json'}));a.download='talakape-backup.json';a.click();toast('✓ Backup exported')}if(b.dataset.i)$('#impf').click()});
$('#impf').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!Array.isArray(d.beans)||!Array.isArray(d.cafes))throw 0;J=d.beans.map(b=>({...b,rating:Math.min(5,Math.max(1,+b.rating||3))}));C=d.cafes;save('tk_beans',J);save('tk_cafes4',C);drawJ();drawC();toast('✓ Backup imported')}catch{toast('That file is not a TalaKape backup')}e.target.value=''};
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
