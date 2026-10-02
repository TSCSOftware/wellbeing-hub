/* Firebase Messaging background service worker. Firebase web config is public;
   Firestore and Storage rules are the actual security boundary. */
const APP_CACHE = 'student-wellbeing-shell-v3'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo(2).ico',
  '/logo-192.png',
  '/logo.png',
]
const FIREBASE_SDK_URLS = [
  'https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js',
]

async function cacheExternalAssets(cache, urls) {
  await Promise.allSettled(urls.map(async (url) => {
    const response = await fetch(url, { mode: 'no-cors', cache: 'no-cache' })
    if (response.ok || response.type === 'opaque') {
      await cache.put(url, response)
    }
  }))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then(async (cache) => {
      await cache.addAll(APP_SHELL)
      await cacheExternalAssets(cache, FIREBASE_SDK_URLS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('student-wellbeing-shell-') && key !== APP_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname === '/firebase-messaging-sw.js') return

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request)

      if (request.mode === 'navigate') {
        try {
          return await fetch(request)
        } catch {
          return cachedResponse || (await caches.match('/index.html')) || new Response('Offline', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        }
      }

      try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
          const responseCopy = networkResponse.clone()
          const cache = await caches.open(APP_CACHE)
          await cache.put(request, responseCopy)
        }
        return networkResponse
      } catch {
        return cachedResponse || Response.error()
      }
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const firebaseMessage = event.notification.data?.FCM_MSG
  const requestedUrl = event.notification.data?.url
    || firebaseMessage?.data?.url
    || firebaseMessage?.fcmOptions?.link
    || '/dashboard'
  const targetUrl = new URL(requestedUrl, self.location.origin)

  if (targetUrl.origin !== self.location.origin) return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
      const existingWindow = windows.find((client) => {
        const clientUrl = new URL(client.url)
        return clientUrl.origin === targetUrl.origin
      })

      if (existingWindow) {
        await existingWindow.navigate(targetUrl.href)
        return existingWindow.focus()
      }

      return self.clients.openWindow(targetUrl.href)
    }),
  )
})

importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCJZbhPM7Pi7IQLjY9ZzQv-RV_3ZuNLF3M',
  authDomain: 'test-7c710.firebaseapp.com',
  projectId: 'test-7c710',
  storageBucket: 'test-7c710.firebasestorage.app',
  messagingSenderId: '659978161434',
  appId: '1:659978161434:web:6b7eed5625ec45772730a3',
})

firebase.messaging().onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Student Wellbeing Hub'
  const body = payload.notification?.body || payload.data?.body || 'You have a new wellbeing update.'
  const url = payload.data?.url || payload.fcmOptions?.link || '/dashboard'

  const options = {
    body,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    tag: payload.data?.notificationId || 'student-wellbeing-update',
    data: { url },
  }

  return self.registration.showNotification(title, options)
})
