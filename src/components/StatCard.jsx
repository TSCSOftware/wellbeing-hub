import PropTypes from 'prop-types'

const tones = {
  brand: 'from-brand-500 to-brand-700',
  calm: 'from-calm-500 to-calm-700',
  amber: 'from-amber-400 to-amber-600',
  rose: 'from-rose-400 to-rose-600',
}

export default function StatCard({ label, value, hint, icon = '', iconImage, tone = 'brand' }) {
  return (
    <div className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-sm
      dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl
            overflow-hidden bg-gradient-to-br ${tones[tone] ?? tones.brand} text-lg text-white`}
          aria-hidden="true"
        >
          {iconImage ? (
            <img
              src={iconImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-50">
            {value}
          </p>
        </div>
      </div>
      {hint && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  )
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  hint: PropTypes.string,
  icon: PropTypes.node,
  iconImage: PropTypes.string,
  tone: PropTypes.oneOf(['brand', 'calm', 'amber', 'rose']),
}
