import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import { PreferencesProvider, usePreferences } from './PreferencesProvider'

const PreferenceControls = () => {
  const { locale, theme, setLocale, setTheme } = usePreferences()
  const t = useTranslations('Navigation')
  return (
    <>
      <Text>
        {locale} {theme} {t('language')}
      </Text>
      <Pressable onClick={() => setLocale('en')}>English</Pressable>
      <Pressable onClick={() => setTheme('dark')}>Dark</Pressable>
    </>
  )
}

describe('PreferencesProvider', () => {
  it('defaults to Portuguese and light mode without URL or browser-language negotiation', () => {
    render(
      <PreferencesProvider>
        <PreferenceControls />
      </PreferencesProvider>
    )

    expect(screen.getByText('pt light Idioma')).toBeVisible()
    expect(document.documentElement.lang).toBe('pt')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('restores saved preferences and updates the document language', () => {
    localStorage.setItem('geobar.locale', 'en')
    localStorage.setItem('geobar.theme', 'dark')

    render(
      <PreferencesProvider>
        <PreferenceControls />
      </PreferencesProvider>
    )

    expect(screen.getByText('en dark Language')).toBeVisible()
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('ignores unsupported saved values', () => {
    localStorage.setItem('geobar.locale', 'invalid')
    localStorage.setItem('geobar.theme', 'system')

    render(
      <PreferencesProvider>
        <PreferenceControls />
      </PreferencesProvider>
    )

    expect(screen.getByText('pt light Idioma')).toBeVisible()
  })

  it('keeps language and theme independent when updating either preference', async () => {
    const user = userEvent.setup()
    render(
      <PreferencesProvider>
        <PreferenceControls />
      </PreferencesProvider>
    )
    await user.click(screen.getByRole('button', { name: 'Dark' }))
    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByText('en dark Language')).toBeVisible()
    expect(localStorage.getItem('geobar.locale')).toBe('en')
    expect(localStorage.getItem('geobar.theme')).toBe('dark')
  })

  it('keeps controls usable when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked')
    })
    const user = userEvent.setup()
    render(
      <PreferencesProvider>
        <PreferenceControls />
      </PreferencesProvider>
    )
    await user.click(screen.getByRole('button', { name: 'English' }))
    await user.click(screen.getByRole('button', { name: 'Dark' }))

    expect(screen.getByText('en dark Language')).toBeVisible()
  })

  it('reports a missing provider for preference consumers', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<PreferenceControls />)).toThrow(
      'usePreferences must be used within PreferencesProvider'
    )
  })
})
