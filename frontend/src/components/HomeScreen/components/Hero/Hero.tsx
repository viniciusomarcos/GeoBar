import { Beer, Compass } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import { HeroVisual } from './components/HeroVisual'

export const Hero = () => {
  const t = useTranslations('Hero')

  return (
    <section className="section-shell hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <Text className="location-label">
          <Text as="span" className="size-2 rounded-full bg-accent-dark" />
          {t('location')}
        </Text>
        <Text as="h1" id="hero-title" className="hero-title">
          {t('titleFirst')} <br />
          {t('titleSecond')} <Text as="span">{t('titleAccent')}</Text>
        </Text>
        <Text className="hero-description">{t('description')}</Text>
        <Pressable href="#explore" className="button button-lime mt-8 sm:mt-10">
          <Compass aria-hidden="true" className="size-5" />
          {t('explore')}
        </Pressable>
        <div className="hero-footnote">
          <Text as="span" className="hero-footnote-icon">
            <Beer aria-hidden="true" className="size-5" strokeWidth={1.6} />
          </Text>
          <Text>
            {t('footnoteFirst')} <br />
            <Text as="span" className="font-medium text-ink">
              {t('footnoteSecond')}
            </Text>
          </Text>
        </div>
      </div>
      <HeroVisual />
    </section>
  )
}
