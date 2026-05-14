'use client'

import { useRouter } from 'next/navigation'

type Props = {
  slug: string
  weddingName: string
  guestCount: number
  tableCount: number
  progress: {
    collection: number
    destinataires: number
    univers: number
    reception: number
  }
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: '#e7e5e4' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: value === 100 ? '#4a5240' : '#7d8a70' }}
        />
      </div>
      <span style={{ fontWeight: 400, fontSize: '0.7rem', color: '#a8a29e', minWidth: 26, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

type ModuleKey = 'collection' | 'destinataires' | 'univers' | 'reception'

const CARD_ACCENTS: Record<ModuleKey, { bg: string; iconBg: string; border: string }> = {
  collection:    { bg: 'rgba(243,238,228,0.6)', iconBg: '#f0e9d8', border: '#e8dfc8' },
  destinataires: { bg: 'rgba(237,242,237,0.5)', iconBg: '#e2ede2', border: '#d4e4d4' },
  univers:       { bg: 'rgba(240,236,248,0.5)', iconBg: '#ede8f5', border: '#ddd6ee' },
  reception:     { bg: 'rgba(255,248,240,0.6)', iconBg: '#fdf0e0', border: '#f5e4c8' },
}

const ICONS: Record<ModuleKey, React.ReactNode> = {
  collection: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="11" width="8" height="9" rx="1.5" />
      <rect x="3" y="15" width="7" height="5" rx="1.5" />
    </svg>
  ),
  destinataires: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l10 7 10-7" />
    </svg>
  ),
  univers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3M5.22 5.22l2.12 2.12M16.66 16.66l2.12 2.12M5.22 18.78l2.12-2.12M16.66 7.34l2.12-2.12" />
    </svg>
  ),
  reception: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h9" />
      <circle cx="18" cy="16" r="3" />
      <path strokeLinecap="round" d="M20.5 18.5l2 2" />
    </svg>
  ),
}

export default function StudioDashboard({ slug, weddingName, guestCount, tableCount, progress }: Props) {
  const router = useRouter()

  const total = Math.round(
    (progress.collection + progress.destinataires + progress.univers + progress.reception) / 4
  )

  const modules: { key: ModuleKey; num: string; title: string; sub: string; progress: number; href: string }[] = [
    {
      key: 'collection',
      num: '01',
      title: 'Votre collection',
      sub: 'Sélection des créations',
      progress: progress.collection,
      href: `/mariage/${slug}/studio/collection`,
    },
    {
      key: 'destinataires',
      num: '02',
      title: 'Vos destinataires',
      sub: `${guestCount} invités · envois personnalisés`,
      progress: progress.destinataires,
      href: `/mariage/${slug}/studio/destinataires`,
    },
    {
      key: 'univers',
      num: '03',
      title: 'Univers visuel',
      sub: 'Ambiance · palette · typographie',
      progress: progress.univers,
      href: `/mariage/${slug}/studio/univers`,
    },
    {
      key: 'reception',
      num: '04',
      title: 'Éléments de réception',
      sub: `Programme · plan de table${tableCount > 0 ? ` · ${tableCount} tables` : ''}`,
      progress: progress.reception,
      href: `/mariage/${slug}/studio/reception`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Bannière hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4a5240 0%, #3a4232 60%, #2d3228 100%)',
          padding: '2rem 1.5rem 1.8rem',
        }}
      >
        {/* Décoration florale SVG */}
        <svg
          viewBox="0 0 200 200"
          className="absolute opacity-10 pointer-events-none"
          style={{ width: 220, height: 220, top: -40, right: -40 }}
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M100 40 Q120 70 100 100 Q80 70 100 40Z" fill="white" opacity="0.4" />
          <path d="M100 160 Q120 130 100 100 Q80 130 100 160Z" fill="white" opacity="0.4" />
          <path d="M40 100 Q70 80 100 100 Q70 120 40 100Z" fill="white" opacity="0.4" />
          <path d="M160 100 Q130 80 100 100 Q130 120 160 100Z" fill="white" opacity="0.4" />
          <circle cx="100" cy="100" r="8" fill="white" opacity="0.6" />
        </svg>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p
                style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}
                className="uppercase mb-2"
              >
                {weddingName}
              </p>
              <h1 style={{ fontWeight: 700, fontSize: '1.7rem', color: '#fff', lineHeight: 1.15 }} className="mb-1.5">
                Studio Créatif
              </h1>
              <p style={{ fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                Composez la papeterie de votre mariage, pièce par pièce.
              </p>
            </div>

            {/* Progression globale + bouton finaliser */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <a
                href={total === 100 ? `/mariage/${slug}/studio/finaliser` : undefined}
                onClick={total < 100 ? (e) => e.preventDefault() : undefined}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                  total === 100
                    ? 'bg-white text-[#2d3228] hover:bg-stone-50 cursor-pointer font-medium'
                    : 'bg-white/15 text-white/50 cursor-not-allowed'
                }`}
                style={{ fontWeight: 400, fontSize: '0.82rem' }}
                title={total < 100 ? 'Complétez tous les modules pour finaliser' : undefined}
              >
                {total === 100 ? '✨ Finaliser' : `Finaliser (${total}%)`}
              </a>
              {total > 0 && (
                <div className="flex items-center gap-2" style={{ minWidth: 120 }}>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${total}%`, background: 'rgba(255,255,255,0.7)', transition: 'width 0.7s' }} />
                  </div>
                  <span style={{ fontWeight: 300, fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{total}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2×2 */}
      <div className="max-w-4xl mx-auto px-4 py-5 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((mod) => {
            const done    = mod.progress === 100
            const started = mod.progress > 0 && !done
            const accent  = CARD_ACCENTS[mod.key]
            const ctaLabel = done ? 'Modifier' : started ? 'Continuer' : 'Commencer'

            return (
              <button
                key={mod.key}
                onClick={() => router.push(mod.href)}
                className="group text-left flex flex-col gap-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                style={{
                  background: accent.bg,
                  border: `1px solid ${accent.border}`,
                  boxShadow: '0 1px 6px 0 rgba(0,0,0,0.05)',
                  padding: '1.1rem',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(0,0,0,0.09)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 6px 0 rgba(0,0,0,0.05)')}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.68rem', color: '#a8a29e', letterSpacing: '0.1em' }}>
                    {mod.num}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Badge statut */}
                    {done && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white"
                        style={{ background: '#4a5240', fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.04em' }}
                      >
                        <svg viewBox="0 0 10 10" fill="none" className="w-2 h-2">
                          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Validé
                      </span>
                    )}
                    {started && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: '#f5e9d0', color: '#9a7040', fontWeight: 400, fontSize: '0.6rem', letterSpacing: '0.04em' }}
                      >
                        En cours
                      </span>
                    )}
                    {/* Icône */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: accent.iconBg, color: '#4a5240' }}
                    >
                      {ICONS[mod.key]}
                    </div>
                  </div>
                </div>

                {/* Titre + sous-titre */}
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2d3228', lineHeight: 1.25 }} className="mb-0.5">
                    {mod.title}
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.75rem', color: '#78716c' }}>
                    {mod.sub}
                  </p>
                </div>

                {/* Progression + CTA */}
                <div className="flex flex-col gap-2.5">
                  <ProgressBar value={mod.progress} />
                  <div className="flex justify-end">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md transition-all duration-150"
                      style={{
                        background: done ? 'transparent' : '#4a5240',
                        color: done ? '#4a5240' : 'white',
                        border: done ? '1px solid #4a5240' : '1px solid transparent',
                        fontWeight: 400,
                        fontSize: '0.78rem',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {ctaLabel} →
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {total === 100 && (
          <div className="mt-4">
            <a
              href={`/mariage/${slug}/studio/finaliser`}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white transition-all"
              style={{ background: '#2d3228', fontWeight: 400, fontSize: '0.9rem' }}
            >
              Finaliser votre collection ✨
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
