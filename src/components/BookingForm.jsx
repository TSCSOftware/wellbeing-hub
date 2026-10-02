import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

import Button from './Button.jsx'
import useAuth from '../hooks/useAuth.js'
import useHub from '../hooks/useHub.js'

const topics = [
  'Anxiety or panic',
  'Low mood',
  'Exam / academic stress',
  'Sleep problems',
  'Relationships or family',
  'Money worries',
  'Something else',
]

export default function BookingForm({ counsellor, onBooked }) {
  const { isLoggedIn, isStudent } = useAuth()
  const { bookSession, bookings } = useHub()
  const navigate = useNavigate()

  const firstFieldRef = useRef(null)

  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [topic, setTopic] = useState(topics[0])
  const [notes, setNotes] = useState('')
  const [hasConsented, setHasConsented] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* Empty dependency list -> focus once, after mount. */
  useEffect(() => {
    if (firstFieldRef.current) firstFieldRef.current.focus()
  }, [])

  useEffect(() => {
    setSelectedSlotId('')
  }, [counsellor])

  const availableSlots = counsellor.slots.filter((slot) => slot.enabled !== false)

  const takenSlotIds = new Set(
    bookings.filter((b) => b.status !== 'cancelled').map((b) => b.slotId),
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/counsellors/${counsellor.id}` } })
      return
    }
    if (!isStudent) {
      setError('Only student accounts can book counselling appointments.')
      return
    }
    if (!selectedSlotId) {
      setError('Please choose an appointment slot.')
      return
    }
    if (!hasConsented) {
      setError('Please confirm you have read how your information is used.')
      return
    }

    const slot = counsellor.slots.find((s) => s.id === selectedSlotId)
    setIsSubmitting(true)

    let booking
    try {
      booking = await bookSession({ counsellor, slot, topic, notes })
      if (!booking) throw new Error('That appointment is no longer available.')
    } catch (reason) {
      setError(reason.message)
      setIsSubmitting(false)
      return
    }

    // Function-as-prop: tell the parent page what happened.
    if (onBooked) onBooked(booking)

    setIsSubmitting(false)
    navigate('/dashboard/bookings', { state: { justBooked: booking.id } })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset>
        <legend className="label">1. Choose a time</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {availableSlots.map((slot, index) => {
            const isTaken = takenSlotIds.has(slot.id)
            const isSelected = selectedSlotId === slot.id
            return (
              <label
                key={slot.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5
                  text-sm transition ${
                    isTaken
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800/60'
                      : isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-100'
                        : 'border-slate-300 hover:border-brand-400 dark:border-slate-700'
                  }`}
              >
                <input
                  ref={index === 0 ? firstFieldRef : null}
                  type="radio"
                  name="slot"
                  value={slot.id}
                  disabled={isTaken}
                  checked={isSelected}
                  onChange={(event) => setSelectedSlotId(event.target.value)}
                  className="accent-brand-600"
                />
                <span>
                  <span className="block font-medium">
                    {slot.day} · {slot.time}
                  </span>
                  <span className="block text-xs opacity-70">
                    {isTaken ? 'Already booked' : slot.date}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

        <div>
        <label className="label" htmlFor="topic">
          2. What would you like to talk about?
        </label>
        <select
          id="topic"
          className="field"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        >
          {topics.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="notes">
          3. Anything your counsellor should know? (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          className="field resize-y"
          placeholder="Only share what you are comfortable sharing."
          value={notes}
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {notes.length}/500
        </p>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          checked={hasConsented}
          onChange={(event) => setHasConsented(event.target.checked)}
          className="mt-0.5 accent-brand-600"
        />
        <span>
          I understand my notes are shared only with my counsellor and that this
          demo stores everything in my own browser.
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" isFullWidth disabled={isSubmitting}>
        {!isLoggedIn ? 'Log in to book' : isStudent ? 'Confirm booking' : 'Student account required'}
      </Button>
    </form>
  )
}

BookingForm.propTypes = {
  counsellor: PropTypes.object.isRequired,
  onBooked: PropTypes.func, // function as a prop (child talks back to parent)
}
