import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('announces an error and can be dismissed with the keyboard', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(
      <Toast
        message="Unable to load bars"
        dismissLabel="Dismiss notification"
        onDismiss={onDismiss}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load bars')
    screen.getByRole('button', { name: 'Dismiss notification' }).focus()
    await user.keyboard('{Enter}')
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('dismisses automatically and cancels its timer on unmount', () => {
    vi.useFakeTimers()
    try {
      const onDismiss = vi.fn()
      const view = render(
        <Toast
          message="Unable to load bars"
          dismissLabel="Dismiss notification"
          onDismiss={onDismiss}
        />
      )
      act(() => vi.advanceTimersByTime(6000))
      expect(onDismiss).toHaveBeenCalledOnce()
      view.unmount()
      act(() => vi.runOnlyPendingTimers())
      expect(onDismiss).toHaveBeenCalledOnce()
    } finally {
      vi.useRealTimers()
    }
  })
})
