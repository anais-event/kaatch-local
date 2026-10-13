'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView, trackEngagement } from '@/lib/analytics'
import { isPublicPath } from '@/lib/analytics-cockpit'

// Mesure d'audience first-party, anonyme (exemption CNIL « mesure d'audience ») :
//  - 1 page_view par page PUBLIQUE consultée (path-only, jamais d'espace privé → pas de slug/nom).
//  - durée d'engagement approximative (temps visible) envoyée en quittant la page.
// Aucune PII, aucun fingerprint. Les espaces mariés/invités/prestataires ne sont jamais tracés ici.
export default function PageViewTracker() {
  const pathname = usePathname()
  const prevPublicPath = useRef<string>('')     // dernière page publique (pour le parcours)
  const curPath = useRef<string>('')            // page en cours de mesure d'engagement
  const enterTs = useRef<number>(0)
  const flushed = useRef<boolean>(false)

  useEffect(() => {
    const flush = () => {
      if (flushed.current) return
      if (curPath.current && isPublicPath(curPath.current) && enterTs.current) {
        trackEngagement(curPath.current, Date.now() - enterTs.current)
        flushed.current = true
      }
    }

    // On quitte la page précédente (changement de route) → on clôt sa durée.
    flush()

    if (isPublicPath(pathname)) {
      trackPageView(prevPublicPath.current && isPublicPath(prevPublicPath.current) ? prevPublicPath.current : undefined)
      prevPublicPath.current = pathname
      curPath.current = pathname
      enterTs.current = Date.now()
      flushed.current = false
    } else {
      // page privée : pas de mesure, et on ne garde pas son chemin comme origine (pas de slug)
      curPath.current = ''
    }

    const onHide = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
    }
  }, [pathname])

  return null
}
