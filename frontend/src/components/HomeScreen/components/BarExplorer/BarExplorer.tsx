import { X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { type FormEvent, useMemo, useState } from 'react'
import { BarMap } from '@/components/BarMap'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import { getDemoBars } from '@/data/demoBars'
import { filterBars } from '@/lib/filterBars'
import { NeighborhoodFilters } from './components/NeighborhoodFilters'
import { Results } from './components/Results'
import { SearchForm } from './components/SearchForm'

export const BarExplorer = () => {
  const locale = useLocale()
  const t = useTranslations('Explorer')
  const demoBars = useMemo(() => getDemoBars(locale), [locale])
  const neighborhoods = [...new Set(demoBars.map((bar) => bar.neighborhood))]
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [neighborhood, setNeighborhood] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const bars = useMemo(
    () => filterBars(demoBars, query, neighborhood),
    [demoBars, query, neighborhood]
  )
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
          <Text className="eyebrow">{t('eyebrow')}</Text>
          <Text as="h2" className="section-title">
            {t('title')}
          </Text>
        </div>
        <Text className="max-w-sm text-base leading-7 text-muted">
          {t('description')}
        </Text>
      </div>
      <SearchForm
        query={draftQuery}
        onQueryChange={setDraftQuery}
        onSubmit={handleSearch}
      />
      <NeighborhoodFilters
        neighborhoods={neighborhoods}
        selected={neighborhood}
        onSelect={setNeighborhood}
      />
      <div className="mt-8 flex min-h-8 flex-wrap items-center justify-between gap-3">
        <Text role="status" className="text-sm text-muted">
          {t('results', { count: bars.length })}
        </Text>
        <ShouldRender if={hasFilters}>
          <Pressable onClick={clearFilters} className="clear-button">
            <X aria-hidden="true" className="size-4" />
            {t('clear')}
          </Pressable>
        </ShouldRender>
      </div>
      <BarMap bars={bars} selectedId={selectedId} />
      <Results bars={bars} onSelect={setSelectedId} />
      <Text className="mt-6 text-sm leading-6 text-muted">
        {t('disclaimer')}
      </Text>
    </section>
  )
}
