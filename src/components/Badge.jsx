import PropTypes from 'prop-types'

const tones = {
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100',
  calm: 'bg-calm-100 text-calm-800 dark:bg-calm-900 dark:text-calm-100',
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  emerald:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
}

export default function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs
        font-medium ${tones[tone] ?? tones.slate} ${className}`}
    >
      {children}
    </span>
  )
}

Badge.propTypes = {
  children: PropTypes.node,
  tone: PropTypes.oneOf(['brand', 'calm', 'slate', 'amber', 'rose', 'emerald']),
  className: PropTypes.string,
}
