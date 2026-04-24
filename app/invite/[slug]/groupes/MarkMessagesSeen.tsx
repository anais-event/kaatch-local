'use client'

import { useEffect } from 'react'
import { useBadges } from '../NotificationBadges'

export default function MarkMessagesSeen({ slug }: { slug: string }) {
  const { clearMessages } = useBadges()

  useEffect(() => {
    clearMessages()
  }, [clearMessages])

  return null
}
