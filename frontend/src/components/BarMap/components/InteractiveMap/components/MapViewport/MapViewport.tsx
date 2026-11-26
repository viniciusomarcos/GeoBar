import { latLngBounds } from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { BarMapProps } from '../../../../BarMap'
import { cityCenter } from '../../mapConfig'

export const MapViewport = ({
  bars,
  radiusCenter = null
}: Pick<BarMapProps, 'bars' | 'radiusCenter'>) => {
  const map = useMap()
  useEffect(() => {
    if (bars.length === 0) {
      if (radiusCenter) {
        map.setView([radiusCenter[0], radiusCenter[1]], 14, { animate: false })
        return
      }
      map.setView(cityCenter, 13, { animate: false })
      return
    }
    const points: Array<[number, number]> = bars.map((bar) => [
      bar.position[0],
      bar.position[1]
    ])
    if (radiusCenter) {
      points.push([radiusCenter[0], radiusCenter[1]])
    }
    map.fitBounds(latLngBounds(points), {
      padding: [48, 48],
      maxZoom: 15,
      animate: false
    })
  }, [map, bars, radiusCenter])
  return null
}
