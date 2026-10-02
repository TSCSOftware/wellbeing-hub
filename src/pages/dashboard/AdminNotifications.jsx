import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { auth, db } from '../../firebase/config.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const initialMessage = {
  title: '',
  body: '',
  url: '/dashboard',
}

const pushApiUrl = import.meta.env.VITE_PUSH_API_URL

export default function AdminNotifications() {
  useDocumentTitle('Send Notifications')

  const [users, setUsers] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(initialMessage)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    let isCurrent = true

    async function loadUsers() {
      try {
        const snapshot = await getDocs(query(collection(db, 'users'), orderBy('name')))
        if (!isCurrent) return
        setUsers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      } catch (reason) {
        if (isCurrent) setError(reason.message || 'Could not load users.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadUsers()
    return () => { isCurrent = false }
  }, [])

  const needle = search.trim().toLowerCase()
  const visibleUsers = users.filter((user) => {
    if (!needle) return true
    return [user.name, user.email, user.studentId, user.role]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle))
  })

  function toggleUser(uid) {
    setSelectedIds((current) =>
      current.includes(uid)
        ? current.filter((item) => item !== uid)
        : [...current, uid],
    )
  }

  function toggleVisibleUsers() {
    const visibleIds = visibleUsers.map((user) => user.id)
    const allVisibleSelected = visibleIds.length > 0
      && visibleIds.every((uid) => selectedIds.includes(uid))

    setSelectedIds((current) => allVisibleSelected
      ? current.filter((uid) => !visibleIds.includes(uid))
      : [...new Set([...current, ...visibleIds])],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setResult(null)

    if (!selectedIds.length) {
      setError('Select at least one user.')
      return
    }

    setIsSending(true)
    try {
      if (!pushApiUrl) {
        throw new Error('Add VITE_PUSH_API_URL before sending notifications.')
      }
      if (!auth.currentUser) {
        throw new Error('Sign in again before sending notifications.')
      }

      const idToken = await auth.currentUser.getIdToken()
      const response = await fetch(pushApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedIds,
          title: message.title.trim(),
          body: message.body.trim(),
          url: message.url.trim() || '/dashboard',
        }),
      })

      const responseBody = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(responseBody.error || 'Notification delivery failed.')
      }

      setResult(responseBody)
      setMessage(initialMessage)
      setSelectedIds([])
    } catch (reason) {
      setError(reason.message || 'Notification delivery failed.')
    } finally {
      setIsSending(false)
    }
  }

  const allVisibleSelected = visibleUsers.length > 0
    && visibleUsers.every((user) => selectedIds.includes(user.id))

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Firebase Cloud Messaging
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
          Send Web Push Notification
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Compose a message and choose the accounts that should receive it.
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {result && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Delivered to {result.successCount} of {result.targetDevices} registered devices for {result.selectedUsers} selected users.
          {result.failureCount > 0 ? ` ${result.failureCount} deliveries failed.` : ''}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <Card title="Message" subtitle={`${selectedIds.length} users selected`}>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="notification-title">Title</label>
              <input
                id="notification-title"
                className="field"
                maxLength={120}
                required
                value={message.title}
                onChange={(event) => setMessage({ ...message, title: event.target.value })}
              />
              <p className="mt-1 text-right text-xs text-slate-400">{message.title.length}/120</p>
            </div>

            <div>
              <label className="label" htmlFor="notification-body">Message</label>
              <textarea
                id="notification-body"
                className="field resize-y"
                rows={6}
                maxLength={500}
                required
                value={message.body}
                onChange={(event) => setMessage({ ...message, body: event.target.value })}
              />
              <p className="mt-1 text-right text-xs text-slate-400">{message.body.length}/500</p>
            </div>

            <div>
              <label className="label" htmlFor="notification-url">Open page</label>
              <input
                id="notification-url"
                className="field"
                placeholder="/dashboard"
                value={message.url}
                onChange={(event) => setMessage({ ...message, url: event.target.value })}
              />
            </div>

            <Button type="submit" disabled={isSending || !selectedIds.length}>
              {isSending ? 'Sending...' : `Send to ${selectedIds.length} users`}
            </Button>
          </div>
        </Card>

        <Card
          title="Recipients"
          actions={(
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!visibleUsers.length}
              onClick={toggleVisibleUsers}
            >
              {allVisibleSelected ? 'Clear visible' : 'Select visible'}
            </Button>
          )}
        >
          <input
            type="search"
            className="field mb-3"
            aria-label="Search users"
            placeholder="Search name, email, ID, or role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading users...</p>
          ) : visibleUsers.length === 0 ? (
            <EmptyState icon="🔔" title="No users found" message="Try a different search term." />
          ) : (
            <div className="max-h-[32rem] divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
              {visibleUsers.map((user) => (
                <label key={user.id} className="flex cursor-pointer items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-brand-600"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user.name || 'Unnamed user'}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {user.email || user.id}
                    </span>
                    <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {user.role || 'student'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </Card>
      </form>
    </div>
  )
}
