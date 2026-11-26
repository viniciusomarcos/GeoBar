import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as apiCatalog from '@/data/loadApiBars'
import type { Locale } from '@/i18n/config'
import { captureExplorerScroll } from '@/lib/explorerScroll'
import { getTestBars, apiBars as places } from '@/test/bars'
import { renderWithIntl } from '@/test/render'
import { BarExplorer } from './BarExplorer'

const renderExplorer = async (locale: Locale = 'en') => {
  renderWithIntl(<BarExplorer />, locale)
  await screen.findByRole('button', { name: 'Savassi' })
}

describe('BarExplorer', () => {
  it('translates search, places, and pluralized results into Portuguese', async () => {
    const user = userEvent.setup()
    await renderExplorer('pt')

    expect(screen.getByRole('status')).toHaveTextContent('3 bares')
    expect(screen.queryByText(/dados de demonstração/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Filtros de bairro' })
    ).toBeVisible()

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar bares' }),
      'pub{Enter}'
    )

    expect(
      screen.getByRole('heading', { name: 'Balcão da Prosa' })
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('1 bar')
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeVisible()
  })

  it('shows the collection without a demonstration label', async () => {
    await renderExplorer()

    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('3 bars')
    expect(
      screen.getByRole('button', { name: 'All neighborhoods' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText(/demo data/i)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Clear filters' })
    ).not.toBeInTheDocument()
  })

  it('applies the search automatically after typing stops', async () => {
    const user = userEvent.setup()
    await renderExplorer()

    await user.type(screen.getByRole('searchbox'), 'Quintal')
    expect(screen.getAllByRole('article')).toHaveLength(3)

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(
      await screen.findByRole('heading', { name: 'Quintal do Sol' })
    ).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('1 bar')
  })

  it('restarts the debounce after each edit and lets the search button submit immediately', async () => {
    await renderExplorer()
    vi.useFakeTimers()
    try {
      const input = screen.getByRole('searchbox')
      fireEvent.change(input, { target: { value: 'Quin' } })
      act(() => vi.advanceTimersByTime(299))
      expect(screen.getAllByRole('article')).toHaveLength(3)
      fireEvent.change(input, { target: { value: 'Quintal' } })
      act(() => vi.advanceTimersByTime(299))
      expect(screen.getAllByRole('article')).toHaveLength(3)

      act(() => vi.advanceTimersByTime(1))

      expect(
        screen.getByRole('heading', { name: 'Quintal do Sol' })
      ).toBeVisible()
      expect(screen.getAllByRole('article')).toHaveLength(1)
      fireEvent.change(input, { target: { value: 'Casa' } })
      fireEvent.click(screen.getByRole('button', { name: 'Search' }))
      expect(
        screen.getByRole('heading', { name: 'Casa da Esquina' })
      ).toBeVisible()
      const historyLength = window.history.length
      act(() => vi.advanceTimersByTime(300))
      expect(window.history.length).toBe(historyLength)
    } finally {
      vi.useRealTimers()
    }
  })

  it('cancels pending typing when the filters are cleared', async () => {
    window.history.replaceState(null, '', '/?q=Casa')
    await renderExplorer()
    vi.useFakeTimers()
    try {
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'Quintal' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
      act(() => vi.advanceTimersByTime(300))
      expect(screen.getAllByRole('article')).toHaveLength(3)
      expect(screen.getByRole('searchbox')).toHaveValue('')
      expect(new URLSearchParams(window.location.search).get('q')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('cancels a pending search when browser navigation restores another query', async () => {
    window.history.replaceState(null, '', '/?q=Casa')
    await renderExplorer()
    vi.useFakeTimers()
    try {
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'Quintal' }
      })
      act(() => {
        window.history.replaceState(null, '', '/?q=balcao')
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.getByRole('searchbox')).toHaveValue('balcao')
      expect(
        screen.getByRole('heading', { name: 'Balcão da Prosa' })
      ).toBeVisible()
    } finally {
      vi.useRealTimers()
    }
  })

  it('cancels a pending search when the explorer unmounts', async () => {
    const view = renderWithIntl(<BarExplorer />)
    await screen.findByRole('button', { name: 'Savassi' })
    vi.useFakeTimers()
    try {
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'Quintal' }
      })
      view.unmount()
      act(() => vi.advanceTimersByTime(300))
      expect(new URLSearchParams(window.location.search).get('q')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('cancels pending typing when browser history changes only the page', async () => {
    const bars = getTestBars('en')
    vi.spyOn(apiCatalog, 'loadApiBars').mockResolvedValue([
      ...bars,
      ...Array.from({ length: 10 }, (_, index) => ({
        ...bars[0],
        id: `extra-${index}`
      }))
    ])
    window.history.replaceState(null, '', '/?page=2')
    await renderExplorer()
    vi.useFakeTimers()
    try {
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'Quintal' }
      })
      act(() => {
        window.history.replaceState(null, '', '/')
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      act(() => vi.advanceTimersByTime(300))
      expect(screen.getByRole('searchbox')).toHaveValue('')
      expect(screen.getAllByRole('article')).toHaveLength(12)
      expect(screen.getByText('Page 1 of 2')).toBeVisible()
    } finally {
      vi.useRealTimers()
    }
  })

  it('supports keyboard submission and accent-insensitive searches', async () => {
    const user = userEvent.setup()
    await renderExplorer()

    await user.type(screen.getByRole('searchbox'), 'BALCAO{Enter}')

    expect(
      screen.getByRole('heading', { name: 'Balcão da Prosa' })
    ).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(1)
  })

  it('filters places when a neighborhood is selected', async () => {
    const user = userEvent.setup()
    await renderExplorer()

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
    await renderExplorer()
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
    await renderExplorer()
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
    await renderExplorer()

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
    await renderExplorer()

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
    await renderExplorer()

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

  it('shows a skeleton while the catalog is pending instead of an empty state', async () => {
    const pending = Promise.withResolvers<Response>()
    vi.mocked(fetch).mockReturnValueOnce(pending.promise)
    renderWithIntl(<BarExplorer />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading bars')
    expect(screen.queryByText('No places found')).not.toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    await act(async () =>
      pending.resolve({ ok: true, json: async () => places } as Response)
    )

    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('3 bars')
  })

  it('announces a failed request and retries without discarding the filters', async () => {
    window.history.replaceState(null, '', '/?q=Quintal&neighborhood=Savassi')
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Offline'))
    const user = userEvent.setup()
    renderWithIntl(<BarExplorer />)
    expect(
      await screen.findByRole('heading', { name: 'We could not load the bars' })
    ).toBeVisible()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The bars could not be loaded'
    )

    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' })
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('heading', { name: 'Quintal do Sol' })
    ).toBeVisible()
    expect(screen.getByRole('searchbox')).toHaveValue('Quintal')
    expect(screen.getByRole('status')).toHaveTextContent('1 bar')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('paginates in groups of twelve and resets the page when filters change', async () => {
    const bars = getTestBars('en')
    const catalog = [
      ...bars,
      ...Array.from({ length: 10 }, (_, index) => ({
        ...bars[0],
        id: `extra-${index}`,
        name: `Extra ${index + 1}`
      }))
    ]
    vi.spyOn(apiCatalog, 'loadApiBars').mockResolvedValue(catalog)
    const user = userEvent.setup()
    await renderExplorer()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(12)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Extra 10' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getAllByRole('article')).toHaveLength(12)
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    await user.click(screen.getByRole('button', { name: 'Savassi' }))
    expect(
      screen.getByRole('heading', { name: 'Quintal do Sol' })
    ).toBeVisible()
    expect(screen.getByText('Page 1 of 1')).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('page')).toBeNull()
  })

  it('replaces a page beyond the last result with the last available page', async () => {
    window.history.replaceState(null, '', '/?page=99&size=2')
    await renderExplorer()
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get('page')).toBeNull()
    )
    expect(screen.getByText('Page 1 of 1')).toBeVisible()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(new URLSearchParams(window.location.search).get('size')).toBeNull()
  })

  it('renders an empty catalog without error notifications or pagination', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    } as Response)
    renderWithIntl(<BarExplorer />)
    expect(
      await screen.findByRole('heading', { name: 'No places found' })
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('0 bars')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Bar results pages' })
    ).not.toBeInTheDocument()
  })

  it('omits a neighborhood filter when the API does not provide a neighborhood', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { ...places[0], neighborhood: null },
        ...places.slice(1)
      ]
    } as Response)
    await renderExplorer()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(
      screen.queryByRole('button', { name: 'Belo Horizonte' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Santa Tereza' })
    ).not.toBeInTheDocument()
  })

  it('uses the Portuguese plural form for zero results', async () => {
    const user = userEvent.setup()
    await renderExplorer('pt')
    await user.type(screen.getByRole('searchbox'), 'missing{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('0 bares')
  })

  it('restores a captured scroll position after the results finish loading', async () => {
    vi.stubGlobal('scrollY', 420)
    captureExplorerScroll()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    await renderExplorer()
    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith({ top: 420, behavior: 'instant' })
    )
  })

  it('keeps the marker selected from a result card in the details address', async () => {
    const user = userEvent.setup()
    await renderExplorer()
    await user.click(screen.getAllByRole('link', { name: 'View on map' })[0])
    expect(new URLSearchParams(window.location.search).get('bar')).toBe('1')
    expect(window.location.hash).toBe('#bar-map')
    expect(
      screen.getAllByRole('link', { name: 'View details' })[0]
    ).toHaveAttribute('href', '/bars/1?bar=1')
  })
})
