import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { NotFoundScreen } from './NotFoundScreen'

describe('NotFoundScreen', () => {
  it('explains a missing page and links back to the bar collection', () => {
    renderWithIntl(<NotFoundScreen />, 'pt')

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
