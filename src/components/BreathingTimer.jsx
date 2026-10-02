import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import Button from './Button.jsx'

const PHASES = [
  { key: 'in', label: 'Breathe in', seconds: 4, scale: 'scale-100' },
  { key: 'hold1', label: 'Hold', seconds: 4, scale: 'scale-100' },
  { key: 'out', label: 'Breathe out', seconds: 4, scale: 'scale-75' },
  { key: 'hold2', label: 'Hold', seconds: 4, scale: 'scale-75' },
]

function format(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export default function BreathingTimer({ onComplete }) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [visibleCycles, setVisibleCycles] = useState([])

  const intervalRef = useRef(null)
  const cyclesRef = useRef([]) 
  const startBtnRef = useRef(null) 
  useEffect(() => {
    if (startBtnRef.current) startBtnRef.current.focus()
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function handleStart() {
    if (intervalRef.current) return 
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
  }

  function handleStop() {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
  }

  function handleReset() {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setSeconds(0)
    cyclesRef.current = []
    setVisibleCycles([])
  }

  function handleMarkCycle() {
    cyclesRef.current = [
      ...cyclesRef.current,
      { number: cyclesRef.current.length + 1, at: seconds },
    ]
  }

  function handleShowCycles() {
    setVisibleCycles([...cyclesRef.current])
  }

  function handleFinish() {
    handleStop()
    if (onComplete && seconds > 0) {
      onComplete(Math.max(1, Math.round(seconds / 60)))
    }
  }

  const totalCycleSeconds = PHASES.reduce((sum, phase) => sum + phase.seconds, 0)
  const positionInCycle = seconds % totalCycleSeconds

  let elapsed = 0
  let activePhase = PHASES[0]
  for (const phase of PHASES) {
    if (positionInCycle < elapsed + phase.seconds) {
      activePhase = phase
      break
    }
    elapsed += phase.seconds
  }
  const secondsLeftInPhase = activePhase.seconds - (positionInCycle - elapsed)
  const completedCycles = Math.floor(seconds / totalCycleSeconds)

  return (
    <div className="rounded-xl2 border border-slate-200 bg-gradient-to-b from-calm-50
      to-white p-6 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
      <p className="text-xs font-semibold uppercase tracking-widest text-calm-700 dark:text-calm-300">
        Box breathing
      </p>

      <div className="mx-auto mt-5 grid h-40 w-40 place-items-center">
        <div
          className={`grid h-40 w-40 place-items-center rounded-full bg-calm-500/20
            transition-transform duration-1000 ease-in-out ${
              isRunning ? activePhase.scale : 'scale-75'
            }`}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-calm-600/80 text-white">
            <div>
              {/* Announced to screen readers as the phase changes. */}
              <p className="text-sm font-medium" aria-live="polite">
                {isRunning ? activePhase.label : 'Ready'}
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {isRunning ? secondsLeftInPhase : 4}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
        {format(seconds)}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {completedCycles} complete {completedCycles === 1 ? 'cycle' : 'cycles'}
        {' · '}
        {cyclesRef.current.length} marked
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
               <button
          ref={startBtnRef}
          type="button"
          onClick={handleStart}
          disabled={isRunning}
          className="inline-flex items-center justify-center rounded-lg bg-calm-600 px-4 py-2
            text-sm font-medium text-white shadow-sm transition-colors hover:bg-calm-700
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start
        </button>
        <Button variant="secondary" onClick={handleStop} disabled={!isRunning}>
          Pause
        </Button>
        <Button variant="secondary" onClick={handleMarkCycle} disabled={!isRunning}>
          Mark cycle
        </Button>
        <Button variant="ghost" onClick={handleShowCycles}>
          Show cycles
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {visibleCycles.length > 0 && (
        <ul className="mx-auto mt-4 max-w-xs space-y-1 text-left text-xs text-slate-600 dark:text-slate-400">
          {visibleCycles.map((cycle) => (
            <li
              key={cycle.number}
              className="flex justify-between border-b border-dashed border-slate-200 py-1
                dark:border-slate-800"
            >
              <span>Cycle {cycle.number}</span>
              <span className="tabular-nums">{format(cycle.at)}</span>
            </li>
          ))}
        </ul>
      )}

      {onComplete && (
        <Button
          variant="primary"
          size="sm"
          className="mt-5"
          onClick={handleFinish}
          disabled={seconds === 0}
        >
          Finish &amp; log this as self-care
        </Button>
      )}
    </div>
  )
}

BreathingTimer.propTypes = {
  onComplete: PropTypes.func,
}
