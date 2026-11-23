'use client'

import { CircleAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'

export const Toast = ({
  message,
  dismissLabel,
  onDismiss
}: {
  message: string
  dismissLabel: string
  onDismiss: () => void
}) => {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 6000)
    return () => window.clearTimeout(timeout)
  }, [onDismiss])

  return (
    <div className="toast" role="alert">
      <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
      <Text>{message}</Text>
      <Pressable
        className="icon-button shrink-0"
        aria-label={dismissLabel}
        onClick={onDismiss}
      >
        <X aria-hidden="true" className="size-4" />
      </Pressable>
    </div>
  )
}
