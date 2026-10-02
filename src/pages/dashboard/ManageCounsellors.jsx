import { useState } from 'react'
import { Link } from 'react-router-dom'

import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import useHub from '../../hooks/useHub.js'
import useAuth from '../../hooks/useAuth.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const sampleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const emptySlot = { date: '', time: '' }

function dayFromDate(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`))
}

function SlotEditor({ counsellor, updateCounsellorSlots, setSuccessMsg, setErrorMsg }) {
  const [draft, setDraft] = useState(emptySlot)
  const [editingId, setEditingId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const slots = counsellor.slots || []

  async function persist(nextSlots, message) {
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await updateCounsellorSlots(counsellor.id, nextSlots)
      setDraft(emptySlot)
      setEditingId('')
      setSuccessMsg(message)
    } catch (error) {
      setErrorMsg(error.message || 'Failed to update time slots.')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveSlot(event) {
    event.preventDefault()
    if (!draft.date || !draft.time) {
      setErrorMsg('Select both a date and time.')
      return
    }

    const duplicate = slots.some((slot) =>
      slot.id !== editingId && slot.date === draft.date && slot.time === draft.time,
    )
    if (duplicate) {
      setErrorMsg('That date and time already exists.')
      return
    }

    const nextSlot = {
      id: editingId || `s-${counsellor.id}-${Date.now()}`,
      day: dayFromDate(draft.date),
      date: draft.date,
      time: draft.time,
      enabled: editingId
        ? slots.find((slot) => slot.id === editingId)?.enabled !== false
        : true,
    }
    const nextSlots = editingId
      ? slots.map((slot) => slot.id === editingId ? nextSlot : slot)
      : [...slots, nextSlot]

    await persist(nextSlots, editingId ? 'Time slot updated.' : 'Time slot added.')
  }

  function beginEdit(slot) {
    setEditingId(slot.id)
    setDraft({ date: slot.date, time: slot.time })
    setErrorMsg('')
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Availability</h5>
        <span className="text-xs text-slate-500">{slots.length} slots</span>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
          >
            <span className="min-w-24 text-sm font-medium text-slate-800 dark:text-slate-200">
              {slot.day} {slot.date}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300">{slot.time}</span>
            <span className={`text-xs font-medium ${slot.enabled !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
              {slot.enabled !== false ? 'Available' : 'Disabled'}
            </span>
            <div className="ml-auto flex gap-1">
              <Button type="button" size="sm" variant="secondary" onClick={() => beginEdit(slot)}>
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isSaving}
                onClick={() => persist(
                  slots.map((item) => item.id === slot.id ? { ...item, enabled: item.enabled === false } : item),
                  slot.enabled === false ? 'Time slot enabled.' : 'Time slot disabled.',
                )}
              >
                {slot.enabled === false ? 'Enable' : 'Disable'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isSaving}
                onClick={() => persist(slots.filter((item) => item.id !== slot.id), 'Time slot deleted.')}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={saveSlot} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="date"
          className="field"
          aria-label="Slot date"
          value={draft.date}
          onChange={(event) => setDraft({ ...draft, date: event.target.value })}
          required
        />
        <input
          type="time"
          className="field"
          aria-label="Slot time"
          value={draft.time}
          onChange={(event) => setDraft({ ...draft, time: event.target.value })}
          required
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? 'Saving...' : editingId ? 'Save' : 'Add Slot'}
          </Button>
          {editingId && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setEditingId(''); setDraft(emptySlot) }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default function ManageCounsellors() {
  useDocumentTitle('Manage Counsellors')

  const { counsellors, addCounsellor, updateCounsellorSlots, counsellorsFromFirestore } = useHub()
  const { student, isAdmin, isCounsellor } = useAuth()
  const visibleCounsellors = isAdmin
    ? counsellors
    : counsellors.filter((counsellor) =>
        isCounsellor && counsellor.id === student?.counsellorId,
      )

  const [form, setForm] = useState({
    name: '',
    role: 'Clinical Psychologist',
    focus: 'Anxiety, Academic stress, Mindfulness',
    languages: 'English, Sinhala',
    location: 'Wellbeing Centre, Block B - Room 1.05',
    bio: '',
    accent: 'brand',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setErrorMsg('Counsellor name is required.')

    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const today = new Date()
      const generatedSlots = sampleDays.slice(0, 3).map((day, idx) => {
        const slotDate = new Date(today)
        slotDate.setDate(today.getDate() + idx + 2)
        return {
          id: `slot-${Date.now()}-${idx}`,
          day,
          date: slotDate.toISOString().slice(0, 10),
          time: idx === 0 ? '09:30' : idx === 1 ? '13:00' : '15:30',
          enabled: true,
        }
      })

      const created = await addCounsellor({
        ...form,
        slots: generatedSlots,
      })

      setSuccessMsg(`✓ Counsellor "${created.name}" created and synced to Firestore!`)
      setForm({
        name: '',
        role: 'Clinical Psychologist',
        focus: 'Anxiety, Academic stress, Mindfulness',
        languages: 'English, Sinhala',
        location: 'Wellbeing Centre, Block B - Room 1.05',
        bio: '',
        accent: 'brand',
      })
      setShowForm(false)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create counsellor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {isAdmin ? 'Counsellor Directory Management' : 'My Availability'}
            </h2>
            {counsellorsFromFirestore ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Firestore Connected
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Default Sample
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isAdmin
              ? 'Add counsellors and manage availability. Changes publish instantly to Firestore.'
              : 'Add, edit, disable, or delete your available appointment times.'}
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? '✕ Close Form' : '+ Add New Counsellor'}
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {isAdmin && showForm && (
        <Card title="Add a New Counsellor" subtitle="Stores directly in Firestore collection 'counsellors'">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div>
                <label className="label" htmlFor="counsellor-name">
                  Full Name & Title *
                </label>
                <input
                  id="counsellor-name"
                  className="field"
                  placeholder="e.g. Dr. Kasun Bandara"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="counsellor-role">
                  Professional Role *
                </label>
                <input
                  id="counsellor-role"
                  className="field"
                  placeholder="e.g. Senior Clinical Psychologist"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="counsellor-focus">
                  Focus Areas (comma separated)
                </label>
                <input
                  id="counsellor-focus"
                  className="field"
                  placeholder="e.g. Anxiety, Exam Panic, Trauma"
                  value={form.focus}
                  onChange={(e) => setForm({ ...form, focus: e.target.value })}
                />
              </div>

              <div>
                <label className="label" htmlFor="counsellor-languages">
                  Spoken Languages (comma separated)
                </label>
                <input
                  id="counsellor-languages"
                  className="field"
                  placeholder="e.g. English, Sinhala, Tamil"
                  value={form.languages}
                  onChange={(e) => setForm({ ...form, languages: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="counsellor-location">
                  Office / Room Location
                </label>
                <input
                  id="counsellor-location"
                  className="field"
                  placeholder="e.g. Wellbeing Centre, Room 3.02"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

            </div>

            <div>
              <label className="label" htmlFor="counsellor-bio">
                Professional Bio & Introduction
              </label>
              <textarea
                id="counsellor-bio"
                rows={3}
                className="field"
                placeholder="Describe qualifications, therapeutic approach, and what students can expect..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving to Firestore…' : 'Publish to Firestore'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`${isAdmin ? 'Active Counsellors' : 'My Counsellor Profile'} (${visibleCounsellors.length})`} subtitle="Loaded in real time from Firestore">
        {visibleCounsellors.length === 0 ? (
          <EmptyState
            icon="🩺"
            title={isAdmin ? 'No counsellors found' : 'No counsellor profile linked'}
            message={isAdmin
              ? 'Feed sample data or add a new counsellor to populate Firestore.'
              : 'Ask an administrator to link your account to a counsellor profile.'}
          />
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {visibleCounsellors.map((counsellor) => (
              <div key={counsellor.id} className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold text-white ${
                      counsellor.accent === 'calm' ? 'bg-calm-600' : 'bg-brand-600'
                    }`}
                  >
                    {counsellor.avatarInitials || counsellor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {counsellor.name}
                      </h4>
                      <Badge tone={counsellor.accent === 'calm' ? 'calm' : 'brand'}>
                        {counsellor.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📍 {counsellor.location} · 🗣️ {(counsellor.languages || []).join(', ')} · 🗓️{' '}
                      {(counsellor.slots || []).length} active slots
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(counsellor.focus || []).map((f) => (
                        <span
                          key={f}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/counsellors/${counsellor.id}`}>
                      <Button variant="secondary" size="sm">View Profile</Button>
                    </Link>
                  </div>
                </div>
                <SlotEditor
                  counsellor={counsellor}
                  updateCounsellorSlots={updateCounsellorSlots}
                  setSuccessMsg={setSuccessMsg}
                  setErrorMsg={setErrorMsg}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
