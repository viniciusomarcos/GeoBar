'use client'

import { useMemo, useSyncExternalStore } from 'react'
import {
  type ExplorerSearch,
  parseExplorerSearch,
  serializeExplorerSearch
} from '@/lib/explorerSearch'

const searchEvent = 'geobar:search'
const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  window.addEventListener(searchEvent, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(searchEvent, onChange)
  }
}
const getSnapshot = () => window.location.search
const getServerSnapshot = () => ''

export const updateExplorerSearch = (
  updates: Partial<ExplorerSearch>,
  {
    replace = false,
    hash = window.location.hash
  }: { replace?: boolean; hash?: string } = {}
) => {
  const next = { ...parseExplorerSearch(window.location.search), ...updates }
  const href = `${window.location.pathname}${serializeExplorerSearch(next)}${hash}`
  if (replace) {
    window.history.replaceState(null, '', href)
    window.dispatchEvent(new Event(searchEvent))
    return
  }
  window.history.pushState(null, '', href)
  window.dispatchEvent(new Event(searchEvent))
}

export const useExplorerSearch = () => {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useMemo(() => parseExplorerSearch(search), [search])
}
