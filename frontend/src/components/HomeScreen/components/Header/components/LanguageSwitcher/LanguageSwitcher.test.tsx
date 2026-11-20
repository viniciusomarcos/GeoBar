import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('links to both languages and identifies English as active', () => {
    renderWithIntl(<LanguageSwitcher />)

    expect(screen.getByRole('group', { name: 'Language' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      '/en'
    )
    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Português' })).toHaveAttribute(
      'href',
      '/pt'
    )
    expect(screen.getByRole('link', { name: 'Português' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('identifies Portuguese as active when rendered in Portuguese', () => {
    renderWithIntl(<LanguageSwitcher />, 'pt')

    expect(screen.getByRole('group', { name: 'Idioma' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Português' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'English' })).not.toHaveAttribute(
      'aria-current'
    )
  })
})
