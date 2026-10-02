import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Badge from './Badge.jsx'
import Button from './Button.jsx'

const statusTone = {
  confirmed: 'emerald',
  cancelled: 'rose',
}

export default function BookingRow({ booking, onCancel, onDelete, isHighlighted = false }) {
  const { id, counsellorId, counsellorName, counsellorRole, day, date, time, mode, topic, notes, status, urgency } =
    booking

  const isCancelled = status === 'cancelled'

  return (
    <li
      className={`rounded-xl2 border p-4 transition ${
        isHighlighted
          ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200 dark:bg-brand-900/30'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      } ${isCancelled ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {counsellorName}
            </h3>
            <Badge tone={statusTone[status] ?? 'slate'}>{status}</Badge>
            {urgency === 'urgent' && !isCancelled && <Badge tone="rose">urgent</Badge>}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{counsellorRole}</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            {day} {date}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {time} · {mode}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid gap-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-slate-400">Topic:</dt>
          <dd className="text-slate-700 dark:text-slate-300">{topic}</dd>
        </div>
        {notes && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-slate-400">Notes:</dt>
            <dd className="text-slate-700 dark:text-slate-300">{notes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/counsellors/${counsellorId}`}>
          <Button variant="ghost" size="sm">
            View counsellor
          </Button>
        </Link>
        {!isCancelled && (
          <Button variant="secondary" size="sm" onClick={() => onCancel(id)}>
            Cancel session
          </Button>
        )}
        {isCancelled && (
          <Button variant="danger" size="sm" onClick={() => onDelete(id)}>
            Remove from list
          </Button>
        )}
      </div>
    </li>
  )
}

BookingRow.propTypes = {
  booking: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isHighlighted: PropTypes.bool,
}
