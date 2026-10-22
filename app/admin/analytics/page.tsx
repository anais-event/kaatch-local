import { createServiceClient } from '@/lib/supabase-service'
import { aggregate, dayKeysFor, pageLabel, EXPECTED_EVENTS, type Ev, type Agg } from '@/lib/analytics-cockpit'
import { requireAdmin } from '@/lib/admin'
import { AreaChart, Donut, RankBars, Funnel, FlowList, ToolCompare, fmtDuration, SEGMENT_COLORS } from './charts'

const LATO = 'var(--font-lato)'
const DISPLAY = 'var(--font-display)'
const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'

const PERIODS = [7, 28, 90] as const
type Period = (typeof PERIODS)[number]
const MIN_COMPARE = 5

function periodLabel(d: number) { return d === 7 ? '7 jours' : d === 28 ? '28 jours' : '90 jours' }

function Delta({ cur, prev, enough, goodUp = true }: { cur: number; prev: number; enough: boolean; goodUp?: boolean }) {
  if (!enough) return <span className="text-stone-300 text-xs" title="Pas assez de données pour comparer">·</span>
  if (prev === 0) return <span className="text-stone-300 text-xs">nouveau</span>
  const pct = Math.round(((cur - prev) / prev) * 100)
  if (pct === 0) return <span className="text-stone-400 text-xs">stable</span>
  const up = pct > 0, good = up === goodUp
  return <span className="text-xs" style={{ fontWeight: 600, color: good ? '#4a7c4a' : '#b45454' }}>{up ? '▲' : '▼'} {Math.abs(pct)}%</span>
}

function Stat({ value, label, hint, delta, accent }: { value: React.ReactNode; label: string; hint?: string; delta?: React.ReactNode; accent?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '2rem', lineHeight: 1, color: accent ? SAGE : SAGE_DARK }}>{value}</span>
        {delta}
      </div>
      <p className="text-stone-500 text-xs mt-1.5 uppercase tracking-wide" style={{ fontWeight: 500 }}>{label}</p>
      {hint && <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{hint}</p>}
    </div>
  )
}

function Section({ n, title, sub, children }: { n: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="w-6 h-6 rounded-full bg-[#4a5240]/10 text-[#4a5240] flex items-center justify-center text-xs shrink-0" style={{ fontWeight: 600 }}>{n}</span>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.3rem', color: SAGE_DARK, lineHeight: 1.1 }}>{title}</h2>
          {sub && <p className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm p-5 ${className}`}>
      {title && <p className="text-stone-500 text-xs uppercase tracking-wide mb-4" style={{ fontWeight: 600 }}>{title}</p>}
      {children}
    </div>
  )
}

const SELECT = 'event_name, visitor_id, session_id, channel, session_channel, campaign, landing_page, page_path, props, created_at'

export default async function AnalyticsCockpit({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  await requireAdmin()
  const sp = await searchParams
  const days: Period = (PERIODS as readonly number[]).includes(Number(sp.d)) ? (Number(sp.d) as Period) : 28
  const now = Date.now()
  const since = new Date(now - days * 24 * 3600 * 1000)
  const prevStart = new Date(now - days * 2 * 24 * 3600 * 1000)

  let serviceOk = true
  let events: Ev[] = []
  const priorVisitorIds = new Set<string>()
  let weddingsAll: number | null = null, weddingsCur = 0, weddingsPrev = 0
  try {
    const svc = createServiceClient()
    const { data } = await svc.from('analytics_events').select(SELECT).gte('created_at', prevStart.toISOString()).order('created_at', { ascending: true }).limit(100000)
    events = (data ?? []) as Ev[]
    const { data: prior } = await svc.from('analytics_events').select('visitor_id').lt('created_at', since.toISOString()).limit(100000)
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

  // Donut sources
  const donutSegments = agg.channels.slice(0, 8).map((c, i) => ({ label: c.label, value: c.visitors, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }))

  // Pages (classement) — libellés clairs, exclut /auth du top "attention"
  const topPages = agg.pages.slice(0, 8).map(p => ({
    label: p.label, value: p.visitors,
    sub: p.avgEngagementMs != null ? `· ${fmtDuration(Math.round(p.avgEngagementMs / 1000))}` : undefined,
  }))
  const entryRows = agg.entryPages.slice(0, 6).map(([p, v]) => ({ label: pageLabel(p), value: v }))

  // Outils : 4 outils interactifs + (liste-invités / programme = pages, à part)
  const interactiveTools = agg.tools.filter(t => ['plan-de-table', 'budget', 'checklist', 'discours'].includes(t.tool))
  const pageTools = agg.tools.filter(t => ['liste-invites', 'programme'].includes(t.tool))

  // Funnel découverte → inscription (populations compatibles, event-based)
  const funnelSteps = [
    { label: 'Visiteurs du site', value: agg.visitors, hint: 'public' },
    { label: 'Ont ouvert un outil', value: agg.toolVisitors, hint: 'gratuit' },
    { label: 'Inscriptions', value: agg.signups, hint: 'compte créé' },
    { label: 'Espaces mariage', value: agg.weddingEvents, hint: 'via le suivi' },
    { label: 'Activés', value: agg.activated, hint: '1re action' },
  ]

  // Section 7 — observations factuelles (seuils pour éviter la sur-interprétation)
  const obs: { fact: string; action?: string }[] = []
  if (!noData) {
    const topCh = agg.channels[0]
    if (topCh && topCh.visitors >= MIN_COMPARE && agg.visitors > 0 && topCh.visitors / agg.visitors >= 0.4) {
      obs.push({ fact: `${topCh.label} représente ${Math.round((topCh.visitors / agg.visitors) * 100)}% de vos visiteurs.`, action: topCh.kind === 'ai' ? "Les assistants IA pèsent : soignez le contenu factuel et les pages piliers." : "Capitalisez sur ce canal, et diversifiez pour réduire la dépendance." })
    }
    const t0 = interactiveTools[0], t1 = interactiveTools[1]
    if (t0 && t0.visitors >= 3 && (!t1 || t0.visitors >= 2 * t1.visitors)) {
      obs.push({ fact: `L'outil « ${t0.label} » attire nettement plus que les autres (${t0.visitors} visiteurs).`, action: "Mettez-le en avant comme porte d'entrée et renforcez son CTA vers l'inscription." })
    }
    const toolExportsZero = interactiveTools.find(t => t.visitors >= 5 && t.exported === 0 && t.started === 0)
    if (toolExportsZero) obs.push({ fact: `« ${toolExportsZero.label} » est consulté (${toolExportsZero.visitors}) mais aucune action n'est encore mesurée.`, action: "Vérifiez que l'outil donne envie d'agir (clarté, premier pas facile)." })
    if (agg.pagesBeforeSignup[0] && agg.signups >= 2) {
      obs.push({ fact: `La page « ${pageLabel(agg.pagesBeforeSignup[0][0])} » précède souvent une inscription.`, action: "Renforcez-y le lien vers la création de compte." })
    }
    if (agg.toolVisitors >= MIN_COMPARE && agg.signups === 0) {
      obs.push({ fact: `${agg.toolVisitors} visiteurs utilisent les outils mais aucun ne s'inscrit encore.`, action: "Ajoutez un rappel « créer mon espace » après usage de l'outil." })
    }
    const hiExit = agg.pages.find(p => p.path !== '/' && p.visitors >= MIN_COMPARE && p.exitRate != null && p.exitRate >= 75)
    if (hiExit) obs.push({ fact: `« ${hiExit.label} » attire ${hiExit.visitors} visiteurs mais la plupart quittent le site ensuite (${hiExit.exitRate}%).`, action: "Ajoutez un lien naturel vers une page utile ou un outil." })
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>
      {/* Header */}
      <div className="bg-[#2d3228] px-5 sm:px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontWeight: 500 }}>Kaatch</p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.55rem' }} className="text-white">Tableau de bord</h1>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(d => (
            <a key={d} href={`/admin/analytics?d=${d}`} className={`text-xs px-3 py-1.5 rounded-lg transition ${days === d ? 'bg-white text-[#2d3228]' : 'text-white/60 border border-white/20 hover:text-white'}`} style={{ fontWeight: 400 }}>{periodLabel(d)}</a>
          ))}
          <a href="/admin" className="text-white/50 text-xs hover:text-white transition ml-1" style={{ fontWeight: 300 }}>← Admin</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        {!serviceOk && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">Clé <code>SUPABASE_SERVICE_ROLE_KEY</code> indisponible : aucune donnée lisible.</div>}
        {serviceOk && noData && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <span className="text-xl">🌱</span>
            <div>
              <p className="text-stone-700 text-sm" style={{ fontWeight: 500 }}>La collecte vient de démarrer sur {periodLabel(days)}.</p>
              <p className="text-stone-500 text-sm mt-0.5" style={{ fontWeight: 300 }}>Les graphiques se rempliront avec le trafic réel. Aucun chiffre n'est inventé : tout ce qui est à zéro l'est réellement.</p>
            </div>
          </div>
        )}

        {/* SECTION 1 — Vue d'ensemble */}
        <Section n="1" title="Kaatch en un coup d'œil" sub="Fréquentation du site public sur la période choisie.">
          <Card>
            <div className="grid sm:grid-cols-4 gap-5 mb-5">
              <Stat value={agg.visitors} label="Visiteurs" hint="personnes uniques" delta={<Delta cur={agg.visitors} prev={prevAgg.visitors} enough={enough} />} />
              <Stat value={agg.sessions} label="Visites" hint="une personne peut revenir" delta={<Delta cur={agg.sessions} prev={prevAgg.sessions} enough={enough} />} accent />
              <Stat value={agg.newVisitors ?? '—'} label="Nouveaux" hint="1re fois" />
              <Stat value={agg.returningVisitors ?? '—'} label="De retour" hint="déjà venus" />
            </div>
            <AreaChart data={agg.spark} labels={dayKeys} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-5 pt-5 border-t border-stone-100">
              <Stat value={agg.signups} label="Inscriptions" hint="depuis le suivi" delta={<Delta cur={agg.signups} prev={prevAgg.signups} enough={enough} />} />
              <Stat value={weddingsCur} label="Espaces créés" hint={weddingsAll != null ? `${weddingsAll} au total` : 'sur la période'} delta={<Delta cur={weddingsCur} prev={weddingsPrev} enough={enoughW} />} accent />
              <Stat value={agg.pageViews || '—'} label="Pages vues" />
              <Stat value={agg.pagesPerSession ?? '—'} label="Pages / visite" hint="en moyenne" />
            </div>
          </Card>
        </Section>

        {/* SECTION 2 — Sources */}
        <Section n="2" title="D'où viennent mes visiteurs ?" sub="« Direct / inconnu » = arrivée sans origine identifiable (on ne l'étiquette pas arbitrairement).">
          <div className="grid lg:grid-cols-2 gap-5">
            <Card title="Répartition des sources">
              <Donut segments={donutSegments} centerValue={agg.visitors} centerLabel="visiteurs" />
              {(agg.aiVisitors > 0 || agg.searchVisitors > 0) && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-stone-100 text-sm">
                  <span className="text-stone-500" style={{ fontWeight: 300 }}>🤖 Assistants IA : <strong style={{ fontWeight: 600, color: SAGE }}>{agg.aiVisitors}</strong></span>
                  <span className="text-stone-500" style={{ fontWeight: 300 }}>🔍 Recherche : <strong style={{ fontWeight: 600, color: SAGE }}>{agg.searchVisitors}</strong></span>
                </div>
              )}
            </Card>
            <Card title="Campagnes (liens UTM)">
              <RankBars rows={agg.campaigns.map(([k, v]) => ({ label: k, value: v }))} emptyLabel="Aucune campagne marquée (utm_campaign) sur la période." />
              <p className="text-stone-400 text-xs mt-4" style={{ fontWeight: 300 }}>Ajoutez <code>?utm_campaign=…</code> à vos liens (newsletter, posts) pour mesurer leur impact ici.</p>
            </Card>
          </div>
        </Section>

        {/* SECTION 3 — Pages */}
        <Section n="3" title="Qu'est-ce qui attire le plus l'attention ?" sub="Pages publiques les plus consultées et principales portes d'entrée.">
          <div className="grid lg:grid-cols-2 gap-5">
            <Card title="Pages les plus consultées">
              <RankBars rows={topPages} emptyLabel="Mesure des pages tout juste activée." />
            </Card>
            <Card title="Pages d'entrée (1re page des visites)">
              <RankBars rows={entryRows} color="#9ca888" emptyLabel="Pas encore de données." />
            </Card>
          </div>
        </Section>

        {/* SECTION 4 — Parcours */}
        <Section n="4" title="Que font les visiteurs ?" sub="Enchaînements de pages réellement observés dans une même visite (faits mesurés, pas de parcours simulé).">
          <Card title="Parcours les plus fréquents">
            <FlowList flows={agg.journeys} pageLabel={pageLabel} />
            {hasBehaviour && (
              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-stone-100 text-center">
                <div><p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1.4rem', color: SAGE_DARK }}>{fmtDuration(agg.avgSessionSec)}</p><p className="text-stone-400 text-xs mt-1" style={{ fontWeight: 300 }}>temps moyen / visite<br />(approximatif)</p></div>
                <div><p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1.4rem', color: SAGE_DARK }}>{agg.pagesPerSession ?? '—'}</p><p className="text-stone-400 text-xs mt-1" style={{ fontWeight: 300 }}>pages par visite</p></div>
                <div><p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1.4rem', color: SAGE_DARK }}>{agg.bounceRate != null ? agg.bounceRate + '%' : '—'}</p><p className="text-stone-400 text-xs mt-1" style={{ fontWeight: 300 }}>repartent après 1 page</p></div>
              </div>
            )}
          </Card>
        </Section>

        {/* SECTION 5 — Outils */}
        <Section n="5" title="Mes outils gratuits" sub="Comparaison des 4 outils interactifs. « Démarrage » et « export » ne comptent que là où l'outil est instrumenté.">
          <div className="grid lg:grid-cols-3 gap-5">
            <Card title="Comparatif des outils" className="lg:col-span-2">
              <ToolCompare tools={interactiveTools.map(t => ({ label: t.label, visitors: t.visitors, started: t.started, exported: t.exported }))} />
            </Card>
            <Card title="Pages vitrines (non interactives)">
              <RankBars rows={pageTools.map(t => ({ label: t.label, value: t.visitors }))} color="#c2b59b" emptyLabel="Pas encore de visites." />
              <p className="text-stone-400 text-xs mt-4" style={{ fontWeight: 300 }}>Liste d'invités et Programme sont des pages de présentation, pas des outils interactifs — seule leur fréquentation est mesurée.</p>
            </Card>
          </div>
        </Section>

        {/* SECTION 6 — Conversion */}
        <Section n="6" title="Ce qui conduit à une inscription" sub="Du visiteur à l'espace mariage. Chaque étape = visiteurs uniques (events), jamais mélangés.">
          <Card>
            <Funnel steps={funnelSteps} />
            <p className="text-stone-400 text-xs mt-5 pt-4 border-t border-stone-100 leading-relaxed" style={{ fontWeight: 300 }}>
              <strong style={{ fontWeight: 500 }}>Limites :</strong> les étapes comptent des <em>visiteurs uniques</em> suivis depuis le déploiement du suivi. Les <strong>{weddingsAll ?? 0} espaces</strong> existants en base incluent des créations antérieures au suivi : elles ne sont pas rattachées à un parcours ici. L'attribution de source est en « premier contact ».
            </p>
          </Card>
        </Section>

        {/* SECTION 7 — Opportunités */}
        <Section n="7" title="Mes opportunités de croissance" sub="Observations tirées uniquement des données réelles.">
          <Card>
            {obs.length === 0 ? (
              <p className="text-stone-500 text-sm py-2" style={{ fontWeight: 300 }}>
                Pas encore assez de données pour dégager des observations fiables. Revenez quand le trafic aura augmenté — on évite d'inventer des recommandations sur trop peu de visites.
              </p>
            ) : (
              <div className="space-y-4">
                {obs.map((o, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#4a5240]/10 text-[#4a5240] flex items-center justify-center text-xs shrink-0 mt-0.5" style={{ fontWeight: 600 }}>{i + 1}</span>
                    <div>
                      <p className="text-stone-700 text-sm" style={{ fontWeight: 400 }}>{o.fact}</p>
                      {o.action && <p className="text-stone-500 text-sm mt-0.5" style={{ fontWeight: 300 }}>→ {o.action}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Section>

        {/* Diagnostic repliable */}
        <details className="bg-white rounded-2xl border border-stone-100 shadow-sm">
          <summary className="px-5 py-4 cursor-pointer text-stone-500 text-xs uppercase tracking-wide select-none" style={{ fontWeight: 600 }}>Diagnostic du suivi (technique)</summary>
          <div className="px-5 pb-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Dernière collecte</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.lastAt ? new Date(agg.lastAt).toLocaleString('fr-FR') : '—'}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Events reçus</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.totalEvents}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Events admin exclus</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.adminEventsExcluded}</p></div>
              <div><p className="text-stone-400 text-xs" style={{ fontWeight: 400 }}>Canal inconnu</p><p className="text-stone-700" style={{ fontWeight: 400 }}>{agg.unknownChannelPct}%</p></div>
            </div>
            {(() => { const missing = EXPECTED_EVENTS.filter(e => !(e in agg.countByEvent)); return missing.length > 0 ? (
              <div className="bg-stone-50 rounded-xl p-3 mb-3"><p className="text-xs text-stone-500 mb-1" style={{ fontWeight: 500 }}>Events attendus mais absents :</p><p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{missing.join(', ')}</p></div>
            ) : null })()}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-stone-500">
              {EXPECTED_EVENTS.map(e => <div key={e} className="flex justify-between"><span style={{ fontWeight: 300 }}>{e}</span><span className={agg.countByEvent[e] ? 'text-stone-600' : 'text-stone-300'}>{agg.countByEvent[e] ?? 0}</span></div>)}
            </div>
            <p className="text-xs text-stone-400 mt-4" style={{ fontWeight: 300 }}>
              Mesure d'audience first-party anonyme (aucun nom, email, téléphone, token ni contenu privé ; pas de fingerprint). Pages privées exclues. Durées = temps où l'onglet est actif, donc approximatives.
            </p>
          </div>
        </details>
      </div>
    </main>
  )
}
