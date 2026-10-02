import { useMemo, useState } from 'react'

import Card from '../../components/Card.jsx'
import Badge from '../../components/Badge.jsx'
import Button from '../../components/Button.jsx'
import StatCard from '../../components/StatCard.jsx'
import SelfCareLogger from '../../components/SelfCareLogger.jsx'
import BreathingTimer from '../../components/BreathingTimer.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import useHub from '../../hooks/useHub.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import { selfCareTypes } from '../../data/selfCareTypes.js'

function formatWhen(iso) {
  const date = new Date(iso)
  const today = new Date().toISOString().slice(0, 10)
  const day = iso.slice(0, 10)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return day === today ? `Today ${time}` : `${day} ${time}`
}

export default function SelfCare() {
  useDocumentTitle('Daily check-ins')

  const { activities, logActivity, removeActivity, stats } = useHub()

  const [typeFilter, setTypeFilter] = useState('All')

  const visible = useMemo(
    () =>
      typeFilter === 'All'
        ? activities
        : activities.filter((activity) => activity.typeId === typeFilter),
    [activities, typeFilter],
  )

  const breakdown = useMemo(() => {
    const counts = new Map()
    activities.forEach((activity) => {
      counts.set(activity.typeId, (counts.get(activity.typeId) ?? 0) + 1)
    })
    return [...counts.entries()]
      .map(([typeId, count]) => ({
        typeId,
        count,
        label: selfCareTypes.find((type) => type.id === typeId)?.label ?? typeId,
        icon: selfCareTypes.find((type) => type.id === typeId)?.icon ?? '✅',
      }))
      .sort((a, b) => b.count - a.count)
  }, [activities])

  function handleBreathingComplete(minutes) {
    logActivity({
      typeId: 'breathing',
      minutes,
      note: 'Box breathing with the on-screen timer',
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Logged this week" value={stats.weeklyActivities} icon="🌱" />
        <StatCard label="Minutes" value={stats.weeklyMinutes} icon="⏱️" tone="calm" />
        <StatCard label="Points" value={stats.weeklyPoints} icon="⭐" tone="amber" />
        <StatCard label="Streak" value={`${stats.streak} d`} icon="🔥" tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Log an activity" subtitle="Anything you did for yourself counts.">
          <SelfCareLogger onLog={logActivity} />
        </Card>
        <BreathingTimer onComplete={handleBreathingComplete} />
      </div>

      <Card
        title="Your log"
        subtitle={`${activities.length} activities recorded`}
        actions={
          breakdown.length > 0 && (
            <Badge tone="calm">
              Most logged: {breakdown[0].icon} {breakdown[0].label}
            </Badge>
          )
        }
      >
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter('All')}
            aria-pressed={typeFilter === 'All'}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              typeFilter === 'All'
                ? 'border-brand-500 bg-brand-600 text-white'
                : 'border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            All
          </button>
          {breakdown.map((item) => (
            <button
              key={item.typeId}
              type="button"
              onClick={() => setTypeFilter(item.typeId)}
              aria-pressed={typeFilter === item.typeId}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                typeFilter === item.typeId
                  ? 'border-brand-500 bg-brand-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {item.icon} {item.label} ({item.count})
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {visible.map((activity) => (
              <li key={activity.id} className="flex items-center gap-3 py-3">
                <span className="text-2xl" aria-hidden="true">
                  {activity.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {activity.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatWhen(activity.loggedAt)}
                    {activity.note ? ` · ${activity.note}` : ''}
                  </p>
                </div>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  {activity.minutes} min
                </span>
                <Badge tone="brand">+{activity.points}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeActivity(activity.id)}
                  aria-label={`Remove ${activity.label}`}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="🌱"
            title="Nothing here yet"
            message="Log the first thing you did for yourself today - even a five-minute break counts."
          />
        )}
      </Card>
    </div>
  )
}
