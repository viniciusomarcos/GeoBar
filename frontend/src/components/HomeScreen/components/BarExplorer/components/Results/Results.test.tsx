import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { toBar } from '@/data/loadApiBars'
import { getTestBars } from '@/test/bars'
import { renderWithIntl } from '@/test/render'
import { Results } from './Results'

describe('Results', () => {
  it('uses a compact card without invented images or missing-address messages', () => {
    const bar = toBar({ ...getTestBars('en')[0].apiData, address: null }, 'en')
    const { container } = renderWithIntl(
      <Results bars={[bar]} onSelect={vi.fn()} />
    )
    expect(screen.getByRole('heading', { name: bar.name })).toBeVisible()
    expect(screen.getByText(bar.category)).toBeVisible()
    expect(container.querySelector('.place-art')).toBeNull()
    expect(container.querySelector('.place-address')).toBeNull()
  })

  it('selects the matching bar when its map action is activated', async () => {
    const user = userEvent.setup()
    const bars = getTestBars('en')
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
