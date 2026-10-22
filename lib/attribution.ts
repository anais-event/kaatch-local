// Attribution first-party Kaatch — SANS PII, SANS fingerprint.
// - visitor_id : UUID anonyme persistant (localStorage), sert uniquement à dédupliquer.
// - session_id : UUID de session (sessionStorage).
// - canal : normalisé depuis utm_* / referrer, stocké en first-touch + last-touch (session).
// Aucune donnée personnelle n'est stockée ni transmise.

'use client'

const VISITOR_KEY = 'kaatch_vid'
const FIRST_KEY = 'kaatch_attr_first'
const SESSION_ID_KEY = 'kaatch_sid'
const SESSION_ATTR_KEY = 'kaatch_attr_session'
const LANDING_KEY = 'kaatch_landing'

export type Attribution = {
  channel: string
  source: string
  medium: string
  campaign: string
}

function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {}
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function safeGet(store: Storage | undefined, key: string): string | null {
  try { return store?.getItem(key) ?? null } catch { return null }
}
function safeSet(store: Storage | undefined, key: string, val: string) {
  try { store?.setItem(key, val) } catch {}
}

/** Visiteur anonyme persistant (dedup only). */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let v = safeGet(localStorage, VISITOR_KEY)
  if (!v) { v = uuid(); safeSet(localStorage, VISITOR_KEY, v) }
  return v
}

/** Session courante. */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let s = safeGet(sessionStorage, SESSION_ID_KEY)
  if (!s) { s = uuid(); safeSet(sessionStorage, SESSION_ID_KEY, s) }
  return s
}

// Hôtes référents → canal normalisé. On ne distingue QUE ce qui est identifiable.
const AI_HOSTS: Record<string, string> = {
  'chatgpt.com': 'chatgpt',
  'chat.openai.com': 'chatgpt',
  'openai.com': 'chatgpt',
  'perplexity.ai': 'perplexity',
  'www.perplexity.ai': 'perplexity',
  'claude.ai': 'claude',
  'gemini.google.com': 'gemini',
  'bard.google.com': 'gemini',
  'copilot.microsoft.com': 'copilot',
  'you.com': 'you',
}
const SEARCH_HOSTS: Record<string, string> = {
  'google.': 'google',
  'bing.com': 'bing',
  'duckduckgo.com': 'duckduckgo',
  'ecosia.org': 'ecosia',
  'qwant.com': 'qwant',
  'yahoo.com': 'yahoo',
}
const SOCIAL_HOSTS = [
  'facebook.com', 'fb.com', 'instagram.com', 'l.instagram.com', 't.co', 'twitter.com',
  'x.com', 'linkedin.com', 'lnkd.in', 'pinterest.', 'youtube.com', 'youtu.be',
  'tiktok.com', 'reddit.com', 'wa.me', 'whatsapp.com',
]

function hostOf(url: string): string {
  try { return new URL(url).hostname.toLowerCase() } catch { return '' }
}

/**
 * Déduit le canal normalisé. Ordre : utm_source/medium explicites > referrer connu > direct.
 * Ne JAMAIS inventer un canal : si rien d'identifiable, on renvoie 'direct' (self/vide) ou 'referral'.
 */
export function normalizeChannel(opts: {
  utmSource?: string | null
  utmMedium?: string | null
  referrer?: string | null
  currentHost?: string | null
}): Attribution {
  const source = (opts.utmSource || '').toLowerCase().trim()
  const medium = (opts.utmMedium || '').toLowerCase().trim()
  const refHost = opts.referrer ? hostOf(opts.referrer) : ''
  const self = (opts.currentHost || '').toLowerCase()

  // 1) UTM explicites
  if (source) {
    if (AI_HOSTS[source]) return chan(AI_HOSTS[source], source, medium || 'referral')
    for (const k in AI_HOSTS) if (source.includes(k.split('.')[0])) return chan(AI_HOSTS[k], source, medium || 'referral')
    if (medium === 'cpc' || medium === 'ppc' || medium === 'paid') return chan('paid', source, medium)
    if (medium === 'email') return chan('email', source, medium)
    if (medium === 'social' || SOCIAL_HOSTS.some(h => source.includes(h.split('.')[0]))) return chan('social', source, medium || 'social')
    if (medium === 'organic' || source === 'google' || source === 'bing') return chan(source === 'bing' ? 'bing' : 'google', source, 'organic')
    return chan('referral', source, medium || 'referral')
  }

  // 2) Referrer
  if (refHost && refHost !== self) {
    if (AI_HOSTS[refHost]) return chan(AI_HOSTS[refHost], refHost, 'referral')
    for (const k in SEARCH_HOSTS) if (refHost.includes(k)) return chan(SEARCH_HOSTS[k], refHost, 'organic')
    if (SOCIAL_HOSTS.some(h => refHost.includes(h))) return chan('social', refHost, 'social')
    return chan('referral', refHost, 'referral')
  }

  // 3) Rien d'identifiable
  return chan('direct', '', '')
}

function chan(channel: string, source: string, medium: string, campaign = ''): Attribution {
  return { channel, source, medium, campaign }
}

function pathOnly(url: string): string {
  try { const u = new URL(url, 'https://kaatch.fr'); return u.pathname } catch { return '/' }
}

/**
 * À appeler une fois au chargement. Capture / rafraîchit l'attribution.
 * Renvoie { first, session, landing } pour joindre aux events.
 */
export function captureAttribution(): {
  first: Attribution
  session: Attribution
  landing: string
} {
  const fallback = { channel: 'direct', source: '', medium: '', campaign: '' }
  if (typeof window === 'undefined') return { first: fallback, session: fallback, landing: '/' }

  const params = new URLSearchParams(window.location.search)
  const attr = normalizeChannel({
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    referrer: document.referrer || null,
    currentHost: window.location.hostname,
  })
  const campaign = (params.get('utm_campaign') || '').slice(0, 80)
  attr.campaign = campaign

  // First-touch : écrit une seule fois.
  let first: Attribution
  const rawFirst = safeGet(localStorage, FIRST_KEY)
  if (rawFirst) {
    try { first = JSON.parse(rawFirst) } catch { first = attr }
  } else {
    first = attr
    safeSet(localStorage, FIRST_KEY, JSON.stringify(first))
  }

  // Session-touch : écrit une fois par session.
  let session: Attribution
  const rawSession = safeGet(sessionStorage, SESSION_ATTR_KEY)
  if (rawSession) {
    try { session = JSON.parse(rawSession) } catch { session = attr }
  } else {
    session = attr
    safeSet(sessionStorage, SESSION_ATTR_KEY, JSON.stringify(session))
  }

  // Landing page de la session (path only, sans query → pas d'IDs sensibles).
  let landing = safeGet(sessionStorage, LANDING_KEY) || ''
  if (!landing) {
    landing = pathOnly(window.location.pathname)
    safeSet(sessionStorage, LANDING_KEY, landing)
  }

  return { first, session, landing }
}

/** True si une nouvelle session vient d'être créée (pour émettre session_start une seule fois). */
export function isNewSession(): boolean {
  if (typeof window === 'undefined') return false
  const flag = safeGet(sessionStorage, 'kaatch_session_started')
  if (flag) return false
  safeSet(sessionStorage, 'kaatch_session_started', '1')
  return true
}
