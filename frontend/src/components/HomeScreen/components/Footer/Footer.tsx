import { useTranslations } from 'next-intl'
import { Brand } from '@/components/Brand'
import { Text } from '@/components/Text'

export const Footer = () => {
  const t = useTranslations('Footer')

  return (
    <footer className="section-shell flex flex-wrap items-center justify-between gap-5 py-8">
      <Brand withIcon={false} className="text-2xl" />
      <Text className="text-sm text-muted">{t('description')}</Text>
    </footer>
  )
}
