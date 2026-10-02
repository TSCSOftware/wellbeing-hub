import { useState } from 'react'
import { Link } from 'react-router-dom'

import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import useHub from '../../hooks/useHub.js'
import useAuth from '../../hooks/useAuth.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const categories = ['Anxiety', 'Sleep', 'Burnout', 'Exam Stress', 'Depression', 'Mindfulness', 'General']
const types = ['Article', 'Guide', 'Exercise', 'Tip']

export default function ManageBlogs() {
  useDocumentTitle('Manage Blogs & Resources')

  const { blogs, addBlog, blogsFromFirestore } = useHub()
  const { student, isAdmin, isCounsellor } = useAuth()

  const [form, setForm] = useState({
    title: '',
    category: 'Anxiety',
    type: 'Article',
    minutes: 5,
    summary: '',
    body: '',
    takeaways: '',
    tags: 'mental-health, university, wellbeing',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setErrorMsg('Blog title is required.')
    if (!form.summary.trim()) return setErrorMsg('Please write a short summary.')

    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const created = await addBlog({
        ...form,
        author: student?.name || 'Staff Practitioner',
        authorRole: student?.role === 'admin' ? 'System Administrator' : 'Student Counsellor',
      })

      setSuccessMsg(`✓ Blog "${created.title}" published and stored in Firestore!`)
      setForm({
        title: '',
        category: 'Anxiety',
        type: 'Article',
        minutes: 5,
        summary: '',
        body: '',
        takeaways: '',
        tags: 'mental-health, university, wellbeing',
      })
      setShowForm(false)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to publish blog.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canCreate = isAdmin || isCounsellor

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Wellbeing Blogs & Resource Publishing
            </h2>
            {blogsFromFirestore ? (
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
            Admins and Counsellors can write and publish evidence-based articles for students.
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? '✕ Close Editor' : '✍️ Write New Blog'}
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

      {showForm && (
        <Card title="Publish New Article / Blog" subtitle="Stores in Firestore collection 'blogs'">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="blog-title">
                Article / Blog Title *
              </label>
              <input
                id="blog-title"
                className="field"
                placeholder="e.g. 5 Grounding Techniques for Mid-Semester Exam Stress"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="blog-category">
                  Category
                </label>
                <select
                  id="blog-category"
                  className="field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="blog-type">
                  Content Format
                </label>
                <select
                  id="blog-type"
                  className="field"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="blog-minutes">
                  Reading Time (minutes)
                </label>
                <input
                  id="blog-minutes"
                  type="number"
                  min={1}
                  max={60}
                  className="field"
                  value={form.minutes}
                  onChange={(e) => setForm({ ...form, minutes: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="blog-summary">
                Summary / Teaser * (1–2 sentences)
              </label>
              <textarea
                id="blog-summary"
                rows={2}
                className="field"
                placeholder="A quick, punchy overview that students see on cards..."
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="blog-body">
                Full Body Content (separate paragraphs with blank lines)
              </label>
              <textarea
                id="blog-body"
                rows={6}
                className="field"
                placeholder="Write your article here. Break thoughts into multiple paragraphs by leaving an empty line between them..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="blog-takeaways">
                  Key Takeaways (one per line)
                </label>
                <textarea
                  id="blog-takeaways"
                  rows={3}
                  className="field"
                  placeholder="Take slow breaths when reading.&#10;Limit screen time 30 mins before sleep."
                  value={form.takeaways}
                  onChange={(e) => setForm({ ...form, takeaways: e.target.value })}
                />
              </div>

              <div>
                <label className="label" htmlFor="blog-tags">
                  Tags (comma separated)
                </label>
                <input
                  id="blog-tags"
                  className="field"
                  placeholder="e.g. sleep, deadlines, anxiety"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
               
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing to Firestore…' : 'Publish Blog to Firestore'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`All Published Blogs & Articles (${blogs.length})`} subtitle="Stored in Firestore and visible to all students">
        {blogs.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No blogs found"
            message="Feed sample data or use the button above to publish your first article."
          />
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {blogs.map((blog) => (
              <div key={blog.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {blog.title}
                    </h4>
                    <Badge tone="calm">{blog.category}</Badge>
                    <span className="text-xs text-slate-400">· {blog.minutes} min read</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {blog.summary}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    By {blog.author || 'Clinical Team'} {blog.authorRole ? `(${blog.authorRole})` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`/resources/${blog.id}`}>
                    <Button variant="secondary" size="sm">
                      Read Article
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
