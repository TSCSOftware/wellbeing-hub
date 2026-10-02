import { useState } from 'react'
import PropTypes from 'prop-types'


export default function CrisisBanner({ isCompact = false }) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div
      role="note"
      className={`flex flex-wrap items-center gap-3 border border-rose-200 bg-rose-50
        text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100
        ${isCompact ? 'rounded-lg px-3 py-2 text-xs' : 'rounded-xl2 px-4 py-3 text-sm'}`}
    >
      <span aria-hidden="true">🚨</span>
      <p className="flex-1">
        In crisis or worried about your safety? Call the{' '}
        <strong>24/7 support line on 1926</strong> now - you do not need an
        appointment.
      </p>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss crisis banner"
        className="rounded px-2 py-1 font-bold hover:bg-rose-100 dark:hover:bg-rose-900"
      >
        ✕
      </button>
    </div>
  )
}

CrisisBanner.propTypes = {
  isCompact: PropTypes.bool,
}
