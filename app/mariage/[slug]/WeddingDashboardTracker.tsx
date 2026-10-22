'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trackEvent, EVENTS } from '@/lib/analytics'

// Émet wedding_created (sur ?created=1, puis nettoie l'URL) et dashboard_first_view (1x par visiteur).
// Aucune donnée du mariage n'est transmise — events sans paramètres.
export default function WeddingDashboardTracker() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    try {
      if (params.get('created') === '1') {
        trackEvent(EVENTS.WEDDING_CREATED)
        // Retire le flag de l'URL sans recharger
        router.replace(window.location.pathname, { scroll: false })
      }
      if (!localStorage.getItem('kaatch_dash_seen')) {
        localStorage.setItem('kaatch_dash_seen', '1')
        trackEvent(EVENTS.DASHBOARD_FIRST_VIEW)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
