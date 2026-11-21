import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageMetadata } from './PageMetadata'

describe('PageMetadata', () => {
  it('updates the document title when page data changes', () => {
    const view = render(
      <PageMetadata
        title="Casa da Esquina — GeoBar"
        description="First description"
      />
    )
    expect(document.title).toBe('Casa da Esquina — GeoBar')

    view.rerender(
      <PageMetadata
        title="Quintal do Sol — GeoBar"
        description="Another description"
      />
    )

    expect(document.title).toBe('Quintal do Sol — GeoBar')
    expect(document.head.querySelectorAll('title')).toHaveLength(1)
  })

  it('keeps a single description tag as page data changes', () => {
    const view = render(
      <PageMetadata title="GeoBar" description="Explore Belo Horizonte" />
    )
    expect(
      document.head.querySelector('meta[name="description"]')
    ).toHaveAttribute('content', 'Explore Belo Horizonte')

    view.rerender(
      <PageMetadata title="GeoBar" description="Encontre seu próximo buteco" />
    )

    expect(
      document.head.querySelectorAll('meta[name="description"]')
    ).toHaveLength(1)
    expect(
      document.head.querySelector('meta[name="description"]')
    ).toHaveAttribute('content', 'Encontre seu próximo buteco')
  })
})
