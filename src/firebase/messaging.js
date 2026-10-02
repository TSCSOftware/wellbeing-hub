import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { app, db } from './config.js'

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function enableNotifications(uid) {
  if (!uid) throw new Error('Sign in before enabling notifications.')
  if (!(await isSupported())) throw new Error('Push messaging is not supported in this browser.')
  if (!vapidKey) throw new Error('Add VITE_FIREBASE_VAPID_KEY before enabling notifications.')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notification permission was not granted.')

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  const messaging = getMessaging(app)
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
  if (!token) throw new Error('Firebase did not return a messaging token.')

  const userDoc = await getDoc(doc(db, 'users', uid))
  const previousToken = userDoc.data()?.preferences?.fcmToken

  if (previousToken === token) return token

  if (previousToken && previousToken !== token) {
    await deleteDoc(doc(db, 'users', uid, 'notificationTokens', previousToken))
  }

  await setDoc(doc(db, 'users', uid, 'notificationTokens', token), {
    token,
    platform: navigator.userAgent,
    enabled: true,
    updatedAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'users', uid), {
    'preferences.fcmToken': token,
    'preferences.fcmEnabled': true,
    'preferences.fcmUpdatedAt': serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return token
}

export async function disableNotifications(uid, token) {
  if (!token) return
  if (await isSupported()) await deleteToken(getMessaging(app))
}

export async function subscribeToForegroundMessages(callback) {
  if (!(await isSupported())) return () => {}
  return onMessage(getMessaging(app), callback)
}

export function showLocalNotification({ title, body, url = '/dashboard' }) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false

  const targetUrl = new URL(url, window.location.origin)
  if (targetUrl.origin !== window.location.origin) return false

  const notification = new Notification(title, {
    body,
    icon: '/logo-192.png',
    data: { url: targetUrl.href },
  })
  notification.onclick = () => {
    window.focus()
    window.location.assign(targetUrl.href)
  }

  return true
}
