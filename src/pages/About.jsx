import { Link } from 'react-router-dom'

import PageLayout from '../components/PageLayout.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

const promises = [
  {
    title: 'Confidential by default',
    text: 'Sessions are private between you and your counsellor. Nothing appears on your academic record. The only exception is a serious risk to life.',
  },
  {
    title: 'Free for enrolled students',
    text: 'Every counselling appointment, workshop and resource in this hub is included in your registration. There is no cap on sessions.',
  },
  {
    title: 'You are in control',
    text: 'You choose the counsellor, the appointment type and how much you share. You can cancel or switch counsellor at any point.',
  },
  {
    title: 'Your data stays on your device',
    text: 'This demo stores your bookings, self-care log and mood check-ins in your own browser (localStorage). Clearing them removes them for good.',
  },
]

const team = [
  { name: 'Student Support Services', role: 'Counselling, casework and disability support' },
  { name: 'Peer Wellbeing Champions', role: 'Trained students running drop-ins and workshops' },
  { name: 'Campus Health Centre', role: 'GP appointments, medication reviews, referrals' },
  { name: 'Students\u2019 Union Advice', role: 'Money, housing, academic appeals' },
]

export default function About() {
  useDocumentTitle('About the hub')

  return (
    <PageLayout
      eyebrow="About"
      title="What this hub is for"
      intro="The Student Wellbeing & Support Hub brings counselling, self-care tracking and practical resources into one place, so that asking for help takes one step instead of five."
      sidebar={
        <>
          <Card title="Opening hours">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Mon - Thu</dt>
                <dd className="text-slate-700 dark:text-slate-300">09:00 - 17:30</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Friday</dt>
                <dd className="text-slate-700 dark:text-slate-300">09:00 - 16:00</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Weekend</dt>
                <dd className="text-slate-700 dark:text-slate-300">Crisis line only</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-900
              dark:bg-rose-950/50 dark:text-rose-100">
              24/7 support line: <strong>1926</strong>
             
              
            </p>
          </Card>

          <Card title="Who you can talk to">
            <ul className="space-y-3 text-sm">
              {team.map((item) => (
                <li key={item.name}>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">{item.role}</p>
                </li>
              ))}
            </ul>
          </Card>
        </>
      }
      content={
        <>
          <Card title="Our four promises">
            <div className="grid gap-4 sm:grid-cols-2">
              {promises.map((promise) => (
                <div
                  key={promise.title}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {promise.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                    {promise.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="How a booking works">
            <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong>1.</strong> Browse counsellors and filter by what is going
                on for you.
              </li>
              <li>
                <strong>2.</strong> Pick a slot, choose in person / video / phone,
                and add a one-line topic.
              </li>
              <li>
                <strong>3.</strong> Confirm. The session appears instantly under{' '}
                <em>Dashboard → Bookings</em>, where you can cancel it any time.
              </li>
              <li>
                <strong>4.</strong> Turn up. That is genuinely the hardest part,
                and it gets easier.
              </li>
            </ol>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/counsellors">
                <Button>Browse counsellors</Button>
              </Link>
              <Link to="/resources">
                <Button variant="secondary">Read a resource first</Button>
              </Link>
            </div>
          </Card>

          <Card title="Built as a React teaching project">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This hub is a working demonstration of the React topics covered in
              class: props and composition, useState, useEffect, useRef,
              useContext and React Router, all styled with Tailwind CSS v4 through
              the Vite plugin.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['props', 'useState', 'useEffect', 'useRef', 'useContext', 'react-router', 'tailwind'].map(
                (tag) => (
                  <Badge key={tag} tone="brand">
                    {tag}
                  </Badge>
                ),
              )}
            </div>
          </Card>
        </>
      }
    />
  )
}
