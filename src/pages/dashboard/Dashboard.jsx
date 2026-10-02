import { NavLink, Outlet } from 'react-router-dom'

import useAuth from '../../hooks/useAuth.js'
import useHub from '../../hooks/useHub.js'

export default function Dashboard() {
  const { student, role, isAdmin, isCounsellor, isStudent } = useAuth()
  const { stats } = useHub()

  const tabs = [
    { to: '/dashboard', label: 'Overview', icon: '', end: true },
    ...(isAdmin || isCounsellor
      ? [{
          to: '/dashboard/manage-counsellors',
          label: isAdmin ? 'Counsellors' : 'My Availability',
          icon: '',
        }]
      : []),
    ...(isAdmin
      ? [{ to: '/dashboard/notifications', label: 'Notifications', icon: '' }]
      : []),
    ...(isAdmin || isCounsellor ? [{ to: '/dashboard/manage-blogs', label: 'Blogs & Articles', icon: '' }] : []),
    {
      to: '/dashboard/bookings',
      label: isCounsellor ? 'Sessions' : 'Bookings',
      icon: '',
      badge: stats.upcoming.length > 0 ? stats.upcoming.length : null,
    },
    ...(isStudent ? [{ to: '/dashboard/selfcare', label: 'Check-ins', icon: '' }] : []),
    { to: '/dashboard/profile', label: 'Profile', icon: '' },
    { to: '/dashboard/settings', label: 'Settings', icon: '' },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              {isAdmin ? 'System Administrator Portal' : isCounsellor ? 'Counsellor Practitioner Portal' : 'Student Private Dashboard'}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : isCounsellor
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {isAdmin ? ' Admin' : isCounsellor ? ' Counsellor' : ' Student'}
            </span>
          </div>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {student?.name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {[
              student?.studentId ? `ID: ${student.studentId}` : null,
              student?.course || null,
              student?.year ? `Year ${student.year}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || `${role.charAt(0).toUpperCase() + role.slice(1)} account`}
          </p>
        </div>

      </header>

      <nav
        aria-label="Dashboard sections"
        className="mb-8 flex gap-1 overflow-x-auto rounded-xl2 border border-slate-200
          bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span className="rounded-full bg-white/25 px-1.5 text-xs">
                {tab.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
