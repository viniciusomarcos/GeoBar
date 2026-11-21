'use client'

import { useTranslations } from 'next-intl'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageMetadata } from '@/components/PageMetadata'
import { Pressable } from '@/components/Pressable'
import { AboutSection } from './components/AboutSection'
import { BarExplorer } from './components/BarExplorer'
import { CityRibbon } from './components/CityRibbon'
import { Hero } from './components/Hero'

export const HomeScreen = () => {
  const t = useTranslations('Navigation')
  const metadata = useTranslations('Metadata')

  return (
    <>
      <PageMetadata
        title={metadata('title')}
        description={metadata('description')}
      />
      <Pressable href="#main-content" className="skip-link">
        {t('skip')}
      </Pressable>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <CityRibbon />
        <BarExplorer />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}
