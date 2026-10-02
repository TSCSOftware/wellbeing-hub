import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'

import { auth, db } from '../firebase/config.js'
import { AuthContext } from './AuthContext.js'

const defaultPreferences = {
  reminders: true,
  shareAnonymousStats: false,
  preferredMode: 'Video call',
}

function profileFromUser(user, data = {}) {
  return {
    uid: user.uid,
    email: user.email,
    name: data.name || user.displayName || 'Student',
    role: data.role || 'student', // 'student' | 'counsellor' | 'admin'
    studentId: data.studentId || '',
    counsellorId: data.counsellorId || '',
    course: data.course || '',
    year: data.year || 1,
    photoURL: data.photoURL || user.photoURL || '',
    joinedAt: data.joinedAt || user.metadata?.creationTime || new Date().toISOString(),
    preferences: { ...defaultPreferences, ...(data.preferences || {}) },
  }
}

export default function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [booting, setBooting] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let stopProfile = () => { }
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopProfile()
      setFirebaseUser(user)
      if (!user) {
        setStudent(null)
        setBooting(false)
        return
      }
      setStudent((prev) => prev || profileFromUser(user))
      stopProfile = onSnapshot(doc(db, 'users', user.uid), async (snapshot) => {
        if (snapshot.exists()) {
          setStudent(profileFromUser(user, snapshot.data()))
        } else {
          const profile = profileFromUser(user)
          await setDoc(doc(db, 'users', user.uid), { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
          setStudent(profile)
        }
        setBooting(false)
      }, (error) => {
        setAuthError(error.message)
        setStudent((prev) => prev || profileFromUser(user))
        setBooting(false)
      })
    })
    return () => { stopProfile(); stopAuth() }
  }, [])

  useEffect(() => {
    if (
      !firebaseUser
      || typeof Notification === 'undefined'
      || Notification.permission !== 'granted'
    ) {
      return undefined
    }

    let isActive = true
    let stopForegroundMessages = () => {}

    async function refreshNotificationToken() {
      try {
        const {
          enableNotifications,
          subscribeToForegroundMessages,
        } = await import('../firebase/messaging.js')
        await enableNotifications(firebaseUser.uid)

        const unsubscribe = await subscribeToForegroundMessages((payload) => {
          const title = payload.notification?.title || payload.data?.title || 'Student Wellbeing Hub'
          const body = payload.notification?.body || payload.data?.body || 'You have a new wellbeing update.'
          const requestedUrl = payload.data?.url || '/dashboard'
          const targetUrl = new URL(requestedUrl, window.location.origin)

          if (targetUrl.origin !== window.location.origin) return

          const notification = new Notification(title, {
            body,
            icon: '/logo-192.png',
            data: { url: targetUrl.href },
          })
          notification.onclick = () => {
            window.focus()
            window.location.assign(targetUrl.href)
          }
        })

        if (isActive) stopForegroundMessages = unsubscribe
        else unsubscribe()
      } catch (error) {
        if (isActive) {
          console.warn('Notification setup:', error.message)
        }
      }
    }

    refreshNotificationToken()
    return () => {
      isActive = false
      stopForegroundMessages()
    }
  }, [firebaseUser])

  const login = useCallback(async ({ email, password }) => {
    setAuthError('')
    return signInWithEmailAndPassword(auth, email.trim(), password)
  }, [])

  const register = useCallback(async ({ email, password, name, studentId, course = '', year = 1 }) => {
    setAuthError('')
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateFirebaseProfile(credential.user, { displayName: name.trim() })
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: credential.user.email,
      name: name.trim(),
      role: 'student',
      studentId: studentId ? studentId.trim().toUpperCase() : '',
      course: course || '',
      year: Number(year) || 1,
      photoURL: '',
      preferences: defaultPreferences,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return credential
  }, [])

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email.trim()), [])
  const logout = useCallback(() => signOut(auth), [])

  const updateProfile = useCallback(async (patch) => {
    if (!auth.currentUser) throw new Error('You must be signed in.')
    if (patch.name && patch.name !== auth.currentUser.displayName) {
      await updateFirebaseProfile(auth.currentUser, { displayName: patch.name })
    }
    await setDoc(doc(db, 'users', auth.currentUser.uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
  }, [])

  const updatePreferences = useCallback(async (patch) => {
    if (!auth.currentUser) throw new Error('You must be signed in.')
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      preferences: { ...(student?.preferences || defaultPreferences), ...patch },
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }, [student])

  const role = student?.role || 'student'
  const isAdmin = role === 'admin'
  const isCounsellor = role === 'counsellor'
  const isStudent = role === 'student'

  const value = useMemo(() => ({
    firebaseUser,
    student,
    role,
    isAdmin,
    isCounsellor,
    isStudent,
    booting,
    authError,
    isLoggedIn: Boolean(firebaseUser && student),
    login,
    register,
    resetPassword,
    logout,
    updateProfile,
    updatePreferences,
  }), [firebaseUser, student, role, isAdmin, isCounsellor, isStudent, booting, authError, login, register, resetPassword, logout, updateProfile, updatePreferences])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired }
