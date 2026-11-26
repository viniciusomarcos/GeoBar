import { Compass, LocateFixed, MousePointerClick, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ChangeEvent, useEffect, useState } from 'react'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import {
  type Coordinates,
  clampRadiusMeters,
  MAX_RADIUS_METERS,
  MIN_RADIUS_METERS,
  RADIUS_OPTIONS
} from '../../hooks/useNearbyBars'

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
  const [draftMeters, setDraftMeters] = useState(String(radiusMeters))

  useEffect(() => {
    setDraftMeters(String(radiusMeters))
  }, [radiusMeters])

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

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    setDraftMeters(raw)
    const parsed = Number(raw)
    if (
      Number.isFinite(parsed) &&
      parsed >= MIN_RADIUS_METERS &&
      parsed <= MAX_RADIUS_METERS
    ) {
      onChangeRadius(parsed)
    }
  }

  const handleNumberBlur = () => {
    const parsed = Number(draftMeters)
    if (!Number.isFinite(parsed) || draftMeters.trim() === '') {
      setDraftMeters(String(radiusMeters))
      return
    }
    const clamped = clampRadiusMeters(parsed)
    setDraftMeters(String(clamped))
    onChangeRadius(clamped)
  }

  const formatRadius = (meters: number) => {
    if (meters < 1000) {
      return t('radiusOptionMeters', { meters })
    }
    const km = meters / 1000
    const formatted = Number.isInteger(km) ? String(km) : km.toFixed(1)
    return t('radiusOptionKm', { km: formatted })
  }

  const isActive = center !== null

  return (
    <fieldset
      className={isActive ? 'radius-panel radius-panel-active' : 'radius-panel'}
    >
      <Text as="legend" className="sr-only">
        {t('radiusGroup')}
      </Text>
      <div className="radius-header">
        <div className="radius-heading">
          <div className="radius-icon-badge" aria-hidden="true">
            <Compass className="size-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Text as="span" className="radius-title">
                {t('radiusTitle')}
              </Text>
              <Text
                as="span"
                className={
                  isActive ? 'radius-pill radius-pill-active' : 'radius-pill'
                }
              >
                {formatRadius(radiusMeters)}
              </Text>
            </div>
            <Text className="radius-subtitle">
              <MousePointerClick aria-hidden="true" className="size-3.5" />
              {t('radiusHint')}
            </Text>
          </div>
        </div>
        <div className="radius-header-actions">
          <Pressable
            onClick={handleNearMe}
            disabled={locating}
            aria-pressed={isActive}
            className="radius-locate-button"
          >
            <LocateFixed aria-hidden="true" className="size-4 shrink-0" />
            <ShouldRender if={locating}>{t('locating')}</ShouldRender>
            <ShouldRender if={!locating}>{t('nearMe')}</ShouldRender>
          </Pressable>
          <ShouldRender if={isActive}>
            <Pressable onClick={onClear} className="clear-button">
              <X aria-hidden="true" className="size-4" />
              {t('clearRadius')}
            </Pressable>
          </ShouldRender>
        </div>
      </div>

      <div className="radius-controls-grid">
        <div className="radius-slider-group">
          <input
            type="range"
            min={MIN_RADIUS_METERS}
            max={MAX_RADIUS_METERS}
            step={100}
            value={radiusMeters}
            aria-label={t('radiusSliderLabel')}
            onChange={(event) => onChangeRadius(Number(event.target.value))}
            className="radius-slider"
          />
          <div className="radius-scale" aria-hidden="true">
            <Text as="span">100 m</Text>
            <Text as="span">5 km</Text>
            <Text as="span">10 km</Text>
          </div>
        </div>

        <div className="radius-custom-box">
          <Text as="label" htmlFor="custom-radius-input" className="sr-only">
            {t('customRadiusLabel')}
          </Text>
          <input
            id="custom-radius-input"
            type="number"
            inputMode="numeric"
            min={MIN_RADIUS_METERS}
            max={MAX_RADIUS_METERS}
            step={50}
            value={draftMeters}
            onChange={handleNumberChange}
            onBlur={handleNumberBlur}
            className="radius-number-input"
          />
          <Text as="span" className="radius-unit">
            m
          </Text>
        </div>

        <div className="radius-presets">
          {RADIUS_OPTIONS.map((meters) => (
            <Pressable
              key={meters}
              aria-pressed={radiusMeters === meters}
              onClick={() => onChangeRadius(meters)}
              className="radius-preset-chip"
            >
              {formatRadius(meters)}
            </Pressable>
          ))}
        </div>
      </div>

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
