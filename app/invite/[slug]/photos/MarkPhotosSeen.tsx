'use client'

import { useEffect } from 'react'
import { useBadges } from '../NotificationBadges'

export default function MarkPhotosSeen({ slug }: { slug: string }) {
  const { clearPhotos } = useBadges()

  useEffect(() => {
    clearPhotos()
  }, [clearPhotos])

  return null
}
