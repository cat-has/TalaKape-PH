const V='v5',STATIC_CACHE='talakape-static-'+V,DYNAMIC_CACHE='talakape-dyn-'+V;
const SHELL=['./','./index.html','./offline.html','./css/styles.css','./js/app.js','./manifest.webmanifest','./favicon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>![STATIC_CACHE,DYNAMIC_CACHE].includes(n)).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(DYNAMIC_CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')).then(m=>m||caches.match('./offline.html'))));return}
e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(DYNAMIC_CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match('./offline.html'))))});
self.addEventListener('push',e=>{const d=e.data?e.data.text():'Your coffee needs attention.';e.waitUntil(self.registration.showNotification('TalaKape PH',{body:d,icon:'icons/icon-192.png',badge:'icons/icon-96.png'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('./index.html'))});
