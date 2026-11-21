import { latLngBounds } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { BarMapProps } from '../../../../BarMap'
import { cityCenter } from '../../mapConfig'

export const MapViewport = ({ bars }: Pick<BarMapProps, 'bars'>) => {
  const map = useMap()
  useEffect(() => {
    if (bars.length === 0) {
      map.setView(cityCenter, 13, { animate: false })
      return
    }
    map.fitBounds(
      latLngBounds(bars.map((bar) => [bar.position[0], bar.position[1]])),
      { padding: [48, 48], maxZoom: 15, animate: false }
    )
  }, [map, bars])
  return null
}
