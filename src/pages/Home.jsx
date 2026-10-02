import { Link } from 'react-router-dom'

import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import CrisisBanner from '../components/CrisisBanner.jsx'
import StatCard from '../components/StatCard.jsx'
import useAuth from '../hooks/useAuth.js'
import useHub from '../hooks/useHub.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

const steps = [
  {
    number: '01',
    icon: '🗓️',
    title: 'Book a session',
    text: 'Browse counsellors by what you actually need help with, pick a slot and confirm in under a minute.',
    to: '/counsellors',
    cta: 'Find a counsellor',
  },
  {
    number: '02',
    icon: '🌱',
    title: 'Complete a check-in',
    text: 'Sleep, movement, breathing, a real conversation. A quick mood and self-care check-in turns small actions into a useful weekly pattern.',
    to: '/dashboard/selfcare',
    cta: 'Start a check-in',
  },
  {
    number: '03',
    icon: '📚',
    title: 'Use the resources',
    text: 'Short, practical guides written for students - grounding, sleep, procrastination, burnout and more.',
    to: '/resources',
    cta: 'Open the library',
  },
]

export default function Home() {
  useDocumentTitle('Home')

  const { student, isLoggedIn } = useAuth()
  const { stats, counsellors, blogs } = useHub()

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-sand-50
        to-transparent dark:from-slate-900 dark:via-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Student Support Services
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900
                sm:text-5xl dark:text-slate-50">
                {isLoggedIn && student ? (
                  <>
                    Welcome back,{' '}
                    <span className="text-brand-600 dark:text-brand-400">
                      {(student?.name || 'Student').split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    Your wellbeing,{' '}
                    <span className="text-brand-600 dark:text-brand-400">
                      one small step at a time
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
                Book counselling sessions, keep track of the things that actually
                help, and find short practical resources - all in one place, and
                all private to you.
              </p>

<div className="mt-8 flex flex-wrap gap-4">
  <Button  size="lg" className="min-h-11">
    <Link to="/counsellors">
      Book a counselling session
    </Link>
  </Button>

  <Button
    size="lg"
    variant="secondary"
    className="min-h-11"
  >
    <Link to={isLoggedIn ? "/dashboard" : "/login"}>
      {isLoggedIn ? "Go to my dashboard" : "Log in"}
    </Link>
  </Button>
</div>
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                {counsellors.length} counsellors · {blogs.length} resources & blogs ·
                confidential
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
            
              <img src="/images/grp-medi.webp" alt="" style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <CrisisBanner />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Three ways to use the hub
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          You do not have to be in crisis to be here. Most students use the hub
          for the ordinary difficult weeks.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.number} isHoverable>
              <span className="text-3xl" aria-hidden="true">
                {step.icon}
              </span>
              <p className="mt-4 text-xs font-bold tracking-widest text-brand-500">
                {step.number}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {step.text}
              </p>
              <Link
                to={step.to}
                className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline
                  dark:text-brand-300"
              >
                {step.cta} →
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <Card
          title="Start with something small today"
          subtitle="Two minutes of box breathing counts. So does going outside."
          actions={
            <Link to="/dashboard/selfcare">
              <Button variant="calm" size="sm">
                Open today’s check-in
              </Button>
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {blogs.slice(0, 3).map((resource) => (
              <Link
                key={resource.id}
                to={`/resources/${resource.id}`}
                className="rounded-lg border border-slate-200 p-4 transition hover:border-brand-400
                  dark:border-slate-800"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600
                  dark:text-brand-400">
                  {resource.category}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {resource.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {resource.minutes} min read
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}
