import PropTypes from 'prop-types'


const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
  'transition-colors duration-150 select-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 ' +
    'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-slate-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
  calm: 'bg-calm-600 text-white hover:bg-calm-700 active:bg-calm-800 shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  isFullWidth = false,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${
        sizes[size] ?? sizes.md
      } ${isFullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* Type-checking props with PropTypes: runtime warnings in development,
   zero cost in production (Props deck, section 03). */
Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'calm']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  isFullWidth: PropTypes.bool,
  className: PropTypes.string,
}
