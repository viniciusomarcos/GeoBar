import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Text } from '@/components/Text'

export const MapPlaceholder = () => {
  const t = useTranslations('Map')
  return (
    <div className="map-placeholder">
      <MapPin aria-hidden="true" className="size-7" />
      <Text>{t('loading')}</Text>
    </div>
  )
}
