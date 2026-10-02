import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import BookingRow from '../../components/BookingRow.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import CrisisBanner from '../../components/CrisisBanner.jsx'
import Badge from '../../components/Badge.jsx'
import useHub from '../../hooks/useHub.js'
import useAuth from '../../hooks/useAuth.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const filters = ['Upcoming', 'Cancelled', 'All']

export default function Bookings() {
  useDocumentTitle('Appointments & Bookings')

  const { bookings, cancelBooking, deleteBooking, stats, allAppointments } = useHub()
  const { role, isAdmin, isCounsellor } = useAuth()
  const location = useLocation()

  const justBooked = location.state?.justBooked ?? null

  const [filter, setFilter] = useState('Upcoming')
  const [showConfirmation, setShowConfirmation] = useState(Boolean(justBooked))

  useEffect(() => {
    if (!showConfirmation) return undefined
    const timerId = window.setTimeout(() => setShowConfirmation(false), 6000)
    return () => window.clearTimeout(timerId)
  }, [showConfirmation])

  const visible = useMemo(() => {
    if (filter === 'All') return bookings
    if (filter === 'Cancelled') return bookings.filter((b) => b.status === 'cancelled')
    return bookings.filter((b) => b.status === 'confirmed')
  }, [bookings, filter])

  return (
    <div className="space-y-6">
      {showConfirmation && (
        <p
          role="status"
          className="rounded-xl2 border border-brand-200 bg-brand-50 px-4 py-3 text-sm
            text-brand-900 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-100"
        >
          ✅ Your session is confirmed. A reminder will appear here 24 hours
          before - and you can cancel any time, no explanation needed.
        </p>
      )}

      <Card
        title="My counselling sessions"
        subtitle={`${stats.upcoming.length} upcoming · ${bookings.length} in total`}
        actions={
          <Link to="/counsellors">
            <Button size="sm">Book another</Button>
          </Link>
        }
      >
        <div className="mb-4 flex flex-wrap gap-1.5">
          {filters.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === option
                  ? 'border-brand-500 bg-brand-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <ul className="space-y-3">
            {visible.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onCancel={cancelBooking}
                onDelete={deleteBooking}
                isHighlighted={booking.id === justBooked}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="🗓️"
            title={
              filter === 'Cancelled'
                ? 'No cancelled sessions'
                : 'You have no sessions booked'
            }
            message="Counselling is free, confidential, and you do not need a reason that sounds serious enough."
            action={
              <Link to="/counsellors">
                <Button>Find a counsellor</Button>
              </Link>
            }
          />
        )}
      </Card>

      {(isAdmin || isCounsellor) && allAppointments.length > 0 && (
        <Card
          title="All Student Appointments (Firestore Sync)"
          subtitle={`${allAppointments.length} total student appointments logged in Firestore`}
        >
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {allAppointments.map((appt) => (
              <div key={appt.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {appt.studentName || 'Student'}
                    </span>
                    {appt.studentId && <Badge tone="calm">{appt.studentId}</Badge>}
                    <span className="text-xs text-slate-500">→ {appt.counsellorName}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Topic: {appt.topic || 'General'} · Mode: {appt.mode} · Status: <span className="capitalize font-medium">{appt.status}</span>
                  </p>
                  {appt.notes && <p className="text-xs italic text-slate-400 mt-0.5">"{appt.notes}"</p>}
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold text-brand-700 dark:text-brand-300">{appt.day} {appt.date}</p>
                  <p className="text-slate-500">{appt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Before your session">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>· Arrive a few minutes early, or test your video link beforehand.</li>
          <li>· Jot down the one thing you most want to say. You can read it out.</li>
          <li>· Nothing you say affects your grades, visa or academic record.</li>
          <li>· If you need to cancel, do it here - the slot goes back to another student.</li>
        </ul>
      </Card>

      <CrisisBanner />
    </div>
  )
}
