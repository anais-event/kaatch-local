'use client'

import { useState, useEffect } from 'react'

type Props = {
  weddingName: string
  dateStr: string | null
  location: string | null
  coupleMessage: string | null
  coverImageUrl: string | null
  slug: string
}

export default function FairePartEnvelope({ weddingName, dateStr, location, coupleMessage, coverImageUrl, slug }: Props) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open' | 'revealed'>('closed')

  // Auto-ouvre l'enveloppe après 0.8s
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('opening'), 800)
    const t2 = setTimeout(() => setPhase('open'), 1800)
    const t3 = setTimeout(() => setPhase('revealed'), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-6 py-16 overflow-hidden"
         style={{ fontFamily: 'var(--font-lato)' }}>

      <style>{`
        @keyframes flap-open {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes card-rise {
          0%   { transform: translateY(60px); opacity: 0; }
          100% { transform: translateY(0px);  opacity: 1; }
        }
        @keyframes fade-in-card {
          0%   { opacity: 0; transform: scale(0.96) translateY(16px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes envelope-drop {
          0%   { opacity: 1; transform: translateY(0)   scale(1); }
          100% { opacity: 0; transform: translateY(60px) scale(0.9); }
        }
        .flap-open {
          animation: flap-open 0.9s cubic-bezier(0.4,0,0.2,1) forwards;
          transform-origin: top center;
        }
        .card-rise {
          animation: card-rise 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .envelope-drop {
          animation: envelope-drop 0.5s ease-in forwards;
        }
        .faire-part-revealed {
          animation: fade-in-card 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>

      {/* === ENVELOPPE === */}
      {phase !== 'revealed' && (
        <div className={`relative select-none ${phase === 'open' ? 'envelope-drop' : ''}`}
             style={{ width: 320, height: 220 }}>

          {/* Corps de l'enveloppe */}
          <div className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #f0ebe0, #e8e2d6)', border: '1px solid #d6cfc2' }}>

            {/* Triangle bas gauche (intérieur) */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: 0, height: 0,
              borderStyle: 'solid',
              borderWidth: '110px 160px 0 0',
              borderColor: '#ddd7c9 transparent transparent transparent',
            }} />
            {/* Triangle bas droit */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 0, height: 0,
              borderStyle: 'solid',
              borderWidth: '110px 0 0 160px',
              borderColor: '#d9d3c5 transparent transparent transparent',
            }} />
            {/* Triangle centre bas */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderStyle: 'solid',
              borderWidth: '0 160px 110px 160px',
              borderColor: 'transparent transparent #cec8ba transparent',
            }} />

            {/* Carte visible à l'intérieur (phase open) */}
            {phase === 'open' && (
              <div className="card-rise absolute left-4 right-4 bottom-4 bg-white rounded-xl flex items-center justify-center"
                   style={{ height: 130 }}>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem', color: '#4a5240', fontWeight: 600 }}>
                  {weddingName}
                </p>
              </div>
            )}
          </div>

          {/* RABAT (flap) - perspective 3D */}
          <div style={{ perspective: '800px', position: 'absolute', top: 0, left: 0, right: 0, height: 110 }}>
            <div className={phase === 'opening' || phase === 'open' ? 'flap-open' : ''}
                 style={{
                   position: 'absolute', top: 0, left: 0, right: 0, height: 110,
                   transformStyle: 'preserve-3d',
                 }}>
              {/* Face avant du rabat */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, #ebe5d9, #ddd7c9)',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                borderRadius: '16px 16px 0 0',
                borderTop: '1px solid #cec8ba',
              }} />
            </div>
          </div>

          {/* Sceau en cire */}
          {phase === 'closed' && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 48, height: 48,
              background: 'radial-gradient(circle at 35% 35%, #7a4a2a, #5a2e10)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(90,46,16,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f0c080',
              fontSize: '1.1rem',
              zIndex: 10,
            }}>
              ✦
            </div>
          )}

          {/* Texte phase fermée */}
          {phase === 'closed' && (
            <div style={{
              position: 'absolute', bottom: -40, left: 0, right: 0,
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.9rem',
                          color: '#9a9187', fontWeight: 300 }}>
                Votre faire-part s'ouvre…
              </p>
            </div>
          )}
        </div>
      )}

      {/* === FAIRE-PART RÉVÉLÉ === */}
      {phase === 'revealed' && (
        <div className="faire-part-revealed w-full max-w-sm">

          {coverImageUrl && (
            <div className="rounded-2xl overflow-hidden mb-0 shadow-lg">
              <img src={coverImageUrl} alt={weddingName}
                   className="w-full object-cover" style={{ maxHeight: '260px', objectFit: 'cover' }} />
            </div>
          )}

          <div className={`bg-white shadow-xl px-8 py-10 text-center ${coverImageUrl ? 'rounded-b-2xl' : 'rounded-2xl'}`}>

            <div className="w-8 h-0.5 bg-[#4a5240] mx-auto mb-6" />

            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '0.85rem',
                        fontStyle: 'italic', letterSpacing: '0.15em' }}
               className="text-stone-400 uppercase mb-3">
              Vous êtes invité(e) à notre mariage
            </p>

            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600,
                         fontSize: 'clamp(2rem, 8vw, 2.8rem)', lineHeight: 1.1 }}
                className="text-[#2d3228] mb-5">
              {weddingName}
            </h1>

            {dateStr && (
              <p style={{ fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.04em' }}
                 className="text-stone-500 capitalize mb-2">
                {dateStr}
              </p>
            )}

            {location && (
              <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mb-5">
                📍 {location}
              </p>
            )}

            {(dateStr || location) && <div className="w-8 h-px bg-stone-200 mx-auto mb-5" />}

            {coupleMessage ? (
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '1.1rem',
                          fontStyle: 'italic', lineHeight: 1.6 }}
                 className="text-stone-600 mb-6">
                &ldquo;{coupleMessage}&rdquo;
              </p>
            ) : (
              <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }}
                 className="text-stone-500 mb-6">
                Nous sommes tellement heureux de vous compter parmi nos invités.<br />
                Votre présence rendra ce jour encore plus inoubliable. 🌸
              </p>
            )}

            <a href={`/invite/${slug}`}
               className="inline-block text-xs text-[#4a5240] border border-[#4a5240]/40 px-5 py-2.5 rounded-full hover:bg-[#4a5240] hover:text-white transition"
               style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
              ← Retour
            </a>
          </div>

          <p className="text-center mt-6 text-[10px] text-stone-400 tracking-widest uppercase"
             style={{ fontWeight: 300 }}>
            Envoyé avec ♥ via{' '}
            <span style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.85rem' }}>Kaatch</span>
          </p>
        </div>
      )}
    </div>
  )
}
