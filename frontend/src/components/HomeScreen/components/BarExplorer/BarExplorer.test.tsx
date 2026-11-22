import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithIntl as render } from '@/test/render'
import { BarExplorer } from './BarExplorer'

describe('BarExplorer', () => {
  it('translates search, places, and pluralized results into Portuguese', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />, 'pt')

    expect(screen.getByRole('status')).toHaveTextContent('3 bares')
    expect(screen.getByText(/dados de demonstração/i)).toBeVisible()
    expect(
      screen.getByRole('group', { name: 'Filtros de bairro' })
    ).toBeVisible()

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar bares' }),
      'musica ao vivo{Enter}'
    )

    expect(
      screen.getByRole('heading', { name: 'Balcão da Prosa' })
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('1 bar')
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeVisible()
  })

  it('shows the demo collection and identifies the places as fictional', () => {
    render(<BarExplorer />)

    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('3 bars')
    expect(
      screen.getByRole('button', { name: 'All neighborhoods' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/demo data/i)).toBeVisible()
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
    expect(screen.getByRole('status')).toHaveTextContent('1 bar')
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

  it('restores every neighborhood without discarding the submitted search', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)
    await user.type(screen.getByRole('searchbox'), 'Quintal{Enter}')
    await user.click(screen.getByRole('button', { name: 'Floresta' }))

    await user.click(screen.getByRole('button', { name: 'All neighborhoods' }))

    expect(screen.getByRole('searchbox')).toHaveValue('Quintal')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(
      screen.getByRole('heading', { name: 'Quintal do Sol' })
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'All neighborhoods' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Floresta' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('removes a submitted search with whitespace while preserving the neighborhood', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)
    await user.click(screen.getByRole('button', { name: 'Savassi' }))
    await user.type(screen.getByRole('searchbox'), 'Casa{Enter}')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), '   {Enter}')

    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(
      screen.getByRole('heading', { name: 'Quintal do Sol' })
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Savassi' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('combines a matching name and neighborhood without including other bars', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)

    await user.type(screen.getByRole('searchbox'), 'balcao{Enter}')
    await user.click(screen.getByRole('button', { name: 'Floresta' }))

    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(
      screen.getByRole('heading', { name: 'Balcão da Prosa' })
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('1 bar')
  })

  it('explains an empty result when the combined filters do not match', async () => {
    const user = userEvent.setup()
    render(<BarExplorer />)

    await user.type(screen.getByRole('searchbox'), 'Quintal{Enter}')
    await user.click(screen.getByRole('button', { name: 'Floresta' }))

    expect(
      screen.getByRole('heading', { name: 'No places found' })
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('0 bars')
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
