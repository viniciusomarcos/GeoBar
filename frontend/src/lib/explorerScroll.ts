import { parseExplorerSearch, serializeExplorerSearch } from './explorerSearch'

type SearchPosition = { search: string; top: number }
const storageKey = 'geobar.searchPosition'
let pendingPosition: SearchPosition | null = null

export const captureExplorerScroll = () => {
  if (window.location.pathname !== '/') {
    return
  }
  pendingPosition = {
    search: serializeExplorerSearch(
      parseExplorerSearch(window.location.search)
    ),
    top: window.scrollY
  }
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(pendingPosition))
  } catch {
    // The in-memory position still survives client navigation.
  }
}

export const consumeExplorerScroll = (search: string) => {
  let position = pendingPosition
  pendingPosition = null
  try {
    const stored = sessionStorage.getItem(storageKey)
    sessionStorage.removeItem(storageKey)
    if (!position && stored) {
      position = JSON.parse(stored)
    }
  } catch {
    // Ignore unavailable storage or an invalid saved position.
  }
  if (
    !position ||
    position.search !== search ||
    !Number.isFinite(position.top) ||
    position.top < 0
  ) {
    return null
  }
  return position.top
}
