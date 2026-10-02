import { findSelfCareType } from '../data/selfCareTypes.js'

const AUTH_KEY = 'swh.student'
const HUB_KEY = 'swh.hub'
const THEME_KEY = 'swh.theme'
const listeners = new Set()

function readJson(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    window.localStorage.removeItem(key)
    return fallback
  }
}

function readTheme() {
  const saved = window.localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const savedHub = readJson(HUB_KEY, {})

let state = {
  student: readJson(AUTH_KEY, null),
  theme: readTheme(),
  bookings: savedHub.bookings ?? [],
  activities: savedHub.activities ?? [],
  moods: savedHub.moods ?? [],
}

function persist() {
  if (state.student) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(state.student))
  } else {
    window.localStorage.removeItem(AUTH_KEY)
  }

  window.localStorage.setItem(THEME_KEY, state.theme)
  window.localStorage.setItem(
    HUB_KEY,
    JSON.stringify({
      bookings: state.bookings,
      activities: state.activities,
      moods: state.moods,
    }),
  )
}

function update(patch) {
  state = { ...state, ...patch }
  persist()
  listeners.forEach((listener) => listener())
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function calculateStats() {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = state.activities.filter(
    (activity) => new Date(activity.loggedAt).getTime() >= sevenDaysAgo,
  )
  const upcoming = state.bookings
    .filter((booking) => booking.status === 'confirmed')
    .slice()
    .sort((first, second) =>
      `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`),
    )
  const weeklyPoints = recent.reduce(
    (total, activity) => total + activity.points,
    0,
  )
  const weeklyMinutes = recent.reduce(
    (total, activity) => total + activity.minutes,
    0,
  )
  const latestMood = state.moods
    .slice()
    .sort((first, second) => second.day.localeCompare(first.day))[0]
  const averageMood = state.moods.length
    ? state.moods.reduce((total, mood) => total + mood.value, 0) /
      state.moods.length
    : 0
  const loggedDays = new Set(state.activities.map((activity) => activity.day))
  const cursor = new Date()
  let streak = 0

  for (let index = 0; index < 365; index += 1) {
    const day = cursor.toISOString().slice(0, 10)
    if (loggedDays.has(day)) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else if (index === 0) {
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return {
    weeklyPoints,
    weeklyMinutes,
    weeklyActivities: recent.length,
    activeDays: new Set(recent.map((activity) => activity.day)).size,
    streak,
    upcoming,
    nextSession: upcoming[0] ?? null,
    totalBookings: state.bookings.length,
    latestMood: latestMood ?? null,
    averageMood: Math.round(averageMood * 10) / 10,
    weeklyGoalPercent: Math.min(100, Math.round((weeklyPoints / 20) * 100)),
  }
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAuthSnapshot() {
  return state.student
}

export function getThemeSnapshot() {
  return state.theme
}

export function getHubSnapshot() {
  return state
}

export const authActions = {
  login({ studentId, name }) {
    const cleanId = studentId.trim()
    const student = {
      studentId: cleanId.toUpperCase(),
      name: name.trim() || 'Student',
      course: 'BSc (Hons) Software Engineering',
      year: 2,
      email: `${cleanId.toLowerCase()}@students.edu`,
      joinedAt: new Date().toISOString(),
      preferences: {
        reminders: true,
        shareAnonymousStats: false,
        preferredMode: 'Video call',
      },
    }
    update({ student })
    return student
  },
  logout() {
    update({ student: null })
  },
  updateProfile(patch) {
    if (state.student) {
      update({ student: { ...state.student, ...patch } })
    }
  },
  updatePreferences(patch) {
    if (state.student) {
      update({
        student: {
          ...state.student,
          preferences: { ...state.student.preferences, ...patch },
        },
      })
    }
  },
}

export function toggleTheme() {
  const theme = state.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.classList.toggle('dark', theme === 'dark')
  update({ theme })
}

document.documentElement.classList.toggle('dark', state.theme === 'dark')

export const hubActions = {
  bookSession({ counsellor, slot, mode, topic, notes, urgency }) {
    const alreadyTaken = state.bookings.some(
      (booking) =>
        booking.slotId === slot.id && booking.status !== 'cancelled',
    )
    if (alreadyTaken) return null

    const booking = {
      id: uid('bk'),
      slotId: slot.id,
      counsellorId: counsellor.id,
      counsellorName: counsellor.name,
      counsellorRole: counsellor.role,
      date: slot.date,
      day: slot.day,
      time: slot.time,
      mode,
      topic,
      notes,
      urgency,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }
    update({ bookings: [booking, ...state.bookings] })
    return booking
  },
  cancelBooking(id) {
    update({
      bookings: state.bookings.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
            }
          : booking,
      ),
    })
  },
  deleteBooking(id) {
    update({
      bookings: state.bookings.filter((booking) => booking.id !== id),
    })
  },
  logActivity({ typeId, minutes, note }) {
    const type = findSelfCareType(typeId)
    const now = new Date()
    const entry = {
      id: uid('ac'),
      typeId,
      label: type ? type.label : typeId,
      icon: type ? type.icon : '✅',
      points: type ? type.points : 1,
      minutes: Number(minutes) || 0,
      note: note || '',
      loggedAt: now.toISOString(),
      day: now.toISOString().slice(0, 10),
    }
    update({ activities: [entry, ...state.activities] })
    return entry
  },
  removeActivity(id) {
    update({
      activities: state.activities.filter((activity) => activity.id !== id),
    })
  },
  recordMood(value) {
    const now = new Date()
    const day = now.toISOString().slice(0, 10)
    const entry = {
      id: uid('md'),
      value: Number(value),
      day,
      recordedAt: now.toISOString(),
    }
    update({
      moods: [entry, ...state.moods.filter((mood) => mood.day !== day)],
    })
    return entry
  },
  clearAll() {
    update({ bookings: [], activities: [], moods: [] })
  },
}

export { calculateStats }