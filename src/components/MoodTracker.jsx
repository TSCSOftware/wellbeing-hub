import PropTypes from 'prop-types'

import { moodScale } from '../data/selfCareTypes.js'
import usePrevious from '../hooks/usePrevious.js'


export default function MoodTracker({ moods, onRecord }) {
  const today = new Date().toISOString().slice(0, 10)
  const todaysMood = moods.find((mood) => mood.day === today)
  const previousMood = usePrevious(todaysMood ? todaysMood.value : null)

  const trend =
    todaysMood && previousMood !== null && previousMood !== undefined
      ? todaysMood.value - previousMood
      : 0

  const lastSeven = moods
    .slice()
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-7)

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        How are you feeling today?
      </p>

      <div className="mt-3 flex justify-between gap-1">
        {moodScale.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onRecord(mood.value)}
            aria-label={mood.label}
            aria-pressed={todaysMood ? todaysMood.value === mood.value : false}
            title={mood.label}
            className={`flex-1 rounded-lg border py-2 text-2xl transition hover:scale-105 ${
              todaysMood && todaysMood.value === mood.value
                ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200 dark:bg-brand-900/40'
                : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
            }`}
          >
            {mood.emoji}
          </button>
        ))}
      </div>

      {todaysMood ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Logged today:{' '}
          <strong className="text-slate-800 dark:text-slate-100">
            {moodScale.find((m) => m.value === todaysMood.value).label}
          </strong>
          {trend !== 0 && (
            <span className={trend > 0 ? ' text-emerald-600' : ' text-amber-600'}>
              {' '}
              ({trend > 0 ? '↑' : '↓'} from your last check-in)
            </span>
          )}
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          No check-in yet today. It takes one tap.
        </p>
      )}

      {lastSeven.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Recent check-ins
          </p>
          <div className="flex items-end gap-1.5" role="img" aria-label="Recent mood chart">
            {lastSeven.map((mood) => (
              <div key={mood.id} className="flex-1 text-center">
                <div
                  className="mx-auto w-full rounded-t bg-brand-500/80"
                  style={{ height: `${mood.value * 12}px` }}
                />
                <span className="mt-1 block text-[10px] text-slate-400">
                  {mood.day.slice(8)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

MoodTracker.propTypes = {
  moods: PropTypes.array.isRequired,
  onRecord: PropTypes.func.isRequired,
}
