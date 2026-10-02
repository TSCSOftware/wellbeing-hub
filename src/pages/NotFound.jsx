import { Link, useLocation, useNavigate } from 'react-router-dom'

import Button from '../components/Button.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function NotFound() {
  useDocumentTitle('Page not found')

  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">
        We could not find that page
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">
        Nothing lives at{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
          {location.pathname}
        </code>
        . It may have moved, or the link may have a typo.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Link to="/">
          <Button>Return home</Button>
        </Link>
        <Link to="/counsellors">
          <Button variant="ghost">Find a counsellor</Button>
        </Link>
      </div>
    </div>
  )
}
