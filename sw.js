const CACHE='family-diet-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS))
  );
});

self.addEventListener('activate',e=>
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys=>
        Promise.all(
          keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
        )
      ),
      self.clients.claim()
    ])
  )
);

self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request)
        .then(r=>{
          let copy=r.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',copy));
          return r;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r=>
      r || fetch(e.request).then(net=>{
        if(e.request.method==='GET' && net.ok){
          let copy=net.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
        }
        return net;
      })
    )
  );
});
