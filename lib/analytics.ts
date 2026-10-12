// trackEvent() centralisé — double envoi GA4 (gtag) + store first-party (/api/track).
// Règles : aucune PII (nom, email, téléphone, token, contenu mariage) ne doit transiter.
// Les noms d'events et les clés de params sont whitelistés.

'use client'

import { captureAttribution, getSessionId, getVisitorId, isNewSession } from './attribution'

// ── Noms d'événements autorisés (funnel réel de Kaatch) ──
export const EVENTS = {
  SESSION_START: 'session_start',
  // Plan de table (outil gratuit, sans compte)
  SEATING_VIEWED: 'seating_plan_viewed',
  SEATING_STARTED: 'seating_plan_started',
  GUEST_ADDED: 'guest_added',
  TABLE_CREATED: 'table_created',
  GUEST_SEATED: 'guest_seated',
  SEATING_COMPLETED: 'seating_plan_completed',
  SEATING_PDF: 'seating_plan_pdf_downloaded',
  SEATING_CTA: 'seating_plan_cta_clicked',
  // Inscription / activation
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  WEDDING_CREATED: 'wedding_created',
  DASHBOARD_FIRST_VIEW: 'dashboard_first_view',
  FEATURE_USED: 'feature_used', // 1re action significative dans l'espace (activation)
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

const ALLOWED_EVENTS = new Set<string>(Object.values(EVENTS))

// Clés de params autorisées (jamais de PII). Tout le reste est jeté.
const ALLOWED_PROP_KEYS = new Set<string>([
  'guest_count', 'table_count', 'unplaced_count', 'seated_count',
  'remaining_capacity', 'completion_pct', 'cta_location', 'tool_version',
  'feature', 'device', 'bulk', 'from',
])

// Détection grossière de PII pour refus défensif côté client aussi.
const PII_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?:\+?\d[\s.-]?){7,}/i

function sanitizeProps(props?: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  if (!props) return out
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_PROP_KEYS.has(k)) continue
    if (v == null) continue
    if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; continue }
    const s = String(v).slice(0, 60)
    if (PII_RE.test(s)) continue // ne jamais laisser passer une valeur ressemblant à une PII
    out[k] = s
  }
  return out
}

function pathOnly(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

/**
 * Émet un événement analytics. Non bloquant, silencieux en cas d'erreur.
 */
export function trackEvent(name: EventName, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!ALLOWED_EVENTS.has(name)) return
  const clean = sanitizeProps(props)

  // 1) GA4 (reports d'acquisition natifs)
  try {
    if (typeof window.gtag === 'function') window.gtag('event', name, clean)
  } catch {}

  // 2) Store first-party (cockpit interne)
  try {
    const { first, session, landing } = captureAttribution()
    const body = JSON.stringify({
      event: name,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      channel: first.channel,
      session_channel: session.channel,
      source: first.source,
      medium: first.medium,
      campaign: first.campaign,
      landing_page: landing,
      page_path: pathOnly(),
      props: clean,
    })
    const url = '/api/track'
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
    } else {
      fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
    }
  } catch {}
}

/** Émet session_start une seule fois par session. */
export function trackSessionStart() {
  if (isNewSession()) trackEvent(EVENTS.SESSION_START)
}
