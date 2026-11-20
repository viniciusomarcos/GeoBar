import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Text } from '@/components/Text'
import { ShouldRender } from './ShouldRender'

describe('ShouldRender', () => {
  it('shows children instead of the fallback when the condition is true', () => {
    render(
      <ShouldRender if fallback={<Text>Fallback</Text>}>
        <Text>Content</Text>
      </ShouldRender>
    )

    expect(screen.getByText('Content')).toBeVisible()
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument()
  })

  it('shows the fallback without mounting hidden children', () => {
    const HiddenContent = vi.fn(() => <Text>Hidden content</Text>)
    render(
      <ShouldRender if={false} fallback={<Text>Fallback</Text>}>
        <HiddenContent />
      </ShouldRender>
    )

    expect(screen.getByText('Fallback')).toBeVisible()
    expect(HiddenContent).not.toHaveBeenCalled()
  })

  it('renders nothing when false without a fallback', () => {
    const { container } = render(
      <ShouldRender if={false}>
        <Text>Hidden content</Text>
      </ShouldRender>
    )

    expect(container).toBeEmptyDOMElement()
  })
})
