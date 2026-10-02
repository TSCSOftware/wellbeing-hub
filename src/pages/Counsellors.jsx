import { useEffect, useMemo, useRef, useState } from 'react'

import PageLayout from '../components/PageLayout.jsx'
import CounsellorCard from '../components/CounsellorCard.jsx'
import CrisisBanner from '../components/CrisisBanner.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import useDebouncedValue from '../hooks/useDebouncedValue.js'
import useHub from '../hooks/useHub.js'

const STORAGE_KEY = 'swh.shortlist'

export default function Counsellors() {
  useDocumentTitle('Counsellors')

  const { counsellors, counsellorsFromFirestore } = useHub()

  const [query, setQuery] = useState('')
  const [activeFocus, setActiveFocus] = useState('All')
  const [mode, setMode] = useState('Any')
  const [shortlist, setShortlist] = useState([])

  const searchRef = useRef(null)

  const debouncedQuery = useDebouncedValue(query, 200)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setShortlist(JSON.parse(saved))
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shortlist))
  }, [shortlist])

  useEffect(() => {
    if (searchRef.current) searchRef.current.focus()
  }, [])

  function handleShortlist(id) {
    setShortlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const visible = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase()
    return counsellors.filter((counsellor) => {
      const matchesFocus =
        activeFocus === 'All' || counsellor.focus.includes(activeFocus)
      const matchesMode = mode === 'Any' || counsellor.modes.includes(mode)
      const matchesQuery =
        !needle ||
        counsellor.name.toLowerCase().includes(needle) ||
        counsellor.role.toLowerCase().includes(needle) ||
        counsellor.focus.join(' ').toLowerCase().includes(needle)
      return matchesFocus && matchesMode && matchesQuery
    })
  }, [debouncedQuery, activeFocus, mode])

  const shortlisted = counsellors.filter((c) => shortlist.includes(c.id))

  const focusAreas = useMemo(() => {
    return [...new Set(counsellors.flatMap((c) => c.focus || []))].sort()
  }, [counsellors])

  const filters = (
    <Card
      title="Filter"
      subtitle={`${visible.length} of ${counsellors.length} available ${counsellorsFromFirestore ? '(Firestore live)' : ''}`}
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="search">
            Search
          </label>
          <input
            ref={searchRef}
            id="search"
            type="search"
            className="field"
            placeholder="Name, role or topic…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div>
          <p className="label">Focus area</p>
          <div className="flex flex-wrap gap-1.5">
            {['All', ...focusAreas].map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setActiveFocus(area)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  activeFocus === area
                    ? 'border-brand-500 bg-brand-600 text-white'
                    : 'border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="mode">
            Appointment type
          </label>
          <select
            id="mode"
            className="field"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            {['Any', 'In person', 'Video call', 'Phone'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          isFullWidth
          onClick={() => {
            setQuery('')
            setActiveFocus('All')
            setMode('Any')
            if (searchRef.current) searchRef.current.focus()
          }}
        >
          Reset filters
        </Button>
      </div>
    </Card>
  )

  const starred = shortlisted.length > 0 && (
    <Card title="⭐ Your shortlist">
      <ul className="space-y-2 text-sm">
        {shortlisted.map((counsellor) => (
          <li key={counsellor.id} className="flex items-center justify-between gap-2">
            <span className="truncate text-slate-700 dark:text-slate-300">
              {counsellor.name}
            </span>
            <button
              type="button"
              onClick={() => handleShortlist(counsellor.id)}
              className="text-xs text-slate-400 hover:text-rose-600"
              aria-label={`Remove ${counsellor.name}`}
            >
              remove
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )

  return (
    <PageLayout
      eyebrow="Counselling"
      title="Find the right person to talk to"
      intro="Every counsellor here is part of Student Support Services. Filter by what is going on for you, then pick a time that fits around your timetable."
      sidebar={
        <>
          {filters}
          {starred}
          <CrisisBanner isCompact />
        </>
      }
      content={
        visible.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {visible.map((counsellor) => (
              <CounsellorCard
                key={counsellor.id}
                counsellor={counsellor}
                onShortlist={handleShortlist}
                isShortlisted={shortlist.includes(counsellor.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="No counsellors match those filters"
            message="Try widening the focus area or clearing the search box."
            action={
              <Button
                onClick={() => {
                  setQuery('')
                  setActiveFocus('All')
                  setMode('Any')
                }}
              >
                Clear filters
              </Button>
            }
          />
        )
      }
    />
  )
}
