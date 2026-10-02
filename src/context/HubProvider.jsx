import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import PropTypes from 'prop-types'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore'

import { db } from '../firebase/config.js'
import { HubContext } from './HubContext.js'
import useAuth from '../hooks/useAuth.js'
import { findSelfCareType } from '../data/selfCareTypes.js'
import { sample_counsellors as sampleCounsellors } from '../data/counsellors.js'
import { resources as sampleResources } from '../data/resources.js'

export const initialHubState = { bookings: [], activities: [], moods: [], hydrated: false }

function normalize(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

function subscribeToCollection(name, setItems, setHasItems) {
  return onSnapshot(collection(db, name), (snapshot) => {
    setItems(normalize(snapshot))
    setHasItems(!snapshot.empty)
  }, (error) => {
    setItems([])
    setHasItems(false)
    console.warn(`${name} Firestore sync:`, error.message)
  })
}

export function hubReducer(state, action) {
  if (action.type === 'SYNC') return { ...state, [action.collection]: action.payload, hydrated: true }
  if (action.type === 'RESET') return initialHubState
  return state
}

export default function HubProvider({ children }) {
  const { firebaseUser, student, isAdmin, isCounsellor, isStudent } = useAuth()
  const [state, dispatch] = useReducer(hubReducer, initialHubState)
  const [syncError, setSyncError] = useState('')

  // Firestore-synced counsellors and blogs
  const [counsellors, setCounsellors] = useState([])
  const [counsellorsFromFirestore, setCounsellorsFromFirestore] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [blogsFromFirestore, setBlogsFromFirestore] = useState(false)
  const [allAppointments, setAllAppointments] = useState([])

  // Real-time listener for Counsellors collection
  useEffect(() => {
    return subscribeToCollection('counsellors', setCounsellors, setCounsellorsFromFirestore)
  }, [])

  // Real-time listener for Blogs collection
  useEffect(() => {
    return subscribeToCollection('blogs', setBlogs, setBlogsFromFirestore)
  }, [])

  // Real-time listener for User-specific data (bookings, activities, moods)
  useEffect(() => {
    if (!firebaseUser) {
      dispatch({ type: 'RESET' })
      return undefined
    }

    setSyncError('')
    const names = ['bookings', 'activities', 'moods']
    const unsubscribers = names.map((name) => {
      const ref = collection(db, 'users', firebaseUser.uid, name)
      return onSnapshot(query(ref, orderBy('createdAt', 'desc')), (snapshot) => {
        dispatch({ type: 'SYNC', collection: name, payload: normalize(snapshot) })
      }, (error) => setSyncError(error.message))
    })

    // Staff appointment visibility is role-scoped. Students use their private booking collection.
    let unsubAppts = () => {}
    if (isAdmin) {
      unsubAppts = onSnapshot(query(collection(db, 'appointments'), orderBy('createdAt', 'desc')), (snapshot) => {
        setAllAppointments(normalize(snapshot))
      }, (error) => setSyncError(error.message))
    } else if (isCounsellor && student?.counsellorId) {
      unsubAppts = onSnapshot(query(
        collection(db, 'appointments'),
        where('counsellorId', '==', student.counsellorId),
        orderBy('createdAt', 'desc'),
      ), (snapshot) => setAllAppointments(normalize(snapshot)), (error) => setSyncError(error.message))
    } else {
      setAllAppointments([])
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      unsubAppts()
    }
  }, [firebaseUser, isAdmin, isCounsellor, student?.counsellorId])

  const userCollection = useCallback((name) => {
    if (!firebaseUser) throw new Error('You must be signed in.')
    return collection(db, 'users', firebaseUser.uid, name)
  }, [firebaseUser])

  // Book session (Student appointment creation)
  const bookSession = useCallback(async ({ counsellor, slot, topic, notes, urgency = 'routine' }) => {
    if (!isStudent) throw new Error('Only student accounts can book appointments.')
    if (state.bookings.some((booking) => booking.slotId === slot.id && booking.status !== 'cancelled')) return null
    const payload = {
      slotId: slot.id,
      counsellorId: counsellor.id,
      counsellorName: counsellor.name,
      counsellorRole: counsellor.role,
      studentUid: firebaseUser?.uid || '',
      studentName: student?.name || 'Student',
      studentEmail: student?.email || '',
      studentId: student?.studentId || '',
      date: slot.date,
      day: slot.day,
      time: slot.time,
      topic,
      notes: notes || '',
      urgency,
      status: 'confirmed',
      createdAt: serverTimestamp(),
      createdAtClient: new Date().toISOString(),
    }
    const created = await addDoc(userCollection('bookings'), payload)

    // Also record in central appointments collection so counsellors/admins can view it
    try {
      await addDoc(collection(db, 'appointments'), {
        ...payload,
        userBookingId: created.id,
      })
    } catch (e) {
      console.warn('Central appointment sync:', e.message)
    }

    return { id: created.id, ...payload }
  }, [state.bookings, userCollection, firebaseUser, student, isStudent])

  const cancelBooking = useCallback(async (id) => {
    await updateDoc(doc(userCollection('bookings'), id), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
    })
  }, [userCollection])

  const deleteBooking = useCallback((id) => deleteDoc(doc(userCollection('bookings'), id)), [userCollection])

  // Admin action: Create a new Counsellor in Firestore
  const addCounsellor = useCallback(async (counsellorData) => {
    if (!isAdmin) throw new Error('Administrator access is required.')
    const id = `c-${Date.now()}`
    const initials = (counsellorData.name || 'CN')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const focusList = Array.isArray(counsellorData.focus)
      ? counsellorData.focus
      : (counsellorData.focus || '')
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean)

    const langList = Array.isArray(counsellorData.languages)
      ? counsellorData.languages
      : (counsellorData.languages ? counsellorData.languages.split(',').map((l) => l.trim()).filter(Boolean) : ['English'])

    const newDoc = {
      id,
      name: counsellorData.name.trim(),
      role: counsellorData.role.trim() || 'Student Counsellor',
      focus: focusList.length ? focusList : ['General wellbeing', 'Stress'],
      languages: langList,
      location: counsellorData.location || 'Wellbeing Centre',
      bio: counsellorData.bio || 'Dedicated to supporting students through their academic journey and personal wellbeing.',
      avatarInitials: counsellorData.avatarInitials || initials,
      accent: counsellorData.accent || 'brand',
      slots: counsellorData.slots && counsellorData.slots.length ? counsellorData.slots : [
        { id: `s-${id}-1`, day: 'Mon', date: '2026-10-05', time: '09:30', enabled: true },
        { id: `s-${id}-2`, day: 'Wed', date: '2026-10-07', time: '13:00', enabled: true },
        { id: `s-${id}-3`, day: 'Fri', date: '2026-10-09', time: '15:30', enabled: true },
      ],
      createdAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'counsellors', id), newDoc)
    return newDoc
  }, [isAdmin])

  const updateCounsellorSlots = useCallback(async (counsellorId, slots) => {
    const canManageSlots = isAdmin
      || (isCounsellor && student?.counsellorId === counsellorId)

    if (!canManageSlots) {
      throw new Error('You do not have permission to manage these time slots.')
    }

    const normalizedSlots = slots
      .map((slot) => ({
        id: slot.id,
        day: slot.day,
        date: slot.date,
        time: slot.time,
        enabled: slot.enabled !== false,
      }))
      .sort((first, second) =>
        `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`),
      )

    await updateDoc(doc(db, 'counsellors', counsellorId), {
      slots: normalizedSlots,
      updatedAt: serverTimestamp(),
    })

    setCounsellors((current) =>
      current.map((counsellor) =>
        counsellor.id === counsellorId
          ? { ...counsellor, slots: normalizedSlots }
          : counsellor,
      ),
    )

    return normalizedSlots
  }, [isAdmin, isCounsellor, student?.counsellorId])

  // Admin & Counsellor action: Create a new Blog/Resource in Firestore
  const addBlog = useCallback(async (blogData) => {
    if (!isAdmin && !isCounsellor) throw new Error('Staff access is required.')
    const id = `b-${Date.now()}`
    const bodyParagraphs = Array.isArray(blogData.body)
      ? blogData.body
      : (blogData.body || '')
          .split('\n\n')
          .map((p) => p.trim())
          .filter(Boolean)

    const takeawaysList = Array.isArray(blogData.takeaways)
      ? blogData.takeaways
      : (blogData.takeaways || '')
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean)

    const tagsList = Array.isArray(blogData.tags)
      ? blogData.tags
      : (blogData.tags || '')
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)

    const newDoc = {
      id,
      title: blogData.title.trim(),
      category: blogData.category || 'Anxiety',
      type: blogData.type || 'Article',
      minutes: Number(blogData.minutes) || 5,
      summary: blogData.summary || '',
      author: blogData.author || student?.name || 'Wellbeing Counsellor',
      authorRole: blogData.authorRole || student?.role || 'Staff',
      body: bodyParagraphs.length ? bodyParagraphs : [blogData.summary || 'Content coming soon.'],
      takeaways: takeawaysList,
      tags: tagsList.length ? tagsList : ['wellbeing', 'student-life'],
      createdAt: serverTimestamp(),
      createdAtClient: new Date().toISOString(),
    }

    await setDoc(doc(db, 'blogs', id), newDoc)
    return newDoc
  }, [student])

  // Seed sample data to Firestore (populates both counsellors and blogs collections)
  const seedSampleData = useCallback(async () => {
    if (!isAdmin) throw new Error('Administrator access is required.')
    const batch = writeBatch(db)

    sampleCounsellors.forEach((c) => {
      const { id, ...data } = c
      batch.set(doc(db, 'counsellors', id), {
        id,
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    })

    sampleResources.forEach((r) => {
      const { id, ...data } = r
      batch.set(doc(db, 'blogs', id), {
        id,
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    })

    await batch.commit()

    return {
      counsellorsCount: sampleCounsellors.length,
      blogsCount: sampleResources.length,
    }
  }, [isAdmin])

  // Helpers to find counsellor and blog
  const findCounsellorById = useCallback(
    (id) => counsellors.find((counsellor) => counsellor.id === id),
    [counsellors],
  )

  const findBlogById = useCallback(
    (id) => blogs.find((blog) => blog.id === id),
    [blogs],
  )

  const logActivity = useCallback(async ({ typeId, minutes, note }) => {
    const type = findSelfCareType(typeId)
    const now = new Date()
    const payload = {
      typeId,
      label: type?.label || typeId,
      icon: type?.icon || '✓',
      points: type?.points || 1,
      minutes: Number(minutes) || 0,
      note: note || '',
      day: now.toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
      loggedAt: now.toISOString(),
    }
    const created = await addDoc(userCollection('activities'), payload)
    return { id: created.id, ...payload }
  }, [userCollection])

  const removeActivity = useCallback((id) => deleteDoc(doc(userCollection('activities'), id)), [userCollection])

  const recordMood = useCallback(async (value) => {
    const now = new Date()
    const day = now.toISOString().slice(0, 10)
    const ref = doc(userCollection('moods'), day)
    const payload = {
      value: Number(value),
      day,
      recordedAt: now.toISOString(),
      createdAt: serverTimestamp(),
    }
    await setDoc(ref, payload, { merge: true })
    return { id: day, ...payload }
  }, [userCollection])

  const clearAll = useCallback(async () => {
    if (!firebaseUser) return
    const batch = writeBatch(db)
    for (const name of ['bookings', 'activities', 'moods']) {
      state[name].forEach((item) => batch.delete(doc(db, 'users', firebaseUser.uid, name, item.id)))
    }
    await batch.commit()
  }, [firebaseUser, state])

  const value = useMemo(() => ({
    ...state,
    syncError,
    isCloudSynced: Boolean(firebaseUser),
    counsellors,
    counsellorsFromFirestore,
    blogs,
    blogsFromFirestore,
    allAppointments,
    findCounsellorById,
    findBlogById,
    addCounsellor,
    updateCounsellorSlots,
    addBlog,
    seedSampleData,
    bookSession,
    cancelBooking,
    deleteBooking,
    logActivity,
    removeActivity,
    recordMood,
    clearAll,
  }), [
    state,
    syncError,
    firebaseUser,
    counsellors,
    counsellorsFromFirestore,
    blogs,
    blogsFromFirestore,
    allAppointments,
    findCounsellorById,
    findBlogById,
    addCounsellor,
    updateCounsellorSlots,
    addBlog,
    seedSampleData,
    bookSession,
    cancelBooking,
    deleteBooking,
    logActivity,
    removeActivity,
    recordMood,
    clearAll,
  ])

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>
}

HubProvider.propTypes = { children: PropTypes.node.isRequired }
