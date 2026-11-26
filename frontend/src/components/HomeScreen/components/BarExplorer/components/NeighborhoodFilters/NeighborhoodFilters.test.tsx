import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { NeighborhoodFilters } from './NeighborhoodFilters'

const manyNeighborhoods = [
  'Savassi',
  'Santa Tereza',
  'Lourdes',
  'Centro',
  'Funcionários',
  'Serra',
  'Pampulha',
  'Buritis'
]

describe('NeighborhoodFilters', () => {
  it('shows every neighborhood directly when the list fits in one row', () => {
    renderWithIntl(
      <NeighborhoodFilters
        neighborhoods={['Savassi', 'Santa Tereza', 'Lourdes']}
        selected={null}
        onSelect={vi.fn()}
      />,
      'en'
    )

    expect(screen.getByRole('button', { name: 'Savassi' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Santa Tereza' })).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /more neighborhoods/i })
    ).not.toBeInTheDocument()
  })

  it('collapses long neighborhood lists and expands on demand', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderWithIntl(
      <NeighborhoodFilters
        neighborhoods={manyNeighborhoods}
        selected={null}
        onSelect={onSelect}
      />,
      'pt'
    )

    expect(
      screen.queryByRole('button', { name: 'Pampulha' })
    ).not.toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Mais 2 bairros' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Pampulha' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Buritis' })).toBeVisible()
    const collapse = screen.getByRole('button', { name: 'Ocultar bairros' })
    expect(collapse).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: 'Buritis' }))
    expect(onSelect).toHaveBeenCalledWith('Buritis')

    await user.click(collapse)
    expect(
      screen.queryByRole('button', { name: 'Pampulha' })
    ).not.toBeInTheDocument()
  })

  it('keeps an active neighborhood visible even when collapsed', () => {
    const view = renderWithIntl(
      <NeighborhoodFilters
        neighborhoods={manyNeighborhoods}
        selected="Buritis"
        onSelect={vi.fn()}
      />,
      'pt'
    )

    const active = screen.getByRole('button', { name: 'Buritis' })
    expect(active).toBeVisible()
    expect(active).toHaveAttribute('aria-pressed', 'true')

    view.rerender(
      <NeighborhoodFilters
        neighborhoods={manyNeighborhoods}
        selected="Desconhecido"
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Savassi' })).toBeVisible()
  })
})
