import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePreferences } from '@/components/PreferencesProvider'
import { Pressable } from '@/components/Pressable'

const nextThemes = { light: 'dark', dark: 'light' } as const
const icons = { light: Moon, dark: Sun }
const actionLabels = { light: 'enableDark', dark: 'enableLight' } as const

export const ThemeSwitcher = () => {
  const { theme, setTheme } = usePreferences()
  const t = useTranslations('Theme')
  const Icon = icons[theme]

  return (
    <Pressable
      className="icon-button"
      role="switch"
      aria-label={t('label')}
      aria-checked={theme === 'dark'}
      title={t(actionLabels[theme])}
      onClick={() => setTheme(nextThemes[theme])}
    >
      <Icon aria-hidden="true" className="size-5" />
    </Pressable>
  )
}
