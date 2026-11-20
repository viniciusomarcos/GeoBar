'use client'

import { MapPin } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'

type BrandProps = {
  withIcon?: boolean
  className?: string
}

export const Brand = ({ withIcon = true, className = '' }: BrandProps) => {
  const locale = useLocale()
  const t = useTranslations('Navigation')

  return (
    <Pressable
      href={`/${locale}`}
      aria-label={t('home')}
      className={`brand ${className}`}
    >
      <ShouldRender if={withIcon}>
        <Text as="span" className="brand-icon">
          <MapPin aria-hidden="true" className="size-6" strokeWidth={2.5} />
        </Text>
      </ShouldRender>
      <Text as="span">
        GeoBar
        <Text as="span" className="text-accent-dark">
          .
        </Text>
      </Text>
    </Pressable>
  )
}
