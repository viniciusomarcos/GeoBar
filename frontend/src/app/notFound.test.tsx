import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import NotFound from './not-found'

describe('Not-found route', () => {
  it('explains a missing page and links back to the bar collection', () => {
    renderWithIntl(<NotFound />, 'pt')

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Esse lugar ficou fora do mapa.'
      })
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Explorar bares' })
    ).toHaveAttribute('href', '/#explore')
    expect(document.title).toBe('Página não encontrada — GeoBar')
  })
})
