import PropTypes from 'prop-types'

export default function EmptyState({ icon = '🌱', title, message, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl2 border border-dashed
      border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  action: PropTypes.node,
}
