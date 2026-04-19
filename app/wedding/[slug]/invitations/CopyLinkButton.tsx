'use client'

import { useState, useRef, useEffect } from 'react'

type WeddingPreview = {
  name: string
  date: string | null
  location: string | null
  coverImageUrl: string | null
  coupleMessage: string | null
}

async function markSent(guestId: string) {
  try {
    await fetch('/api/invite-sent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId }),
    })
  } catch {}
}

export default function CopyLinkButton({
  url,
  guestName,
  gender,
  slug,
  wedding,
  guestId,
}: {
  url: string
  guestName: string
  gender?: 'M' | 'F' | null
  slug?: string
  wedding?: WeddingPreview
  guestId?: string
}) {
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const firstName = guestName?.split(' ')[0] ?? guestName

  const salutation = gender === 'F'
    ? `Chère ${firstName},`
    : gender === 'M'
    ? `Cher ${firstName},`
    : `Cher(e) ${firstName},`

  const dateFormatted = wedding?.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setDropdownOpen(false)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappMsg = encodeURIComponent(
    `${salutation}\n\nVoici ton invitation personnalisée pour notre mariage${wedding?.name ? ` — ${wedding.name}` : ''} :\n${url}\n\nÀ très vite ! 🥂`
  )

  const emailSubject = encodeURIComponent(`Ton invitation — ${wedding?.name ?? 'Notre mariage'}`)
  const emailBody = encodeURIComponent(
    `${salutation}\n\nNous sommes ravis de t'inviter à célébrer notre mariage !\n\nAccède à ton espace personnel ici :\n${url}\n\nTu pourras y confirmer ta présence, consulter le programme et bien plus encore.\n\nÀ très vite,\n${wedding?.name ?? 'Les mariés'}`
  )

  function printFairepart() {
    setPreview(true)
    setDropdownOpen(false)
    setTimeout(() => window.print(), 400)
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bouton principal */}
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer whitespace-nowrap ${
            copied
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'border-stone-200 text-stone-600 hover:border-[#4a5240] hover:text-[#4a5240]'
          }`}
          style={{ fontWeight: 300 }}>
          {copied ? '✓ Copié !' : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Partager
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 z-50 min-w-[200px]">

            {/* Copier le lien */}
            <button onClick={copy}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition text-left cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">Copier le lien</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Collez-le où vous voulez</p>
              </div>
            </button>

            {/* WhatsApp */}
            <a href={`https://wa.me/?text=${whatsappMsg}`}
               target="_blank" rel="noopener noreferrer"
               onClick={() => { setDropdownOpen(false); if (guestId) markSent(guestId) }}
               className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition cursor-pointer">
              <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">WhatsApp</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Message personnalisé prêt</p>
              </div>
            </a>

            {/* Email */}
            <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
               onClick={() => { setDropdownOpen(false); if (guestId) markSent(guestId) }}
               className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">Email</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Ouvre votre messagerie</p>
              </div>
            </a>

            <div className="border-t border-stone-100 my-1" />

            {/* Aperçu */}
            <button onClick={() => { setPreview(true); setDropdownOpen(false) }}
               className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition text-left cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">Aperçu du faire-part</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Voir ce que recevra {firstName}</p>
              </div>
            </button>

          </div>
        )}
      </div>

      {/* Modale aperçu faire-part */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm print:hidden"
          onClick={e => { if (e.target === e.currentTarget) setPreview(false) }}>

          <div className="relative flex flex-col shadow-2xl"
               style={{ width: '380px', maxHeight: '92vh', borderRadius: '24px', overflow: 'hidden' }}>

            {/* Barre d'actions */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f5f0e8] shrink-0">
              <p style={{ fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.1em', color: '#a8a29e' }}>
                APERÇU — {firstName.toUpperCase()}
              </p>
              <div className="flex items-center gap-3">
                {slug && (
                  <a href={`/wedding/${slug}/edit`} target="_blank" rel="noopener noreferrer"
                     style={{ fontWeight: 300, fontSize: '0.72rem', color: '#4a5240' }}
                     className="hover:underline">
                    ✏ Modifier
                  </a>
                )}
                <button onClick={() => window.open(url, '_blank')}
                  className="text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer"
                  style={{ fontWeight: 300 }}
                  title="Ouvrir le faire-part dans un nouvel onglet pour imprimer">
                  🖨 Imprimer
                </button>
                <button onClick={() => setPreview(false)}
                  className="text-stone-400 hover:text-stone-700 transition text-lg leading-none cursor-pointer">
                  ×
                </button>
              </div>
            </div>

            {/* Carte faire-part scrollable */}
            <div className="overflow-y-auto bg-white" id="fairepart-print" style={{ fontFamily: 'Georgia, serif' }}>

              {/* Photo couverture */}
              <div className="relative w-full" style={{ height: '260px' }}>
                {wedding?.coverImageUrl
                  ? <img src={wedding.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #4a5240 0%, #2d3228 100%)' }} />
                }
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
              </div>

              {/* Corps */}
              <div className="bg-white px-8 py-8">
                <p className="text-center mb-6"
                   style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.25rem', color: '#4a5240', fontWeight: 400 }}>
                  {salutation}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e7e5e4' }} />
                  <span style={{ color: '#d6d3d1', fontSize: '10px', letterSpacing: '0.3em' }}>✦</span>
                  <div style={{ flex: 1, height: '1px', background: '#e7e5e4' }} />
                </div>

                <h1 className="text-center mb-2"
                    style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '2.2rem', color: '#2d3228', lineHeight: 1.1 }}>
                  {wedding?.name ?? '—'}
                </h1>

                <p className="text-center mb-8"
                   style={{ fontWeight: 400, fontSize: '0.7rem', letterSpacing: '0.22em', color: '#a8a29e', fontFamily: 'system-ui, sans-serif' }}>
                  vous invitent à célébrer leur mariage
                </p>

                <div className="text-center mb-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {dateFormatted && (
                    <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem', color: '#4a5240', fontWeight: 400 }}
                       className="capitalize">
                      {dateFormatted}
                    </p>
                  )}
                  {wedding?.location && (
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 400, fontSize: '0.68rem', letterSpacing: '0.22em', color: '#a8a29e' }}
                       className="uppercase">
                      {wedding.location}
                    </p>
                  )}
                </div>

                {wedding?.coupleMessage && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ flex: 1, height: '1px', background: '#f5f5f4' }} />
                      <span style={{ color: '#e7e5e4', fontSize: '10px' }}>✦</span>
                      <div style={{ flex: 1, height: '1px', background: '#f5f5f4' }} />
                    </div>
                    <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.22em', color: '#c5bfba', textAlign: 'center', marginBottom: '14px', fontFamily: 'system-ui, sans-serif' }}>
                      LE MOT DES MARIÉS
                    </p>
                    <p className="text-center mb-8"
                       style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.95rem', color: '#78716c', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                      «&nbsp;{wedding.coupleMessage}&nbsp;»
                    </p>
                  </>
                )}

                <div style={{ background: '#4a5240', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'white', letterSpacing: '0.06em' }}>
                    Accéder à mon espace →
                  </p>
                </div>

                <p className="text-center mt-6"
                   style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em', color: '#d6d3d1' }}>
                  Organisé avec Kaatch
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
