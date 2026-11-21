'use client'

export const PageMetadata = ({
  title,
  description
}: {
  title: string
  description: string
}) => (
  <>
    <title>{title}</title>
    <meta name="description" content={description} />
  </>
)
