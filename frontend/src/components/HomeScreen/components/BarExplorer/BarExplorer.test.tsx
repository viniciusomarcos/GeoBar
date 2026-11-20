import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithIntl as render } from '@/test/render'
import { BarExplorer } from './BarExplorer'

describe('BarExplorer', () => {
  it('translates search, places, and pluralized results into Portuguese', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />, 'pt')

    expect(screen.getByRole('status')).toHaveTextContent(
      '3 lugares de demonstração'
    )
    expect(screen.getByText(/estes lugares fictícios/i)).toBeVisible()
    expect(
      screen.getByRole('group', { name: 'Filtros de bairro' })
    ).toBeVisible()

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar lugares de demonstração' }),
      'musica ao vivo{Enter}'
    )

    expect(
      screen.getByRole('heading', { name: 'Balcão da Prosa' })
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent(
      '1 lugar de demonstração'
    )
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeVisible()
  })

  it('shows the demo collection and identifies the places as fictional', () => {
    render(<BarExplorer />)

    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('3 demo places')
    expect(
      screen.getByRole('button', { name: 'All neighborhoods' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/these fictional places/i)).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Clear filters' })
    ).not.toBeInTheDocument()
  })

  it('applies the draft search only after the form is submitted', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)

    await user.type(screen.getByRole('searchbox'), 'Quintal')
    expect(screen.getAllByRole('article')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(
      screen.getByRole('heading', { name: 'Quintal do Sol' })
    ).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('1 demo place')
  })

  it('supports keyboard submission and accent-insensitive searches', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)

    await user.type(screen.getByRole('searchbox'), 'BALCAO{Enter}')

    expect(
      screen.getByRole('heading', { name: 'Balcão da Prosa' })
    ).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(1)
  })

  it('filters places when a neighborhood is selected', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)

    await user.click(screen.getByRole('button', { name: 'Savassi' }))

    expect(
      screen.getByRole('heading', { name: 'Quintal do Sol' })
    ).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Savassi' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('explains an empty result when the combined filters do not match', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)

    await user.type(screen.getByRole('searchbox'), 'Quintal{Enter}')
    await user.click(screen.getByRole('button', { name: 'Floresta' }))

    expect(
      screen.getByRole('heading', { name: 'No places found' })
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('0 demo places')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('clears both filters and restores the collection', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)

    await user.type(screen.getByRole('searchbox'), 'missing{Enter}')
    await user.click(screen.getByRole('button', { name: 'Savassi' }))
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(
      screen.getByRole('button', { name: 'All neighborhoods' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('No places found')).not.toBeInTheDocument()
  })
})
