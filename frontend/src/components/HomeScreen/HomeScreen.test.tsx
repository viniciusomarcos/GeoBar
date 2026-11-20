import { screen } from '@testing-library/react'
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

  it('renders the Portuguese page and keeps home links in the active locale', () => {
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
      expect(link).toHaveAttribute('href', '/pt')
    }
    expect(
      screen.getByRole('img', { name: /luminárias aconchegantes/i })
    ).toBeVisible()
  })
})
