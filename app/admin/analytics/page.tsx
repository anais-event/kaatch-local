import { createServiceClient } from '@/lib/supabase-service'
import {
  aggregate, dayKeysFor, fmtDuration, pageLabel, EXPECTED_EVENTS, CHANNEL_LABELS,
  type Ev, type Agg,
} from '@/lib/analytics-cockpit'
import { requireAdmin } from '@/lib/admin'

const LATO = 'var(--font-lato)'
const DISPLAY = 'var(--font-display)'
const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'
const MUTED = '#9ca888'

const PERIODS = [7, 28, 90] as const
type Period = (typeof PERIODS)[number]
const MIN_COMPARE = 5

function periodLabel(d: number) { return d === 7 ? '7 jours' : d === 28 ? '28 jours' : '90 jours' }
function rate(num: number, den: number): { text: string; na: boolean } {
  if (den <= 0) return { text: 'n/d', na: true }
  return { text: Math.round((num / den) * 1000) / 10 + ' %', na: false }
}

// ── composants ──
function Delta({ cur, prev, enough, goodUp = true }: { cur: number; prev: number; enough: boolean; goodUp?: boolean }) {
  if (!enough) return <span className="text-stone-300 text-xs" title="Pas assez de données pour comparer">·</span>
  if (prev === 0) return <span className="text-stone-300 text-xs">—</span>
  const pct = Math.round(((cur - prev) / prev) * 100)
  if (pct === 0) return <span className="text-stone-400 text-xs">→ 0 %</span>
  const up = pct > 0, good = up === goodUp
  return <span className="text-xs" style={{ fontWeight: 500, color: good ? '#4a7c4a' : '#b45454' }}>{up ? '▲' : '▼'} {Math.abs(pct)} %</span>
}
function Kpi({ label, value, hint, delta, accent }: { label: string; value: React.ReactNode; hint?: string; delta?: React.ReactNode; accent?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.9rem', lineHeight: 1, color: accent ? SAGE : SAGE_DARK }}>{value}</p>
        {delta}
      </div>
      <p className="text-stone-500 text-xs mt-2 uppercase tracking-wide" style={{ fontWeight: 500 }}>{label}</p>
      {hint && <p className="text-stone-400 text-xs mt-0.5 leading-snug" style={{ fontWeight: 300 }}>{hint}</p>}
    </div>
  )
}
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0
  return <div className="h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} /></div>
}
function Spark({ data, labels }: { data: number[]; labels: string[] }) {
  if (data.reduce((a, b) => a + b, 0) === 0)
    return <div className="h-[90px] flex items-center justify-center rounded-xl bg-stone-50"><p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Pas encore de visiteurs sur la période</p></div>
  const w = 680, h = 90, pad = 4, max = Math.max(1, ...data), n = data.length
  const pts = data.map((v, i) => { const x = pad + (n <= 1 ? 0 : (i / (n - 1)) * (w - pad * 2)); const y = h - pad - (v / max) * (h - pad * 2); return `${x.toFixed(1)},${y.toFixed(1)}` })
  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 90 }} preserveAspectRatio="none">
        <polygon points={`${pad},${h - pad} ${pts.join(' ')} ${w - pad},${h - pad}`} fill={`${SAGE}18`} />
        <polyline points={pts.join(' ')} fill="none" stroke={SAGE} strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between text-xs text-stone-400 mt-1" style={{ fontWeight: 300 }}><span>{labels[0]?.slice(5)}</span><span>{labels[labels.length - 1]?.slice(5)}</span></div>
    </>
  )
}
function ListBars({ rows, max, color, labelMap }: { rows: [string, number][]; max: number; color: string; labelMap?: (k: string) => string }) {
  if (rows.length === 0) return <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Aucune donnée sur la période.</p>
  return <>{rows.map(([k, v]) => (
    <div key={k} className="mb-2.5">
      <div className="flex justify-between text-sm mb-1"><span className="text-stone-600 truncate mr-2" style={{ fontWeight: 300 }}>{labelMap ? labelMap(k) : k}</span><span className="text-stone-400" style={{ fontWeight: 400 }}>{v}</span></div>
      <Bar value={v} max={max} color={color} />
    </div>
  ))}</>
}
function SectionTitle({ n, title, subtitle }: { n: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 mt-10">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#4a5240]/10 text-[#4a5240] flex items-center justify-center text-xs" style={{ fontWeight: 600 }}>{n}</span>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.25rem', color: SAGE_DARK }}>{title}</h2>
      </div>
      {subtitle && <p className="text-stone-400 text-xs mt-1" style={{ fontWeight: 300, marginLeft: '2.1rem' }}>{subtitle}</p>}
    </div>
  )
}
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <p className="text-stone-500 text-xs uppercase tracking-wide mb-1" style={{ fontWeight: 600 }}>{title}</p>
      {hint && <p className="text-stone-400 text-xs mb-3" style={{ fontWeight: 300 }}>{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </div>
  )
}

const SELECT = 'event_name, visitor_id, session_id, channel, session_channel, campaign, landing_page, page_path, props, created_at'

export default async function AnalyticsCockpit({
  searchParams,
}: { searchParams: Promise<{ d?: string; page?: string }> }) {
  await requireAdmin()
  const sp = await searchParams
  const days: Period = (PERIODS as readonly number[]).includes(Number(sp.d)) ? (Number(sp.d) as Period) : 28
  const focusPage = typeof sp.page === 'string' ? sp.page : ''
  const now = Date.now()
  const since = new Date(now - days * 24 * 3600 * 1000)
  const prevStart = new Date(now - days * 2 * 24 * 3600 * 1000)

  let serviceOk = true
  let events: Ev[] = []
  let priorVisitorIds = new Set<string>()
  let weddingsAll: number | null = null, weddingsCur = 0, weddingsPrev = 0
  try {
    const svc = createServiceClient()
    const { data } = await svc.from('analytics_events').select(SELECT)
      .gte('created_at', prevStart.toISOString()).order('created_at', { ascending: true }).limit(100000)
    events = (data ?? []) as Ev[]
    const { data: prior } = await svc.from('analytics_events').select('visitor_id')
      .lt('created_at', since.toISOString()).limit(100000)
    for (const r of prior ?? []) if (r.visitor_id) priorVisitorIds.add(r.visitor_id)
    const [all, cur, prev] = await Promise.all([
      svc.from('weddings').select('id', { count: 'exact', head: true }),
      svc.from('weddings').select('id', { count: 'exact', head: true }).gte('created_at', since.toISOString()),
      svc.from('weddings').select('id', { count: 'exact', head: true }).gte('created_at', prevStart.toISOString()).lt('created_at', since.toISOString()),
    ])
    weddingsAll = all.count ?? null; weddingsCur = cur.count ?? 0; weddingsPrev = prev.count ?? 0
  } catch { serviceOk = false }

  const curEvents = events.filter(e => e.created_at >= since.toISOString())
  const prevEvents = events.filter(e => e.created_at < since.toISOString())
  const agg: Agg = aggregate(curEvents, dayKeysFor(days, now), priorVisitorIds)
  const prevAgg: Agg = aggregate(prevEvents, dayKeysFor(days, since.getTime()))
  const enough = agg.visitors >= MIN_COMPARE && prevAgg.visitors >= MIN_COMPARE
  const enoughW = weddingsPrev >= MIN_COMPARE
  const dayKeys = dayKeysFor(days, now)
  const noData = agg.visitors === 0 && agg.pageViews === 0
  const hasBehaviour = agg.pageViews > 0
  const topSource = agg.channels[0]

  // drill-down page
  const focus = focusPage ? agg.pages.find(p => p.path === focusPage) : null
  const nextPages = focusPage ? agg.journeys.filter(j => j.from === focusPage).slice(0, 6) : []
  const prevPages = focusPage ? agg.journeys.filter(j => j.to === focusPage).slice(0, 6) : []

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>
      <div className="bg-[#2d3228] px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontWeight: 500 }}>Kaatch Analytics</p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.6rem' }} className="text-white">Comportement des visiteurs</h1>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(d => (
            <a key={d} href={`/admin/analytics?d=${d}`} className={`text-xs px-3 py-1.5 rounded-lg transition ${days === d ? 'bg-white text-[#2d3228]' : 'text-white/60 border border-white/20 hover:text-white'}`} style={{ fontWeight: 400 }}>{periodLabel(d)}</a>
          ))}
          <a href="/admin" className="text-white/50 text-xs hover:text-white transition ml-2" style={{ fontWeight: 300 }}>← Admin</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {!serviceOk && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">Clé <code>SUPABASE_SERVICE_ROLE_KEY</code> indisponible : aucune donnée lisible.</div>}

        {/* EN BREF */}
        <div className="bg-[#2d3228] rounded-2xl p-6 mb-8 text-white">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-4" style={{ fontWeight: 500 }}>En bref · {periodLabel(days)}</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm" style={{ fontWeight: 300 }}>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">Qui ?</span>
              {noData ? <span className="text-white/70">Collecte tout juste active — pas encore de visiteurs.</span>
                : <span><strong className="text-white" style={{ fontWeight: 500 }}>{agg.visitors} visiteurs</strong>, {agg.sessions} visites{agg.newVisitors != null ? <> · {agg.newVisitors} nouveaux, {agg.returningVisitors} de retour</> : ''}.</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">D'où ?</span>
              {topSource ? <span>Surtout <strong className="text-white" style={{ fontWeight: 500 }}>{topSource.label}</strong>. IA : {agg.aiVisitors} · Google&co : {agg.searchVisitors}.</span> : <span className="text-white/70">Origine inconnue (pas de trafic).</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">Quoi ?</span>
              {hasBehaviour ? <span><strong className="text-white" style={{ fontWeight: 500 }}>{agg.pageViews} pages vues</strong>, {agg.pagesPerSession ?? '—'} pages/visite en moyenne.</span> : <span className="text-white/70">Pas encore de pages mesurées.</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">Restent ?</span>
              {hasBehaviour ? <span>Temps moyen/visite ~<strong className="text-white" style={{ fontWeight: 500 }}>{fmtDuration(agg.avgSessionSec)}</strong>. {agg.bounceRate ?? '—'} % repartent après 1 page.</span> : <span className="text-white/70">—</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">Outils ?</span>
              {agg.tools.some(t => t.visitors > 0) ? <span>Le plus visité : <strong className="text-white" style={{ fontWeight: 500 }}>{agg.tools[0].label}</strong> ({agg.tools[0].visitors}).</span> : <span className="text-white/70">Aucune visite d'outil mesurée.</span>}
            </p>
            <p className="flex gap-2"><span className="text-white/40 shrink-0">Convertit ?</span>
              <span><strong className="text-white" style={{ fontWeight: 500 }}>{agg.signups}</strong> inscriptions · <strong className="text-white" style={{ fontWeight: 500 }}>{weddingsCur}</strong> espaces créés.</span>
            </p>
          </div>
          <p className="text-white/35 text-xs mt-4 pt-3 border-t border-white/10" style={{ fontWeight: 300 }}>
            Faits mesurés sur données réelles. Durées approximatives (temps où l'onglet est actif). Rien n'est reconstitué avant le démarrage du suivi.
          </p>
        </div>

        {/* 1. QUI */}
        <SectionTitle n="1" title="Qui visite Kaatch ?" subtitle="Visiteurs du site public (espaces mariés, invités, prestataires et admin exclus)." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <Kpi label="Visiteurs uniques" value={agg.visitors} hint="personnes différentes" delta={<Delta cur={agg.visitors} prev={prevAgg.visitors} enough={enough} />} />
          <Kpi label="Visites (sessions)" value={agg.sessions} hint="une personne peut revenir" delta={<Delta cur={agg.sessions} prev={prevAgg.sessions} enough={enough} />} />
          <Kpi label="Nouveaux" value={agg.newVisitors ?? 'n/d'} hint="1re fois sur le site" accent />
          <Kpi label="De retour" value={agg.returningVisitors ?? 'n/d'} hint="déjà venus avant" accent />
        </div>
        <Card title="Visiteurs par jour">
          <Spark data={agg.spark} labels={dayKeys} />
        </Card>

        {/* 2. D'OÙ */}
        <SectionTitle n="2" title="D'où viennent-ils ?" subtitle="Origine de chaque visiteur. « Direct / inconnu » = arrivée sans origine identifiable." />
        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Sources d'acquisition" hint="IA = assistants type ChatGPT · SEO = moteurs de recherche">
            {agg.channels.length === 0 ? <p className="text-stone-400 text-sm">Aucune donnée.</p> : agg.channels.map(c => (
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
          </Card>
          <Card title="Campagnes (liens UTM)" hint="Visiteurs arrivés via un lien marqué utm_campaign.">
            <ListBars rows={agg.campaigns} max={Math.max(1, ...agg.campaigns.map(c => c[1]))} color={MUTED} />
          </Card>
        </div>

        {/* 3. QUE CONSULTENT-ILS */}
        <SectionTitle n="3" title="Que consultent-ils ?" subtitle="Toutes les pages publiques réellement vues. Clique une page pour voir son détail et les parcours." />
        {!hasBehaviour ? (
          <Card title="Pages consultées"><p className="text-stone-400 text-sm py-4 text-center" style={{ fontWeight: 300 }}>Mesure des pages tout juste activée — les données arriveront avec le trafic.</p></Card>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-5 py-3 border-b border-stone-100 text-xs text-stone-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>
              <span>Page</span><span className="text-right">Vues</span><span className="text-right">Visiteurs</span><span className="text-right">Temps moy.</span><span className="text-right">Sortie</span>
            </div>
            {agg.pages.slice(0, 15).map(p => (
              <a key={p.path} href={`/admin/analytics?d=${days}&page=${encodeURIComponent(p.path)}`}
                 className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-5 py-2.5 text-sm hover:bg-stone-50 transition border-b border-stone-50 ${focusPage === p.path ? 'bg-stone-50' : ''}`}>
                <span className="text-stone-700 truncate" style={{ fontWeight: 300 }} title={p.path}>{p.label}</span>
                <span className="text-right text-stone-600" style={{ fontWeight: 400 }}>{p.pageviews}</span>
                <span className="text-right text-stone-500" style={{ fontWeight: 300 }}>{p.visitors}</span>
                <span className="text-right text-stone-500" style={{ fontWeight: 300 }}>{p.avgEngagementMs != null ? fmtDuration(Math.round(p.avgEngagementMs / 1000)) : '—'}</span>
                <span className="text-right text-stone-500" style={{ fontWeight: 300 }}>{p.exitRate != null ? p.exitRate + ' %' : '—'}</span>
              </a>
            ))}
            {focus && (
              <div className="px-5 py-4 bg-[#f5f0e8]/60 border-t border-stone-100">
                <p className="text-stone-600 text-sm mb-2" style={{ fontWeight: 500 }}>Détail · {focus.label} <a href={`/admin/analytics?d=${days}`} className="text-xs text-stone-400 hover:text-stone-600 ml-2" style={{ fontWeight: 300 }}>✕ fermer</a></p>
                <div className="grid sm:grid-cols-3 gap-4 text-sm mb-3">
                  <div><span className="text-stone-400 text-xs block" style={{ fontWeight: 400 }}>Temps moyen</span>{focus.avgEngagementMs != null ? fmtDuration(Math.round(focus.avgEngagementMs / 1000)) : 'n/d'} <span className="text-stone-300 text-xs">({focus.engagementSamples} mesures)</span></div>
                  <div><span className="text-stone-400 text-xs block" style={{ fontWeight: 400 }}>Entrées sur le site</span>{focus.entries}</div>
                  <div><span className="text-stone-400 text-xs block" style={{ fontWeight: 400 }}>Taux de sortie</span>{focus.exitRate != null ? focus.exitRate + ' %' : 'n/d'}</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-stone-400 text-xs mb-1" style={{ fontWeight: 400 }}>Pages visitées juste avant</p>
                    {prevPages.length ? prevPages.map(j => <p key={j.from} className="text-xs text-stone-500 flex justify-between" style={{ fontWeight: 300 }}><span className="truncate mr-2">{pageLabel(j.from)}</span><span>{j.count}</span></p>) : <p className="text-xs text-stone-300">—</p>}
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs mb-1" style={{ fontWeight: 400 }}>Pages visitées juste après</p>
                    {nextPages.length ? nextPages.map(j => <p key={j.to} className="text-xs text-stone-500 flex justify-between" style={{ fontWeight: 300 }}><span className="truncate mr-2">{pageLabel(j.to)}</span><span>{j.count}</span></p>) : <p className="text-xs text-stone-300">—</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. RESTENT / NAVIGUENT */}
        <SectionTitle n="4" title="Restent-ils et naviguent-ils ?" subtitle="Engagement et parcours. Durées approximatives (temps où l'onglet reste actif)." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <Kpi label="Pages par visite" value={agg.pagesPerSession ?? 'n/d'} hint="moyenne" />
          <Kpi label="Temps moyen / visite" value={fmtDuration(agg.avgSessionSec)} hint="approximatif" accent />
          <Kpi label="Repartent après 1 page" value={agg.bounceRate != null ? agg.bounceRate + ' %' : 'n/d'} hint="n'ont vu qu'une page" />
          <Kpi label="Visites analysées" value={agg.sessionsWithPV} hint="avec au moins 1 page mesurée" />
        </div>
        <Card title="Parcours les plus fréquents" hint="Enchaînements page → page suivante, le plus souvent observés.">
          {agg.journeys.length === 0 ? <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Pas encore de parcours (il faut au moins 2 pages dans une visite).</p> :
            agg.journeys.map(j => (
              <div key={j.from + j.to} className="flex items-center justify-between text-sm mb-2">
                <span className="text-stone-600 truncate mr-2" style={{ fontWeight: 300 }}>{pageLabel(j.from)} <span className="text-stone-300">→</span> {pageLabel(j.to)}</span>
                <span className="text-stone-400 shrink-0" style={{ fontWeight: 400 }}>{j.count}</span>
              </div>
            ))}
        </Card>

        {/* 5. OUTILS */}
        <SectionTitle n="5" title="Quels outils gratuits fonctionnent ?" subtitle="Comparaison des 6 outils. « Démarré » et « Exporté » ne sont comptés que là où l'outil est instrumenté." />
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 px-5 py-3 border-b border-stone-100 text-xs text-stone-400 uppercase tracking-wide" style={{ fontWeight: 500 }}>
            <span>Outil</span><span className="text-right">Visiteurs</span><span className="text-right">Démarré</span><span className="text-right">Exporté</span>
          </div>
          {agg.tools.map(t => (
            <div key={t.tool} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 px-5 py-2.5 text-sm border-b border-stone-50 last:border-0">
              <span className="text-stone-700" style={{ fontWeight: 300 }}>{t.label}</span>
              <span className="text-right text-stone-600" style={{ fontWeight: 400 }}>{t.visitors}</span>
              <span className="text-right text-stone-500" style={{ fontWeight: 300 }}>{t.started || '—'}</span>
              <span className="text-right text-stone-500" style={{ fontWeight: 300 }}>{t.exported || '—'}</span>
            </div>
          ))}
        </div>

        {/* 6. DÉCOUVERTE DE L'APP */}
        <SectionTitle n="6" title="Qu'est-ce qui fait découvrir Kaatch ?" subtitle="Pages & sources qui précèdent une inscription. Se construit au fil du suivi (pas de reconstitution)." />
        <div className="grid md:grid-cols-2 gap-6">
          <Card title="Pages vues avant une inscription" hint="Dans les visites ayant abouti à une inscription.">
            <ListBars rows={agg.pagesBeforeSignup} max={Math.max(1, ...agg.pagesBeforeSignup.map(p => p[1]))} color={SAGE} labelMap={pageLabel} />
          </Card>
          <Card title="Conversions par source" hint="Inscriptions / espaces attribués à une origine.">
            {agg.signupsByChannel.length === 0 && agg.weddingsByChannel.length === 0 ? (
              <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Aucune conversion attribuée pour l'instant. L'attribution se construit depuis le déploiement du suivi.</p>
            ) : (
              <>
                <p className="text-stone-400 text-xs mb-1" style={{ fontWeight: 400 }}>Inscriptions</p>
                <ListBars rows={agg.signupsByChannel} max={Math.max(1, ...agg.signupsByChannel.map(x => x[1]))} color={SAGE} labelMap={k => CHANNEL_LABELS[k] ?? k} />
                <p className="text-stone-400 text-xs mb-1 mt-3" style={{ fontWeight: 400 }}>Espaces créés</p>
                <ListBars rows={agg.weddingsByChannel} max={Math.max(1, ...agg.weddingsByChannel.map(x => x[1]))} color={SAGE} labelMap={k => CHANNEL_LABELS[k] ?? k} />
              </>
            )}
          </Card>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Kpi label="Inscriptions" value={agg.signups} hint="depuis le suivi" delta={<Delta cur={agg.signups} prev={prevAgg.signups} enough={enough} />} />
          <Kpi label="Espaces créés (période)" value={weddingsCur} hint={weddingsAll != null ? `${weddingsAll} au total (historique)` : ''} delta={<Delta cur={weddingsCur} prev={weddingsPrev} enough={enoughW} />} accent />
          <Kpi label="Entrées sur le site" value={agg.entryPages.reduce((s, e) => s + e[1], 0)} hint="1re page des visites" />
          <Kpi label="Sorties principales" value={agg.exitPages[0] ? pageLabel(agg.exitPages[0][0]) : '—'} hint={agg.exitPages[0] ? `${agg.exitPages[0][1]} sorties` : 'où l\'on quitte le site'} />
        </div>

        {/* Diagnostic */}
        <details className="mt-10 bg-white rounded-2xl border border-stone-100 shadow-sm">
          <summary className="px-5 py-4 cursor-pointer text-stone-500 text-xs uppercase tracking-wide select-none" style={{ fontWeight: 600 }}>Diagnostic du suivi</summary>
          <div className="px-5 pb-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Dernière collecte</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.lastAt ? new Date(agg.lastAt).toLocaleString('fr-FR') : '—'}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Events reçus (période)</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.totalEvents}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Events admin exclus</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.adminEventsExcluded}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Canal inconnu</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.unknownChannelPct} %</p></div>
            </div>
            {(() => { const missing = EXPECTED_EVENTS.filter(e => !(e in agg.countByEvent)); return missing.length > 0 ? (
              <div className="bg-stone-50 rounded-xl p-3 mb-3"><p className="text-xs text-stone-500 mb-1" style={{ fontWeight: 500 }}>Events attendus mais absents sur la période :</p><p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{missing.join(', ')}</p></div>
            ) : null })()}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-stone-500">
              {EXPECTED_EVENTS.map(e => <div key={e} className="flex justify-between"><span style={{ fontWeight: 300 }}>{e}</span><span className={agg.countByEvent[e] ? 'text-stone-600' : 'text-stone-300'}>{agg.countByEvent[e] ?? 0}</span></div>)}
            </div>
            <p className="text-xs text-stone-400 mt-4" style={{ fontWeight: 300 }}>
              Mesure d'audience first-party anonyme (aucun nom, email, téléphone, token ni contenu privé ; pas de fingerprint). Espaces privés exclus. Durées = temps où l'onglet est actif, donc approximatives. GA4/Vercel tournent en parallèle pour leurs propres rapports.
            </p>
          </div>
        </details>
      </div>
    </main>
  )
}
