'use client'

import { ArrowLeft, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { PageMetadata } from '@/components/PageMetadata'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'

export const NotFoundScreen = () => {
  const t = useTranslations('NotFound')
  return (
    <>
      <PageMetadata title={t('pageTitle')} description={t('description')} />
      <Header />
      <main className="section-shell not-found">
        <MapPin className="size-10 text-accent-dark" aria-hidden="true" />
        <Text className="eyebrow mt-6">404</Text>
        <Text as="h1" className="section-title">
          {t('title')}
        </Text>
        <Text className="mt-5 max-w-md leading-8 text-muted">
          {t('description')}
        </Text>
        <Pressable href="/#explore" className="button button-lime mt-8">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('back')}
        </Pressable>
      </main>
      <Footer />
    </>
  )
}
