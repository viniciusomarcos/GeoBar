import type { PropsWithChildren, ReactNode } from 'react'

export type ShouldRenderProps = PropsWithChildren<{
  if: boolean
  fallback?: ReactNode
}>

export const ShouldRender = ({
  if: condition,
  children,
  fallback = null
}: ShouldRenderProps) => {
  if (!condition) {
    return fallback
  }

  return children
}
