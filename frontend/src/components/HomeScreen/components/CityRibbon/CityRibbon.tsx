import { useTranslations } from 'next-intl'
import { Text } from '@/components/Text'

export const CityRibbon = () => {
  const t = useTranslations('Ribbon')

  return (
    <div className="city-ribbon" aria-hidden="true">
      <div className="section-shell flex flex-wrap items-center justify-between gap-x-7 gap-y-4">
        <Text as="span">{t('food')}</Text>
        <Text as="span" className="ribbon-star">
          ✳
        </Text>
        <Text as="span">{t('drinks')}</Text>
        <Text as="span" className="ribbon-star">
          ✳
        </Text>
        <Text as="span">{t('company')}</Text>
        <Text as="span" className="ribbon-star hidden sm:inline">
          ✳
        </Text>
      </div>
    </div>
  )
}
