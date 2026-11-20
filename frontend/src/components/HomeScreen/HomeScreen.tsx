'use client'

import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { AboutSection } from './components/AboutSection'
import { BarExplorer } from './components/BarExplorer'
import { CityRibbon } from './components/CityRibbon'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'

export const HomeScreen = () => {
  const t = useTranslations('Navigation')

  return (
    <>
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
