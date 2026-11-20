'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { routing } from '@/i18n/routing'

const languageNames = {
  en: 'English',
  pt: 'Português'
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations('Navigation')

  return (
    <fieldset className="language-switcher">
      <legend className="sr-only">{t('language')}</legend>
      {routing.locales.map((language) => (
        <Link
          key={language}
          href={`/${language}`}
          hrefLang={language}
          lang={language}
          aria-label={languageNames[language]}
          aria-current={language === locale ? 'page' : undefined}
        >
          {language.toUpperCase()}
        </Link>
      ))}
    </fieldset>
  )
}
