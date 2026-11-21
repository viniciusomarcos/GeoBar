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
  })

  it('updates the server-rendered description meta tag', () => {
    const description = document.createElement('meta')
    description.name = 'description'
    document.head.append(description)

    render(<PageMetadata title="GeoBar" description="Explore Belo Horizonte" />)

    expect(description.content).toBe('Explore Belo Horizonte')
    description.remove()
  })
})
