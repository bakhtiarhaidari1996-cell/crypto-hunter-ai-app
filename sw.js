"use strict";
const CACHE_PREFIX="ch-pwa-shell-";
const CACHE_NAME=CACHE_PREFIX+"v264-1";
const BASE=new URL("./",self.registration.scope);
const SHELL=BASE.href;
const STATIC=[new URL("manifest.json",BASE).href,new URL("icon.svg",BASE).href];
self.addEventListener("install",event=>{event.waitUntil((async()=>{const c=await caches.open(CACHE_NAME);await c.addAll([SHELL,...STATIC]);await self.skipWaiting()})())});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener("fetch",event=>{const req=event.request;if(req.method!=="GET")return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;if(url.pathname.includes("/api/")||url.pathname.endsWith("/api"))return;if(req.mode==="navigate"){event.respondWith((async()=>{try{const res=await fetch(req);if(res&&res.ok){const c=await caches.open(CACHE_NAME);await c.put(SHELL,res.clone())}return res}catch(e){return(await caches.match(req))||(await caches.match(SHELL))||Response.error()}})());return}if(STATIC.includes(url.href)){event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;try{const res=await fetch(req);if(res&&res.ok)(await caches.open(CACHE_NAME)).put(req,res.clone());return res}catch(e){return Response.error()}})())}});
