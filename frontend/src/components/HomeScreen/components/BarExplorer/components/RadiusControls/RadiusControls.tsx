import { LocateFixed, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import { type Coordinates, RADIUS_OPTIONS } from '../../hooks/useNearbyBars'

type RadiusControlsProps = {
  center: Coordinates | null
  radiusMeters: number
  isError: boolean
  onSelectCenter: (coords: Coordinates) => void
  onChangeRadius: (radiusMeters: number) => void
  onClear: () => void
}

export const RadiusControls = ({
  center,
  radiusMeters,
  isError,
  onSelectCenter,
  onChangeRadius,
  onClear
}: RadiusControlsProps) => {
  const t = useTranslations('Explorer')
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const handleNearMe = () => {
    setGeoError(null)
    if (!('geolocation' in navigator) || !navigator.geolocation) {
      setGeoError(t('geoUnsupported'))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        onSelectCenter([position.coords.latitude, position.coords.longitude])
      },
      () => {
        setLocating(false)
        setGeoError(t('geoDenied'))
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  const formatRadius = (meters: number) => {
    if (meters < 1000) {
      return t('radiusOptionMeters', { meters })
    }
    return t('radiusOptionKm', { km: meters / 1000 })
  }

  return (
    <fieldset className="radius-bar">
      <Text as="legend" className="sr-only">
        {t('radiusGroup')}
      </Text>
      <div className="radius-actions">
        <Pressable
          onClick={handleNearMe}
          disabled={locating}
          aria-pressed={center !== null}
          className="filter-chip"
        >
          <LocateFixed aria-hidden="true" className="size-4" />
          <ShouldRender if={locating}>{t('locating')}</ShouldRender>
          <ShouldRender if={!locating}>{t('nearMe')}</ShouldRender>
        </Pressable>
        {RADIUS_OPTIONS.map((meters) => (
          <Pressable
            key={meters}
            aria-pressed={radiusMeters === meters}
            onClick={() => onChangeRadius(meters)}
            className="filter-chip"
          >
            {formatRadius(meters)}
          </Pressable>
        ))}
        <ShouldRender if={center !== null}>
          <Pressable onClick={onClear} className="clear-button">
            <X aria-hidden="true" className="size-4" />
            {t('clearRadius')}
          </Pressable>
        </ShouldRender>
      </div>
      <Text className="mt-2 text-xs text-muted">{t('radiusHint')}</Text>
      <ShouldRender if={geoError !== null}>
        <Text role="alert" className="radius-error">
          {geoError}
        </Text>
      </ShouldRender>
      <ShouldRender if={isError}>
        <Text role="alert" className="radius-error">
          {t('nearbyError')}
        </Text>
      </ShouldRender>
    </fieldset>
  )
}
