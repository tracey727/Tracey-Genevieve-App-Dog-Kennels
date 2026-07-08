const CACHE_NAME='genevieve-kennels-v6';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);const appCode=u.pathname.endsWith('app.js')||u.pathname.endsWith('index.html')||u.pathname.endsWith('/');
if(appCode){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))}
else{e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))}});
