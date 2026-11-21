import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('shows flag images with accessible language names', () => {
    renderWithIntl(<LanguageSwitcher />)

    expect(screen.getByRole('group', { name: 'Language' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Português' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(
      screen.getByRole('button', { name: 'Português' }).querySelector('img')
    ).toHaveAttribute('src', '/images/flags/br.svg')
  })

  it('switches language in place and saves the choice', async () => {
    const user = userEvent.setup()
    renderWithIntl(<LanguageSwitcher />)

    await user.click(screen.getByRole('button', { name: 'Português' }))

    expect(screen.getByRole('group', { name: 'Idioma' })).toBeVisible()
    expect(document.documentElement.lang).toBe('pt')
    expect(localStorage.getItem('geobar.locale')).toBe('pt')
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('button', { name: 'Português' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('restores the saved language when the interface mounts again', async () => {
    const user = userEvent.setup()
    const first = renderWithIntl(<LanguageSwitcher />, 'pt')
    await user.click(screen.getByRole('button', { name: 'English' }))
    first.unmount()

    renderWithIntl(<LanguageSwitcher />, 'pt')

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(document.documentElement.lang).toBe('en')
  })
})
