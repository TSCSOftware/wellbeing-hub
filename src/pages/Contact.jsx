import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

import PageLayout from '../components/PageLayout.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import CrisisBanner from '../components/CrisisBanner.jsx'
import { db } from '../firebase/config.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import useAuth from '../hooks/useAuth.js'

const reasons = [
  'General question',
  'Booking or rescheduling',
  'Accessibility / study adjustments',
  'Feedback about the service',
  'Something else',
]

const emptyForm = { name: '', email: '', reason: reasons[0], message: '' }

export default function Contact() {
  useDocumentTitle('Contact us')

  const { firebaseUser, student, isLoggedIn } = useAuth()

  const [form, setForm] = useState(() =>
    isLoggedIn && student
      ? { ...emptyForm, name: student.name || '', email: student.email || '' }
      : emptyForm,
  )

  useEffect(() => {
    if (student) {
      setForm((current) => ({
        ...current,
        name: current.name || student.name || '',
        email: current.email || student.email || '',
      }))
    }
  }, [student])
  const [errors, setErrors] = useState({})
  const [wasSent, setWasSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const nameRef = useRef(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Please tell us your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'That does not look like an email address.'
    if (form.message.trim().length < 10) next.message = 'A little more detail helps us route your message.'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    setSubmitError('')

    if (Object.keys(found).length > 0) {
      if (found.name && nameRef.current) nameRef.current.focus()
      return
    }

    setIsSending(true)

    try {
      await addDoc(collection(db, 'messages'), {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        reason: form.reason,
        message: form.message.trim(),
        userUid: firebaseUser?.uid || null,
        status: 'new',
        createdAt: serverTimestamp(),
        createdAtClient: new Date().toISOString(),
      })
      setWasSent(true)
      setForm(emptyForm)
    } catch (reason) {
      setSubmitError(reason.message || 'Your message could not be sent. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <PageLayout
      eyebrow="Contact"
      title="Send us a message"
      intro="For anything that is not urgent. We reply within two working days. If you need help now, use the 24/7 line instead."
      sidebar={
        <>
          <CrisisBanner isCompact />
          <Card title="Other ways to reach us">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="label">Email</dt>
                <dd className="text-slate-700 dark:text-slate-300">wellbeing@campus.edu</dd>
              </div>
              <div>
                <dt className="label">Phone (office hours)</dt>
                <dd className="text-slate-700 dark:text-slate-300">011 234 5678</dd>
              </div>
              <div>
                <dt className="label">Drop-in</dt>
                <dd className="text-slate-700 dark:text-slate-300">
                  Student Services, Block C, Level 2. No appointment needed,
                  weekdays 11:00 - 15:00.
                </dd>
              </div>
            </dl>
          </Card>
        </>
      }
      content={
        <Card title="Message form">
          {wasSent && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm
                text-brand-900 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-100"
            >
              Thanks - your message has been queued. Someone from the wellbeing
              team will reply within two working days.
            </p>
          )}

          {submitError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm
                text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
            >
              {submitError}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">
                  Your name
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  className="field"
                  value={form.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
              </div>

              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="field"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reason">
                What is it about?
              </label>
              <select
                id="reason"
                name="reason"
                className="field"
                value={form.reason}
                onChange={handleChange}
              >
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="field"
                placeholder="Tell us what you need. You do not have to go into detail."
                value={form.message}
                onChange={handleChange}
                aria-invalid={Boolean(errors.message)}
              />
              <div className="mt-1 flex justify-between text-xs">
                {errors.message ? (
                  <span className="text-rose-600">{errors.message}</span>
                ) : (
                  <span className="text-slate-400">Minimum 10 characters.</span>
                )}
                <span className="text-slate-400">{form.message.length} characters</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send message'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setForm(emptyForm)
                  setErrors({})
                  setWasSent(false)
                  setSubmitError('')
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </Card>
      }
    />
  )
}
