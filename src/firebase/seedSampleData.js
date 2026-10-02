import { deleteApp, initializeApp } from 'firebase/app'
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth'
import { collection, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'

import { sample_counsellors as counsellors } from '../data/counsellors.js'
import { app, db } from './config.js'

const preferences = {
  reminders: true,
  shareAnonymousStats: false,
  preferredMode: 'Video call',
}

const students = [
  { email: 'student1@wellbeing.test', name: 'Maya Silva', studentId: 'S-2026-001', course: 'Computer Science', year: 2 },
  { email: 'student2@wellbeing.test', name: 'Dilan Perera', studentId: 'S-2026-002', course: 'Business Management', year: 1 },
  { email: 'student3@wellbeing.test', name: 'Anuki Fernando', studentId: 'S-2026-003', course: 'Engineering', year: 3 },
]

async function createAccount(account, password, index) {
  const secondaryApp = initializeApp(app.options, `sample-seed-${Date.now()}-${index}`)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, account.email, password)
    await updateProfile(credential.user, { displayName: account.name })

    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: account.email,
      name: account.name,
      role: account.role,
      studentId: account.studentId || '',
      counsellorId: account.counsellorId || '',
      course: account.course || '',
      year: account.year || 1,
      photoURL: '',
      preferences,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return { email: account.email, status: 'created' }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      return { email: account.email, status: 'existing' }
    }
    throw error
  } finally {
    await deleteApp(secondaryApp)
  }
}

export async function seedSampleDataInBrowser(password) {
  if (!password || password.length < 8) {
    throw new Error('Enter a sample password containing at least 8 characters.')
  }

  const counsellorAccounts = counsellors.map((counsellor, index) => ({
    email: `counsellor${index + 1}@wellbeing.test`,
    name: counsellor.name,
    role: 'counsellor',
    counsellorId: counsellor.id,
  }))
  const accounts = [
    ...students.map((student) => ({ ...student, role: 'student' })),
    ...counsellorAccounts,
  ]

  const batch = writeBatch(db)
  for (const counsellor of counsellors) {
    batch.set(doc(collection(db, 'counsellors'), counsellor.id), {
      ...counsellor,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }
  await batch.commit()

  const results = []
  for (const [index, account] of accounts.entries()) {
    results.push(await createAccount(account, password, index))
  }

  return {
    students: students.length,
    counsellors: counsellorAccounts.length,
    created: results.filter((result) => result.status === 'created').length,
    existing: results.filter((result) => result.status === 'existing').length,
  }
}