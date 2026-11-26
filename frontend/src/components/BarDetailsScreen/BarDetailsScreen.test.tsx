import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { toBar } from '@/data/loadApiBars'
import { getTestBars } from '@/test/bars'
import { renderWithIntl } from '@/test/render'
import { BarDetailsScreen } from './BarDetailsScreen'

const bar = getTestBars('en')[0]

describe('BarDetailsScreen', () => {
  it('shows the real address, supplied hours, map, and directions', () => {
    renderWithIntl(<BarDetailsScreen bar={bar} />)
    expect(
      screen.getByRole('heading', { level: 1, name: bar.name })
    ).toBeVisible()
    expect(screen.getByText('Rua Mármore, 10, Santa Tereza')).toBeVisible()
    expect(screen.getByText('Tu-Su 17:00-00:00')).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Map of bars in Belo Horizonte' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to the bars' })
    ).toHaveAttribute('href', '/#explore')
    expect(
      screen.getByRole('link', { name: 'Get directions' })
    ).toHaveAttribute(
      'href',
      `https://www.google.com/maps/dir/?api=1&destination=${bar.position[0]},${bar.position[1]}`
    )
    expect(document.title).toBe(`${bar.name} — GeoBar`)
  })

  it('uses Portuguese labels when the saved language is Portuguese', () => {
    renderWithIntl(<BarDetailsScreen bar={bar} />, 'pt')
    expect(
      screen.getAllByRole('heading', { name: 'Localização' })
    ).toHaveLength(2)
    expect(
      screen.getByRole('complementary', { name: 'Informações do bar' })
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Como chegar' })).toBeVisible()
  })

  it('translates the API category and preserves the title and theme', async () => {
    const user = userEvent.setup()
    const garden = getTestBars('pt')[1]
    renderWithIntl(<BarDetailsScreen bar={garden} />, 'pt')
    expect(screen.getByText('Cervejaria ao ar livre')).toBeVisible()
    await user.click(screen.getByRole('switch', { name: 'Modo escuro' }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByText('Beer garden')).toBeVisible()
    expect(screen.queryByText('Cervejaria ao ar livre')).not.toBeInTheDocument()
    expect(document.title).toBe(`${garden.name} — GeoBar`)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('omits absent addresses, schedules, and image placeholders', () => {
    const sparse = toBar(
      { ...bar.apiData, address: null, neighborhood: null, metadata: {} },
      'pt'
    )
    const { container } = renderWithIntl(
      <BarDetailsScreen bar={sparse} />,
      'pt'
    )
    expect(screen.getByRole('heading', { name: bar.name })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Horários' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/não informado/i)).not.toBeInTheDocument()
    expect(container.querySelector('.bar-overview-art')).toBeNull()
    expect(screen.getByRole('link', { name: 'Como chegar' })).toBeVisible()
  })
})
