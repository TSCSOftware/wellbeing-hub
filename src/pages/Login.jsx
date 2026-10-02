import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function Login() {
  useDocumentTitle('Sign in')
  const { login, register, resetPassword, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/dashboard'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', studentId: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const emailRef = useRef(null)

  useEffect(() => emailRef.current?.focus(), [mode])
  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true })
  }, [isLoggedIn, navigate, redirectTo])

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    setMessage('')
  }

  async function submit(event) {
    event.preventDefault()
    if (!form.email.includes('@')) return setError('Enter a valid email address.')
    if (form.password.length < 6) return setError('Password must contain at least 6 characters.')
    if (mode === 'register' && !form.name.trim()) {
      return setError('Name is required.')
    }
    setPending(true)
    try {
      if (mode === 'register') await register(form)
      else await login(form)
    } catch (reason) {
      setError(reason.message.replace('Firebase: ', ''))
    } finally {
      setPending(false)
    }
  }

  async function forgot() {
    if (!form.email.includes('@')) return setError('Enter your email first.')
    try {
      await resetPassword(form.email)
      setMessage('Password reset email sent. Check your inbox.')
    } catch (reason) { setError(reason.message.replace('Firebase: ', '')) }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <div className="mb-7 text-center">
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Secure student account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Your wellbeing records sync privately across your signed-in devices.
        </p>
      </div>

      <Card>
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {['login', 'register'].map((item) => (
            <button key={item} type="button" onClick={() => setMode(item)}
              className={`min-h-10 rounded-lg text-sm font-semibold ${mode === item ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-300'}`}>
              {item === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="space-y-4">
          {mode === 'register' && <>
            <div><label className="label" htmlFor="name">Full name</label><input className="field" id="name" name="name" autoComplete="name" value={form.name} onChange={change} placeholder="e.g. Maya Silva" /></div>
            <div><label className="label" htmlFor="studentId">Student ID</label><input className="field" id="studentId" name="studentId" autoComplete="username" value={form.studentId} onChange={change} placeholder="e.g. S-2024-889" /></div>
          </>}
          <div><label className="label" htmlFor="email">Email</label><input ref={emailRef} className="field" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} /></div>
          <div><label className="label" htmlFor="password">Password</label><input className="field" id="password" name="password" type="password" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={change} /></div>
          {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
          <Button type="submit" isFullWidth size="lg" disabled={pending}>{pending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</Button>
          {mode === 'login' && <button type="button" onClick={forgot} className="w-full text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">Forgot password?</button>}
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Prefer not to sign in? <Link to="/resources" className="text-brand-700 hover:underline dark:text-brand-300">Browse resources</Link>.
      </p>
    </div>
  )
}
