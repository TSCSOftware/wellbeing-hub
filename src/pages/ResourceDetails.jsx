import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import PageLayout from '../components/PageLayout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import useHub from '../hooks/useHub.js'
import useAuth from '../hooks/useAuth.js'

const STORAGE_KEY = 'swh.saved'

export default function ResourceDetails() {
  const { resourceId } = useParams()
  const navigate = useNavigate()

  const { logActivity, findBlogById, blogs } = useHub()
  const { isLoggedIn } = useAuth()

  const resource = findBlogById(resourceId)
  useDocumentTitle(resource ? resource.title : 'Resource not found')

  const [saved, setSaved] = useState([])
  const [wasLogged, setWasLogged] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setSaved(JSON.parse(stored))
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    setWasLogged(false)
  }, [resourceId])

  function toggleSave(id) {
    setSaved((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  if (!resource) {
    return (
      <PageLayout title="Resource not found">
        <EmptyState
          icon="📄"
          title={`No resource with the id "${resourceId}"`}
          message="It may have been renamed. The full library is one click away."
          action={<Button onClick={() => navigate('/resources')}>Back to library</Button>}
        />
      </PageLayout>
    )
  }

  const { id, title, category, type, minutes, summary, body, tags, takeaways } = resource
  const isSaved = saved.includes(id)
  const related = (blogs || []).filter((item) => item.category === category && item.id !== id)

  function handleMarkAsDone() {
    logActivity({
      typeId: 'reading',
      minutes,
      note: `Read "${title}"`,
    })
    setWasLogged(true)
  }

  return (
    <PageLayout
      eyebrow={
        <Link to="/resources" className="hover:underline">
          ← Resource library
        </Link>
      }
      title={title}
      intro={summary}
      sidebar={
        <>
          <Card title="At a glance">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Category</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300">{category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Format</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300">{type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Time needed</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300">{minutes} min</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} tone="slate">
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <Button
                variant={isSaved ? 'secondary' : 'primary'}
                isFullWidth
                onClick={() => toggleSave(id)}
              >
                {isSaved ? '★ Saved' : '☆ Save for later'}
              </Button>
              {isLoggedIn && (
                <Button variant="calm" isFullWidth onClick={handleMarkAsDone}>
                  Log this as self-care
                </Button>
              )}
              {wasLogged && (
                <p role="status" className="text-center text-xs text-brand-700 dark:text-brand-300">
                  Added {minutes} minutes to today&apos;s log.
                </p>
              )}
            </div>
          </Card>

          {related.length > 0 && (
            <Card title="More on this">
              <ul className="space-y-2 text-sm">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/resources/${item.id}`}
                      className="text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      }
      content={
        <>
          <Card>
            <div className="space-y-4">
              {body.map((paragraph, index) => (
                <p
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>

          {takeaways && takeaways.length > 0 && (
            <Card title="Try this today">
              <ul className="space-y-2">
                {takeaways.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span aria-hidden="true" className="text-brand-500">
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      }
    />
  )
}
