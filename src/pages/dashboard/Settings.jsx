import { useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import useAuth from '../../hooks/useAuth.js'
import useTheme from '../../hooks/useTheme.js'
import useHub from '../../hooks/useHub.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

function Toggle({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {label}
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

Toggle.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default function Settings() {
  useDocumentTitle('Settings')

  const { student, updatePreferences, logout, isAdmin, isStudent } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { clearAll, bookings, activities, moods, seedSampleData } = useHub()
  const navigate = useNavigate()

  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )
  const [notificationMsg, setNotificationMsg] = useState('')

  const totalRecords = bookings.length + activities.length + moods.length

  const preferences = student?.preferences || {
    reminders: true,
    shareAnonymousStats: false,
    preferredMode: 'Video call',
  }

  async function handleSeed() {
    setIsSeeding(true)
    setSeedMsg('')
    try {
      const res = await seedSampleData()
      setSeedMsg(`✓ Successfully fed ${res.counsellorsCount} counsellors & ${res.blogsCount} blogs to Firestore!`)
    } catch (err) {
      setSeedMsg(`❌ Error: ${err.message}`)
    } finally {
      setIsSeeding(false)
    }
  }

  function handleClear() {
    clearAll()
    setIsConfirmingClear(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

 async function handleEnableNotifications() {
  if (!student?.uid) {
    setNotificationMsg('Sign in before enabling browser notifications.')
    return
  }

  setIsEnablingNotifications(true)
  setNotificationMsg('')

  try {
    const { enableNotifications } = await import(
      '../../firebase/messaging.js'
    )

    await enableNotifications(student.uid)

    setNotificationPermission(Notification.permission)
    setNotificationMsg(
      'Browser notifications are enabled on this device.',
    )
  } catch (error) {
    const permission =
      typeof Notification === 'undefined'
        ? 'unsupported'
        : Notification.permission

    setNotificationPermission(permission)
    setNotificationMsg(
      permission === 'denied'
        ? 'Notifications are blocked. Allow them in your browser settings.'
        : error.message || 'Browser notifications could not be enabled.',
    )
  } finally {
    setIsEnablingNotifications(false)
  }
}

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Appearance">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Theme</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Currently {theme}. The choice is remembered on this device.
            </p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Theme comes from ThemeContext, so every component reads it directly -
          no prop drilling.
        </p>
      </Card>

      <Card title="Notifications & privacy">
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Browser notifications
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {notificationPermission === 'granted'
                ? 'Enabled on this device. Your notification token refreshes when you sign in.'
                : notificationPermission === 'denied'
                  ? 'Blocked in this browser. Update the permission in site settings.'
                  : notificationPermission === 'unsupported'
                    ? 'This browser does not support Web Push notifications.'
                    : 'Enable appointment and wellbeing updates on this device.'}
            </p>
          </div>
          <Button
            variant="secondary"
            className="shrink-0"
            onClick={handleEnableNotifications}
            disabled={
              isEnablingNotifications
              || notificationPermission === 'granted'
              || notificationPermission === 'unsupported'
            }
          >
            {isEnablingNotifications
              ? 'Enabling...'
              : notificationPermission === 'granted'
                ? 'Notifications enabled'
                : 'Enable browser notifications'}
          </Button>
        </div>

        {notificationMsg && (
          <p
            role={notificationPermission === 'granted' ? 'status' : 'alert'}
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              notificationPermission === 'granted'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
            }`}
          >
            {notificationMsg}
          </p>
        )}

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          <Toggle
            id="reminders"
            label="Session reminders"
            description="Show a reminder on your dashboard 24 hours before a session."
            checked={Boolean(preferences.reminders)}
            onChange={(value) => updatePreferences({ reminders: value })}
          />
          <Toggle
            id="anon-stats"
            label="Share anonymous statistics"
            description="Help the service understand demand. Never includes your name or notes."
            checked={Boolean(preferences.shareAnonymousStats)}
            onChange={(value) => updatePreferences({ shareAnonymousStats: value })}
          />
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="preferred-mode">
            Preferred appointment type
          </label>
          <select
            id="preferred-mode"
            className="field"
            value={preferences.preferredMode || 'Video call'}
            onChange={(event) => updatePreferences({ preferredMode: event.target.value })}
          >
            {['In person', 'Video call', 'Phone'].map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {isStudent && <Card title="Your data" subtitle={`${totalRecords} cloud records linked to your account`}>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Bookings, check-ins and mood entries are stored in Cloud Firestore and synced
          across your signed-in devices. Clearing them cannot be undone.
        </p>

        {isConfirmingClear ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4
            dark:border-rose-900 dark:bg-rose-950/40">
            <p className="text-sm text-rose-900 dark:text-rose-100">
              Delete all {totalRecords} records permanently?
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" size="sm" onClick={handleClear}>
                Yes, delete everything
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsConfirmingClear(false)}>
                Keep my data
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            className="mt-4"
            disabled={totalRecords === 0}
            onClick={() => setIsConfirmingClear(true)}
          >
            Clear all my data
          </Button>
        )}
      </Card>}

      {isAdmin && <Card title="Cloud Database & Sample Data" subtitle="Feed sample practitioners and clinical blogs into Firestore">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Click below to populate or refresh Firestore with standard university counsellors and mental health resources.
        </p>
        <div className="mt-4">
          <Button onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? 'Feeding sample data…' : '⚡ Feed Sample Data to Firestore'}
          </Button>
          {seedMsg && (
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {seedMsg}
            </p>
          )}
        </div>
      </Card>}

      <Card title="Account">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Logging out keeps your cloud data securely linked to this account. Sign in
          again with the same email or Google account to continue.
        </p>
        <Button variant="secondary" className="mt-4" onClick={handleLogout}>
          Log out
        </Button>
      </Card>
    </div>
  )
}
