import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithIntl as render } from '@/test/render'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen', () => {
  it('introduces GeoBar and links visitors to the collection', () => {
    render(<HomeScreen />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Find your kind of buteco.'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Find your next spot' })
    ).toHaveAttribute('href', '#explore')
    expect(
      screen.getByRole('link', { name: 'Skip to content' })
    ).toHaveAttribute('href', '#main-content')
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' })
    ).toBeVisible()
    expect(
      screen.getByRole('img', { name: /warm pendant lights/i })
    ).toBeVisible()
  })

  it('renders the Portuguese page and keeps home links at the root', () => {
    render(<HomeScreen />, 'pt')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Encontre seu próximo buteco.'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Encontre seu próximo lugar' })
    ).toHaveAttribute('href', '#explore')
    for (const link of screen.getAllByRole('link', {
      name: 'Página inicial do GeoBar'
    })) {
      expect(link).toHaveAttribute('href', '/')
    }
    expect(
      screen.getByRole('img', { name: /luminárias aconchegantes/i })
    ).toBeVisible()
  })

  it('keeps the search and neighborhood selected when the language changes', async () => {
    const user = userEvent.setup()
    render(<HomeScreen />, 'pt')
    await user.type(screen.getByRole('searchbox'), 'balcao{Enter}')
    await user.click(screen.getByRole('button', { name: 'Floresta' }))

    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('searchbox', { name: 'Search bars' })).toHaveValue(
      'balcao'
    )
    expect(screen.getByRole('button', { name: 'Floresta' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('Live music')).toBeVisible()
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/bars/balcao-da-prosa?q=balcao&neighborhood=Floresta'
    )
  })
})
