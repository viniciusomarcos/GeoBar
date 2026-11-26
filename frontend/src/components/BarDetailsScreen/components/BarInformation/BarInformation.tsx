import {
  AtSign,
  Clock3,
  Globe,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
  Utensils
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import type { Bar } from '@/data/bar'
import { extractBarMetadata } from '@/data/barMetadata'

export const BarInformation = ({ bar }: { bar: Bar }) => {
  const t = useTranslations('Details')
  const meta = extractBarMetadata(bar.apiData.metadata)
  const hasAmenities =
    meta.amenities.outdoorSeating ||
    meta.amenities.wheelchair ||
    meta.amenities.wifi

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
      <ShouldRender if={Boolean(meta.cuisine)}>
        <section className="bar-info-row">
          <Utensils className="size-5" aria-hidden="true" />
          <div>
            <Text as="h2" className="font-semibold">
              {t('cuisine')}
            </Text>
            <Text className="mt-2 text-sm leading-7 text-muted">
              {meta.cuisine}
            </Text>
          </div>
        </section>
      </ShouldRender>
      <ShouldRender if={Boolean(meta.phone)}>
        <section className="bar-info-row">
          <Phone className="size-5" aria-hidden="true" />
          <div>
            <Text as="h2" className="font-semibold">
              {t('phone')}
            </Text>
            <Pressable
              href={`tel:${meta.phone}`}
              className="bar-info-link mt-2"
            >
              {meta.phone}
            </Pressable>
          </div>
        </section>
      </ShouldRender>
      <ShouldRender if={Boolean(meta.websiteUrl)}>
        <section className="bar-info-row">
          <Globe className="size-5" aria-hidden="true" />
          <div>
            <Text as="h2" className="font-semibold">
              {t('website')}
            </Text>
            <Pressable
              href={meta.websiteUrl ?? ''}
              target="_blank"
              rel="noopener noreferrer"
              className="bar-info-link mt-2"
            >
              {meta.websiteLabel}
            </Pressable>
          </div>
        </section>
      </ShouldRender>
      <ShouldRender if={Boolean(meta.instagramUrl)}>
        <section className="bar-info-row">
          <AtSign className="size-5" aria-hidden="true" />
          <div>
            <Text as="h2" className="font-semibold">
              {t('instagram')}
            </Text>
            <Pressable
              href={meta.instagramUrl ?? ''}
              target="_blank"
              rel="noopener noreferrer"
              className="bar-info-link mt-2"
            >
              {meta.instagramHandle}
            </Pressable>
          </div>
        </section>
      </ShouldRender>
      <ShouldRender if={hasAmenities}>
        <section className="bar-info-row">
          <Sparkles className="size-5" aria-hidden="true" />
          <div>
            <Text as="h2" className="font-semibold">
              {t('amenities')}
            </Text>
            <div className="mt-2 flex flex-wrap gap-2">
              <ShouldRender if={meta.amenities.outdoorSeating}>
                <Text as="span" className="amenity-chip">
                  {t('outdoorSeating')}
                </Text>
              </ShouldRender>
              <ShouldRender if={meta.amenities.wheelchair}>
                <Text as="span" className="amenity-chip">
                  {t('wheelchair')}
                </Text>
              </ShouldRender>
              <ShouldRender if={meta.amenities.wifi}>
                <Text as="span" className="amenity-chip">
                  {t('wifi')}
                </Text>
              </ShouldRender>
            </div>
          </div>
        </section>
      </ShouldRender>
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
