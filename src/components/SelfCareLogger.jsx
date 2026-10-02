import { useRef, useState } from 'react'
import PropTypes from 'prop-types'

import Button from './Button.jsx'
import { selfCareTypes } from '../data/selfCareTypes.js'


export default function SelfCareLogger({ onLog }) {
  const [typeId, setTypeId] = useState('')
  const [minutes, setMinutes] = useState(10)
  const [note, setNote] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const minutesRef = useRef(null)

  function handlePick(nextTypeId) {
    setTypeId(nextTypeId)
    // Reach into the real DOM node and move the cursor there.
    if (minutesRef.current) {
      minutesRef.current.focus()
      minutesRef.current.select()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!typeId) return

    const entry = await onLog({ typeId, minutes, note })

    setConfirmation(`${entry.icon} ${entry.label} logged. Nice one.`)
    setTypeId('')
    setMinutes(10)
    setNote('')
  }

  const selected = selfCareTypes.find((type) => type.id === typeId)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset>
        <legend className="label">What supported you today?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {selfCareTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handlePick(type.id)}
              aria-pressed={typeId === type.id}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                typeId === type.id
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200 dark:bg-brand-900/40'
                  : 'border-slate-300 hover:border-brand-400 dark:border-slate-700'
              }`}
            >
              <span className="text-lg" aria-hidden="true">
                {type.icon}
              </span>
              <span className="mt-1 block font-medium text-slate-800 dark:text-slate-100">
                {type.label}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                +{type.points} pts
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {selected && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800
          dark:bg-brand-900/40 dark:text-brand-100">
          {selected.blurb}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="minutes">
            Minutes
          </label>
          <input
            ref={minutesRef}
            id="minutes"
            type="number"
            min={1}
            max={600}
            className="field"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="note">
            Note (optional)
          </label>
          <input
            id="note"
            type="text"
            className="field"
            maxLength={120}
            placeholder="Walked to the lake instead of doom-scrolling"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!typeId}>
          Save check-in
        </Button>
        {confirmation && (
          <p
            role="status"
            className="text-sm font-medium text-brand-700 dark:text-brand-300"
          >
            {confirmation}
          </p>
        )}
      </div>
    </form>
  )
}

SelfCareLogger.propTypes = {
  onLog: PropTypes.func.isRequired,
}
