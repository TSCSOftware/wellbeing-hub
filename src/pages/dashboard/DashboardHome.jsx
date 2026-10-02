import { useState } from 'react'
import { Link } from 'react-router-dom'

import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'
import StatCard from '../../components/StatCard.jsx'
import MoodTracker from '../../components/MoodTracker.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import useHub from '../../hooks/useHub.js'
import useAuth from '../../hooks/useAuth.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

export default function DashboardHome() {
  useDocumentTitle('Dashboard')

  const {
    stats,
    activities,
    moods,
    recordMood,
    counsellors,
    counsellorsFromFirestore,
    blogs,
    blogsFromFirestore,
    seedSampleData,
    allAppointments,
  } = useHub()

  const { student, isAdmin, isCounsellor, isStudent, role } = useAuth()

  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState('')

  async function handleSeedData() {
    setIsSeeding(true)
    setSeedResult('')
    try {
      const res = await seedSampleData()
      setSeedResult(
        `✓ Successfully fed sample data to Firestore! (${res.counsellorsCount} counsellors & ${res.blogsCount} blogs populated in collections 'counsellors' and 'blogs')`
      )
    } catch (err) {
      setSeedResult(`❌ Failed to seed data: ${err.message}`)
    } finally {
      setIsSeeding(false)
    }
  }

  const recent = activities.slice(0, 5)
  const suggestion = blogs[(stats.weeklyActivities + (student?.year || 1)) % (blogs.length || 1)] || blogs[0]

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Counsellors"
            value={counsellors.length}
            iconImage="/images/therapist.png"
            tone="brand"
          />
          <StatCard
            label="Published Blogs"
            value={blogs.length}
            iconImage="/images/blog.jpg"
            tone="calm"
          />
          <StatCard
            label="Total Appointments"
            value={allAppointments.length || stats.totalBookings}
            iconImage="/images/calender.jpg"
            tone="amber"
          />
          <StatCard
            label="Active Role"
            value="Admin"
            hint="Full hub permissions"
            iconImage="/images/grp-medi.webp"
            tone="rose"
          />
        </div>
      ) : isCounsellor ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="My Next Session"
            value={stats.nextSession ? `${stats.nextSession.day} ${stats.nextSession.time}` : 'None'}
            hint={stats.nextSession ? stats.nextSession.studentName || 'Student booked' : 'Open slots available'}
            iconImage="/images/calender.jpg"
            tone="brand"
          />
          <StatCard
            label="Active Bookings"
            value={stats.upcoming.length}
            hint="Upcoming confirmed sessions"
            iconImage="/images/grp-medi.webp"
            tone="calm"
          />
          <StatCard
            label="Published Blogs"
            value={blogs.length}
            hint="Accessible by students"
            iconImage="/images/blog.jpg"
            tone="amber"
          />
          <StatCard
            label="Practitioner Status"
            value="Active"
            hint="Available for booking"
            iconImage="/images/therapist.png"
            tone="rose"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Self-care points"
            value={stats.weeklyPoints}
            hint="Earned in the last 7 days"
            iconImage="/images/grp-medi.webp"
          />
          <StatCard
            label="Active days"
            value={`${stats.activeDays}/7`}
            hint="Days with at least one activity"
            iconImage="/images/blog.jpg"
            tone="calm"
          />
          <StatCard
            label="Current streak"
            value={`${stats.streak} d`}
            hint="Keep it going - one small thing counts"
            iconImage="/images/therapist.png"
            tone="amber"
          />
          <StatCard
            label="Upcoming sessions"
            value={stats.upcoming.length}
            hint={`${stats.totalBookings} bookings in total`}
            iconImage="/images/calender.jpg"
            tone="rose"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {isAdmin ? (
            <Card
              title="Admin Quick Management Actions"
              subtitle="Perform core administrative duties for the Student Wellbeing Hub"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <span className="text-2xl"></span>
                  <h4 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    Counsellor Management
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Add new mental health practitioners to the live Firestore directory.
                  </p>
                  <Link to="/dashboard/manage-counsellors" className="mt-3 block">
                    <Button size="sm" isFullWidth>
                      + Add & Manage Counsellors
                    </Button>
                  </Link>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <span className="text-2xl"></span>
                  <h4 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    Blog & Resource Publishing
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Write evidence-based mental health articles for students.
                  </p>
                  <Link to="/dashboard/manage-blogs" className="mt-3 block">
                    <Button size="sm" variant="secondary" isFullWidth>
                      + Create New Blog
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : isCounsellor ? (
            <Card
              title="Counsellor Practitioner Actions"
              subtitle="Publish articles and review your upcoming student appointments"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <span className="text-2xl"></span>
                  <h4 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    Publish a Wellbeing Blog
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Share clinical guidance, grounding tools, and advice with students.
                  </p>
                  <Link to="/dashboard/manage-blogs" className="mt-3 block">
                    <Button size="sm" isFullWidth>
                      Write New Article
                    </Button>
                  </Link>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <span className="text-2xl"></span>
                  <h4 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    Upcoming Appointments
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Review confirmed student consultation requests and notes.
                  </p>
                  <Link to="/dashboard/bookings" className="mt-3 block">
                    <Button size="sm" variant="secondary" isFullWidth>
                      View All Sessions ({stats.upcoming.length})
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card
              title="Weekly wellbeing goal"
              subtitle="20 self-care points a week is a healthy, realistic target."
            >
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                role="progressbar"
                aria-valuenow={stats.weeklyGoalPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Weekly self-care goal progress"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-calm-500 transition-all duration-500"
                  style={{ width: `${stats.weeklyGoalPercent}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {stats.weeklyGoalPercent}% of this week&apos;s goal · {stats.weeklyMinutes} minutes logged
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/dashboard/selfcare">
                  <Button size="sm" variant="calm">
                    Log an activity
                  </Button>
                </Link>
                <Link to="/counsellors">
                  <Button size="sm" variant="secondary">
                    Book an appointment
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          <Card
            title={isCounsellor ? 'Next Student Session' : 'Next Counselling Session'}
            actions={
              <Link to="/dashboard/bookings">
                <Button size="sm" variant="ghost">
                  All bookings
                </Button>
              </Link>
            }
          >
            {stats.nextSession ? (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/40">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {stats.nextSession.counsellorName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Topic: {stats.nextSession.topic}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand-700 dark:text-brand-300">
                    {stats.nextSession.day} {stats.nextSession.date}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stats.nextSession.time} · {stats.nextSession.mode}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon=""
                title="No sessions booked"
                message="Students can browse all professional counsellors loaded from Firestore and book a confidential slot."
                action={
                  <Link to="/counsellors">
                    <Button>Find a counsellor</Button>
                  </Link>
                }
              />
            )}
          </Card>

          {isStudent && (
            <Card
              title="Recent self-care"
              actions={
                <Link to="/dashboard/selfcare">
                  <Button size="sm" variant="ghost">
                    Full log
                  </Button>
                </Link>
              }
            >
              {recent.length > 0 ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {recent.map((activity) => (
                    <li key={activity.id} className="flex items-center gap-3 py-2.5">
                      <span className="text-xl" aria-hidden="true">
                        {activity.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {activity.label}
                        </p>
                        {activity.note && (
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {activity.note}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{activity.minutes} min</span>
                      <Badge tone="brand">+{activity.points}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon="🌱"
                  title="Nothing logged yet"
                  message="Sleep, a walk, a real conversation - it all counts."
                  action={
                    <Link to="/dashboard/selfcare">
                      <Button>Log your first activity</Button>
                    </Link>
                  }
                />
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Mood check-in" subtitle="One tap. It builds a picture over time.">
            <MoodTracker moods={moods} onRecord={recordMood} />
          </Card>

          {suggestion && (
            <Card title="Suggested wellbeing read">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
                {suggestion.category}
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                {suggestion.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {suggestion.summary}
              </p>
              <Link to={`/resources/${suggestion.id}`}>
                <Button size="sm" variant="secondary" className="mt-4">
                  Read article ({suggestion.minutes} min)
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
