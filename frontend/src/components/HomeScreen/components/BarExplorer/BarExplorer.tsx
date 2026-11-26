import { X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { BarMap } from '@/components/BarMap'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import { Toast } from '@/components/Toast'
import {
  updateExplorerSearch,
  useExplorerSearch
} from '@/hooks/useExplorerSearch'
import { consumeExplorerScroll } from '@/lib/explorerScroll'
import {
  paginateBars,
  parseExplorerSearch,
  serializeExplorerSearch
} from '@/lib/explorerSearch'
import { filterBars } from '@/lib/filterBars'
import { ExplorerSkeleton } from './components/ExplorerSkeleton'
import { NeighborhoodFilters } from './components/NeighborhoodFilters'
import { Pagination } from './components/Pagination'
import { RadiusControls } from './components/RadiusControls'
import { RequestError } from './components/RequestError'
import { Results } from './components/Results'
import { SearchForm } from './components/SearchForm'
import { useBarCatalog } from './hooks/useBarCatalog'
import { useNearbyBars } from './hooks/useNearbyBars'

export const BarExplorer = () => {
  const locale = useLocale()
  const t = useTranslations('Explorer')
  const search = useExplorerSearch()
  const catalog = useBarCatalog(locale)
  const nearby = useNearbyBars(locale)
  const neighborhoods = [
    ...new Set(
      catalog.bars
        .filter((bar) => bar.apiData.neighborhood?.trim())
        .map((bar) => bar.neighborhood)
    )
  ]
  const resultsStart = useRef<HTMLElement>(null)
  const [draftQuery, setDraftQuery] = useState(search.query)
  const [toastVisible, setToastVisible] = useState(false)
  const restoredScroll = useRef(false)
  const dismissToast = useCallback(() => setToastVisible(false), [])
  const sourceBars =
    nearby.center !== null && nearby.status === 'success'
      ? nearby.bars
      : catalog.bars
  const bars = useMemo(
    () => filterBars(sourceBars, search.query, search.neighborhood),
    [sourceBars, search.query, search.neighborhood]
  )
  const pagination = paginateBars(bars, search)
  const hasFilters =
    search.query !== '' ||
    search.neighborhood !== null ||
    nearby.center !== null

  useEffect(() => setDraftQuery(search.query), [search.query])
  useEffect(() => {
    const restoreDraft = () =>
      setDraftQuery(parseExplorerSearch(window.location.search).query)
    window.addEventListener('popstate', restoreDraft)
    return () => window.removeEventListener('popstate', restoreDraft)
  }, [])
  useEffect(() => {
    const query = draftQuery.trim()
    if (query === search.query) {
      return
    }
    const timeout = window.setTimeout(() => {
      updateExplorerSearch({ query, page: 1, selectedId: null })
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [draftQuery, search.query])
  useEffect(() => {
    setToastVisible(catalog.status === 'error')
  }, [catalog.status])
  useEffect(() => {
    if (catalog.status !== 'success') {
      return
    }
    if (pagination.page !== search.page) {
      updateExplorerSearch({ page: pagination.page }, { replace: true })
    }
    if (restoredScroll.current) {
      return
    }
    restoredScroll.current = true
    const top = consumeExplorerScroll(serializeExplorerSearch(search))
    if (top === null) {
      return
    }
    const frame = window.requestAnimationFrame(() =>
      window.scrollTo({ top, behavior: 'instant' })
    )
    return () => window.cancelAnimationFrame(frame)
  }, [catalog.status, pagination.page, search])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateExplorerSearch({
      query: draftQuery.trim(),
      page: 1,
      selectedId: null
    })
  }

  const clearFilters = () => {
    setDraftQuery('')
    nearby.clear()
    updateExplorerSearch({
      query: '',
      neighborhood: null,
      page: 1,
      selectedId: null
    })
  }

  const selectRadiusCenter = (
    coords: readonly [latitude: number, longitude: number]
  ) => {
    nearby.setCenter(coords)
    updateExplorerSearch({ page: 1, selectedId: null })
  }

  const changePage = (page: number) => {
    updateExplorerSearch({ page, selectedId: null })
    resultsStart.current?.scrollIntoView({
      block: 'start',
      // Use the CSS scroll behavior, including reduced-motion preferences.
      behavior: 'auto'
    })
    resultsStart.current?.focus({ preventScroll: true })
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
        selected={search.neighborhood}
        onSelect={(neighborhood) =>
          updateExplorerSearch({ neighborhood, page: 1, selectedId: null })
        }
      />
      <RadiusControls
        center={nearby.center}
        radiusMeters={nearby.radiusMeters}
        isError={nearby.status === 'error'}
        onSelectCenter={selectRadiusCenter}
        onChangeRadius={nearby.setRadiusMeters}
        onClear={nearby.clear}
      />
      <div className="mt-8 flex min-h-8 flex-wrap items-center justify-between gap-3">
        <ShouldRender if={catalog.status === 'success'}>
          <Text role="status" className="text-sm text-muted">
            {t('results', { count: bars.length })}
          </Text>
        </ShouldRender>
        <ShouldRender if={hasFilters}>
          <Pressable onClick={clearFilters} className="clear-button">
            <X aria-hidden="true" className="size-4" />
            {t('clear')}
          </Pressable>
        </ShouldRender>
      </div>
      <div aria-busy={catalog.status === 'loading'}>
        <ShouldRender if={catalog.status === 'loading'}>
          <ExplorerSkeleton />
        </ShouldRender>
        <ShouldRender if={catalog.status === 'error'}>
          <RequestError onRetry={catalog.retry} />
        </ShouldRender>
        <ShouldRender if={catalog.status === 'success'}>
          <BarMap
            bars={bars}
            selectedId={search.selectedId}
            radiusCenter={nearby.center}
            radiusMeters={nearby.radiusMeters}
            onSelectLocation={selectRadiusCenter}
          />
          <section
            ref={resultsStart}
            tabIndex={-1}
            className="results-start"
            aria-label={t('places')}
          >
            <Results
              bars={pagination.bars}
              onSelect={(selectedId) =>
                updateExplorerSearch(
                  { selectedId },
                  { replace: true, hash: '#bar-map' }
                )
              }
            />
          </section>
          <ShouldRender if={bars.length > 0}>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={bars.length}
              onPageChange={changePage}
            />
          </ShouldRender>
        </ShouldRender>
      </div>
      <ShouldRender if={toastVisible}>
        <Toast
          message={t('errorToast')}
          dismissLabel={t('dismissToast')}
          onDismiss={dismissToast}
        />
      </ShouldRender>
    </section>
  )
}
