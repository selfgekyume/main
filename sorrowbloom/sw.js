// Sorrowbloom offline cache.
// The game page is network-first, so a phone with signal always gets the newest build and falls back to the
// cached copy offline. Icons and fonts are served from cache and refreshed in the background.
// version.json is never cached: the page uses it to notice updates.
const CACHE='sorrowbloom-2026.10.01-2156';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','icon-maskable-512.png'];
const FONT_CSS='https://fonts.googleapis.com/css2?family=Pirata+One&family=Silkscreen&family=VT323&display=swap';
const FONT_HOSTS=['fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})));
    // best effort: fonts make it look right offline, but a failure here must not block install
    try{
      const css=await fetch(FONT_CSS,{mode:'cors'});
      if(css.ok){
        const text=await css.clone().text();
        await c.put(FONT_CSS,css);
        const files=[...text.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]);
        await Promise.all(files.map(u=>fetch(u,{mode:'cors'}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})));
      }
    }catch(err){}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k.startsWith('sorrowbloom-')&&k!==CACHE)await caches.delete(k);
    await self.clients.claim();
  })());
});

function timeout(ms){return new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))}

async function networkFirst(req){
  const c=await caches.open(CACHE),key=req.url.split('?')[0];
  try{
    // no-cache: revalidate with GitHub Pages instead of trusting the browser's 10 minute HTTP cache
    const res=await Promise.race([fetch(new Request(key,{cache:'no-cache',credentials:'same-origin'})),timeout(5000)]);
    if(res.ok){c.put(key,res.clone());return res}
    throw new Error('bad status');
  }catch(err){
    return(await c.match(key))||(await c.match('index.html'))||(await c.match('./'))||Response.error();
  }
}

async function staleWhileRevalidate(req){
  const c=await caches.open(CACHE),hit=await c.match(req,{ignoreVary:true});
  const fresh=fetch(req).then(res=>{if(res.ok||res.type==='opaque')c.put(req,res.clone());return res}).catch(()=>null);
  return hit||(await fresh)||Response.error();
}

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url),same=url.origin===self.location.origin;
  if(same&&url.pathname.endsWith('/version.json'))return;
  if(req.mode==='navigate'||(same&&(url.pathname.endsWith('/')||url.pathname.endsWith('.html')))){e.respondWith(networkFirst(req));return}
  if(same||FONT_HOSTS.includes(url.hostname))e.respondWith(staleWhileRevalidate(req));
});
