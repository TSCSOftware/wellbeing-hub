import { Link, useNavigate, useParams } from 'react-router-dom'

import PageLayout from '../components/PageLayout.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import BookingForm from '../components/BookingForm.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CrisisBanner from '../components/CrisisBanner.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import useHub from '../hooks/useHub.js'

export default function CounsellorDetails() {
  const { counsellorId } = useParams()
  const navigate = useNavigate()
  const { findCounsellorById } = useHub()

  const counsellor = findCounsellorById(counsellorId)

  useDocumentTitle(counsellor ? counsellor.name : 'Counsellor not found')

  if (!counsellor) {
    return (
      <PageLayout title="Counsellor not found">
        <EmptyState
          icon="🤷"
          title={`No counsellor with the id "${counsellorId}"`}
          message="The link may be out of date. Browse the full list instead."
          action={
            <Button onClick={() => navigate('/counsellors')}>
              Back to all counsellors
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const { name, role, focus, bio, rating, reviews, languages, modes, avatarInitials, accent, location, slots } =
    counsellor

  const profile = (
    <>
      <Card>
        <div className="flex items-center gap-4">
          <span
            className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-xl
              font-bold text-white ${accent === 'calm' ? 'bg-calm-600' : 'bg-brand-600'}`}
            aria-hidden="true"
          >
            {avatarInitials}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              ★ {rating} <span className="text-slate-400">({reviews} reviews)</span>
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="label">Where</dt>
            <dd className="text-slate-700 dark:text-slate-300">{location}</dd>
          </div>
          <div>
            <dt className="label">Slots open this week</dt>
            <dd className="text-slate-700 dark:text-slate-300">{slots.length}</dd>
          </div>
          <div>
            <dt className="label">Languages</dt>
            <dd className="text-slate-700 dark:text-slate-300">{languages.join(', ')}</dd>
          </div>
          <div>
            <dt className="label">Appointment types</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {modes.map((mode) => (
                <Badge key={mode} tone="calm">
                  {mode}
                </Badge>
              ))}
            </dd>
          </div>
          <div>
            <dt className="label">Focus areas</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {focus.map((area) => (
                <Badge key={area} tone="brand">
                  {area}
                </Badge>
              ))}
            </dd>
          </div>
        </dl>
      </Card>

      <Card title="Confidentiality">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          What you say stays between you and your counsellor. The only exception
          is a serious risk to your safety or someone else&apos;s, which the
          service is required to act on.
        </p>
      </Card>

      <CrisisBanner isCompact />
    </>
  )

  return (
    <PageLayout
      eyebrow={
        <Link to="/counsellors" className="hover:underline">
          ← All counsellors
        </Link>
      }
      title={`Book with ${name}`}
      intro={bio}
      sidebar={profile}
      content={
        <>
          <Card
            title="About the sessions"
            subtitle="50 minutes · free for enrolled students"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">
              First appointments are a relaxed conversation about what is going
              on and what kind of support would help. You are never obliged to
              talk about anything you are not ready for, and you can change
              counsellor at any point.
            </p>
          </Card>

          <Card title="Book a session" subtitle="Three quick steps. You can cancel any time.">
            <BookingForm counsellor={counsellor} />
          </Card>
        </>
      }
    />
  )
}
