import { Circle, useMapEvents } from 'react-leaflet'

type RadiusOverlayProps = {
  center: readonly [latitude: number, longitude: number] | null
  radiusMeters?: number
  onSelectLocation?: (coords: readonly [number, number]) => void
}

export const RadiusOverlay = ({
  center,
  radiusMeters,
  onSelectLocation
}: RadiusOverlayProps) => {
  useMapEvents({
    click: (event) => {
      if (!onSelectLocation) {
        return
      }
      onSelectLocation([event.latlng.lat, event.latlng.lng])
    }
  })

  if (!center || !radiusMeters) {
    return null
  }

  return (
    <Circle
      center={[center[0], center[1]]}
      radius={radiusMeters}
      pathOptions={{
        color: '#b45309',
        fillColor: '#f59e0b',
        fillOpacity: 0.14,
        weight: 2
      }}
    />
  )
}
