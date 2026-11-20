'use client'

import { Beer, Compass, MapPin, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { BarExplorer } from '@/components/bar-explorer'
import { LanguageSwitcher } from '@/components/language-switcher'

export function HomeScreen() {
  const locale = useLocale()
  const t = useTranslations()

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('Navigation.skip')}
      </a>

      <header className="section-shell flex items-center justify-between gap-5 py-6 sm:py-8">
        <Link
          href={`/${locale}`}
          aria-label={t('Navigation.home')}
          className="brand"
        >
          <span className="brand-icon">
            <MapPin aria-hidden="true" className="size-6" strokeWidth={2.5} />
          </span>
          GeoBar<span className="text-accent-dark">.</span>
        </Link>
        <nav
          aria-label={t('Navigation.main')}
          className="flex items-center gap-3 sm:gap-6"
        >
          <a href="#about" className="nav-link hidden sm:inline-flex">
            {t('Navigation.about')}
          </a>
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <a href="#explore" className="button button-dark header-button">
              {t('Navigation.explore')}
            </a>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="section-shell hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="location-label">
              <span className="size-2 rounded-full bg-accent-dark" />
              {t('Hero.location')}
            </p>
            <h1 id="hero-title" className="hero-title">
              {t('Hero.titleFirst')} <br />
              {t('Hero.titleSecond')} <span>{t('Hero.titleAccent')}</span>
            </h1>
            <p className="hero-description">{t('Hero.description')}</p>
            <a href="#explore" className="button button-lime mt-8 sm:mt-10">
              <Compass aria-hidden="true" className="size-5" />
              {t('Hero.explore')}
            </a>
            <div className="hero-footnote">
              <span className="hero-footnote-icon">
                <Beer aria-hidden="true" className="size-5" strokeWidth={1.6} />
              </span>
              <p>
                {t('Hero.footnoteFirst')}
                <br />
                <span className="font-medium text-ink">
                  {t('Hero.footnoteSecond')}
                </span>
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-photo">
              <Image
                src="/images/bar-interior.jpg"
                alt={t('Hero.photoAlt')}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="hero-photo-shade" />
              <div className="hero-photo-caption">
                <span className="text-sm tracking-wide">
                  {t('Hero.photoIntro')}
                </span>
                <p>
                  {t('Hero.photoFirst')} <br />
                  {t('Hero.photoSecond')}
                </p>
              </div>
            </div>
            <div className="city-stamp">
              <Sparkles aria-hidden="true" className="size-5" />
              <span>{t('Hero.stamp')}</span>
              <strong>BH</strong>
            </div>
            <div className="hero-note">
              <span className="hero-note-icon">
                <MapPin aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{t('Hero.noteTitle')}</p>
                <p className="mt-1 text-sm text-muted">
                  {t('Hero.noteDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="city-ribbon" aria-hidden="true">
          <div className="section-shell flex flex-wrap items-center justify-between gap-x-7 gap-y-4">
            <span>{t('Ribbon.food')}</span>
            <span className="ribbon-star">✳</span>
            <span>{t('Ribbon.drinks')}</span>
            <span className="ribbon-star">✳</span>
            <span>{t('Ribbon.company')}</span>
            <span className="ribbon-star hidden sm:inline">✳</span>
          </div>
        </div>

        <BarExplorer />

        <section id="about" className="about-section scroll-mt-8">
          <div className="section-shell about-layout">
            <div>
              <p className="eyebrow text-lime">{t('About.eyebrow')}</p>
              <h2 className="about-title">
                {t('About.titleFirst')} <br />
                {t('About.titleSecond')} <em>BH.</em>
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-lg leading-8 text-white/80">
                {t('About.description')}
              </p>
              <p className="mt-5 text-base leading-7 text-white/65">
                {t('About.invitation')}
              </p>
              <a href="#explore" className="button button-lime mt-8">
                {t('About.explore')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="section-shell flex flex-wrap items-center justify-between gap-5 py-8">
        <Link
          href={`/${locale}`}
          className="brand text-2xl"
          aria-label={t('Navigation.home')}
        >
          GeoBar<span className="text-accent-dark">.</span>
        </Link>
        <p className="text-sm text-muted">{t('Footer.description')}</p>
      </footer>
    </>
  )
}
