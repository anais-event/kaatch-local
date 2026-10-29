// Ingestion analytics first-party. Écrit dans analytics_events via service_role.
// Défense : whitelist des noms d'events, anti-PII serveur, caps de taille, sanitisation des paths.
// Si SUPABASE_SERVICE_ROLE_KEY absent → no-op silencieux (jamais de crash, jamais d'écriture anon).

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { isPublicPath, SURVEY, SURVEY_ANSWER_IDS } from '@/lib/analytics-cockpit'

export const runtime = 'nodejs'

const ALLOWED_EVENTS = new Set<string>([
  'session_start',
  'page_view', 'page_engagement',
  'tool_viewed', 'tool_started', 'tool_export',
  'seating_plan_viewed', 'seating_plan_started', 'guest_added', 'table_created',
  'guest_seated', 'seating_plan_completed', 'seating_plan_pdf_downloaded', 'seating_plan_cta_clicked',
  'signup_started', 'signup_completed', 'wedding_created', 'dashboard_first_view', 'feature_used',
  'survey_shown', 'survey_answered',
])

const ALLOWED_PROP_KEYS = new Set<string>([
  'guest_count', 'table_count', 'unplaced_count', 'seated_count',
  'remaining_capacity', 'completion_pct', 'cta_location', 'tool_version',
  'feature', 'device', 'bulk', 'from',
  'from_path', 'duration_ms', 'tool',
  'survey_q', 'survey_a',
])

const ALLOWED_CHANNELS = new Set<string>([
  'chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'you',
  'google', 'bing', 'duckduckgo', 'ecosia', 'qwant', 'yahoo',
  'social', 'referral', 'paid', 'email', 'direct',
])

const PII_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?:\+?\d[\s.-]?){7,}/i

function str(v: unknown, max: number): string | null {
  if (v == null) return null
  const s = String(v).slice(0, max)
  return s || null
}

// path only, sans query (pas d'IDs/tokens sensibles), et on tronque les segments dynamiques
function cleanPath(v: unknown): string | null {
  const s = str(v, 300)
  if (!s) return null
  let p = s
  try { p = new URL(s, 'https://kaatch.fr').pathname } catch {}
  if (PII_RE.test(p)) return null
  return p.slice(0, 200)
}

function cleanChannel(v: unknown): string | null {
  const s = (str(v, 32) || '').toLowerCase()
  return ALLOWED_CHANNELS.has(s) ? s : (s ? 'referral' : null)
}

function cleanId(v: unknown): string | null {
  const s = str(v, 64)
  if (!s) return null
  // UUID/token court alphanumérique uniquement
  return /^[a-z0-9-]{6,64}$/i.test(s) ? s : null
}

function sanitizeProps(raw: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  if (!raw || typeof raw !== 'object') return out
  let count = 0
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (count >= 12) break
    if (!ALLOWED_PROP_KEYS.has(k)) continue
    if (v == null) continue
    if (typeof v === 'number' && Number.isFinite(v)) { out[k] = v; count++; continue }
    if (typeof v === 'boolean') { out[k] = v; count++; continue }
    const s = String(v).slice(0, 60)
    if (PII_RE.test(s)) continue
    // from_path = chemin interne : on refuse tout chemin privé (jamais de slug de mariage).
    if (k === 'from_path' && !isPublicPath(s)) continue
    // Micro-sondage : enum fermé. Toute valeur hors liste est rejetée (aucun texte libre admis).
    if (k === 'survey_q' && s !== SURVEY.id) continue
    if (k === 'survey_a' && !SURVEY_ANSWER_IDS.has(s)) continue
    out[k] = s; count++
  }
  return out
}

export async function POST(req: Request) {
  try {
    // Cap de taille (évite les gros payloads)
    const text = await req.text()
    if (text.length > 4000) return NextResponse.json({ ok: false }, { status: 413 })

    let b: Record<string, unknown>
    try { b = JSON.parse(text) } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

    const event = str(b.event, 48)
    if (!event || !ALLOWED_EVENTS.has(event)) {
      // event inconnu → on ignore silencieusement (pas d'info leak)
      return NextResponse.json({ ok: true })
    }

    // Pas de service_role dispo → no-op (ne jamais écrire en anon)
    let supabase
    try { supabase = createServiceClient() } catch { return NextResponse.json({ ok: true }) }

    const row = {
      event_name: event,
      visitor_id: cleanId(b.visitor_id),
      session_id: cleanId(b.session_id),
      channel: cleanChannel(b.channel),
      session_channel: cleanChannel(b.session_channel),
      source: str(b.source, 120),
      medium: str(b.medium, 60),
      campaign: str(b.campaign, 80),
      landing_page: cleanPath(b.landing_page),
      page_path: cleanPath(b.page_path),
      props: sanitizeProps(b.props),
    }

    await supabase.from('analytics_events').insert(row)
    return NextResponse.json({ ok: true })
  } catch {
    // Jamais faire échouer le client sur de la télémétrie
    return NextResponse.json({ ok: true })
  }
}
