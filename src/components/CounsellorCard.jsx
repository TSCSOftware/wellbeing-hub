import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Badge from './Badge.jsx'
import Button from './Button.jsx'

export default function CounsellorCard({
  counsellor,
  onShortlist,
  isShortlisted = false,
}) {
  const { id, name, role, focus, avatarInitials, slots, accent } =
    counsellor

  const nextSlot = slots.find((slot) => slot.enabled !== false)

  return (
    <article
      className="flex h-full flex-col rounded-xl2 border border-slate-200 bg-white p-5
        shadow-sm transition hover:-translate-y-0.5 hover:shadow-md
        dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm
            font-bold text-white ${
              accent === 'calm' ? 'bg-calm-600' : 'bg-brand-600'
            }`}
          aria-hidden="true"
        >
          {avatarInitials}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
            {name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
        </div>

        <button
          type="button"
          onClick={() => onShortlist(id)}
          aria-pressed={isShortlisted}
          aria-label={
            isShortlisted ? `Remove ${name} from shortlist` : `Shortlist ${name}`
          }
          className="rounded-lg p-1.5 text-lg leading-none transition hover:scale-110"
        >
          {isShortlisted ? '⭐' : '☆'}
        </button>
      </div>

      {/* Mapping over an array -> remember the key prop */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {focus.map((area) => (
          <Badge key={area} tone={accent === 'calm' ? 'calm' : 'brand'}>
            {area}
          </Badge>
        ))}
      </div>

      <div className="mt-auto pt-5">
        {nextSlot ? (
          <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
            Next free slot:{' '}
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {nextSlot.day} {nextSlot.date} at {nextSlot.time}
            </span>
          </p>
        ) : (
          <p className="mb-3 text-xs text-slate-400">No slots this week</p>
        )}

        {/* Dynamic link: one route template, many counsellors */}
        <Link to={`/counsellors/${id}`}>
          <Button isFullWidth size="sm">
            View profile &amp; book
          </Button>
        </Link>
      </div>
    </article>
  )
}

CounsellorCard.propTypes = {
  counsellor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    focus: PropTypes.arrayOf(PropTypes.string).isRequired,
    avatarInitials: PropTypes.string.isRequired,
    accent: PropTypes.string,
    slots: PropTypes.array.isRequired,
  }).isRequired,
  onShortlist: PropTypes.func.isRequired,
  isShortlisted: PropTypes.bool,
}
