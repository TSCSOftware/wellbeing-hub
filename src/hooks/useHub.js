import { useContext, useMemo } from 'react'
import { HubContext } from '../context/HubContext.js'

function calculateStats(bookings, activities, moods) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = activities.filter((activity) => {
    const timestamp = activity.loggedAt || activity.createdAtClient
    return timestamp && new Date(timestamp).getTime() >= sevenDaysAgo
  })
  const upcoming = bookings
    .filter((booking) => booking.status === 'confirmed')
    .slice()
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const weeklyPoints = recent.reduce((sum, item) => sum + Number(item.points || 0), 0)
  const weeklyMinutes = recent.reduce((sum, item) => sum + Number(item.minutes || 0), 0)
  const averageMood = moods.length
    ? moods.reduce((sum, item) => sum + Number(item.value || 0), 0) / moods.length
    : 0
  const loggedDays = new Set(activities.map((item) => item.day))
  const cursor = new Date()
  let streak = 0
  for (let index = 0; index < 365; index += 1) {
    const day = cursor.toISOString().slice(0, 10)
    if (loggedDays.has(day)) streak += 1
    else if (index > 0) break
    cursor.setDate(cursor.getDate() - 1)
  }
  return {
    weeklyPoints,
    weeklyMinutes,
    weeklyActivities: recent.length,
    activeDays: new Set(recent.map((item) => item.day)).size,
    streak,
    upcoming,
    nextSession: upcoming[0] || null,
    totalBookings: bookings.length,
    latestMood: moods.slice().sort((a, b) => b.day.localeCompare(a.day))[0] || null,
    averageMood: Math.round(averageMood * 10) / 10,
    weeklyGoalPercent: Math.min(100, Math.round((weeklyPoints / 20) * 100)),
  }
}

export default function useHub() {
  const context = useContext(HubContext)
  if (!context) throw new Error('useHub() must be used inside a <HubProvider>')
  const stats = useMemo(
    () => calculateStats(context.bookings, context.activities, context.moods),
    [context.bookings, context.activities, context.moods],
  )
  return { ...context, stats }
}
