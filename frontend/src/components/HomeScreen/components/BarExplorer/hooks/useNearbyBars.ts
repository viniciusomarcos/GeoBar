import { useCallback, useEffect, useState } from 'react'
import type { Bar } from '@/data/bar'
import { loadNearbyApiBars } from '@/data/loadApiBars'
import type { Locale } from '@/i18n/config'

export const MIN_RADIUS_METERS = 100
export const MAX_RADIUS_METERS = 10000
export const DEFAULT_RADIUS_METERS = 1000
export const RADIUS_OPTIONS: ReadonlyArray<number> = [500, 1000, 2000, 5000]

export const clampRadiusMeters = (value: number) =>
  Math.min(MAX_RADIUS_METERS, Math.max(MIN_RADIUS_METERS, Math.round(value)))

export type Coordinates = readonly [latitude: number, longitude: number]

type NearbyState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  bars: Array<Bar>
}

export const useNearbyBars = (locale: Locale) => {
  const [center, setCenterState] = useState<Coordinates | null>(null)
  const [radiusMeters, setRadiusMetersState] = useState(DEFAULT_RADIUS_METERS)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<NearbyState>({
    status: 'idle',
    bars: []
  })

  const setCenter = useCallback((coords: Coordinates) => {
    setCenterState(coords)
  }, [])

  const setRadiusMeters = useCallback((value: number) => {
    setRadiusMetersState(clampRadiusMeters(value))
  }, [])

  const clear = useCallback(() => {
    setCenterState(null)
    setState({ status: 'idle', bars: [] })
  }, [])

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: A retry intentionally restarts the nearby request even when inputs are unchanged.
  useEffect(() => {
    if (center === null) {
      return
    }
    const controller = new AbortController()
    setState((current) => ({ ...current, status: 'loading' }))
    loadNearbyApiBars(
      '/api',
      { lat: center[0], lng: center[1], radius: radiusMeters, limit: 100 },
      locale,
      controller.signal
    ).then(
      (bars) => {
        if (controller.signal.aborted) {
          return
        }
        setState({ status: 'success', bars })
      },
      () => {
        if (controller.signal.aborted) {
          return
        }
        setState((current) => ({ ...current, status: 'error' }))
      }
    )
    return () => controller.abort()
  }, [center, radiusMeters, locale, attempt])

  return {
    center,
    radiusMeters,
    ...state,
    setCenter,
    setRadiusMeters,
    clear,
    retry
  }
}
