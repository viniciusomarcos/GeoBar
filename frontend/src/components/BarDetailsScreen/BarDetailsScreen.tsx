'use client'

import { ArrowLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { BarMap } from '@/components/BarMap'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageMetadata } from '@/components/PageMetadata'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import type { Bar } from '@/data/bar'
import { toBar } from '@/data/loadApiBars'
import { useExplorerSearch } from '@/hooks/useExplorerSearch'
import { getExplorerHref } from '@/lib/explorerSearch'
import { BarInformation } from './components/BarInformation'
import { BarOverview } from './components/BarOverview'

export const BarDetailsScreen = ({ bar }: { bar: Bar }) => {
  const locale = useLocale()
  const t = useTranslations('Details')
  const navigation = useTranslations('Navigation')
  const search = useExplorerSearch()
  const localized = useMemo(() => toBar(bar.apiData, locale), [bar, locale])
  const bars = useMemo(() => [localized], [localized])

  return (
    <>
      <PageMetadata
        title={t('pageTitle', { name: bar.name })}
        description={localized.description}
      />
      <Pressable href="#main-content" className="skip-link">
        {navigation('skip')}
      </Pressable>
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="section-shell bar-details"
      >
        <Pressable href={getExplorerHref(search)} className="back-link">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('back')}
        </Pressable>
        <BarOverview bar={localized} />
        <section aria-labelledby="bar-location">
          <Text
            as="h2"
            id="bar-location"
            className="details-section-title mb-5"
          >
            {t('location')}
          </Text>
          <div className="details-content">
            <BarMap bars={bars} selectedId={null} />
            <BarInformation bar={localized} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
