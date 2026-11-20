import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { HomeScreen } from '@/components/home-screen'
import { routing } from '@/i18n/routing'

export default async function HomePage({
  params
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return <HomeScreen />
}
