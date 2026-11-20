import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Pressable } from './Pressable'

describe('Pressable', () => {
  it('runs an action without accidentally submitting its parent form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event) => event.preventDefault())
    const onClick = vi.fn()
    render(
      <form onSubmit={onSubmit}>
        <Pressable onClick={onClick}>Clear</Pressable>
      </form>
    )

    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onClick).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a form when explicitly configured as a submit button', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Pressable type="submit">Search</Pressable>
      </form>
    )

    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('prevents a disabled action from running', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Pressable disabled onClick={onClick}>
        Search
      </Pressable>
    )

    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByRole('button')).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('preserves internal link attributes and forwards its ref', () => {
    const ref = createRef<HTMLAnchorElement>()
    render(
      <Pressable href="/pt" lang="pt" hrefLang="pt" ref={ref}>
        Português
      </Pressable>
    )

    const link = screen.getByRole('link', { name: 'Português' })
    expect(link).toHaveAttribute('href', '/pt')
    expect(link).toHaveAttribute('hreflang', 'pt')
    expect(ref.current).toBe(link)
  })

  it('removes navigation and focus from a disabled link', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Pressable href="/pt" disabled onClick={onClick}>
        Português
      </Pressable>
    )

    const link = screen.getByRole('link', { name: 'Português' })
    await user.click(link)

    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('preserves hash navigation and click handlers', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn((event) => event.preventDefault())
    render(
      <Pressable href="#explore" onClick={onClick} tabIndex={0} rel="help">
        Explore
      </Pressable>
    )

    await user.click(screen.getByRole('link', { name: 'Explore' }))

    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('link')).toHaveAttribute('href', '#explore')
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'help')
  })

  it('protects a new-tab link without existing rel values', () => {
    render(
      <Pressable href="https://example.com" target="_blank">
        External
      </Pressable>
    )

    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    )
  })

  it('preserves existing rel values on a protocol-relative new-tab link', () => {
    render(
      <Pressable href="//example.com" target="_blank" rel="nofollow">
        External
      </Pressable>
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', '//example.com')
    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'nofollow noopener noreferrer'
    )
  })
})
