import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map as LeafletMap } from 'leaflet'
import { createRef } from 'react'
import { MapContainer } from 'react-leaflet'
import { describe, expect, it, vi } from 'vitest'
import type { DemoBar } from '@/data/demoBars'
import { getDemoBars } from '@/data/demoBars'
import { renderWithIntl } from '@/test/render'
import { cityCenter } from '../../mapConfig'
import { MapControls } from './MapControls'

const renderControls = (bars: ReadonlyArray<DemoBar>) => {
  const ref = createRef<LeafletMap>()
  const view = renderWithIntl(
    <MapContainer
      ref={ref}
      center={cityCenter}
      zoom={13}
      minZoom={11}
      maxZoom={19}
      zoomAnimation={false}
      zoomControl={false}
    >
      <MapControls bars={bars} />
    </MapContainer>
  )
  const map = ref.current as LeafletMap
  // jsdom has no layout; give Leaflet a viewport for geographic assertions.
  Object.defineProperties(map.getContainer(), {
    clientWidth: { configurable: true, value: 640 },
    clientHeight: { configurable: true, value: 400 }
  })
  map.invalidateSize({ pan: false })
  return { ...view, map }
}

describe('MapControls', () => {
  it('zooms in and out with the keyboard without forwarding clicks to the map', async () => {
    const user = userEvent.setup()
    const { map } = renderControls(getDemoBars('en'))
    const onMapClick = vi.fn()
    map.on('click', onMapClick)

    screen.getByRole('button', { name: 'Zoom in' }).focus()
    await user.keyboard('{Enter}')
    expect(map.getZoom()).toBe(14)
    screen.getByRole('button', { name: 'Zoom out' }).focus()
    await user.keyboard('{Enter}')

    expect(map.getZoom()).toBe(13)
    expect(onMapClick).not.toHaveBeenCalled()
  })

  it('fits the visible results after the user moves away from them', async () => {
    const user = userEvent.setup()
    const bars = getDemoBars('en')
    const { map } = renderControls(bars)
    map.setView([-20.1, -44.1], 12, { animate: false })

    screen.getByRole('button', { name: 'Show all results' }).focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      for (const bar of bars) {
        expect(
          map.getBounds().contains([bar.position[0], bar.position[1]])
        ).toBe(true)
      }
    })
  })

  it('returns to Belo Horizonte when no results are available', async () => {
    const user = userEvent.setup()
    const { map } = renderControls([])
    map.setView([-20.1, -44.1], 15, { animate: false })

    screen.getByRole('button', { name: 'Show all results' }).focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(map.getZoom()).toBe(13)
      expect(map.getCenter().lat).toBeCloseTo(cityCenter[0])
      expect(map.getCenter().lng).toBeCloseTo(cityCenter[1])
    })
  })
})
