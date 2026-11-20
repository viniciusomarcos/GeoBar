'use client'

import Link from 'next/link'
import type { ComponentPropsWithRef } from 'react'

export type ActionPressableProps = ComponentPropsWithRef<'button'> & {
  href?: never
}

export type LinkPressableProps = Omit<ComponentPropsWithRef<'a'>, 'href'> & {
  href: string
  disabled?: boolean
}

export type PressableProps = ActionPressableProps | LinkPressableProps

const getLinkRel = (target: string | undefined, rel: string | undefined) => {
  if (target !== '_blank') {
    return rel
  }

  return `${rel ?? ''} noopener noreferrer`.trim()
}

export const Pressable = (props: PressableProps) => {
  if (props.href !== undefined) {
    const { disabled, href, target, rel, tabIndex, onClick, ...rest } = props
    const safeRel = getLinkRel(target, rel)

    if (disabled) {
      return <a {...rest} role="link" aria-disabled="true" tabIndex={-1} />
    }

    if (href.startsWith('/') && !href.startsWith('//')) {
      return (
        <Link
          {...rest}
          href={href}
          target={target}
          rel={safeRel}
          tabIndex={tabIndex}
          onClick={onClick}
        />
      )
    }

    return (
      <a
        {...rest}
        href={href}
        target={target}
        rel={safeRel}
        tabIndex={tabIndex}
        onClick={onClick}
      />
    )
  }

  const { type = 'button', ...rest } = props

  return <button {...rest} type={type} />
}
