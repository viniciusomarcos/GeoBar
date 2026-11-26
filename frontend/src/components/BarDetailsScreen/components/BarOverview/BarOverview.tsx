import { Award, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import type { Bar } from '@/data/bar'
import { extractBarMetadata } from '@/data/barMetadata'

export const BarOverview = ({ bar }: { bar: Bar }) => {
  const t = useTranslations('Details')
  const meta = extractBarMetadata(bar.apiData.metadata)

  return (
    <section className="bar-overview" aria-labelledby="bar-title">
      <div className="bar-overview-copy">
        <Text className="location-label">
          <MapPin aria-hidden="true" className="size-4" />
          {bar.neighborhood}
        </Text>
        <Text as="h1" id="bar-title" className="bar-title">
          {bar.name}
        </Text>
        <ShouldRender if={Boolean(bar.address)}>
          <Text className="bar-description">{bar.address}</Text>
        </ShouldRender>
        <ShouldRender if={Boolean(meta.description)}>
          <Text className="bar-extra-description">{meta.description}</Text>
        </ShouldRender>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Text as="span" className="category-badge">
            {bar.category}
          </Text>
          <ShouldRender if={meta.isComidaDiButeco}>
            <Text as="span" className="edition-badge">
              <Award aria-hidden="true" className="size-3.5" />
              {t('comidaDiButeco')}
            </Text>
          </ShouldRender>
        </div>
      </div>
    </section>
  )
}
