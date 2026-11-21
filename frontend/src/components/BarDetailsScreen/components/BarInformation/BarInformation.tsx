import { Check, Clock3, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Text } from '@/components/Text'
import type { DemoBar } from '@/data/demoBars'

export const BarInformation = ({ bar }: { bar: DemoBar }) => {
  const t = useTranslations('Details')

  return (
    <aside className="bar-information" aria-label={t('information')}>
      <section>
        <Text as="h2" className="details-section-title">
          {t('highlights')}
        </Text>
        <ul className="bar-highlights">
          {bar.highlights.map((highlight) => (
            <li key={highlight}>
              <Check className="size-4" aria-hidden="true" />
              <Text>{highlight}</Text>
            </li>
          ))}
        </ul>
      </section>
      <section className="bar-info-row">
        <Clock3 className="size-5" aria-hidden="true" />
        <div>
          <Text as="h2" className="font-semibold">
            {t('hours')}
          </Text>
          <Text className="mt-2 text-sm leading-7 text-muted">{bar.hours}</Text>
        </div>
      </section>
      <section className="bar-info-row">
        <MapPin className="size-5" aria-hidden="true" />
        <div>
          <Text as="h2" className="font-semibold">
            {t('neighborhood')}
          </Text>
          <Text className="mt-2 text-sm leading-7 text-muted">
            {bar.neighborhood} · Belo Horizonte, MG
          </Text>
        </div>
      </section>
    </aside>
  )
}
