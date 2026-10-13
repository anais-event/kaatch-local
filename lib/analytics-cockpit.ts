// Agrégation serveur du cockpit analytics. Pur calcul, aucune PII.
// Règles clés :
//  - Les pages privées (/admin, /dashboard, /mariage…) sont EXCLUES de l'acquisition
//    (un admin qui ouvre le cockpit ne doit pas compter comme visiteur).
//  - Les events de conversion (signup/wedding/feature) restent comptés où qu'ils aient lieu.
//  - On distingue toujours : zéro réel vs donnée indisponible vs volume insuffisant.

export type Ev = {
  event_name: string
  visitor_id: string | null
  session_id: string | null
  channel: string | null
  session_channel: string | null
  landing_page: string | null
  page_path: string | null
  created_at: string
}

export const CHANNEL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini',
  copilot: 'Copilot', you: 'You.com', google: 'Google', bing: 'Bing',
  duckduckgo: 'DuckDuckGo', ecosia: 'Ecosia', qwant: 'Qwant', yahoo: 'Yahoo',
  social: 'Réseaux sociaux', referral: 'Sites référents', paid: 'Payant',
  email: 'Email', direct: 'Direct / inconnu',
}
export const AI_CHANNELS = new Set(['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'you'])
export const SEARCH_CHANNELS = new Set(['google', 'bing', 'duckduckgo', 'ecosia', 'qwant', 'yahoo'])

// Préfixes de pages privées : exclus des métriques d'acquisition et des listes de pages.
const PRIVATE_PREFIXES = ['/admin', '/dashboard', '/mariage', '/invite', '/invité', '/vendor', '/prestataire', '/rsvp', '/api']

export function isPublicPath(path: string | null): boolean {
  if (!path) return false
  return !PRIVATE_PREFIXES.some(p => path === p || path.startsWith(p + '/') || path.startsWith(p))
}

// Événements attendus (pour le diagnostic).
export const EXPECTED_EVENTS = [
  'session_start', 'seating_plan_viewed', 'seating_plan_started', 'guest_added',
  'table_created', 'guest_seated', 'seating_plan_completed', 'seating_plan_pdf_downloaded',
  'seating_plan_cta_clicked', 'signup_started', 'signup_completed', 'wedding_created',
  'dashboard_first_view', 'feature_used',
]

export type Agg = {
  // acquisition (visiteurs publics uniquement)
  visitors: number
  sessions: number
  aiVisitors: number
  searchVisitors: number
  directVisitors: number
  socialRefVisitors: number
  channels: { key: string; label: string; visitors: number; kind: 'ai' | 'search' | 'other' }[]
  landing: [string, number][]        // [path, visiteurs uniques]
  topPages: [string, number][]       // [path, vues] pages publiques
  spark: number[]                    // visiteurs publics / jour
  // plan de table (events)
  tool: { viewed: number; started: number; completed: number; pdf: number; cta: number }
  // conversion (events)
  signups: number
  activated: number
  weddingEvents: number              // events wedding_created (attribution dispo)
  dashboardFirst: number
  // attribution conversions (channel → count), vide tant que pas d'events de conv
  signupsByChannel: [string, number][]
  weddingsByChannel: [string, number][]
  // diagnostic
  countByEvent: Record<string, number>
  totalEvents: number                // events bruts (toutes pages) sur la période
  adminEventsExcluded: number
  unknownChannelPct: number
  lastAt: string
}

function vcount(sets: Record<string, Set<string>>, k: string): number {
  return sets[k]?.size ?? 0
}

export function aggregate(rawEvents: Ev[], dayKeys: string[]): Agg {
  // On garde tout pour le diagnostic, mais l'acquisition ne compte que les events "publics".
  const visitorsByEvent: Record<string, Set<string>> = {}
  const countByEvent: Record<string, number> = {}
  const publicVisitors = new Set<string>()
  const publicSessions = new Set<string>()
  const channelVisitors: Record<string, Set<string>> = {}
  const pageViews: Record<string, number> = {}
  const landingVisitors: Record<string, Set<string>> = {}
  const signupSet = new Set<string>()
  const activatedSet = new Set<string>()
  const weddingSet = new Set<string>()
  const dashFirstSet = new Set<string>()
  const signupChan: Record<string, Set<string>> = {}
  const weddingChan: Record<string, Set<string>> = {}
  const byDay: Record<string, Set<string>> = {}
  let unknownChannel = 0
  let adminExcluded = 0
  let lastAt = ''

  for (const e of rawEvents) {
    const vid = e.visitor_id || `anon:${e.session_id || Math.random()}`
    countByEvent[e.event_name] = (countByEvent[e.event_name] ?? 0) + 1
    ;(visitorsByEvent[e.event_name] ??= new Set()).add(vid)
    if (e.created_at > lastAt) lastAt = e.created_at

    const pub = isPublicPath(e.page_path)
    if (!pub && e.page_path && e.page_path.startsWith('/admin')) adminExcluded++

    // Conversions : comptées où qu'elles surviennent (événement = vérité de conversion)
    if (e.event_name === 'signup_completed') { signupSet.add(vid); if (e.channel) (signupChan[e.channel] ??= new Set()).add(vid) }
    if (e.event_name === 'feature_used') activatedSet.add(vid)
    if (e.event_name === 'wedding_created') { weddingSet.add(vid); if (e.channel) (weddingChan[e.channel] ??= new Set()).add(vid) }
    if (e.event_name === 'dashboard_first_view') dashFirstSet.add(vid)

    // Acquisition / pages : pages publiques uniquement
    if (!pub) continue
    publicVisitors.add(vid)
    if (e.session_id) publicSessions.add(e.session_id)
    const ch = e.channel || 'direct'
    ;(channelVisitors[ch] ??= new Set()).add(vid)
    if (!CHANNEL_LABELS[ch]) unknownChannel++
    if (e.page_path) pageViews[e.page_path] = (pageViews[e.page_path] ?? 0) + 1
    if (e.landing_page && isPublicPath(e.landing_page)) (landingVisitors[e.landing_page] ??= new Set()).add(vid)
    const day = e.created_at.slice(0, 10)
    ;(byDay[day] ??= new Set()).add(vid)
  }

  const channels = Object.entries(channelVisitors)
    .map(([k, s]) => ({
      key: k, label: CHANNEL_LABELS[k] ?? k, visitors: s.size,
      kind: (AI_CHANNELS.has(k) ? 'ai' : SEARCH_CHANNELS.has(k) ? 'search' : 'other') as 'ai' | 'search' | 'other',
    }))
    .sort((a, b) => b.visitors - a.visitors)

  const aiVisitors = channels.filter(c => c.kind === 'ai').reduce((s, c) => s + c.visitors, 0)
  const searchVisitors = channels.filter(c => c.kind === 'search').reduce((s, c) => s + c.visitors, 0)
  const directVisitors = channelVisitors['direct']?.size ?? 0
  const socialRefVisitors = channels.filter(c => c.kind === 'other' && c.key !== 'direct').reduce((s, c) => s + c.visitors, 0)

  const toEntriesSize = (m: Record<string, Set<string>>): [string, number][] =>
    Object.entries(m).map(([k, s]) => [k, s.size] as [string, number]).sort((a, b) => b[1] - a[1])

  const publicEventsTotal = Object.values(countByEvent).reduce((a, b) => a + b, 0)

  return {
    visitors: publicVisitors.size,
    sessions: publicSessions.size,
    aiVisitors, searchVisitors, directVisitors, socialRefVisitors,
    channels,
    landing: toEntriesSize(landingVisitors).slice(0, 8),
    topPages: Object.entries(pageViews).sort((a, b) => b[1] - a[1]).slice(0, 10),
    spark: dayKeys.map(d => byDay[d]?.size ?? 0),
    tool: {
      viewed: vcount(visitorsByEvent, 'seating_plan_viewed'),
      started: vcount(visitorsByEvent, 'seating_plan_started'),
      completed: vcount(visitorsByEvent, 'seating_plan_completed'),
      pdf: vcount(visitorsByEvent, 'seating_plan_pdf_downloaded'),
      cta: vcount(visitorsByEvent, 'seating_plan_cta_clicked'),
    },
    signups: signupSet.size,
    activated: activatedSet.size,
    weddingEvents: weddingSet.size,
    dashboardFirst: dashFirstSet.size,
    signupsByChannel: toEntriesSize(signupChan),
    weddingsByChannel: toEntriesSize(weddingChan),
    countByEvent,
    totalEvents: rawEvents.length,
    adminEventsExcluded: adminExcluded,
    unknownChannelPct: publicEventsTotal > 0 ? Math.round((unknownChannel / publicEventsTotal) * 1000) / 10 : 0,
    lastAt,
  }
}

export function dayKeysFor(days: number, endMs: number = Date.now()): string[] {
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) keys.push(new Date(endMs - i * 24 * 3600 * 1000).toISOString().slice(0, 10))
  return keys
}
