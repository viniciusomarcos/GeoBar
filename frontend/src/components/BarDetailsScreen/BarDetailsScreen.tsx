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
import { type DemoBar, getDemoBar } from '@/data/demoBars'
import { BarInformation } from './components/BarInformation'
import { BarOverview } from './components/BarOverview'

export const BarDetailsScreen = ({ bar }: { bar: DemoBar }) => {
  const locale = useLocale()
  const t = useTranslations('Details')
  const navigation = useTranslations('Navigation')
  const localized = useMemo(
    () => getDemoBar(bar.id, locale) ?? bar,
    [bar, locale]
  )
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
        <Pressable href="/#explore" className="back-link">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('back')}
        </Pressable>
        <BarOverview bar={localized} />
        <div className="details-content">
          <section aria-labelledby="about-bar">
            <Text as="h2" id="about-bar" className="details-section-title">
              {t('about')}
            </Text>
            <Text className="details-story">{localized.story}</Text>
            <BarMap bars={bars} selectedId={null} />
          </section>
          <BarInformation bar={localized} />
        </div>
        <Text className="demo-note">{t('disclaimer')}</Text>
      </main>
      <Footer />
    </>
  )
}
