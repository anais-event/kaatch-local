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
    <div className="w-full h-px bg-stone-200 relative overflow-hidden rounded-full">
      <div
        className="h-full bg-[#4a5240] rounded-full transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function ModuleCard({
  number,
  title,
  subtitle,
  description,
  progress,
  href,
  icon,
  locked,
}: {
  number: string
  title: string
  subtitle: string
  description: string
  progress: number
  href: string
  icon: React.ReactNode
  locked?: boolean
}) {
  const router = useRouter()
  const isComplete = progress === 100
  const hasStarted = progress > 0

  return (
    <button
      onClick={() => !locked && router.push(href)}
      disabled={locked}
      className={`group relative w-full text-left bg-white rounded-2xl border transition-all duration-300 overflow-hidden
        ${locked
          ? 'border-stone-100 opacity-50 cursor-not-allowed'
          : 'border-stone-100 hover:border-[#4a5240]/30 hover:shadow-[0_8px_40px_-12px_rgba(74,82,64,0.2)] cursor-pointer shadow-sm'
        }`}
    >
      {/* Coin décoratif */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <circle cx="100" cy="0" r="80" fill="#2d3228" />
        </svg>
      </div>

      {isComplete && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4a5240] flex items-center justify-center">
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div className="p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
            ${hasStarted || isComplete ? 'bg-[#4a5240]' : 'bg-stone-100 group-hover:bg-[#f5f0e8]'}`}>
            <span className={hasStarted || isComplete ? 'text-white' : 'text-stone-400'}>
              {icon}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            >
              {number}
            </p>
            <h3
              className="text-[#2d3228] leading-tight"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 500 }}
            >
              {title}
            </h3>
            <p
              className="text-stone-400 text-xs mt-0.5 leading-snug"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p
          className="text-stone-500 text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        >
          {description}
        </p>

        {/* Footer progression */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] tracking-widest uppercase text-stone-400"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            >
              {isComplete ? 'Complété' : hasStarted ? 'En cours' : 'À commencer'}
            </span>
            <span
              className="text-xs text-stone-400"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            >
              {progress}%
            </span>
          </div>
          <ProgressBar value={progress} />
          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-xs font-medium transition-colors
                ${locked ? 'text-stone-300' : isComplete
                  ? 'text-[#4a5240]'
                  : 'text-[#4a5240] group-hover:text-[#2d3228]'}`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 400, letterSpacing: '0.03em' }}
            >
              {locked ? 'Bientôt disponible' : isComplete ? 'Modifier' : hasStarted ? 'Continuer →' : 'Commencer →'}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function StudioDashboard({ slug, weddingName, guestCount, tableCount, progress }: Props) {
  const total = Math.round(
    (progress.collection + progress.destinataires + progress.univers + progress.reception) / 4
  )

  const modules = [
    {
      number: '01',
      title: 'Votre collection',
      subtitle: 'Sélection des créations',
      description: `Choisissez les pièces qui composeront votre papeterie — faire-part, menus, marque-places et bien plus.`,
      progress: progress.collection,
      href: `/mariage/${slug}/studio/collection`,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-5 h-5">
          <rect x="3" y="3" width="6" height="8" rx="1" />
          <rect x="11" y="3" width="6" height="5" rx="1" />
          <rect x="11" y="11" width="6" height="6" rx="1" />
          <rect x="3" y="14" width="6" height="3" rx="1" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Vos destinataires',
      subtitle: `${guestCount} invités · envois personnalisés`,
      description: `Attribuez chaque création à vos invités et renseignez les adresses pour vos envois postaux.`,
      progress: progress.destinataires,
      href: `/mariage/${slug}/studio/destinataires`,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l8 6 8-6" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Univers visuel',
      subtitle: 'Ambiance · palette · typographie',
      description: `Définissez l'esthétique qui unira toutes vos créations — une signature visuelle unique pour votre mariage.`,
      progress: progress.univers,
      href: `/mariage/${slug}/studio/univers`,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-5 h-5">
          <circle cx="10" cy="10" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 3v2M10 15v2M3 10h2M15 10h2M5.05 5.05l1.41 1.41M13.54 13.54l1.41 1.41M5.05 14.95l1.41-1.41M13.54 6.46l1.41-1.41" />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Éléments de réception',
      subtitle: `Programme · plan de table · ${tableCount > 0 ? `${tableCount} tables` : 'numéros'}`,
      description: `Complétez votre collection avec les pièces du jour J — programme de cérémonie et plan de table.`,
      progress: progress.reception,
      href: `/mariage/${slug}/studio/reception`,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h12M4 10h12M4 14h6" />
          <circle cx="15" cy="14" r="2.5" />
          <path strokeLinecap="round" d="M17 16.5l1.5 1.5" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-2xl mx-auto px-4 py-12 pb-32 md:py-16">

        {/* En-tête */}
        <div className="mb-12">
          <p
            className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            {weddingName}
          </p>
          <h1
            className="text-[#2d3228] mb-3"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 5vw, 2.8rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              fontStyle: 'italic',
            }}
          >
            Studio Créatif
          </h1>
          <p
            className="text-stone-500 text-sm leading-relaxed max-w-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            Composez la papeterie de votre mariage, pièce par pièce, à votre rythme.
          </p>
        </div>

        {/* Progression totale */}
        {total > 0 && (
          <div className="mb-10 p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs tracking-[0.15em] uppercase text-stone-400"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              >
                Progression de votre collection
              </span>
              <span
                className="text-sm text-[#4a5240]"
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem' }}
              >
                {total}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4a5240] rounded-full transition-all duration-1000"
                style={{ width: `${total}%` }}
              />
            </div>
          </div>
        )}

        {/* Ligne décorative */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-stone-200" />
          <span
            className="text-[10px] tracking-[0.2em] uppercase text-stone-300"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            4 modules
          </span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Grille modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {modules.map((mod) => (
            <ModuleCard key={mod.number} {...mod} />
          ))}
        </div>

        {/* CTA finaliser — affiché si tout complété */}
        {total === 100 && (
          <div className="text-center mb-8">
            <a
              href={`/mariage/${slug}/studio/finaliser`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#2d3228] text-white rounded-full hover:bg-[#1a1f17] transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em', fontSize: '0.85rem' }}
            >
              <span>Finaliser votre collection</span>
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        )}

        {/* Lien retour vers ancienne vue si besoin */}
        <div className="text-center">
          <a
            href={`/mariage/${slug}/impressions`}
            className="text-xs text-stone-300 hover:text-stone-400 transition-colors"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}
          >
            Accéder à l'ancien studio →
          </a>
        </div>

      </div>
    </div>
  )
}
