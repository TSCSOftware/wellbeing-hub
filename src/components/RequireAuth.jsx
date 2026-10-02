import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'

import useAuth from '../hooks/useAuth.js'

export default function RequireAuth({ children }) {
  const { isLoggedIn, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <p className="animate-pulse text-sm text-slate-500">Checking your session…</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

RequireAuth.propTypes = {
  children: PropTypes.node,
}
