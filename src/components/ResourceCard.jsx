import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Badge from './Badge.jsx'

const typeIcons = {
  Article: '📄',
  Guide: '🧭',
  Exercise: '🧘',
  Checklist: '☑️',
}

export default function ResourceCard({ resource, onToggleSave, isSaved = false }) {
  const { id, title, category, type, minutes, summary, tags } = resource

  return (
    <article
      className="flex h-full flex-col rounded-xl2 border border-slate-200 bg-white p-5
        shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
        dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {typeIcons[type] ?? ''}
          </span>
          <Badge tone="calm">{category}</Badge>
        </div>
        <button
          type="button"
          onClick={() => onToggleSave(id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Unsave ${title}` : `Save ${title}`}
          className="rounded-lg p-1 text-lg leading-none transition hover:scale-110"
        >
          {isSaved ? '' : ''}
        </button>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{summary}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-xs text-slate-400">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-5 text-sm">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {type} · {minutes} min read
        </span>
        <Link
          to={`/resources/${id}`}
          className="font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          Read →
        </Link>
      </div>
    </article>
  )
}

ResourceCard.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    minutes: PropTypes.number.isRequired,
    summary: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onToggleSave: PropTypes.func.isRequired,
  isSaved: PropTypes.bool,
}
