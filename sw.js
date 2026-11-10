/* 在庫管理アプリ service worker（このファイルを在庫管理アプリのHTMLと同じ場所に置いてください） */
const CACHE='zaiko-v1',FONTS='zaiko-fonts';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.add(new Request('./',{cache:'reload'})).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k.startsWith('zaiko-')&&k!==CACHE&&k!==FONTS).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    if(u.searchParams.has('_'))return; /* アップデート確認は常にネットワークへ */
    e.respondWith(fetch(r).then(res=>{
      if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./'):Response.error()))));
    return;
  }
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)||(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/'))){
    e.respondWith(caches.open(FONTS).then(c=>c.match(r).then(m=>{
      const f=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>m);
      return m||f;
    })));
  }
});
