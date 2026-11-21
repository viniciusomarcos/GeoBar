import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getDemoBars } from '@/data/demoBars'
import { renderWithIntl } from '@/test/render'
import { Results } from './Results'

describe('Results', () => {
  it('selects the matching bar when its map action is activated', async () => {
    const user = userEvent.setup()
    const bars = getDemoBars('en')
    const onSelect = vi.fn()
    renderWithIntl(<Results bars={bars} onSelect={onSelect} />)
    const card = screen.getAllByRole('article')[1]

    await user.click(within(card).getByRole('link', { name: 'View on map' }))

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(bars[1].id)
    expect(
      within(card).getByRole('link', { name: 'View details' })
    ).toHaveAttribute('href', `/bars/${bars[1].id}`)
  })
})
