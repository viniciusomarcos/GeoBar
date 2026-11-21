import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getDemoBars } from '@/data/demoBars'
import { renderWithIntl } from '@/test/render'
import { InteractiveMap } from './InteractiveMap'

const bars = getDemoBars('en')

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
    expect(screen.getByText('Santa Tereza · Classic buteco')).toBeVisible()
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/bars/casa-da-esquina'
    )
  })

  it('opens the place selected from a result card', () => {
    const view = renderWithIntl(
      <InteractiveMap bars={bars} selectedId={null} />
    )
    view.rerender(<InteractiveMap bars={bars} selectedId={bars[1].id} />)
    expect(screen.getByText(bars[1].description)).toBeVisible()
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
})
