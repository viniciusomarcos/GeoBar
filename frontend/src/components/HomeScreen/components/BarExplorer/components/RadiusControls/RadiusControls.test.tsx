import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { RadiusControls } from './RadiusControls'

const originalGeolocation = navigator.geolocation

afterEach(() => {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: originalGeolocation
  })
})

describe('RadiusControls', () => {
  it('lets users switch radius options and clear an active radius', async () => {
    const user = userEvent.setup()
    const onChangeRadius = vi.fn()
    const onClear = vi.fn()

    renderWithIntl(
      <RadiusControls
        center={[-19.932, -43.938]}
        radiusMeters={1000}
        isError={false}
        onSelectCenter={vi.fn()}
        onChangeRadius={onChangeRadius}
        onClear={onClear}
      />,
      'pt'
    )

    expect(screen.getByRole('button', { name: '1 km' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await user.click(screen.getByRole('button', { name: '500 m' }))
    expect(onChangeRadius).toHaveBeenCalledWith(500)

    await user.click(screen.getByRole('button', { name: 'Limpar raio' }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('requests browser coordinates when clicking Near me', async () => {
    const user = userEvent.setup()
    const onSelectCenter = vi.fn()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: { latitude: -19.93, longitude: -43.94 }
          } as GeolocationPosition)
        }
      }
    })

    renderWithIntl(
      <RadiusControls
        center={null}
        radiusMeters={1000}
        isError={false}
        onSelectCenter={onSelectCenter}
        onChangeRadius={vi.fn()}
        onClear={vi.fn()}
      />,
      'en'
    )

    await user.click(screen.getByRole('button', { name: 'Near me' }))
    expect(onSelectCenter).toHaveBeenCalledWith([-19.93, -43.94])
  })

  it('shows an accessible alert when geolocation is denied or unsupported', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback
        ) => {
          error({ code: 1 } as GeolocationPositionError)
        }
      }
    })

    const view = renderWithIntl(
      <RadiusControls
        center={null}
        radiusMeters={1000}
        isError={false}
        onSelectCenter={vi.fn()}
        onChangeRadius={vi.fn()}
        onClear={vi.fn()}
      />,
      'en'
    )

    await user.click(screen.getByRole('button', { name: 'Near me' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not access your location'
    )

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: undefined
    })

    await user.click(screen.getByRole('button', { name: 'Near me' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'does not support geolocation'
    )

    view.rerender(
      <RadiusControls
        center={[-19.93, -43.94]}
        radiusMeters={1000}
        isError={true}
        onSelectCenter={vi.fn()}
        onChangeRadius={vi.fn()}
        onClear={vi.fn()}
      />
    )
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1)
  })
})
