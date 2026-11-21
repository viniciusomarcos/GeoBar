import { useTranslations } from 'next-intl'
import { Brand } from '@/components/Brand'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { ThemeSwitcher } from './components/ThemeSwitcher'

export const Header = () => {
  const t = useTranslations('Navigation')

  return (
    <header className="section-shell flex items-center justify-between gap-5 py-6 sm:py-8">
      <Brand />
      <nav aria-label={t('main')} className="flex items-center gap-3 sm:gap-6">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </nav>
    </header>
  )
}
