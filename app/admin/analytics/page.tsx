import { createServiceClient } from '@/lib/supabase-service'
import { aggregate, dayKeysFor, EXPECTED_EVENTS, CHANNEL_LABELS, type Ev, type Agg } from '@/lib/analytics-cockpit'
import { requireAdmin } from '@/lib/admin'

const LATO = 'var(--font-lato)'
const DISPLAY = 'var(--font-display)'
const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'
const MUTED = '#9ca888'

const PERIODS = [7, 28, 90] as const
type Period = (typeof PERIODS)[number]
const MIN_COMPARE = 5 // seuil minimal de visiteurs pour afficher une comparaison honnête

function periodLabel(d: number) { return d === 7 ? '7 jours' : d === 28 ? '28 jours' : '90 jours' }

// Taux sûr : distingue n/d (dénominateur 0) d'un vrai 0.
function rate(num: number, den: number): { text: string; na: boolean } {
  if (den <= 0) return { text: 'n/d', na: true }
  return { text: Math.round((num / den) * 1000) / 10 + ' %', na: false }
}

// ── Composants d'affichage (SVG/CSS purs, pas de dépendance) ──

function Delta({ cur, prev, enough, goodUp = true }: { cur: number; prev: number; enough: boolean; goodUp?: boolean }) {
  if (!enough) {
    return <span className="text-stone-300 text-xs" style={{ fontWeight: 300 }} title="Pas assez de données pour comparer">·</span>
  }
  if (prev === 0) return <span className="text-stone-300 text-xs">—</span>
  const pct = Math.round(((cur - prev) / prev) * 100)
  if (pct === 0) return <span className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>→ 0 %</span>
  const up = pct > 0
  const good = up === goodUp
  const color = good ? '#4a7c4a' : '#b45454'
  return (
    <span className="text-xs" style={{ fontWeight: 500, color }}>
      {up ? '▲' : '▼'} {Math.abs(pct)} %
    </span>
  )
}

function Kpi({ label, value, hint, delta, accent }: {
  label: string; value: React.ReactNode; hint?: string; delta?: React.ReactNode; accent?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '2rem', lineHeight: 1, color: accent ? SAGE : SAGE_DARK }}>{value}</p>
        {delta}
      </div>
      <p className="text-stone-500 text-xs mt-2 uppercase tracking-wide" style={{ fontWeight: 500 }}>{label}</p>
      {hint && <p className="text-stone-400 text-xs mt-0.5 leading-snug" style={{ fontWeight: 300 }}>{hint}</p>}
    </div>
  )
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} />
    </div>
  )
}

function Spark({ data, labels }: { data: number[]; labels: string[] }) {
  const sum = data.reduce((a, b) => a + b, 0)
  if (sum === 0) {
    return (
      <div className="h-[90px] flex items-center justify-center rounded-xl bg-stone-50">
        <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Pas encore de visiteurs sur la période</p>
      </div>
    )
  }
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
    <>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 90 }} preserveAspectRatio="none">
        <polygon points={area} fill={`${SAGE}18`} />
        <polyline points={pts.join(' ')} fill="none" stroke={SAGE} strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between text-xs text-stone-400 mt-1" style={{ fontWeight: 300 }}>
        <span>{labels[0]?.slice(5)}</span><span>{labels[labels.length - 1]?.slice(5)}</span>
      </div>
    </>
  )
}

function FunnelRow({ label, value, prevValue, max, isFirst }: {
  label: string; value: number; prevValue: number; max: number; isFirst?: boolean
}) {
  const passage = isFirst ? null : rate(value, prevValue)
  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline text-sm mb-1">
        <span className="text-stone-600" style={{ fontWeight: 300 }}>{label}</span>
        <span className="text-stone-600" style={{ fontWeight: 500 }}>
          {value}
          {passage && !passage.na && (
            <span className={`ml-2 text-xs ${prevValue > 0 && value / prevValue < 0.5 ? 'text-[#b45454]' : 'text-stone-400'}`} style={{ fontWeight: 400 }}>
              {passage.text}
            </span>
          )}
        </span>
      </div>
      <Bar value={value} max={Math.max(1, max)} color={SAGE_DARK} />
    </div>
  )
}

function ListBars({ rows, max, color, labelMap }: {
  rows: [string, number][]; max: number; color: string; labelMap?: (k: string) => string
}) {
  if (rows.length === 0) return <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Aucune donnée sur la période.</p>
  return (
    <>
      {rows.map(([k, v]) => (
        <div key={k} className="mb-2.5">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-stone-600 truncate mr-2" style={{ fontWeight: 300 }}>{labelMap ? labelMap(k) : k}</span>
            <span className="text-stone-400" style={{ fontWeight: 400 }}>{v}</span>
          </div>
          <Bar value={v} max={max} color={color} />
        </div>
      ))}
    </>
  )
}

function SectionTitle({ letter, title, subtitle }: { letter: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 mt-10 first:mt-0">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#4a5240]/10 text-[#4a5240] flex items-center justify-center text-xs" style={{ fontWeight: 600 }}>{letter}</span>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.25rem', color: SAGE_DARK }}>{title}</h2>
      </div>
      {subtitle && <p className="text-stone-400 text-xs mt-1 ml-8.5" style={{ fontWeight: 300, marginLeft: '2.1rem' }}>{subtitle}</p>}
    </div>
  )
}

export default async function AnalyticsCockpit({
  searchParams,
}: { searchParams: Promise<{ d?: string }> }) {
  // Garde admin : rôle vérifié côté serveur (table admins), jamais une URL obscure ni un email en dur.
  await requireAdmin()

  const sp = await searchParams
  const days: Period = (PERIODS as readonly number[]).includes(Number(sp.d)) ? (Number(sp.d) as Period) : 28
  const now = Date.now()
  const since = new Date(now - days * 24 * 3600 * 1000)
  const prevStart = new Date(now - days * 2 * 24 * 3600 * 1000)

  let serviceOk = true
  let events: Ev[] = []
  let weddingsAll: number | null = null
  let weddingsCur = 0
  let weddingsPrev = 0
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('analytics_events')
      .select('event_name, visitor_id, session_id, channel, session_channel, landing_page, page_path, created_at')
      .gte('created_at', prevStart.toISOString())
      .order('created_at', { ascending: true })
      .limit(100000)
    events = (data ?? []) as Ev[]
    const [all, cur, prev] = await Promise.all([
      svc.from('weddings').select('id', { count: 'exact', head: true }),
      svc.from('weddings').select('id', { count: 'exact', head: true }).gte('created_at', since.toISOString()),
      svc.from('weddings').select('id', { count: 'exact', head: true }).gte('created_at', prevStart.toISOString()).lt('created_at', since.toISOString()),
    ])
    weddingsAll = all.count ?? null
    weddingsCur = cur.count ?? 0
    weddingsPrev = prev.count ?? 0
  } catch {
    serviceOk = false
  }

  const curEvents = events.filter(e => e.created_at >= since.toISOString())
  const prevEvents = events.filter(e => e.created_at < since.toISOString())
  const agg: Agg = aggregate(curEvents, dayKeysFor(days, now))
  const prevAgg: Agg = aggregate(prevEvents, dayKeysFor(days, since.getTime()))

  const enoughCompare = agg.visitors >= MIN_COMPARE && prevAgg.visitors >= MIN_COMPARE
  const enoughWeddings = weddingsPrev >= MIN_COMPARE
  const dayKeys = dayKeysFor(days, now)
  const noPublicData = agg.visitors === 0
  const firstCollect = agg.lastAt || prevAgg.lastAt

  // Étape prioritaire : plus grosse perte relative sur des étapes à source homogène (events).
  const steps = [
    { label: 'les visiteurs', v: agg.visitors },
    { label: "l'ouverture du plan de table", v: agg.tool.viewed },
    { label: 'le démarrage de l’outil', v: agg.tool.started },
    { label: 'la complétion du plan', v: agg.tool.completed },
    { label: 'le téléchargement PDF', v: agg.tool.pdf },
    { label: "l'inscription", v: agg.signups },
    { label: "l'activation", v: agg.activated },
  ]
  let priority = ''
  let priorityDrop = -1
  for (let i = 1; i < steps.length; i++) {
    if (steps[i - 1].v <= 0) continue
    const drop = (steps[i - 1].v - steps[i].v) / steps[i - 1].v
    if (drop > priorityDrop && drop > 0) { priorityDrop = drop; priority = steps[i].label }
  }

  // Top source lisible
  const topSource = agg.channels[0]
  const vToSignup = rate(agg.signups, agg.visitors)

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>
      {/* Header */}
      <div className="bg-[#2d3228] px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontWeight: 500 }}>Kaatch Analytics</p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.6rem' }} className="text-white">Pilotage acquisition & produit</h1>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(d => (
            <a key={d} href={`/admin/analytics?d=${d}`}
               className={`text-xs px-3 py-1.5 rounded-lg transition ${days === d ? 'bg-white text-[#2d3228]' : 'text-white/60 border border-white/20 hover:text-white'}`}
               style={{ fontWeight: 400 }}>{periodLabel(d)}</a>
          ))}
          <a href="/admin" className="text-white/50 text-xs hover:text-white transition ml-2" style={{ fontWeight: 300 }}>← Admin</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {!serviceOk && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
            Clé <code>SUPABASE_SERVICE_ROLE_KEY</code> indisponible : aucune donnée ne peut être lue.
          </div>
        )}

        {/* ── EN BREF (lecture < 30 s) ── */}
        <div className="bg-[#2d3228] rounded-2xl p-6 mb-8 text-white">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-4" style={{ fontWeight: 500 }}>En bref · {periodLabel(days)}</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm" style={{ fontWeight: 300 }}>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">1.</span>
              {noPublicData
                ? <span className="text-white/70">Collecte tout juste active — pas encore de visiteurs mesurés sur la période.</span>
                : <span><strong className="text-white" style={{ fontWeight: 500 }}>{agg.visitors} visiteurs</strong> uniques{enoughCompare ? <> ({prevAgg.visitors} période précédente)</> : ''}.</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">2.</span>
              {topSource
                ? <span>Principale source : <strong className="text-white" style={{ fontWeight: 500 }}>{topSource.label}</strong> ({topSource.visitors}). IA : {agg.aiVisitors} · Recherche : {agg.searchVisitors}.</span>
                : <span className="text-white/70">Sources inconnues (pas de trafic public).</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">3.</span>
              {agg.tool.viewed > 0
                ? <span>Plan de table : <strong className="text-white" style={{ fontWeight: 500 }}>{agg.tool.viewed}</strong> l’ouvrent, {agg.tool.completed} complètent, {agg.tool.pdf} exportent.</span>
                : <span className="text-white/70">Plan de table : aucune ouverture mesurée sur la période.</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">4.</span>
              <span><strong className="text-white" style={{ fontWeight: 500 }}>{agg.signups}</strong> inscriptions · <strong className="text-white" style={{ fontWeight: 500 }}>{weddingsCur}</strong> espaces créés{vToSignup.na ? '' : <> · {vToSignup.text} des visiteurs s’inscrivent</>}.</span>
            </p>
            <p className="flex gap-2 sm:col-span-2 pt-2 border-t border-white/10"><span className="text-white/40 shrink-0">5.</span>
              {priority
                ? <span>À surveiller en priorité : la plus grosse perte se situe à <strong className="text-white" style={{ fontWeight: 500 }}>{priority}</strong>.</span>
                : <span className="text-white/70">Pas encore assez de données pour identifier l’étape à travailler — la collecte vient de démarrer.</span>}
            </p>
          </div>
        </div>

        {/* ── A. ACQUISITION ── */}
        <SectionTitle letter="A" title="Acquisition" subtitle="Visiteurs du site public (pages admin / espaces privés exclus)." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <Kpi label="Visiteurs uniques" value={agg.visitors} hint={`${agg.sessions} sessions`} delta={<Delta cur={agg.visitors} prev={prevAgg.visitors} enough={enoughCompare} />} />
          <Kpi label="Via assistants IA" value={agg.aiVisitors} hint="ChatGPT, Perplexity, Claude…" delta={<Delta cur={agg.aiVisitors} prev={prevAgg.aiVisitors} enough={enoughCompare} />} accent />
          <Kpi label="Via moteurs de recherche" value={agg.searchVisitors} hint="Google, Bing…" delta={<Delta cur={agg.searchVisitors} prev={prevAgg.searchVisitors} enough={enoughCompare} />} accent />
          <Kpi label="Direct / autres" value={agg.directVisitors + agg.socialRefVisitors} hint={`${agg.directVisitors} direct · ${agg.socialRefVisitors} social/référents`} />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-2">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-3" style={{ fontWeight: 600 }}>Visiteurs par jour</p>
            <Spark data={agg.spark} labels={dayKeys} />
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Pages de destination (landing)</p>
            <ListBars rows={agg.landing} max={Math.max(1, ...agg.landing.map(l => l[1]))} color={MUTED} />
          </div>
        </div>

        {/* ── B. PLAN DE TABLE ── */}
        <SectionTitle letter="B" title="Utilisation du plan de table" subtitle="Outil gratuit, sans compte. Taux = passage depuis l'étape précédente." />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4 content-start">
            <Kpi label="Visiteurs de l'outil" value={agg.tool.viewed} delta={<Delta cur={agg.tool.viewed} prev={prevAgg.tool.viewed} enough={enoughCompare} />} />
            <Kpi label="Ont commencé" value={agg.tool.started} hint={rate(agg.tool.started, agg.tool.viewed).na ? 'n/d' : rate(agg.tool.started, agg.tool.viewed).text + ' des visiteurs outil'} />
            <Kpi label="Plans complétés" value={agg.tool.completed} hint={rate(agg.tool.completed, agg.tool.started).na ? 'n/d' : rate(agg.tool.completed, agg.tool.started).text + ' des démarrages'} />
            <Kpi label="Téléchargements PDF" value={agg.tool.pdf} accent />
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Entonnoir de l'outil</p>
            {agg.tool.viewed === 0 ? (
              <p className="text-stone-400 text-sm py-6 text-center" style={{ fontWeight: 300 }}>Aucune utilisation de l'outil mesurée sur la période.</p>
            ) : (
              <>
                <FunnelRow label="Outil ouvert" value={agg.tool.viewed} prevValue={agg.tool.viewed} max={agg.tool.viewed} isFirst />
                <FunnelRow label="Démarré" value={agg.tool.started} prevValue={agg.tool.viewed} max={agg.tool.viewed} />
                <FunnelRow label="Plan complété" value={agg.tool.completed} prevValue={agg.tool.started} max={agg.tool.viewed} />
                <FunnelRow label="PDF téléchargé" value={agg.tool.pdf} prevValue={agg.tool.completed} max={agg.tool.viewed} />
                <FunnelRow label="Clic vers Kaatch" value={agg.tool.cta} prevValue={agg.tool.viewed} max={agg.tool.viewed} />
              </>
            )}
          </div>
        </div>

        {/* ── C. CONVERSION PRODUIT ── */}
        <SectionTitle letter="C" title="Conversion produit" subtitle="Inscriptions & espaces mariage. Les events datent du déploiement du suivi ; les espaces viennent de la base (historique fiable)." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="Inscriptions" value={agg.signups} hint="depuis le suivi" delta={<Delta cur={agg.signups} prev={prevAgg.signups} enough={enoughCompare} />} />
          <Kpi label="Espaces créés (période)" value={weddingsCur} hint={weddingsAll != null ? `${weddingsAll} au total (historique)` : ''} delta={<Delta cur={weddingsCur} prev={weddingsPrev} enough={enoughWeddings} />} accent />
          <Kpi label="Utilisateurs activés" value={agg.activated} hint="espace créé + 1re action" delta={<Delta cur={agg.activated} prev={prevAgg.activated} enough={enoughCompare} />} />
          <Kpi label="Visiteur → inscrit" value={vToSignup.text} hint="taux global (events)" />
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mt-4">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Entonnoir produit (visiteurs uniques, events)</p>
          {noPublicData && agg.signups === 0 ? (
            <p className="text-stone-400 text-sm py-6 text-center" style={{ fontWeight: 300 }}>
              Pas encore de parcours complet mesuré. Les {weddingsAll ?? 0} espaces existants sont antérieurs au suivi — ils ne sont pas comptés comme créations récentes ici.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-8">
              <div>
                <FunnelRow label="Visiteurs" value={agg.visitors} prevValue={agg.visitors} max={agg.visitors} isFirst />
                <FunnelRow label="Inscription" value={agg.signups} prevValue={agg.visitors} max={agg.visitors} />
              </div>
              <div>
                <FunnelRow label="Espace créé (event)" value={agg.weddingEvents} prevValue={agg.signups} max={Math.max(1, agg.visitors)} />
                <FunnelRow label="Activation" value={agg.activated} prevValue={agg.weddingEvents} max={Math.max(1, agg.visitors)} />
              </div>
            </div>
          )}
        </div>

        {/* ── D. PAGES & SOURCES ── */}
        <SectionTitle letter="D" title="Performance des pages & sources" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Pages les plus vues (public)</p>
            <ListBars rows={agg.topPages} max={Math.max(1, ...agg.topPages.map(p => p[1]))} color={MUTED} />
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>Sources d'acquisition</p>
            {agg.channels.length === 0 ? <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Aucune donnée sur la période.</p> : agg.channels.map(c => (
              <div key={c.key} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-600 flex items-center gap-1.5" style={{ fontWeight: 300 }}>
                    {c.kind === 'ai' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4a5240]/10 text-[#4a5240]" style={{ fontWeight: 500 }}>IA</span>}
                    {c.kind === 'search' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500" style={{ fontWeight: 500 }}>SEO</span>}
                    {c.label}
                  </span>
                  <span className="text-stone-400" style={{ fontWeight: 400 }}>{c.visitors} · {rate(c.visitors, agg.visitors).text}</span>
                </div>
                <Bar value={c.visitors} max={Math.max(1, ...agg.channels.map(x => x.visitors))} color={c.kind === 'ai' ? SAGE : MUTED} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mt-4">
          <p className="text-stone-500 text-xs uppercase tracking-wide mb-2" style={{ fontWeight: 600 }}>Conversions par source (attribution)</p>
          {agg.signupsByChannel.length === 0 && agg.weddingsByChannel.length === 0 ? (
            <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
              Aucune inscription/création attribuée à une source sur la période. L'attribution se construit à partir du déploiement du suivi — on ne reconstitue pas la source des espaces créés avant.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-stone-400 text-xs mb-2" style={{ fontWeight: 400 }}>Inscriptions par source</p>
                <ListBars rows={agg.signupsByChannel} max={Math.max(1, ...agg.signupsByChannel.map(x => x[1]))} color={SAGE} labelMap={k => CHANNEL_LABELS[k] ?? k} />
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-2" style={{ fontWeight: 400 }}>Espaces créés par source</p>
                <ListBars rows={agg.weddingsByChannel} max={Math.max(1, ...agg.weddingsByChannel.map(x => x[1]))} color={SAGE} labelMap={k => CHANNEL_LABELS[k] ?? k} />
              </div>
            </div>
          )}
        </div>

        {/* ── Diagnostic du suivi (replié) ── */}
        <details className="mt-10 bg-white rounded-2xl border border-stone-100 shadow-sm">
          <summary className="px-5 py-4 cursor-pointer text-stone-500 text-xs uppercase tracking-wide select-none" style={{ fontWeight: 600 }}>
            Diagnostic du suivi
          </summary>
          <div className="px-5 pb-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Dernière collecte</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{firstCollect ? new Date(firstCollect).toLocaleString('fr-FR') : '—'}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Events reçus (période)</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.totalEvents}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Events admin exclus</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.adminEventsExcluded}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Canal inconnu</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.unknownChannelPct} %</p></div>
            </div>
            {(() => {
              const missing = EXPECTED_EVENTS.filter(e => !(e in agg.countByEvent))
              return missing.length > 0 ? (
                <div className="bg-stone-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-stone-500 mb-1" style={{ fontWeight: 500 }}>Events attendus mais jamais reçus sur la période :</p>
                  <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{missing.join(', ')}</p>
                </div>
              ) : null
            })()}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-stone-500">
              {EXPECTED_EVENTS.map(e => (
                <div key={e} className="flex justify-between">
                  <span style={{ fontWeight: 300 }}>{e}</span>
                  <span className={agg.countByEvent[e] ? 'text-stone-600' : 'text-stone-300'}>{agg.countByEvent[e] ?? 0}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-4" style={{ fontWeight: 300 }}>
              Données first-party anonymes (aucun nom, email, téléphone, token ni contenu de mariage). Pages admin / espaces privés exclus de l'acquisition. GA4 conserve en parallèle les rapports d'acquisition détaillés.
            </p>
          </div>
        </details>

      </div>
    </main>
  )
}
