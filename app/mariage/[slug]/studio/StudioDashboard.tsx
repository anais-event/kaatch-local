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
    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: '#4a5240' }}
      />
    </div>
  )
}

const ICONS = {
  collection: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <rect x="3" y="3" width="6" height="7" rx="1" />
      <rect x="11" y="3" width="6" height="4" rx="1" />
      <rect x="11" y="10" width="6" height="7" rx="1" />
      <rect x="3" y="13" width="6" height="4" rx="1" />
    </svg>
  ),
  destinataires: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l8 6 8-6" />
    </svg>
  ),
  univers: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <circle cx="10" cy="10" r="3" />
      <path strokeLinecap="round" d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
    </svg>
  ),
  reception: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h12M4 9h12M4 13h7" />
      <circle cx="15" cy="14.5" r="2.5" />
      <path strokeLinecap="round" d="M17 16.5l1.5 1.5" />
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
      desc: `Choisissez les pièces de votre papeterie — faire-part, menus, marque-places et plus.`,
      progress: progress.collection,
      href: `/mariage/${slug}/studio/collection`,
    },
    {
      key: 'destinataires' as const,
      num: '02',
      title: 'Vos destinataires',
      sub: `${guestCount} invités · envois personnalisés`,
      desc: `Attribuez chaque création à vos invités et renseignez les adresses pour l'envoi.`,
      progress: progress.destinataires,
      href: `/mariage/${slug}/studio/destinataires`,
    },
    {
      key: 'univers' as const,
      num: '03',
      title: 'Univers visuel',
      sub: 'Ambiance · palette · typographie',
      desc: `Définissez l'esthétique qui unira toutes vos créations en une signature unique.`,
      progress: progress.univers,
      href: `/mariage/${slug}/studio/univers`,
    },
    {
      key: 'reception' as const,
      num: '04',
      title: 'Éléments de réception',
      sub: `Programme · plan de table${tableCount > 0 ? ` · ${tableCount} tables` : ''}`,
      desc: `Complétez avec les pièces du jour J — programme de cérémonie et plan de table.`,
      progress: progress.reception,
      href: `/mariage/${slug}/studio/reception`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6">

        {/* En-tête */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }}
            className="text-stone-400 uppercase mb-2">
            {weddingName}
          </p>
          <h1 style={{ fontWeight: 600, fontSize: '1.4rem', lineHeight: 1.2 }}
            className="text-[#2d3228] mb-1">
            Studio Créatif
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-500">
            Composez la papeterie de votre mariage, pièce par pièce.
          </p>
        </div>

        {/* Progression globale */}
        {total > 0 && (
          <div className="bg-white rounded-xl border border-stone-100 px-4 py-3 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.1em' }}
                  className="text-stone-400 uppercase">
                  Progression totale
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#4a5240]">
                  {total}%
                </span>
              </div>
              <ProgressBar value={total} />
            </div>
          </div>
        )}

        {/* Grid modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((mod) => {
            const done = mod.progress === 100
            const started = mod.progress > 0

            return (
              <button
                key={mod.key}
                onClick={() => router.push(mod.href)}
                className="group bg-white rounded-xl border border-stone-100 p-5 text-left hover:border-[#4a5240]/30 hover:shadow-sm transition-all duration-200 flex flex-col gap-4"
              >
                {/* Top : badge num + icône */}
                <div className="flex items-center justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.15em' }}
                    className="text-stone-300 uppercase">
                    {mod.num}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${done ? 'bg-[#4a5240] text-white' : started ? 'bg-[#4a5240]/10 text-[#4a5240]' : 'bg-stone-50 text-stone-400'}`}>
                    {done ? (
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                        <path d="M3 8l3 3 7-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : ICONS[mod.key]}
                  </div>
                </div>

                {/* Titre + sous-titre */}
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }} className="text-[#2d3228] mb-0.5">
                    {mod.title}
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.05em' }} className="text-stone-400">
                    {mod.sub}
                  </p>
                </div>

                {/* Description */}
                <p style={{ fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.5 }} className="text-stone-500 flex-1">
                  {mod.desc}
                </p>

                {/* Progression + CTA */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.1em' }}
                      className="text-stone-400 uppercase">
                      {done ? 'Complété' : started ? 'En cours' : 'À commencer'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.72rem' }} className="text-stone-400">
                      {mod.progress}%
                    </span>
                  </div>
                  <ProgressBar value={mod.progress} />
                  <div className="flex justify-end pt-0.5">
                    <span style={{ fontWeight: 400, fontSize: '0.75rem' }}
                      className="text-[#4a5240] group-hover:text-[#2d3228] transition-colors">
                      {done ? 'Modifier →' : started ? 'Continuer →' : 'Commencer →'}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA finaliser */}
        {total === 100 && (
          <a
            href={`/mariage/${slug}/studio/finaliser`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#2d3228] text-white rounded-xl hover:bg-[#1a1f17] transition-colors"
            style={{ fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.03em' }}
          >
            Finaliser votre collection
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}

        {/* Lien ancien studio */}
        <div className="text-center pt-2">
          <a href={`/mariage/${slug}/impressions`}
            className="text-xs text-stone-300 hover:text-stone-400 transition-colors"
            style={{ fontWeight: 300, letterSpacing: '0.05em' }}>
            Accéder à l'ancien studio →
          </a>
        </div>

      </div>
    </div>
  )
}
