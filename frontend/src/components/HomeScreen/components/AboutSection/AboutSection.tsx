import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'

export const AboutSection = () => {
  const t = useTranslations('About')

  return (
    <section id="about" className="about-section scroll-mt-8">
      <div className="section-shell about-layout">
        <div>
          <Text className="eyebrow text-lime">{t('eyebrow')}</Text>
          <Text as="h2" className="about-title">
            {t('titleFirst')} <br />
            {t('titleSecond')} <Text as="em">BH.</Text>
          </Text>
        </div>
        <div className="max-w-md">
          <Text className="text-lg leading-8 text-white/80">
            {t('description')}
          </Text>
          <Text className="mt-5 text-base leading-7 text-white/65">
            {t('invitation')}
          </Text>
          <Pressable href="#explore" className="button button-lime mt-8">
            {t('explore')}
          </Pressable>
        </div>
      </div>
    </section>
  )
}
