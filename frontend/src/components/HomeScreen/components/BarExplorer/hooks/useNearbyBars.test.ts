import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as apiCatalog from '@/data/loadApiBars'
import { getTestBars } from '@/test/bars'
import { DEFAULT_RADIUS_METERS, useNearbyBars } from './useNearbyBars'

const sampleBars = getTestBars('pt').map((bar, index) => ({
  ...bar,
  distanceMeters: (index + 1) * 250
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useNearbyBars', () => {
  it('starts idle without requesting nearby bars', () => {
    const spy = vi.spyOn(apiCatalog, 'loadNearbyApiBars')
    const { result } = renderHook(() => useNearbyBars('pt'))
    expect(result.current.status).toBe('idle')
    expect(result.current.center).toBeNull()
    expect(result.current.radiusMeters).toBe(DEFAULT_RADIUS_METERS)
    expect(spy).not.toHaveBeenCalled()
  })

  it('fetches nearby bars when a center is selected and updates when radius changes', async () => {
    const spy = vi
      .spyOn(apiCatalog, 'loadNearbyApiBars')
      .mockResolvedValue(sampleBars)

    const { result } = renderHook(() => useNearbyBars('pt'))

    act(() => {
      result.current.setCenter([-19.932, -43.938])
    })

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.bars).toEqual(sampleBars)
    expect(spy).toHaveBeenCalledWith(
      '/api',
      { lat: -19.932, lng: -43.938, radius: 1000, limit: 100 },
      'pt',
      expect.any(AbortSignal)
    )

    act(() => {
      result.current.setRadiusMeters(2000)
    })

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        '/api',
        { lat: -19.932, lng: -43.938, radius: 2000, limit: 100 },
        'pt',
        expect.any(AbortSignal)
      )
    )

    act(() => {
      result.current.clear()
    })

    expect(result.current.center).toBeNull()
    expect(result.current.status).toBe('idle')
    expect(result.current.bars).toEqual([])
  })

  it('handles failed nearby requests and supports retry', async () => {
    const spy = vi
      .spyOn(apiCatalog, 'loadNearbyApiBars')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(sampleBars)

    const { result } = renderHook(() => useNearbyBars('en'))

    act(() => {
      result.current.setCenter([-19.92, -43.94])
    })

    await waitFor(() => expect(result.current.status).toBe('error'))

    act(() => {
      result.current.retry()
    })

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
