import { useCallback, useEffect, useState } from 'react'

import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageLayout from '../components/PageLayout.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

const NEWS_API_HOST = 'newsapi.org'
const DEFAULT_QUERY = 'mental health OR wellbeing OR student health'

function getApiUrl() {
  const protocol = window.location.protocol === 'http:' ? 'http:' : 'https:'
  return `${protocol}//${NEWS_API_HOST}/v2/everything`
}

function getFromDate() {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getArticleSummary(article) {
  return article.description || article.content?.replace(/\[\+\d+ chars\]$/, '') || 'Open the article to read the latest health and wellbeing update.'
}

export default function HealthNews() {
  useDocumentTitle('Health News')

  const [query, setQuery] = useState(DEFAULT_QUERY)
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadNews = useCallback(async (searchTerm = DEFAULT_QUERY) => {
    const apiKey = import.meta.env.VITE_NEWSAPI_API_KEY
    if (!apiKey) {
      setError('News is not configured yet. Add VITE_NEWSAPI_API_KEY to the environment.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    const params = new URLSearchParams({
      q: searchTerm,
      from: getFromDate(),
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: '12',
      apiKey,
    })

    try {
      const response = await fetch(`${getApiUrl()}?${params}`)
      const result = await response.json()

      if (!response.ok || result.status !== 'ok') {
        throw new Error(result.message || 'News could not be loaded right now.')
      }

      setArticles(result.articles || [])
      setLastUpdated(new Date())
    } catch (reason) {
      setArticles([])
      setError(reason.message || 'News could not be loaded right now.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  function handleSubmit(event) {
    event.preventDefault()
    const searchTerm = query.trim() || DEFAULT_QUERY
    setQuery(searchTerm)
    loadNews(searchTerm)
  }

  return (
    <PageLayout
      eyebrow="Live wellbeing briefing"
      title="Health news, kept useful"
      intro="A quick read of current health and mental wellbeing reporting from publishers around the world. News is refreshed from the last 30 days."
      actions={(
        <Button variant="secondary" onClick={() => loadNews(query.trim() || DEFAULT_QUERY)} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh news'}
        </Button>
      )}
    >
      <Card className="border-brand-100 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/20">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="label" htmlFor="health-news-search">Search health topics</label>
            <input
              id="health-news-search"
              className="field bg-white dark:bg-slate-900"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Mental health, sleep, student wellbeing..."
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Sources are external. Read critically and check advice with a qualified professional.</span>
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
      </Card>

      {error && (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-sm font-medium text-rose-800 dark:text-rose-200">{error}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-rose-700 underline dark:text-rose-300"
            onClick={() => loadNews(query.trim() || DEFAULT_QUERY)}
          >
            Try again
          </button>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading health news" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-xl2 border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
          ))}
        </div>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          icon="📰"
          title="No recent articles found"
          message="Try a broader topic, such as mental health, sleep, or wellbeing."
        />
      )}

      {!isLoading && articles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={`${article.url}-${article.publishedAt}`} className="flex h-full flex-col overflow-hidden p-0" isHoverable>
              <div className="aspect-[16/9] bg-gradient-to-br from-brand-100 via-sand-100 to-calm-100 dark:from-brand-950 dark:via-slate-900 dark:to-calm-950">
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                    {article.source?.name || 'News source'}
                  </span>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </div>
                <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">
                  {article.title}
                </h2>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {getArticleSummary(article)}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto pt-5 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
                >
                  Read full article <span aria-hidden="true">↗</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  )
}