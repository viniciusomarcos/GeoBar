import { Beer, MapPin, Music2, TreePine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import type { DemoBar } from '@/data/demoBars'

const illustrations = { beer: Beer, garden: TreePine, music: Music2 }

export const PlaceCard = ({
  bar,
  onSelect
}: {
  bar: DemoBar
  onSelect: () => void
}) => {
  const t = useTranslations('Explorer')
  const Illustration = illustrations[bar.illustration]

  return (
    <article className="place-card">
      <div className={`place-art place-art-${bar.illustration}`}>
        <Text as="span" className="place-atmosphere">
          {bar.atmosphere}
        </Text>
        <Illustration
          aria-hidden="true"
          className="place-illustration"
          strokeWidth={1.1}
        />
      </div>
      <div className="p-6">
        <Text className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin aria-hidden="true" className="size-4" />
          {bar.neighborhood}
        </Text>
        <Text as="h3" className="mt-3 text-2xl font-semibold tracking-tight">
          <Pressable href={`/bars/${bar.id}`} className="place-title-link">
            {bar.name}
          </Pressable>
        </Text>
        <Text className="mt-3 text-base leading-7 text-muted">
          {bar.description}
        </Text>
        <div className="place-actions">
          <Pressable href={`/bars/${bar.id}`} className="details-link">
            {t('viewDetails')}
          </Pressable>
          <Pressable
            href="#bar-map"
            onClick={onSelect}
            className="view-map-button"
          >
            <MapPin aria-hidden="true" className="size-4" />
            {t('viewOnMap')}
          </Pressable>
        </div>
      </div>
    </article>
  )
}
