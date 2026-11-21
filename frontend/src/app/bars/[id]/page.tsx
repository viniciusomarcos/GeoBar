import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BarDetailsScreen } from '@/components/BarDetailsScreen'
import { getDemoBar, getDemoBars } from '@/data/demoBars'
import { defaultLocale } from '@/i18n/config'

type BarPageProps = { params: Promise<{ id: string }> }

export const dynamicParams = false

export const generateStaticParams = () =>
  getDemoBars(defaultLocale).map(({ id }) => ({ id }))

export const generateMetadata = async ({
  params
}: BarPageProps): Promise<Metadata> => {
  const { id } = await params
  const bar = getDemoBar(id, defaultLocale)
  if (!bar) {
    notFound()
  }
  return { title: `${bar.name} — GeoBar`, description: bar.description }
}

const BarDetailsPage = async ({ params }: BarPageProps) => {
  const { id } = await params
  const bar = getDemoBar(id, defaultLocale)
  if (!bar) {
    notFound()
  }
  return <BarDetailsScreen bar={bar} />
}

export default BarDetailsPage
