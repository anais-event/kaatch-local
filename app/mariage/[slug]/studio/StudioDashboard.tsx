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
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: '#e7e5e4' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: '#4a5240' }}
        />
      </div>
      <span style={{ fontWeight: 400, fontSize: '0.75rem', color: '#a8a29e', minWidth: 28, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

const ICONS = {
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

  const modules = [
    {
      key: 'collection' as const,
      num: '01',
      title: 'Votre collection',
      sub: 'Sélection des créations',
      progress: progress.collection,
      href: `/mariage/${slug}/studio/collection`,
    },
    {
      key: 'destinataires' as const,
      num: '02',
      title: 'Vos destinataires',
      sub: `${guestCount} invités · envois personnalisés`,
      progress: progress.destinataires,
      href: `/mariage/${slug}/studio/destinataires`,
    },
    {
      key: 'univers' as const,
      num: '03',
      title: 'Univers visuel',
      sub: 'Ambiance · palette · typographie',
      progress: progress.univers,
      href: `/mariage/${slug}/studio/univers`,
    },
    {
      key: 'reception' as const,
      num: '04',
      title: 'Éléments de réception',
      sub: `Programme · plan de table${tableCount > 0 ? ` · ${tableCount} tables` : ''}`,
      progress: progress.reception,
      href: `/mariage/${slug}/studio/reception`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28">

        {/* En-tête */}
        <div className="mb-5">
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em', color: '#a8a29e' }} className="uppercase mb-2">
                {weddingName}
              </p>
              <h1 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#2d3228', lineHeight: 1.2 }} className="mb-1">
                Studio Créatif
              </h1>
              <p style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c' }}>
                Composez la papeterie de votre mariage, pièce par pièce.
              </p>
            </div>
            <a
              href={total === 100 ? `/mariage/${slug}/studio/finaliser` : undefined}
              onClick={total < 100 ? (e) => e.preventDefault() : undefined}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                total === 100
                  ? 'bg-[#2d3228] text-white hover:bg-[#2d3228]/90 cursor-pointer'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              style={{ fontWeight: 400, fontSize: '0.82rem', flexShrink: 0 }}
              title={total < 100 ? 'Complétez tous les modules pour finaliser' : undefined}
            >
              Finaliser {total === 100 ? '✨' : `(${total}%)`}
            </a>
          </div>
        </div>

        {/* Progression globale */}
        {total > 0 && (
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm px-6 py-4 mb-4 flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#57534e' }}>
                  Progression totale
                </span>
              </div>
              <ProgressBar value={total} />
            </div>
            {total === 100 && (
              <span style={{ fontSize: '1.2rem' }}>🎉</span>
            )}
          </div>
        )}

        {/* Grid 2×2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((mod) => {
            const done    = mod.progress === 100
            const started = mod.progress > 0 && !done
            const label   = done ? 'Modifier' : started ? 'Continuer' : 'Commencer'

            return (
              <button
                key={mod.key}
                onClick={() => router.push(mod.href)}
                className="group bg-white rounded-xl text-left flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 1px 6px 0 rgba(0,0,0,0.05)',
                  padding: '1.1rem',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(0,0,0,0.09)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 6px 0 rgba(0,0,0,0.05)')}
              >
                {/* Top row : numéro + icône */}
                <div className="flex items-start justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', letterSpacing: '0.08em' }}>
                    {mod.num}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: done ? '#4a5240' : 'rgba(74,82,64,0.10)',
                      color: done ? '#fff' : '#4a5240',
                    }}
                  >
                    {done
                      ? <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : ICONS[mod.key]
                    }
                  </div>
                </div>

                {/* Titre + sous-titre */}
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2d3228', lineHeight: 1.25 }} className="mb-1">
                    {mod.title}
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.78rem', color: '#78716c' }}>
                    {mod.sub}
                  </p>
                </div>

                {/* Progression */}
                <div className="flex flex-col gap-3">
                  <ProgressBar value={mod.progress} />
                  <div className="flex justify-end">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-white transition-all duration-150"
                      style={{
                        background: '#4a5240',
                        fontWeight: 400,
                        fontSize: '0.8rem',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {label} →
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA finaliser */}
        {total === 100 && (
          <div className="mt-8">
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
