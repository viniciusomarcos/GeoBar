import { MapPin, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Text } from '@/components/Text'

export const HeroVisual = () => {
  const t = useTranslations('Hero')

  return (
    <div className="hero-visual">
      <div className="hero-photo">
        <Image
          src="/images/barInterior.jpg"
          alt={t('photoAlt')}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="hero-photo-shade" />
        <div className="hero-photo-caption">
          <Text as="span" className="text-sm tracking-wide">
            {t('photoIntro')}
          </Text>
          <Text>
            {t('photoFirst')} <br />
            {t('photoSecond')}
          </Text>
        </div>
      </div>
      <div className="city-stamp">
        <Sparkles aria-hidden="true" className="size-5" />
        <Text as="span">{t('stamp')}</Text>
        <Text as="strong">BH</Text>
      </div>
      <div className="hero-note">
        <Text as="span" className="hero-note-icon">
          <MapPin aria-hidden="true" className="size-5" />
        </Text>
        <div>
          <Text className="font-semibold">{t('noteTitle')}</Text>
          <Text className="mt-1 text-sm text-muted">
            {t('noteDescription')}
          </Text>
        </div>
      </div>
    </div>
  )
}
