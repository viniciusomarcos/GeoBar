import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getTestBars } from '@/test/bars'
import { renderWithIntl } from '@/test/render'
import { InteractiveMap } from './InteractiveMap'

const bars = getTestBars('en')

describe('InteractiveMap', () => {
  it('renders each fictional place as an accessible marker and credits the basemap', () => {
    renderWithIntl(<InteractiveMap bars={bars} selectedId={null} />)
    for (const bar of bars) {
      expect(screen.getByRole('button', { name: bar.name })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'OpenStreetMap' })).toHaveAttribute(
      'href',
      'https://www.openstreetmap.org/copyright'
    )
  })

  it('updates markers when filters change and handles an empty collection', () => {
    const view = renderWithIntl(
      <InteractiveMap bars={bars} selectedId={null} />
    )
    view.rerender(<InteractiveMap bars={[bars[1]]} selectedId={null} />)
    expect(
      screen.getByRole('button', { name: 'Quintal do Sol' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Casa da Esquina' })
    ).not.toBeInTheDocument()
    view.rerender(<InteractiveMap bars={[]} selectedId={null} />)
    expect(
      screen.queryByRole('button', { name: 'Quintal do Sol' })
    ).not.toBeInTheDocument()
  })

  it('shows place details when a marker is selected', async () => {
    const user = userEvent.setup()
    renderWithIntl(<InteractiveMap bars={bars} selectedId={null} />)
    await user.click(screen.getByRole('button', { name: 'Casa da Esquina' }))
    expect(screen.getByText(bars[0].description)).toBeVisible()
    expect(screen.getByText('Santa Tereza · Bar')).toBeVisible()
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/bars/1'
    )
  })

  it('opens the place selected from a result card', () => {
    const view = renderWithIntl(
      <InteractiveMap bars={bars} selectedId={null} />
    )
    view.rerender(<InteractiveMap bars={bars} selectedId={bars[1].id} />)
    expect(screen.getByText(bars[1].description)).toBeVisible()
  })

  it('opens a focused marker with the keyboard and exposes its details link', () => {
    renderWithIntl(<InteractiveMap bars={bars} selectedId={null} />)
    const marker = screen.getByRole('button', { name: 'Balcão da Prosa' })
    marker.focus()

    // Leaflet reads keyCode, which jsdom does not populate automatically.
    fireEvent.keyPress(marker, { key: 'Enter', code: 'Enter', keyCode: 13 })

    expect(screen.getByText(bars[2].description)).toBeVisible()
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/bars/3'
    )
  })

  it('closes a selected popup when filtering removes that bar', () => {
    const view = renderWithIntl(
      <InteractiveMap bars={bars} selectedId={bars[1].id} />
    )
    expect(screen.getByText(bars[1].description)).toBeVisible()

    view.rerender(<InteractiveMap bars={[bars[0]]} selectedId={bars[1].id} />)

    expect(screen.queryByText(bars[1].description)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'View details' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Casa da Esquina' })
    ).toBeInTheDocument()
  })

  it('keeps markers available when tiles fail and clears the notice when a tile loads', async () => {
    const { container } = renderWithIntl(
      <InteractiveMap bars={bars} selectedId={null} />
    )
    const tile = container.querySelector('.leaflet-tile')
    expect(tile).not.toBeNull()
    fireEvent.error(tile as Element)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The basemap could not load'
    )
    expect(
      screen.getByRole('button', { name: 'Casa da Esquina' })
    ).toBeInTheDocument()
    fireEvent.load(tile as Element)
    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    )
  })

  it('renders the search radius circle when a center and radius are provided', () => {
    const onSelectLocation = vi.fn()
    const { container } = renderWithIntl(
      <InteractiveMap
        bars={bars}
        selectedId={null}
        radiusCenter={[-19.932, -43.938]}
        radiusMeters={1000}
        onSelectLocation={onSelectLocation}
      />
    )
    expect(container.querySelector('.leaflet-interactive')).not.toBeNull()
  })
})
