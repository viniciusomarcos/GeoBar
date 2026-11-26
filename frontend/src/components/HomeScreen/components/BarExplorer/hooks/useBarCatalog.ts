import { useCallback, useEffect, useState } from 'react'
import type { Bar } from '@/data/bar'
import { loadApiBars } from '@/data/loadApiBars'
import type { Locale } from '@/i18n/config'

type CatalogState = {
  status: 'loading' | 'success' | 'error'
  bars: Array<Bar>
}

export const useBarCatalog = (locale: Locale) => {
  const [state, setState] = useState<CatalogState>({
    status: 'loading',
    bars: []
  })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: A retry intentionally restarts the request even when the locale is unchanged.
  useEffect(() => {
    const controller = new AbortController()
    setState((current) => ({ ...current, status: 'loading' }))
    loadApiBars('/api', locale, controller.signal).then(
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
  }, [locale, attempt])

  return { ...state, retry }
}
