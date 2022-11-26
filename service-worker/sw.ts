import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
/*
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
*/

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

const entries = self.__WB_MANIFEST
if (import.meta.env.DEV)
  entries.push({ url: '/error', revision: Math.random().toString() })

precacheAndRoute(entries)

// clean old assets
cleanupOutdatedCaches()

// allow only fallback in dev: we don't want to cache anything
let allowlist: undefined | RegExp[]
if (import.meta.env.DEV)
  allowlist = [/^\/error$/]

// deny api calls
let denylist: undefined | RegExp[]
if (import.meta.env.PROD)
  denylist = [/^\/api\//, /^\/login\//, /^\/oauth\//, /^\/signin\//]

// only cache pages and external assets on local build + start or in production
if (import.meta.env.PROD) {
  // external assets: rn avatars from mas.to
  // requires <img crossorigin="anonymous".../> and http header: Allow-Control-Allow-Origin: *
/*
  registerRoute(
    ({ sameOrigin, request }) => !sameOrigin && request.destination === 'image',
    new NetworkFirst({
      cacheName: 'elk-external-media',
      plugins: [
        // add opaque responses?
        new CacheableResponsePlugin({ statuses: [/!* 0, *!/200] }),
        // 15 days max
        new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 15 }),
      ],
    }),
  )
*/
}

// to allow work offline
registerRoute(new NavigationRoute(
  createHandlerBoundToURL('/error'),
  { allowlist, denylist },
))

