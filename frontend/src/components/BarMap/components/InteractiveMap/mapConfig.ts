import { divIcon } from 'leaflet'

export const cityCenter: [number, number] = [-19.923, -43.931]

export const placeIcon = divIcon({
  className: 'map-marker',
  html: '<svg viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"><path d="M16 1C7.7 1 1 7.7 1 16c0 11 15 25 15 25s15-14 15-25C31 7.7 24.3 1 16 1Z" fill="currentColor" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#d3f58a"/></svg>',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -36]
})
