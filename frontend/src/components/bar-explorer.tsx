'use client'

import { Beer, MapPin, Music2, Search, TreePine, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'
import { getDemoBars } from '@/data/demo-bars'
import { filterBars } from '@/lib/filter-bars'

const illustrations = {
  beer: Beer,
  garden: TreePine,
  music: Music2
}

export function BarExplorer() {
  const locale = useLocale()
  const t = useTranslations('Explorer')
  const demoBars = getDemoBars(locale)
  const neighborhoods = [
    null,
    ...new Set(demoBars.map((bar) => bar.neighborhood))
  ]
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [neighborhood, setNeighborhood] = useState<string | null>(null)
  const bars = filterBars(demoBars, query, neighborhood)
  const hasFilters = query !== '' || neighborhood !== null

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setQuery(draftQuery.trim())
  }

  const clearFilters = () => {
    setDraftQuery('')
    setQuery('')
    setNeighborhood(null)
  }

  return (
    <section id="explore" className="section-shell scroll-mt-8 py-20 sm:py-24">
      <div className="section-intro">
        <div>
          <p className="eyebrow">{t('eyebrow')}</p>
          <h2 className="section-title">{t('title')}</h2>
        </div>
        <p className="max-w-sm text-base leading-7 text-muted">
          {t('description')}
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="search-form"
        aria-label={t('formLabel')}
      >
        <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
        <label htmlFor="bar-search" className="sr-only">
          {t('inputLabel')}
        </label>
        <input
          id="bar-search"
          type="search"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder={t('placeholder')}
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none"
        />
        <button type="submit" className="button button-dark search-button">
          {t('search')}
        </button>
      </form>

      <fieldset className="mt-6 flex flex-wrap gap-2">
        <legend className="sr-only">{t('neighborhoods')}</legend>
        {neighborhoods.map((item) => (
          <button
            key={item ?? 'all'}
            type="button"
            aria-pressed={neighborhood === item}
            onClick={() => setNeighborhood(item)}
            className="filter-chip"
          >
            {item ?? t('allNeighborhoods')}
          </button>
        ))}
      </fieldset>

      <div className="mt-8 flex min-h-8 flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted">
          {t('results', { count: bars.length })}
        </p>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="clear-button">
            <X aria-hidden="true" className="size-4" />
            {t('clear')}
          </button>
        )}
      </div>

      {bars.length > 0 ? (
        <ul aria-label={t('places')} className="mt-4 grid gap-5 md:grid-cols-3">
          {bars.map((bar) => {
            const Illustration = illustrations[bar.illustration]

            return (
              <li key={bar.id}>
                <article className="place-card">
                  <div className={`place-art place-art-${bar.illustration}`}>
                    <span className="place-atmosphere">{bar.atmosphere}</span>
                    <Illustration
                      aria-hidden="true"
                      className="place-illustration"
                      strokeWidth={1.1}
                    />
                    <span className="place-art-caption">
                      {t('cardCaption')}
                    </span>
                  </div>
                  <div className="p-6">
                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      <MapPin aria-hidden="true" className="size-4" />
                      {bar.neighborhood}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                      {bar.name}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-muted">
                      {bar.description}
                    </p>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <Search aria-hidden="true" className="mx-auto size-8 text-muted" />
          <h3 className="mt-4 text-2xl font-semibold">{t('emptyTitle')}</h3>
          <p className="mt-2 text-muted">{t('emptyDescription')}</p>
        </div>
      )}

      <p className="mt-6 text-sm leading-6 text-muted">{t('disclaimer')}</p>
    </section>
  )
}
