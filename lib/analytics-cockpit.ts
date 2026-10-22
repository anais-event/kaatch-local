// Agrégation serveur du cockpit analytics. Pur calcul, aucune PII.
// Règles clés :
//  - Les pages privées (/admin, /dashboard, /mariage…) sont EXCLUES de l'acquisition et du comportement
//    (un admin ou un marié dans son espace ne doit pas polluer l'analyse du site public).
//  - Les events de conversion (signup/wedding/feature) restent comptés où qu'ils aient lieu.
//  - On distingue toujours : zéro réel vs donnée indisponible vs volume insuffisant.

export type Ev = {
  event_name: string
  visitor_id: string | null
  session_id: string | null
  channel: string | null
  session_channel: string | null
  campaign: string | null
  landing_page: string | null
  page_path: string | null
  props: Record<string, unknown> | null
  created_at: string
}

export const CHANNEL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini',
  copilot: 'Copilot', you: 'You.com', google: 'Google', bing: 'Bing',
  duckduckgo: 'DuckDuckGo', ecosia: 'Ecosia', qwant: 'Qwant', yahoo: 'Yahoo',
  social: 'Réseaux sociaux', referral: 'Sites référents', paid: 'Publicité payante',
  email: 'Email', direct: 'Direct / inconnu',
}
export const AI_CHANNELS = new Set(['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'you'])
export const SEARCH_CHANNELS = new Set(['google', 'bing', 'duckduckgo', 'ecosia', 'qwant', 'yahoo'])

// Préfixes de pages privées : exclus des métriques d'acquisition / comportement.
const PRIVATE_PREFIXES = ['/admin', '/dashboard', '/mariage', '/invite', '/invité', '/vendor', '/prestataire', '/rsvp', '/api']

export function isPublicPath(path: string | null): boolean {
  if (!path) return false
  return !PRIVATE_PREFIXES.some(p => path === p || path.startsWith(p + '/'))
}

// Libellés lisibles pour les pages publiques connues (sinon on affiche le chemin).
export const PAGE_LABELS: Record<string, string> = {
  '/': "Page d'accueil",
  '/plan-de-table-mariage': 'Outil · Plan de table',
  '/budget-mariage': 'Outil · Budget',
  '/checklist-mariage': 'Outil · Checklist',
  '/discours-mariage': 'Outil · Discours',
  '/liste-invites-mariage': "Outil · Liste d'invités",
  '/programme-mariage': 'Outil · Programme',
  '/outils': 'Hub outils',
  '/fonctionnalites': 'Fonctionnalités',
  '/pricing': 'Tarifs',
  '/faq': 'FAQ',
  '/guide': 'Guide',
  '/blog': 'Blog',
  '/inspirations': 'Inspirations',
  '/kaatch-vs-excel': 'Kaatch vs Excel',
  '/entre-nous': 'Entre nous',
  '/wedding-planner': 'Wedding planner',
  '/auth': 'Connexion / inscription',
}
export function pageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path]
  // /blog/xxx, /inspirations/xxx → libellé de section
  const seg = path.split('/')[1]
  if (seg === 'blog') return 'Article de blog'
  if (seg === 'inspirations') return 'Article · Inspirations'
  return path
}

// Outils gratuits réellement présents (path = page de l'outil). `tool` = identifiant stable.
export const TOOLS: { tool: string; label: string; path: string }[] = [
  { tool: 'plan-de-table', label: 'Plan de table', path: '/plan-de-table-mariage' },
  { tool: 'budget', label: 'Budget', path: '/budget-mariage' },
  { tool: 'checklist', label: 'Checklist', path: '/checklist-mariage' },
  { tool: 'discours', label: 'Discours', path: '/discours-mariage' },
  { tool: 'liste-invites', label: "Liste d'invités", path: '/liste-invites-mariage' },
  { tool: 'programme', label: 'Programme', path: '/programme-mariage' },
]

export const EXPECTED_EVENTS = [
  'session_start', 'page_view', 'page_engagement',
  'tool_viewed', 'tool_started', 'tool_export',
  'seating_plan_viewed', 'seating_plan_started', 'guest_added',
  'table_created', 'guest_seated', 'seating_plan_completed', 'seating_plan_pdf_downloaded',
  'seating_plan_cta_clicked', 'signup_started', 'signup_completed', 'wedding_created',
  'dashboard_first_view', 'feature_used',
]

export type PageStat = {
  path: string; label: string
  pageviews: number; visitors: number
  entries: number; exits: number
  exitRate: number | null         // exits / pageviews (null si pageviews 0)
  avgEngagementMs: number | null  // moyenne des durées mesurées (null si non mesuré)
  engagementSamples: number
}

export type Agg = {
  // acquisition (visiteurs publics)
  visitors: number
  sessions: number
  newVisitors: number | null       // null si on ne peut pas trancher (pas d'historique)
  returningVisitors: number | null
  aiVisitors: number
  searchVisitors: number
  directVisitors: number
  socialRefVisitors: number
  channels: { key: string; label: string; visitors: number; sessions: number; kind: 'ai' | 'search' | 'other' }[]
  campaigns: [string, number][]    // utm_campaign → visiteurs
  spark: number[]
  // comportement (depuis page_view / page_engagement)
  pageViews: number
  pagesPerSession: number | null
  avgSessionSec: number | null     // approx (dernier - premier page_view)
  bounceRate: number | null        // sessions à 1 page / sessions avec page_view
  sessionsWithPV: number
  pages: PageStat[]                 // dynamique, toutes les pages publiques vues
  entryPages: [string, number][]
  exitPages: [string, number][]
  journeys: { from: string; to: string; count: number }[]
  // outils gratuits
  tools: { tool: string; label: string; path: string; visitors: number; started: number; exported: number }[]
  toolVisitors: number              // visiteurs uniques ayant vu au moins une page d'outil
  // plan de table (détail historique conservé)
  tool: { viewed: number; started: number; completed: number; pdf: number; cta: number }
  // conversion
  signups: number
  activated: number
  weddingEvents: number
  dashboardFirst: number
  signupsByChannel: [string, number][]
  weddingsByChannel: [string, number][]
  pagesBeforeSignup: [string, number][]  // pages vues dans une session qui a mené à une inscription
  // diagnostic
  countByEvent: Record<string, number>
  totalEvents: number
  adminEventsExcluded: number
  unknownChannelPct: number
  lastAt: string
}

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}
function toEntriesSize(m: Record<string, Set<string>>): [string, number][] {
  return Object.entries(m).map(([k, s]) => [k, s.size] as [string, number]).sort((a, b) => b[1] - a[1])
}

/**
 * @param rawEvents events de la période (déjà filtrés par date)
 * @param dayKeys   jours de la période (pour la courbe)
 * @param priorVisitorIds visiteurs vus AVANT la période (pour nouveaux vs retour) ; undefined = indéterminable
 */
export function aggregate(rawEvents: Ev[], dayKeys: string[], priorVisitorIds?: Set<string>): Agg {
  const visitorsByEvent: Record<string, Set<string>> = {}
  const countByEvent: Record<string, number> = {}
  const publicVisitors = new Set<string>()
  const publicSessions = new Set<string>()
  const channelVisitors: Record<string, Set<string>> = {}
  const channelSessions: Record<string, Set<string>> = {}
  const campaignVisitors: Record<string, Set<string>> = {}
  const signupSet = new Set<string>()
  const activatedSet = new Set<string>()
  const weddingSet = new Set<string>()
  const dashFirstSet = new Set<string>()
  const signupChan: Record<string, Set<string>> = {}
  const weddingChan: Record<string, Set<string>> = {}
  const byDay: Record<string, Set<string>> = {}
  // comportement
  const pvRows: { vid: string; sid: string; path: string; ts: string }[] = []
  const engByPath: Record<string, { sum: number; n: number }> = {}
  const toolStarted: Record<string, Set<string>> = {}
  const toolExported: Record<string, Set<string>> = {}
  const toolPaths = new Set(TOOLS.map(t => t.path))
  const toolPageVisitors = new Set<string>()
  const signupSessions = new Set<string>()
  let unknownChannel = 0, adminExcluded = 0, lastAt = ''

  for (const e of rawEvents) {
    const vid = e.visitor_id || `anon:${e.session_id || Math.random()}`
    const sid = e.session_id || vid
    countByEvent[e.event_name] = (countByEvent[e.event_name] ?? 0) + 1
    ;(visitorsByEvent[e.event_name] ??= new Set()).add(vid)
    if (e.created_at > lastAt) lastAt = e.created_at

    const pub = isPublicPath(e.page_path)
    if (!pub && e.page_path && e.page_path.startsWith('/admin')) adminExcluded++

    // Conversions : comptées partout
    if (e.event_name === 'signup_completed') { signupSet.add(vid); signupSessions.add(sid); if (e.channel) (signupChan[e.channel] ??= new Set()).add(vid) }
    if (e.event_name === 'feature_used') activatedSet.add(vid)
    if (e.event_name === 'wedding_created') { weddingSet.add(vid); if (e.channel) (weddingChan[e.channel] ??= new Set()).add(vid) }
    if (e.event_name === 'dashboard_first_view') dashFirstSet.add(vid)

    // Outils (events génériques)
    const toolId = typeof e.props?.tool === 'string' ? (e.props!.tool as string) : null
    if (toolId && e.event_name === 'tool_started') (toolStarted[toolId] ??= new Set()).add(vid)
    if (toolId && e.event_name === 'tool_export') (toolExported[toolId] ??= new Set()).add(vid)
    // Plan de table : export spécifique = aussi un export d'outil
    if (e.event_name === 'seating_plan_pdf_downloaded') (toolExported['plan-de-table'] ??= new Set()).add(vid)
    if (e.event_name === 'seating_plan_started') (toolStarted['plan-de-table'] ??= new Set()).add(vid)

    if (!pub) continue
    // ── périmètre public ──
    publicVisitors.add(vid)
    publicSessions.add(sid)
    const ch = e.channel || 'direct'
    ;(channelVisitors[ch] ??= new Set()).add(vid)
    ;(channelSessions[ch] ??= new Set()).add(sid)
    if (!CHANNEL_LABELS[ch]) unknownChannel++
    const day = e.created_at.slice(0, 10)
    ;(byDay[day] ??= new Set()).add(vid)

    if (e.event_name === 'page_view' && e.page_path) {
      pvRows.push({ vid, sid, path: e.page_path, ts: e.created_at })
      if (toolPaths.has(e.page_path)) toolPageVisitors.add(vid)
    }
    if (e.event_name === 'page_engagement' && e.page_path) {
      const d = num(e.props?.duration_ms)
      if (d != null && d > 0) { const b = engByPath[e.page_path] ??= { sum: 0, n: 0 }; b.sum += d; b.n++ }
    }
  }

  // Campagnes UTM (sur session_start publics : champ campaign)
  for (const e of rawEvents) {
    if (!isPublicPath(e.page_path)) continue
    const camp = (typeof e.campaign === 'string' ? e.campaign : '').trim()
    if (camp) (campaignVisitors[camp] ??= new Set()).add(e.visitor_id || e.session_id || '')
  }

  // ── Comportement : sessions de pages ──
  const sessPages: Record<string, { path: string; ts: string }[]> = {}
  for (const r of pvRows) (sessPages[r.sid] ??= []).push({ path: r.path, ts: r.ts })
  for (const sid in sessPages) sessPages[sid].sort((a, b) => a.ts.localeCompare(b.ts))

  const pageAgg: Record<string, { pv: number; vis: Set<string>; entries: number; exits: number }> = {}
  const entryPages: Record<string, number> = {}
  const exitPages: Record<string, number> = {}
  const journeyMap: Record<string, number> = {}
  const pagesBeforeSignup: Record<string, number> = {}
  let sessionDurSum = 0, sessionDurN = 0, bounce = 0

  for (const r of pvRows) {
    const a = pageAgg[r.path] ??= { pv: 0, vis: new Set(), entries: 0, exits: 0 }
    a.pv++; a.vis.add(r.vid)
  }
  for (const sid in sessPages) {
    const list = sessPages[sid]
    if (list.length === 0) continue
    const first = list[0].path, last = list[list.length - 1].path
    entryPages[first] = (entryPages[first] ?? 0) + 1
    exitPages[last] = (exitPages[last] ?? 0) + 1
    pageAgg[first] && pageAgg[first].entries++
    pageAgg[last] && pageAgg[last].exits++
    if (list.length === 1) bounce++
    // durée session approx (dernier - premier page_view)
    const dur = new Date(list[list.length - 1].ts).getTime() - new Date(list[0].ts).getTime()
    if (list.length > 1) { sessionDurSum += dur; sessionDurN++ }
    // parcours
    for (let i = 1; i < list.length; i++) {
      const key = list[i - 1].path + ' → ' + list[i].path
      journeyMap[key] = (journeyMap[key] ?? 0) + 1
    }
    // pages vues dans une session qui a mené à une inscription
    if (signupSessions.has(sid)) {
      const seen = new Set(list.map(x => x.path))
      for (const p of seen) if (p !== '/auth') pagesBeforeSignup[p] = (pagesBeforeSignup[p] ?? 0) + 1
    }
  }

  const pages: PageStat[] = Object.entries(pageAgg).map(([path, a]) => ({
    path, label: pageLabel(path),
    pageviews: a.pv, visitors: a.vis.size,
    entries: a.entries, exits: a.exits,
    exitRate: a.pv > 0 ? Math.round((a.exits / a.pv) * 1000) / 10 : null,
    avgEngagementMs: engByPath[path]?.n ? Math.round(engByPath[path].sum / engByPath[path].n) : null,
    engagementSamples: engByPath[path]?.n ?? 0,
  })).sort((x, y) => y.pageviews - x.pageviews)

  const channels = Object.entries(channelVisitors)
    .map(([k, s]) => ({
      key: k, label: CHANNEL_LABELS[k] ?? k, visitors: s.size, sessions: channelSessions[k]?.size ?? 0,
      kind: (AI_CHANNELS.has(k) ? 'ai' : SEARCH_CHANNELS.has(k) ? 'search' : 'other') as 'ai' | 'search' | 'other',
    }))
    .sort((a, b) => b.visitors - a.visitors)

  const aiVisitors = channels.filter(c => c.kind === 'ai').reduce((s, c) => s + c.visitors, 0)
  const searchVisitors = channels.filter(c => c.kind === 'search').reduce((s, c) => s + c.visitors, 0)
  const directVisitors = channelVisitors['direct']?.size ?? 0
  const socialRefVisitors = channels.filter(c => c.kind === 'other' && c.key !== 'direct').reduce((s, c) => s + c.visitors, 0)

  // nouveaux vs retour
  let newVisitors: number | null = null, returningVisitors: number | null = null
  if (priorVisitorIds) {
    let ret = 0
    for (const v of publicVisitors) if (priorVisitorIds.has(v)) ret++
    returningVisitors = ret
    newVisitors = publicVisitors.size - ret
  }

  const sessionsWithPV = Object.keys(sessPages).length
  const totalPV = pvRows.length

  const tools = TOOLS.map(t => ({
    tool: t.tool, label: t.label, path: t.path,
    visitors: pageAgg[t.path]?.vis.size ?? 0,
    started: toolStarted[t.tool]?.size ?? 0,
    exported: toolExported[t.tool]?.size ?? 0,
  })).sort((a, b) => b.visitors - a.visitors)

  const vcount = (k: string) => visitorsByEvent[k]?.size ?? 0
  const publicEventsTotal = rawEvents.filter(e => isPublicPath(e.page_path)).length

  return {
    visitors: publicVisitors.size,
    sessions: publicSessions.size,
    newVisitors, returningVisitors,
    aiVisitors, searchVisitors, directVisitors, socialRefVisitors,
    channels,
    campaigns: toEntriesSize(campaignVisitors).slice(0, 10),
    spark: dayKeys.map(d => byDay[d]?.size ?? 0),
    pageViews: totalPV,
    pagesPerSession: sessionsWithPV > 0 ? Math.round((totalPV / sessionsWithPV) * 10) / 10 : null,
    avgSessionSec: sessionDurN > 0 ? Math.round(sessionDurSum / sessionDurN / 1000) : null,
    bounceRate: sessionsWithPV > 0 ? Math.round((bounce / sessionsWithPV) * 1000) / 10 : null,
    sessionsWithPV,
    pages,
    entryPages: Object.entries(entryPages).sort((a, b) => b[1] - a[1]).slice(0, 10),
    exitPages: Object.entries(exitPages).sort((a, b) => b[1] - a[1]).slice(0, 10),
    journeys: Object.entries(journeyMap).map(([k, count]) => { const [from, to] = k.split(' → '); return { from, to, count } }).sort((a, b) => b.count - a.count).slice(0, 12),
    tools,
    toolVisitors: toolPageVisitors.size,
    tool: {
      viewed: vcount('seating_plan_viewed'), started: vcount('seating_plan_started'),
      completed: vcount('seating_plan_completed'), pdf: vcount('seating_plan_pdf_downloaded'), cta: vcount('seating_plan_cta_clicked'),
    },
    signups: signupSet.size,
    activated: activatedSet.size,
    weddingEvents: weddingSet.size,
    dashboardFirst: dashFirstSet.size,
    signupsByChannel: toEntriesSize(signupChan),
    weddingsByChannel: toEntriesSize(weddingChan),
    pagesBeforeSignup: Object.entries(pagesBeforeSignup).sort((a, b) => b[1] - a[1]).slice(0, 8),
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

export function fmtDuration(sec: number | null): string {
  if (sec == null) return 'n/d'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60), s = sec % 60
  return `${m}min ${s.toString().padStart(2, '0')}s`
}
