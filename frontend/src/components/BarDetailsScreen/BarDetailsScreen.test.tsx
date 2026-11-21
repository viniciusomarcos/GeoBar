import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getDemoBars } from '@/data/demoBars'
import { renderWithIntl } from '@/test/render'
import { BarDetailsScreen } from './BarDetailsScreen'

const bar = getDemoBars('en')[0]

describe('BarDetailsScreen', () => {
  it('shows the selected bar, its story, hours, highlights, and location', () => {
    renderWithIntl(<BarDetailsScreen bar={bar} />)

    expect(
      screen.getByRole('heading', { level: 1, name: bar.name })
    ).toBeVisible()
    expect(screen.getByText(bar.story)).toBeVisible()
    expect(screen.getByText(bar.hours)).toBeVisible()
    for (const highlight of bar.highlights) {
      expect(screen.getByText(highlight)).toBeVisible()
    }
    expect(
      screen.getByRole('region', { name: 'Map of bars in Belo Horizonte' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to the bars' })
    ).toHaveAttribute('href', '/#explore')
    expect(document.title).toBe(`${bar.name} — GeoBar`)
  })

  it('localizes bar details using the saved language', () => {
    renderWithIntl(<BarDetailsScreen bar={bar} />, 'pt')

    expect(screen.getByRole('heading', { name: 'Sobre o bar' })).toBeVisible()
    expect(screen.getByText(getDemoBars('pt')[0].story)).toBeVisible()
    expect(
      screen.getByRole('complementary', { name: 'Informações do bar' })
    ).toBeVisible()
  })

  it('preserves the bar title when switching theme and language', async () => {
    const user = userEvent.setup()
    renderWithIntl(<BarDetailsScreen bar={bar} />, 'pt')

    await user.click(screen.getByRole('switch', { name: 'Modo escuro' }))
    expect(document.title).toBe(`${bar.name} — GeoBar`)
    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('heading', { name: 'About the bar' })).toBeVisible()
    expect(screen.getByText(bar.story)).toBeVisible()
    expect(document.title).toBe(`${bar.name} — GeoBar`)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('supports every bar illustration and its own information', () => {
    const view = renderWithIntl(<BarDetailsScreen bar={bar} />)
    for (const place of getDemoBars('en').slice(1)) {
      view.rerender(<BarDetailsScreen bar={place} />)
      expect(
        screen.getByRole('heading', { level: 1, name: place.name })
      ).toBeVisible()
      expect(screen.getByText(place.hours)).toBeVisible()
    }
  })
})
