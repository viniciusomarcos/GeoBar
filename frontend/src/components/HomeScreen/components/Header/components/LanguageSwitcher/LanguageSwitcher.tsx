import { useLocale, useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import { type Locale, routing } from '@/i18n/routing'

const languageNames = { en: 'English', pt: 'Português' }

const getCurrentPage = (
  language: Locale,
  locale: Locale
): 'page' | undefined => {
  if (language === locale) {
    return 'page'
  }

  return undefined
}

export const LanguageSwitcher = () => {
  const locale = useLocale()
  const t = useTranslations('Navigation')

  return (
    <fieldset className="language-switcher">
      <Text as="legend" className="sr-only">
        {t('language')}
      </Text>
      {routing.locales.map((language) => (
        <Pressable
          key={language}
          href={`/${language}`}
          hrefLang={language}
          lang={language}
          aria-label={languageNames[language]}
          aria-current={getCurrentPage(language, locale)}
        >
          {language.toUpperCase()}
        </Pressable>
      ))}
    </fieldset>
  )
}
