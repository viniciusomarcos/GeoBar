import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { usePreferences } from '@/components/PreferencesProvider'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import { locales } from '@/i18n/config'

const languageNames = { en: 'English', pt: 'Português' }

const flags = { pt: '/images/flags/br.svg', en: '/images/flags/gb.svg' }

export const LanguageSwitcher = () => {
  const { locale, setLocale } = usePreferences()
  const t = useTranslations('Navigation')

  return (
    <fieldset className="language-switcher">
      <Text as="legend" className="sr-only">
        {t('language')}
      </Text>
      {locales.map((language) => (
        <Pressable
          key={language}
          onClick={() => setLocale(language)}
          lang={language}
          aria-label={languageNames[language]}
          aria-pressed={language === locale}
          title={languageNames[language]}
        >
          <Image src={flags[language]} alt="" width={27} height={18} />
        </Pressable>
      ))}
    </fieldset>
  )
}
