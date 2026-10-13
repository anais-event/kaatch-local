'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/attribution'
import { trackSessionStart } from '@/lib/analytics'

// Capture l'attribution first/last-touch au 1er rendu et émet session_start une fois par session.
// Aucune PII, aucun fingerprint. GA4 gère déjà page_view séparément.
export default function AnalyticsInit() {
  useEffect(() => {
    try {
      captureAttribution()
      trackSessionStart()
    } catch {}
  }, [])
  return null
}
