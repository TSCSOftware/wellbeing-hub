import { useState } from 'react'
import { Link } from 'react-router-dom'

import InstallButton from './InstallButton.jsx'
import useAuth from '../hooks/useAuth.js'
import { seedSampleDataInBrowser } from '../firebase/seedSampleData.js'

export default function Footer() {
  const { isAdmin } = useAuth()
  const [seedStatus, setSeedStatus] = useState('idle')
  const [seedMessage, setSeedMessage] = useState('')
  const [seedPassword, setSeedPassword] = useState('')

  async function createSampleData() {
    setSeedStatus('pending')
    setSeedMessage('')

    try {
      const data = await seedSampleDataInBrowser(seedPassword)
      setSeedStatus('success')
      setSeedMessage(`Created ${data.created} accounts; ${data.existing} already existed.`)
    } catch (error) {
      setSeedStatus('error')
      setSeedMessage(error.message.replace('Firebase: ', ''))
    }
  }

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-10
      dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
            🌿 Student Wellbeing &amp; Support Hub
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Book counselling, log self-care and find resources - all in one place.
            A React teaching project.
          </p>
          <div className="mt-4">
            <InstallButton />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Explore
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link to="/counsellors" className="text-slate-600 hover:text-brand-600 dark:text-slate-400">
                Find a counsellor
              </Link>
            </li>
            <li>
              <Link to="/resources" className="text-slate-600 hover:text-brand-600 dark:text-slate-400">
                Resource library
              </Link>
            </li>
            <li>
              <Link to="/dashboard/selfcare" className="text-slate-600 hover:text-brand-600 dark:text-slate-400">
                Log self-care
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-slate-600 hover:text-brand-600 dark:text-slate-400">
                About the hub
              </Link>
            </li>
          </ul>
        </div>

        <div className="rounded-xl2 bg-rose-50 p-4 dark:bg-rose-950/40">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-700 dark:text-rose-300">
            Need help now?
          </p>
          <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">
            If you are in crisis, do not wait for a booking.
          </p>
          <p className="mt-2 text-sm font-semibold text-rose-900 dark:text-rose-100">
            24/7 support line: 1926
          </p>
       
        </div>
      </div>

     
    </footer>
  )
}
