import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout.jsx'
import ResourceCard from '../components/ResourceCard.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import useDebouncedValue from '../hooks/useDebouncedValue.js'
import useHub from '../hooks/useHub.js'
import useAuth from '../hooks/useAuth.js'
import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'swh.saved'

export default function Resources() {
  useDocumentTitle('Resources & Blogs')

  const { blogs, blogsFromFirestore } = useHub()
  const { isAdmin, isCounsellor } = useAuth()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [onlySaved, setOnlySaved] = useState(false)
  const [saved, setSaved] = useState([])

  const debouncedQuery = useDebouncedValue(query, 200)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setSaved(JSON.parse(stored))
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }, [saved])

  function handleToggleSave(id) {
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const categories = useMemo(() => {
    const set = new Set(blogs.map((b) => b.category || 'General'))
    return ['All', ...Array.from(set).sort()]
  }, [blogs])

  const visible = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase()
    return blogs.filter((resource) => {
      const matchesCategory = category === 'All' || resource.category === category
      const matchesSaved = !onlySaved || saved.includes(resource.id)
      const tagsString = Array.isArray(resource.tags) ? resource.tags.join(' ') : (resource.tags || '')
      const matchesQuery =
        !needle ||
        resource.title.toLowerCase().includes(needle) ||
        resource.summary.toLowerCase().includes(needle) ||
        tagsString.toLowerCase().includes(needle)
      return matchesCategory && matchesSaved && matchesQuery
    })
  }, [blogs, debouncedQuery, category, onlySaved, saved])

  return (
    <PageLayout
      eyebrow="Wellbeing Library & Blogs"
      title="Practical resources and clinical blogs"
      intro="Written by professional university counsellors and psychologists. Filter by topic, save for later, or browse expert advice."
      action={
        (isAdmin || isCounsellor) && (
          <Link to="/dashboard/manage-blogs">
            <Button size="sm">✍️ Create new blog</Button>
          </Link>
        )
      }
      sidebar={
        <Card
          title="Browse"
          subtitle={`${visible.length} of ${blogs.length} items ${blogsFromFirestore ? '(Firestore live)' : ''}`}
        >
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="resource-search">
                Search
              </label>
              <input
                id="resource-search"
                type="search"
                className="field"
                placeholder="Sleep, panic, deadlines…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div>
              <p className="label">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategory(option)}
                    aria-pressed={category === option}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      category === option
                        ? 'border-brand-500 bg-brand-600 text-white'
                        : 'border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
                checked={onlySaved}
                onChange={(event) => setOnlySaved(event.target.checked)}
              />
              Show only saved ({saved.length})
            </label>

            <Button
              variant="ghost"
              size="sm"
              isFullWidth
              onClick={() => {
                setQuery('')
                setCategory('All')
                setOnlySaved(false)
              }}
            >
              Reset
            </Button>
          </div>
        </Card>
      }
      content={
        visible.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {visible.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onToggleSave={handleToggleSave}
                isSaved={saved.includes(resource.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📚"
            title="Nothing matches that yet"
            message="Try a different word, or clear the filters to see the whole library."
            action={
              <Button
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                  setOnlySaved(false)
                }}
              >
                Show everything
              </Button>
            }
          />
        )
      }
    />
  )
}
