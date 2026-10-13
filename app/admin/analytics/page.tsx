import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'anais@kaatch.fr'

const LATO = 'var(--font-lato)'
const DISPLAY = 'var(--font-display)'
const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'

type Ev = {
  event_name: string
  visitor_id: string | null
  session_id: string | null
  channel: string | null
  session_channel: string | null
  landing_page: string | null
  page_path: string | null
  created_at: string
}

const PERIODS = [7, 28, 90] as const
type Period = (typeof PERIODS)[number]

// Libellés canaux
const CHANNEL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini',
  copilot: 'Copilot', you: 'You.com', google: 'Google', bing: 'Bing',
  duckduckgo: 'DuckDuckGo', ecosia: 'Ecosia', qwant: 'Qwant', yahoo: 'Yahoo',
  social: 'Réseaux sociaux', referral: 'Sites référents', paid: 'Payant',
  email: 'Email', direct: 'Direct',
}
const AI_CHANNELS = new Set(['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'you'])

// Étapes du funnel (distinct visiteurs atteignant l'étape — jamais compté deux fois)
const FUNNEL: { key: string; label: string }[] = [
  { key: 'seating_plan_viewed', label: 'Visite plan de table' },
  { key: 'seating_plan_started', label: 'Outil démarré' },
  { key: 'seating_plan_completed', label: 'Plan complété' },
  { key: 'seating_plan_pdf_downloaded', label: 'PDF téléchargé' },
  { key: 'seating_plan_cta_clicked', label: 'CTA cliqué' },
  { key: 'signup_completed', label: 'Inscription' },
  { key: 'wedding_created', label: 'Espace mariage créé' },
  { key: 'feature_used', label: 'Activation (1re action)' },
]

const EXPECTED_EVENTS = [
  'session_start', 'seating_plan_viewed', 'seating_plan_started', 'guest_added',
  'table_created', 'guest_seated', 'seating_plan_completed', 'seating_plan_pdf_downloaded',
  'seating_plan_cta_clicked', 'signup_started', 'signup_completed', 'wedding_created',
  'dashboard_first_view', 'feature_used',
]

function fmtPct(num: number, den: number): string {
  if (den <= 0) return '—'
  return Math.round((num / den) * 1000) / 10 + ' %'
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

// Sparkline SVG pur (évolution quotidienne des visiteurs)
function Spark({ data }: { data: number[] }) {
  const w = 680, h = 90, pad = 4
  const max = Math.max(1, ...data)
  const n = data.length
  const pts = data.map((v, i) => {
    const x = pad + (n <= 1 ? 0 : (i / (n - 1)) * (w - pad * 2))
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const area = `${pad},${h - pad} ${pts.join(' ')} ${w - pad},${h - pad}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 90 }} preserveAspectRatio="none">
      <polygon points={area} fill={`${SAGE}18`} />
      <polyline points={pts.join(' ')} fill="none" stroke={SAGE} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  )
}

export default async function AnalyticsCockpit({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>
}) {
  // ── Garde admin (jamais « sécurisé » juste parce que l'URL est difficile à deviner) ──
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) redirect('/auth')

  const sp = await searchParams
  const days: Period = (PERIODS as readonly number[]).includes(Number(sp.d)) ? (Number(sp.d) as Period) : 28
  const since = new Date(Date.now() - days * 24 * 3600 * 1000)
  const sinceISO = since.toISOString()

  // ── Lecture via service_role (contourne la RLS ; la table n'a aucune policy publique) ──
  let events: Ev[] = []
  let serviceOk = true
  let weddingsTotal: number | null = null
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('analytics_events')
      .select('event_name, visitor_id, session_id, channel, session_channel, landing_page, page_path, created_at')
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: true })
      .limit(100000)
    events = (data ?? []) as Ev[]
    // Cross-check indépendant : nb réel de mariages créés (table de vérité)
    const { count } = await svc.from('weddings').select('id', { count: 'exact', head: true }).gte('created_at', sinceISO)
    weddingsTotal = count ?? null
  } catch {
    serviceOk = false
  }

  // ── Agrégations (distinct visitor_id, pas de double comptage) ──
  const visitorsByEvent: Record<string, Set<string>> = {}
  const countByEvent: Record<string, number> = {}
  const allVisitors = new Set<string>()
  const allSessions = new Set<string>()
  const channelVisitors: Record<string, Set<string>> = {}
  const pageViews: Record<string, number> = {}
  const landingVisitors: Record<string, Set<string>> = {}
  const signupVisitors = new Set<string>()
  const signupLanding: Record<string, number> = {}
  const weddingVisitors = new Set<string>()
  const weddingLanding: Record<string, number> = {}
  const byDay: Record<string, Set<string>> = {}
  let unknownChannel = 0
  let lastAt = ''

  for (const e of events) {
    const vid = e.visitor_id || `anon:${e.session_id || Math.random()}`
    countByEvent[e.event_name] = (countByEvent[e.event_name] ?? 0) + 1
    ;(visitorsByEvent[e.event_name] ??= new Set()).add(vid)
    allVisitors.add(vid)
    if (e.session_id) allSessions.add(e.session_id)
    const ch = e.channel || 'direct'
    ;(channelVisitors[ch] ??= new Set()).add(vid)
    if (!CHANNEL_LABELS[ch]) unknownChannel++
    if (e.page_path) pageViews[e.page_path] = (pageViews[e.page_path] ?? 0) + 1
    if (e.landing_page) (landingVisitors[e.landing_page] ??= new Set()).add(vid)
    if (e.event_name === 'signup_completed') { signupVisitors.add(vid); if (e.landing_page) signupLanding[e.landing_page] = (signupLanding[e.landing_page] ?? 0) + 1 }
    if (e.event_name === 'wedding_created') { weddingVisitors.add(vid); if (e.landing_page) weddingLanding[e.landing_page] = (weddingLanding[e.landing_page] ?? 0) + 1 }
    const day = e.created_at.slice(0, 10)
    ;(byDay[day] ??= new Set()).add(vid)
    if (e.created_at > lastAt) lastAt = e.created_at
  }

  const vCount = (k: string) => visitorsByEvent[k]?.size ?? 0

  // KPIs
  const visitors = allVisitors.size
  const sessions = allSessions.size
  const signups = signupVisitors.size
  const weddings = weddingVisitors.size
  const activated = vCount('feature_used')
  const pdfs = countByEvent['seating_plan_pdf_downloaded'] ?? 0
  const seatingViewers = vCount('seating_plan_viewed')

  // Série quotidienne visiteurs
  const dayKeys: string[] = []
  for (let i = days - 1; i >= 0; i--) dayKeys.push(new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().slice(0, 10))
  const spark = dayKeys.map(d => byDay[d]?.size ?? 0)

  // Canaux triés
  const channels = Object.entries(channelVisitors)
    .map(([k, s]) => ({ key: k, label: CHANNEL_LABELS[k] ?? k, visitors: s.size, ai: AI_CHANNELS.has(k) }))
    .sort((a, b) => b.visitors - a.visitors)
  const maxChannel = Math.max(1, ...channels.map(c => c.visitors))
  const aiVisitors = channels.filter(c => c.ai).reduce((s, c) => s + c.visitors, 0)

  // Funnel
  const funnelRows = FUNNEL.map(f => ({ ...f, v: vCount(f.key) }))
  const funnelTop = funnelRows[0].v

  // Pages
  const topPages = Object.entries(pageViews).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const maxPage = Math.max(1, ...topPages.map(p => p[1]))
  const topLanding = Object.entries(landingVisitors).map(([k, s]) => [k, s.size] as [string, number]).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxLanding = Math.max(1, ...topLanding.map(p => p[1]))
  const signupPages = Object.entries(signupLanding).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // Qualité des données
  const missingEvents = EXPECTED_EVENTS.filter(e => !(e in countByEvent))
  const totalEvents = events.length
  const lastCollect = lastAt ? new Date(lastAt).toLocaleString('fr-FR') : '—'
  const noData = totalEvents === 0

  const periodLabel = (d: number) => d === 7 ? '7 jours' : d === 28 ? '28 jours' : '90 jours'

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>
      {/* Header */}
      <div className="bg-[#2d3228] px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontWeight: 500 }}>Kaatch Analytics</p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.6rem' }} className="text-white">Cockpit acquisition & conversion</h1>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(d => (
            <a key={d} href={`/admin/analytics?d=${d}`}
               className={`text-xs px-3 py-1.5 rounded-lg transition ${days === d ? 'bg-white text-[#2d3228]' : 'text-white/60 border border-white/20 hover:text-white'}`}
               style={{ fontWeight: 400 }}>
              {periodLabel(d)}
            </a>
          ))}
          <a href="/admin" className="text-white/50 text-xs hover:text-white transition ml-2" style={{ fontWeight: 300 }}>← Admin</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {!serviceOk && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
            Clé <code>SUPABASE_SERVICE_ROLE_KEY</code> indisponible côté serveur : les données ne peuvent pas être lues. Aucune donnée affichée n'est fiable tant que ce n'est pas résolu.
          </div>
        )}
        {serviceOk && noData && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 text-sm text-stone-500">
            Aucun événement collecté sur <strong>{periodLabel(days)}</strong>. Les compteurs ci-dessous sont donc à zéro — ce ne sont pas des données fictives, simplement l'absence réelle de collecte (tracking déployé récemment ou pas encore de trafic sur la période).
          </div>
        )}

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Visiteurs', value: visitors, sub: `${sessions} sessions` },
            { label: 'Dont IA', value: aiVisitors, sub: 'ChatGPT, Perplexity…' },
            { label: 'Inscriptions', value: signups, sub: fmtPct(signups, visitors) + ' des visiteurs' },
            { label: 'Espaces créés', value: weddings, sub: weddingsTotal != null ? `${weddingsTotal} réels en BDD` : '' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
              <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '2rem', lineHeight: 1, color: SAGE_DARK }}>{k.value}</p>
              <p className="text-stone-500 text-xs mt-1 uppercase tracking-wide" style={{ fontWeight: 500 }}>{k.label}</p>
              {k.sub && <p className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{k.sub}</p>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Activés', value: activated, sub: fmtPct(activated, signups) + ' des inscrits' },
            { label: 'Plans PDF', value: pdfs, sub: 'téléchargements' },
            { label: 'Plan de table', value: seatingViewers, sub: 'visiteurs outil' },
            { label: 'Visiteur → inscrit', value: fmtPct(signups, visitors), sub: 'taux global', isText: true },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
              <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: k.isText ? '1.5rem' : '2rem', lineHeight: 1.2, color: SAGE }}>{k.value}</p>
              <p className="text-stone-500 text-xs mt-1 uppercase tracking-wide" style={{ fontWeight: 500 }}>{k.label}</p>
              {k.sub && <p className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{k.sub}</p>}
            </div>
          ))}
        </div>

        {/* Évolution */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-3" style={{ fontWeight: 600 }}>Visiteurs par jour · {periodLabel(days)}</p>
          <Spark data={spark} />
          <div className="flex justify-between text-xs text-stone-400 mt-1" style={{ fontWeight: 300 }}>
            <span>{dayKeys[0]?.slice(5)}</span>
            <span>{dayKeys[dayKeys.length - 1]?.slice(5)}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Acquisition */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Acquisition par canal</p>
            {channels.length === 0 ? (
              <p className="text-stone-400 text-sm">Aucune donnée de canal.</p>
            ) : channels.map(c => (
              <div key={c.key} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600 flex items-center gap-1.5" style={{ fontWeight: 300 }}>
                    {c.ai && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4a5240]/10 text-[#4a5240]" style={{ fontWeight: 500 }}>IA</span>}
                    {c.label}
                  </span>
                  <span className="text-stone-400" style={{ fontWeight: 400 }}>{c.visitors} · {fmtPct(c.visitors, visitors)}</span>
                </div>
                <Bar value={c.visitors} max={maxChannel} color={c.ai ? SAGE : '#9ca888'} />
              </div>
            ))}
          </div>

          {/* Funnel */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Funnel (visiteurs uniques)</p>
            {funnelRows.map((f, i) => {
              const prev = i === 0 ? f.v : funnelRows[i - 1].v
              const drop = prev > 0 ? Math.round(((prev - f.v) / prev) * 100) : 0
              return (
                <div key={f.key} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600" style={{ fontWeight: 300 }}>{f.label}</span>
                    <span className="text-stone-500" style={{ fontWeight: 400 }}>
                      {f.v}
                      {i > 0 && prev > 0 && <span className={`ml-2 text-xs ${drop > 50 ? 'text-red-400' : 'text-stone-300'}`}>−{drop}%</span>}
                    </span>
                  </div>
                  <Bar value={f.v} max={Math.max(1, funnelTop)} color={SAGE_DARK} />
                </div>
              )
            })}
            <p className="text-xs text-stone-400 mt-3" style={{ fontWeight: 300 }}>
              Chaque étape = visiteurs uniques l'ayant atteinte. Les baisses &gt; 50 % signalent les principales pertes.
            </p>
          </div>
        </div>

        {/* Pages */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Pages les plus vues (events)</p>
            {topPages.length === 0 ? <p className="text-stone-400 text-sm">—</p> : topPages.map(([p, c]) => (
              <div key={p} className="mb-2.5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600 truncate mr-2" style={{ fontWeight: 300 }}>{p}</span>
                  <span className="text-stone-400" style={{ fontWeight: 400 }}>{c}</span>
                </div>
                <Bar value={c} max={maxPage} color="#9ca888" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Pages d'entrée (landing)</p>
            {topLanding.length === 0 ? <p className="text-stone-400 text-sm">—</p> : topLanding.map(([p, c]) => (
              <div key={p} className="mb-2.5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600 truncate mr-2" style={{ fontWeight: 300 }}>{p}</span>
                  <span className="text-stone-400" style={{ fontWeight: 400 }}>{c}</span>
                </div>
                <Bar value={c} max={maxLanding} color="#9ca888" />
              </div>
            ))}
            {signupPages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-stone-400 text-xs mb-2" style={{ fontWeight: 400 }}>Landing → inscription</p>
                {signupPages.map(([p, c]) => (
                  <div key={p} className="flex justify-between text-xs text-stone-500 mb-1" style={{ fontWeight: 300 }}>
                    <span className="truncate mr-2">{p}</span><span>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Qualité des données */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-10">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Qualité des données</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Dernière collecte</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{lastCollect}</p></div>
            <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Événements reçus</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{totalEvents}</p></div>
            <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Canal inconnu</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{fmtPct(unknownChannel, totalEvents)}</p></div>
            <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Types d'events</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{Object.keys(countByEvent).length} / {EXPECTED_EVENTS.length}</p></div>
          </div>
          {missingEvents.length > 0 && (
            <div className="bg-stone-50 rounded-xl p-3 mb-3">
              <p className="text-xs text-stone-500 mb-1" style={{ fontWeight: 500 }}>Événements attendus mais jamais reçus sur la période :</p>
              <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{missingEvents.join(', ')}</p>
            </div>
          )}
          <details className="text-xs text-stone-500">
            <summary className="cursor-pointer" style={{ fontWeight: 500 }}>Détail par événement</summary>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
              {EXPECTED_EVENTS.map(e => (
                <div key={e} className="flex justify-between">
                  <span style={{ fontWeight: 300 }}>{e}</span>
                  <span className={countByEvent[e] ? 'text-stone-600' : 'text-stone-300'}>{countByEvent[e] ?? 0}</span>
                </div>
              ))}
            </div>
          </details>
          <p className="text-xs text-stone-400 mt-4" style={{ fontWeight: 300 }}>
            Données first-party anonymes (aucun nom, email, téléphone, token ni contenu de mariage). GA4 conserve en parallèle les rapports d'acquisition détaillés.
          </p>
        </div>

      </div>
    </main>
  )
}
