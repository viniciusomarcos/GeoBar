import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { ThemeSwitcher } from './ThemeSwitcher'

describe('ThemeSwitcher', () => {
  it('starts in light mode and switches directly to dark mode on click', async () => {
    const user = userEvent.setup()
    renderWithIntl(<ThemeSwitcher />)
    const toggle = screen.getByRole('switch', { name: 'Dark mode' })
    expect(toggle).not.toBeChecked()
    expect(toggle).toHaveAttribute('title', 'Enable dark mode')

    await user.click(toggle)

    expect(toggle).toBeChecked()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('geobar.theme')).toBe('dark')
    expect(toggle).toHaveAttribute('title', 'Enable light mode')
  })

  it('restores dark mode and switches back to light with the keyboard', async () => {
    localStorage.setItem('geobar.theme', 'dark')
    const user = userEvent.setup()
    renderWithIntl(<ThemeSwitcher />, 'pt')
    const toggle = screen.getByRole('switch', { name: 'Modo escuro' })
    expect(toggle).toBeChecked()
    toggle.focus()

    await user.keyboard(' ')

    expect(toggle).not.toBeChecked()
    expect(localStorage.getItem('geobar.theme')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('keeps the selected theme after remounting', async () => {
    const user = userEvent.setup()
    const first = renderWithIntl(<ThemeSwitcher />)
    await user.click(screen.getByRole('switch', { name: 'Dark mode' }))
    first.unmount()

    renderWithIntl(<ThemeSwitcher />)

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeChecked()
  })
})
