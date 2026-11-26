import { Circle, CircleMarker, useMapEvents } from 'react-leaflet'

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
    <>
      <Circle
        center={[center[0], center[1]]}
        radius={radiusMeters}
        pathOptions={{
          color: '#547b36',
          fillColor: '#547b36',
          fillOpacity: 0.14,
          weight: 2,
          dashArray: '6 6'
        }}
      />
      <CircleMarker
        center={[center[0], center[1]]}
        radius={6}
        pathOptions={{
          color: '#ffffff',
          fillColor: '#1b3028',
          fillOpacity: 1,
          weight: 2
        }}
      />
    </>
  )
}
