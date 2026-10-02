import PropTypes from 'prop-types'


export default function Card({
  children,
  title,
  subtitle,
  actions,
  as: Tag = 'section',
  isHoverable = false,
  className = '',
}) {
  return (
    <Tag
      className={`rounded-xl2 border border-slate-200 bg-white p-5 shadow-sm
        dark:border-slate-800 dark:bg-slate-900
        ${isHoverable ? 'transition hover:-translate-y-0.5 hover:shadow-md' : ''}
        ${className}`}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  )
}

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node, // an element passed as a prop = composition
  as: PropTypes.elementType,
  isHoverable: PropTypes.bool,
  className: PropTypes.string,
}
