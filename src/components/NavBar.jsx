import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import Button from './Button.jsx'
import useAuth from '../hooks/useAuth.js'
import useHub from '../hooks/useHub.js'
import useTheme from '../hooks/useTheme.js'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/counsellors', label: 'Counsellors' },
  { to: '/resources', label: 'Resources & Blogs' },
  { to: '/health-news', label: 'Health News' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`

export default function NavBar() {
  const { student, isLoggedIn, logout } = useAuth()
  const { stats } = useHub()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  /* Close the mobile menu whenever the route changes.
     Dependency list = [location.pathname], so it fires on navigation only. */
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  /* useNavigate: navigating from CODE rather than from a click on a Link. */
  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85
      backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {/* A Link, not an <a>: swaps the component instantly, no reload. */}
        <Link
          to="/"
          aria-label="Wellbeing Hub home"
          className="mr-2 flex items-center gap-2"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg
              text-white shadow-sm"
            aria-hidden="true"
          >
            🌿
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold text-slate-900 dark:text-slate-50">
              Wellbeing Hub
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              Private student support
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {isLoggedIn && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
              {stats.upcoming.length > 0 && (
                <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {stats.upcoming.length}
                </span>
              )}
            </NavLink>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200
              bg-white p-1.5 shadow-sm transition-colors hover:bg-slate-100
              dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <img
              src={isDark ? '/images/day-mode.webp' : '/images/moon.webp'}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 object-contain"
            />
          </button>

          {isLoggedIn && student ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  student.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : student.role === 'counsellor'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {student.role || 'student'}
              </span>
              <Link
                to="/dashboard/profile"
                aria-label={`Open profile for ${student?.name || 'User'}`}
                className="grid h-9 w-9 place-items-center rounded-full bg-calm-600
                  text-xs font-bold text-white shadow-sm"
                title={`${student?.name || 'User'} (${student?.role || 'student'})`}
              >
                {(student?.name || 'ST').slice(0, 2).toUpperCase()}
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Log in
            </Button>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden
              dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Conditional rendering driven by useState */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            {isLoggedIn ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
