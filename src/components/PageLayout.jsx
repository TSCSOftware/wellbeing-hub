import PropTypes from 'prop-types'


export default function PageLayout({
  title,
  intro,
  eyebrow,
  actions,
  sidebar,
  content,
  children,
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {(title || eyebrow || actions) && (
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-up">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {title}
              </h1>
            )}
            {intro && (
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                {intro}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}

      {sidebar ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <main className="space-y-6 lg:col-span-2">{content ?? children}</main>
          <aside className="space-y-6">{sidebar}</aside>
        </div>
      ) : (
        <main className="space-y-6">{content ?? children}</main>
      )}
    </div>
  )
}

PageLayout.propTypes = {
  title: PropTypes.node,
  intro: PropTypes.node,
  eyebrow: PropTypes.node,
  actions: PropTypes.node,
  sidebar: PropTypes.node, 
  content: PropTypes.node,
  children: PropTypes.node, 
}
