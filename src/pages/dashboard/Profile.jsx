import { useEffect, useState } from 'react'

import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'
import useAuth from '../../hooks/useAuth.js'
import useHub from '../../hooks/useHub.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import { uploadProfileImage } from '../../firebase/storage.js'

const courses = [
  'BSc (Hons) Software Engineering',
  'BSc (Hons) Computer Science',
  'BA (Hons) Business Management',
  'BSc (Hons) Psychology',
  'BEng (Hons) Civil Engineering',
]

export default function Profile() {
  useDocumentTitle('My profile')

  const { student, updateProfile } = useAuth()
  const { stats, bookings, activities, moods } = useHub()

  const profileImageUrl = student?.photoURL || student?.preferences?.profileImageUrl || ''
  const profileInitials = (student?.name || 'ST')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST'

  const [draft, setDraft] = useState({
    name: student?.name || '',
    email: student?.email || '',
    course: student?.course || '',
    year: student?.year || 1,
  })
  const [wasSaved, setWasSaved] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (student) {
      setDraft({
        name: student.name || '',
        email: student.email || '',
        course: student.course || '',
        year: student.year || 1,
      })
    }
  }, [student])

  useEffect(() => {
    if (!wasSaved) return undefined
    const timerId = window.setTimeout(() => setWasSaved(false), 3000)
    return () => window.clearTimeout(timerId)
  }, [wasSaved])

  function handleChange(event) {
    const { name, value } = event.target
    setDraft((current) => ({
      ...current,
      [name]: name === 'year' ? Number(value) : value,
    }))
  }

  async function handleProfileImageUpload(event) {
    const file = event.target.files?.[0]
    if (!file || !student?.uid) return

    try {
      setIsUploadingImage(true)
      setUploadError('')

      const uploadedUrl = await uploadProfileImage(student.uid, file)
      await updateProfile({
        photoURL: uploadedUrl,
        preferences: {
          ...(student.preferences || {}),
          profileImageUrl: uploadedUrl,
        },
      })

      setWasSaved(true)
    } catch (error) {
      setUploadError(error.message || 'Image upload failed.')
    } finally {
      setIsUploadingImage(false)
      event.target.value = ''
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    updateProfile(draft)
    setWasSaved(true)
  }

  const memberSince = student?.joinedAt
    ? new Date(student.joinedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card title="Your details" subtitle="Only you can see this. It never leaves your browser.">
          {wasSaved && (
            <p
              role="status"
              className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm
                text-brand-900 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-100"
            >
              Saved.
            </p>
          )}

          <div className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={student?.name ? `${student.name} profile` : 'Profile'}
                className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-slate-700"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-200 text-lg font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {profileInitials}
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Profile photo</p>
              <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-200 dark:hover:border-brand-700 dark:hover:bg-slate-800">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                  disabled={isUploadingImage}
                />
                {isUploadingImage ? 'Uploading...' : 'Upload image'}
              </label>
              {uploadError && (
                <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                  {uploadError}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="profile-name">
                  Preferred name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  className="field"
                  value={draft.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  className="field"
                  value={draft.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="profile-course">
                  Course
                </label>
                <select
                  id="profile-course"
                  name="course"
                  className="field"
                  value={draft.course}
                  onChange={handleChange}
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="profile-year">
                  Year of study
                </label>
                <select
                  id="profile-year"
                  name="year"
                  className="field"
                  value={draft.year}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save changes</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setDraft({
                    name: student?.name || '',
                    email: student?.email || '',
                    course: student?.course || '',
                    year: student?.year || 1,
                  })
                }
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Membership">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Student ID</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-300">
                {student?.studentId || '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Using the hub since</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-300">{memberSince}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Preferred appointment</dt>
              <dd className="font-medium text-slate-700 dark:text-slate-300">
                {student?.preferences?.preferredMode || 'Video call'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Your activity">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Bookings made</span>
              <Badge tone="brand">{bookings.length}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Activities logged</span>
              <Badge tone="calm">{activities.length}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Mood check-ins</span>
              <Badge tone="amber">{moods.length}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Average mood</span>
              <Badge tone="rose">{stats.averageMood || '—'}</Badge>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
