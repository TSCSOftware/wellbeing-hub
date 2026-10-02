import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function RequireRole({ allow, children }) {
  const { role, booting, isLoggedIn } = useAuth()
  const location = useLocation()

  if (booting) {
    return <div className="grid min-h-64 place-items-center text-sm text-slate-500">Checking permissions…</div>
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!allow.includes(role)) {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />
  }
  return children
}

RequireRole.propTypes = {
  allow: PropTypes.arrayOf(PropTypes.oneOf(['student', 'counsellor', 'admin'])).isRequired,
  children: PropTypes.node.isRequired,
}
