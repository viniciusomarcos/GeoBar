import { Clock3, MapPin, Navigation } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import type { Bar } from '@/data/bar'

export const BarInformation = ({ bar }: { bar: Bar }) => {
  const t = useTranslations('Details')

  return (
    <aside className="bar-information" aria-label={t('information')}>
      <ShouldRender if={Boolean(bar.hours)}>
        <section className="bar-info-row">
          <Clock3 className="size-5" aria-hidden="true" />
          <div>
            <Text as="h2" className="font-semibold">
              {t('hours')}
            </Text>
            <Text className="mt-2 text-sm leading-7 text-muted">
              {bar.hours}
            </Text>
          </div>
        </section>
      </ShouldRender>
      <section className="bar-info-row">
        <MapPin className="size-5" aria-hidden="true" />
        <div>
          <Text as="h2" className="font-semibold">
            {t('location')}
          </Text>
          <Text className="mt-2 text-sm leading-7 text-muted">
            {bar.neighborhood} · MG
          </Text>
        </div>
      </section>
      <Pressable
        href={`https://www.google.com/maps/dir/?api=1&destination=${bar.position[0]},${bar.position[1]}`}
        target="_blank"
        rel="noopener noreferrer"
        className="button button-dark justify-center"
      >
        <Navigation aria-hidden="true" className="size-4" />
        {t('directions')}
      </Pressable>
    </aside>
  )
}
