// Composants de visualisation du cockpit — SVG/CSS purs, aucune dépendance.
// Server components (présentation uniquement). Responsive via viewBox + width 100%.

const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'
const DISPLAY = 'var(--font-display)'

// Palette de segments (déclinaisons de la charte), ordre stable.
export const SEGMENT_COLORS = ['#4a5240', '#6b7c5e', '#2d3228', '#9ca888', '#c2b59b', '#7d6f5a', '#b0a07f', '#8a9475', '#5c5143', '#aeb89c']

export function fmtDuration(sec: number | null): string {
  if (sec == null) return 'n/d'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60), s = sec % 60
  return `${m}min ${s.toString().padStart(2, '0')}s`
}

// ── Grand graphique d'aire (fréquentation) ──
export function AreaChart({ data, labels }: { data: number[]; labels: string[] }) {
  const total = data.reduce((a, b) => a + b, 0)
  if (total === 0) {
    return (
      <div className="h-40 flex flex-col items-center justify-center rounded-xl bg-[#f5f0e8]/60 border border-dashed border-stone-200">
        <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Pas encore de visiteurs sur la période</p>
        <p className="text-stone-300 text-xs mt-1" style={{ fontWeight: 300 }}>La courbe se tracera dès les premières visites.</p>
      </div>
    )
  }
  const w = 900, h = 220, padX = 8, padTop = 16, padBottom = 24
  const max = Math.max(1, ...data), n = data.length
  const x = (i: number) => padX + (n <= 1 ? 0 : (i / (n - 1)) * (w - padX * 2))
  const y = (v: number) => h - padBottom - (v / max) * (h - padTop - padBottom)
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
  const peakIdx = data.indexOf(max)
  const gridY = [0.5, 1].map(f => h - padBottom - f * (h - padTop - padBottom))
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 'auto', aspectRatio: `${w} / ${h}` }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SAGE} stopOpacity="0.22" />
            <stop offset="100%" stopColor={SAGE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridY.map((gy, i) => <line key={i} x1={padX} y1={gy} x2={w - padX} y2={gy} stroke="#e7e2d8" strokeWidth="1" strokeDasharray="4 5" />)}
        <polygon points={`${x(0)},${h - padBottom} ${pts.join(' ')} ${x(n - 1)},${h - padBottom}`} fill="url(#areaFill)" />
        <polyline points={pts.join(' ')} fill="none" stroke={SAGE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(peakIdx)} cy={y(max)} r="4" fill={SAGE} />
        <circle cx={x(n - 1)} cy={y(data[n - 1])} r="3.5" fill="#fff" stroke={SAGE} strokeWidth="2" />
        <text x={x(peakIdx)} y={y(max) - 9} textAnchor="middle" fontSize="13" fill={SAGE_DARK} style={{ fontFamily: DISPLAY, fontWeight: 600 }}>{max}</text>
      </svg>
      <div className="flex justify-between text-xs text-stone-400 -mt-1" style={{ fontWeight: 300 }}>
        <span>{labels[0]?.slice(5)}</span><span>{labels[labels.length - 1]?.slice(5)}</span>
      </div>
    </div>
  )
}

// ── Donut (répartition des sources) ──
export function Donut({ segments, centerValue, centerLabel }: {
  segments: { label: string; value: number; color: string }[]
  centerValue: number | string
  centerLabel: string
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const size = 180, stroke = 26, r = (size - stroke) / 2, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#efeae0" strokeWidth={stroke} />
          {total > 0 && segments.map((s, i) => {
            const frac = s.value / total
            const dash = frac * circ
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} strokeLinecap="butt" />
            )
            offset += dash
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1.7rem', color: SAGE_DARK, lineHeight: 1 }}>{centerValue}</span>
          <span className="text-stone-400 text-xs mt-0.5" style={{ fontWeight: 300 }}>{centerLabel}</span>
        </div>
      </div>
      <div className="flex-1 min-w-[160px] space-y-1.5">
        {total === 0 ? <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>Aucune source mesurée.</p> :
          segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-stone-600 flex-1 truncate" style={{ fontWeight: 300 }}>{s.label}</span>
              <span className="text-stone-400" style={{ fontWeight: 400 }}>{Math.round((s.value / total) * 100)}%</span>
              <span className="text-stone-300 text-xs w-6 text-right">{s.value}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

// ── Classement en barres horizontales ──
export function RankBars({ rows, color = SAGE, emptyLabel = 'Aucune donnée sur la période.' }: {
  rows: { label: string; value: number; tag?: string; sub?: string }[]
  color?: string
  emptyLabel?: string
}) {
  if (rows.length === 0) return <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>{emptyLabel}</p>
  const max = Math.max(1, ...rows.map(r => r.value))
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex justify-between items-baseline text-sm mb-1 gap-2">
            <span className="text-stone-700 truncate flex items-center gap-1.5" style={{ fontWeight: 300 }}>
              {r.tag && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4a5240]/10 text-[#4a5240]" style={{ fontWeight: 500 }}>{r.tag}</span>}
              {r.label}
            </span>
            <span className="text-stone-500 shrink-0" style={{ fontWeight: 500 }}>{r.value}{r.sub && <span className="text-stone-300 text-xs ml-1" style={{ fontWeight: 300 }}>{r.sub}</span>}</span>
          </div>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.round((r.value / max) * 100)}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Entonnoir (étapes décroissantes) ──
export function Funnel({ steps }: { steps: { label: string; value: number; hint?: string }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1)
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pctWidth = Math.max(6, Math.round((s.value / top) * 100))
        const prev = i === 0 ? s.value : steps[i - 1].value
        const conv = i === 0 ? null : prev > 0 ? Math.round((s.value / prev) * 1000) / 10 : null
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-40 shrink-0 text-right">
              <p className="text-stone-600 text-sm leading-tight" style={{ fontWeight: 300 }}>{s.label}</p>
              {s.hint && <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{s.hint}</p>}
            </div>
            <div className="flex-1">
              <div className="h-9 rounded-lg flex items-center justify-between px-3 text-white transition-all"
                   style={{ width: `${pctWidth}%`, minWidth: 64, background: `linear-gradient(90deg, ${SAGE_DARK}, ${SAGE})` }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1rem' }}>{s.value}</span>
              </div>
            </div>
            <div className="w-14 shrink-0 text-xs text-stone-400" style={{ fontWeight: 400 }}>
              {conv != null && <span>{conv}%</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Parcours observés (from → to) ──
export function FlowList({ flows, pageLabel }: {
  flows: { from: string; to: string; count: number }[]
  pageLabel: (p: string) => string
}) {
  if (flows.length === 0) return (
    <p className="text-stone-400 text-sm py-4 text-center" style={{ fontWeight: 300 }}>
      Pas encore de parcours observé (il faut au moins 2 pages dans une même visite).
    </p>
  )
  const max = Math.max(1, ...flows.map(f => f.count))
  return (
    <div className="space-y-2.5">
      {flows.map((f, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="px-2.5 py-1 rounded-lg bg-[#f5f0e8] text-stone-600 truncate max-w-[38%]" style={{ fontWeight: 300 }}>{pageLabel(f.from)}</span>
          <span className="text-stone-300">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#f5f0e8] text-stone-600 truncate max-w-[38%]" style={{ fontWeight: 300 }}>{pageLabel(f.to)}</span>
          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden mx-1">
            <div className="h-full rounded-full" style={{ width: `${Math.round((f.count / max) * 100)}%`, background: SAGE }} />
          </div>
          <span className="text-stone-400 shrink-0" style={{ fontWeight: 400 }}>{f.count}</span>
        </div>
      ))}
    </div>
  )
}

// ── Comparatif outils (3 métriques par outil) ──
export function ToolCompare({ tools }: {
  tools: { label: string; visitors: number; started: number; exported: number }[]
}) {
  const maxV = Math.max(1, ...tools.map(t => t.visitors))
  const metrics: { key: 'visitors' | 'started' | 'exported'; label: string; color: string }[] = [
    { key: 'visitors', label: 'Visiteurs', color: SAGE },
    { key: 'started', label: 'Démarrages', color: '#6b7c5e' },
    { key: 'exported', label: 'Résultats / exports', color: '#c2b59b' },
  ]
  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-xs text-stone-400" style={{ fontWeight: 400 }}>
        {metrics.map(m => <span key={m.key} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />{m.label}</span>)}
      </div>
      {tools.map((t, i) => (
        <div key={i}>
          <p className="text-stone-700 text-sm mb-1.5" style={{ fontWeight: 400 }}>{t.label}</p>
          <div className="space-y-1">
            {metrics.map(m => (
              <div key={m.key} className="flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((t[m.key] / maxV) * 100)}%`, background: m.color }} />
                </div>
                <span className="w-7 text-right text-xs text-stone-500" style={{ fontWeight: 400 }}>{t[m.key] || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
