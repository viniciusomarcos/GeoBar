import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Text } from './Text'

describe('Text', () => {
  it('preserves content, styling, and accessibility attributes', () => {
    render(
      <Text role="status" className="result-count" id="results">
        3 places
      </Text>
    )

    expect(screen.getByRole('status')).toHaveTextContent('3 places')
    expect(screen.getByRole('status')).toHaveClass('result-count')
    expect(screen.getByRole('status')).toHaveAttribute('id', 'results')
  })

  it('exposes the requested heading level and forwards its ref', () => {
    const ref = createRef<HTMLHeadingElement>()
    render(
      <Text as="h2" ref={ref}>
        Explore neighborhoods
      </Text>
    )

    expect(ref.current).toBe(
      screen.getByRole('heading', { level: 2, name: 'Explore neighborhoods' })
    )
  })

  it('associates a label with its form control', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Text as="label" htmlFor="query">
          Search places
        </Text>
        <input id="query" />
      </>
    )

    await user.click(screen.getByText('Search places'))

    expect(screen.getByRole('textbox', { name: 'Search places' })).toHaveFocus()
  })
})
