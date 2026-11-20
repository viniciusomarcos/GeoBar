import { useTranslations } from 'next-intl'
import { Brand } from '@/components/Brand'
import { Pressable } from '@/components/Pressable'
import { LanguageSwitcher } from './components/LanguageSwitcher'

export const Header = () => {
  const t = useTranslations('Navigation')

  return (
    <header className="section-shell flex items-center justify-between gap-5 py-6 sm:py-8">
      <Brand />
      <nav aria-label={t('main')} className="flex items-center gap-3 sm:gap-6">
        <Pressable href="#about" className="nav-link hidden sm:inline-flex">
          {t('about')}
        </Pressable>
        <LanguageSwitcher />
        <div className="hidden sm:block">
          <Pressable
            href="#explore"
            className="button button-dark header-button"
          >
            {t('explore')}
          </Pressable>
        </div>
      </nav>
    </header>
  )
}
