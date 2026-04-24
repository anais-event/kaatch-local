'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

type Counts = { messages: boolean; photos: boolean }
type BadgeContextType = Counts & { clearMessages: () => void; clearPhotos: () => void }

const BadgeContext = createContext<BadgeContextType>({
  messages: false,
  photos: false,
  clearMessages: () => {},
  clearPhotos: () => {},
})

export function useBadges() {
  return useContext(BadgeContext)
}

export function NotificationBadgesProvider({
  slug,
  weddingId,
  children,
}: {
  slug: string
  weddingId: string
  children: React.ReactNode
}) {
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [hasNewPhotos, setHasNewPhotos] = useState(false)

  const lsKeyMessages = `kaatch_last_seen_messages_${slug}`
  const lsKeyPhotos = `kaatch_last_seen_photos_${slug}`

  const fetchCounts = useCallback(async () => {
    const supabase = createClient()
    const lastMessages = localStorage.getItem(lsKeyMessages)
    const lastPhotos = localStorage.getItem(lsKeyPhotos)

    // Check new messages
    let msgQuery = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('wedding_id', weddingId)
    if (lastMessages) {
      msgQuery = msgQuery.gt('created_at', lastMessages)
    }
    const { count: msgCount } = await msgQuery
    setHasNewMessages((msgCount ?? 0) > 0)

    // Check new photos
    let photoQuery = supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('wedding_id', weddingId)
    if (lastPhotos) {
      photoQuery = photoQuery.gt('created_at', lastPhotos)
    }
    const { count: photoCount } = await photoQuery
    setHasNewPhotos((photoCount ?? 0) > 0)
  }, [weddingId, lsKeyMessages, lsKeyPhotos])

  useEffect(() => {
    fetchCounts()
    const interval = setInterval(fetchCounts, 30_000)
    return () => clearInterval(interval)
  }, [fetchCounts])

  const clearMessages = useCallback(() => {
    localStorage.setItem(lsKeyMessages, new Date().toISOString())
    setHasNewMessages(false)
  }, [lsKeyMessages])

  const clearPhotos = useCallback(() => {
    localStorage.setItem(lsKeyPhotos, new Date().toISOString())
    setHasNewPhotos(false)
  }, [lsKeyPhotos])

  return (
    <BadgeContext.Provider value={{ messages: hasNewMessages, photos: hasNewPhotos, clearMessages, clearPhotos }}>
      {children}
    </BadgeContext.Provider>
  )
}
