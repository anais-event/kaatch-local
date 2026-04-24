'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

type Props = {
  weddingName: string
  dateStr: string | null
  location: string | null
  coupleMessage: string | null
  coverImageUrl: string | null
  slug: string
}

// 28 petals — deterministic positions using formulas
const PETALS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 13 + 7) % 100,           // 0-99 % from left
  delay: (i * 7 + 3) % 40 * 0.1,   // 0–4s delay
  duration: 3.5 + ((i * 11) % 30) * 0.1, // 3.5–6.5s
  size: 8 + (i * 5) % 14,           // 8–22px
  rotation: (i * 37) % 360,
  color: ['#fce4ec', '#f8bbd0', '#ffffff', '#fff0f5', '#fce4ec', '#f8bbd0'][i % 6],
  sway: ((i * 17) % 3) - 1,         // -1, 0, 1
}))

export default function FairePartEnvelope({ weddingName, dateStr, location, coupleMessage, coverImageUrl, slug }: Props) {
  const [phase, setPhase] = useState<'sealed' | 'blooming' | 'revealed'>('sealed')
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('blooming'), 1200)
    const t2 = setTimeout(() => setPhase('revealed'), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // QR code generation
  useEffect(() => {
    if (phase !== 'revealed' || !qrRef.current) return
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://kaatch.fr'}/invite/${slug}`
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(qrRef.current!, url, {
        width: 120,
        margin: 1,
        color: { dark: '#2C3B2E', light: '#ffffff' },
      })
    }).catch(() => {})
  }, [phase, slug])

  const bgColor = phase === 'sealed' ? '#1a2419' : '#f5f0e8'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: bgColor,
        transition: 'background 0.8s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-lato)',
        zIndex: 50,
      }}
    >
      <style>{`
        @keyframes pulse-seal {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(139,30,30,0.4); }
          50% { transform: translate(-50%, -50%) scale(1.06); box-shadow: 0 0 0 16px rgba(139,30,30,0); }
        }
        @keyframes petal-fall {
          0%   { transform: translateY(-40px) rotate(var(--r0)) translateX(0px); opacity: 0; }
          5%   { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(var(--r1)) translateX(var(--sway)); opacity: 0; }
        }
        @keyframes card-reveal {
          0%   { opacity: 0; transform: scale(0.94) translateY(60px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-up-text {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .seal-pulse {
          animation: pulse-seal 2s ease-in-out infinite;
        }
        .card-revealed {
          animation: card-reveal 0.9s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
        }
        .text-fade-up {
          animation: fade-up-text 0.6s ease forwards 0.3s;
          opacity: 0;
        }
      `}</style>

      {/* ── PETALS (blooming + revealed) ── */}
      {(phase === 'blooming' || phase === 'revealed') && PETALS.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            top: 0,
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.3,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: p.color,
            opacity: 0,
            animationName: 'petal-fall',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
            '--r0': `${p.rotation}deg`,
            '--r1': `${p.rotation + 180}deg`,
            '--sway': `${p.sway * 40}px`,
            pointerEvents: 'none',
            zIndex: 10,
          } as React.CSSProperties}
        />
      ))}

      {/* ── SEALED phase ── */}
      {phase === 'sealed' && (
        <>
          {/* Wax seal */}
          <div
            className="seal-pulse"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #8b1e1e, #5a0e0e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f0c080',
              fontSize: '2rem',
              boxShadow: '0 4px 24px rgba(90,14,14,0.5)',
              zIndex: 20,
            }}
          >
            ✦
          </div>
          <p
            style={{
              position: 'absolute',
              top: 'calc(50% + 70px)',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'rgba(240,232,220,0.6)',
              fontWeight: 300,
              whiteSpace: 'nowrap',
            }}
          >
            Un instant…
          </p>
        </>
      )}

      {/* ── REVEALED phase: card ── */}
      {phase === 'revealed' && (
        <div
          className="card-revealed"
          style={{
            position: 'relative',
            zIndex: 20,
            width: '100%',
            maxWidth: 400,
            margin: '0 auto',
            padding: '24px 16px',
            maxHeight: '100vh',
            overflowY: 'auto',
          }}
        >
          {coverImageUrl && (
            <div className="rounded-2xl overflow-hidden mb-0 shadow-lg">
              <img
                src={coverImageUrl}
                alt={weddingName}
                className="w-full object-cover"
                style={{ maxHeight: 220, objectFit: 'cover' }}
              />
            </div>
          )}

          <div
            className={`bg-white shadow-2xl px-8 py-10 text-center ${coverImageUrl ? 'rounded-b-2xl' : 'rounded-2xl'}`}
          >
            <div className="w-8 h-0.5 bg-[#4a5240] mx-auto mb-6" />

            <p
              className="text-fade-up text-stone-400 uppercase mb-3"
              style={{
                fontFamily: 'var(--font-lato)',
                fontWeight: 600,
                fontSize: '0.72rem',
                letterSpacing: '0.15em',
              }}
            >
              Vous êtes invité(e) à notre mariage
            </p>

            <h1
              className="text-fade-up text-[#2d3228] mb-5"
              style={{
                fontFamily: 'var(--font-lato)',
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 7vw, 2.2rem)',
                lineHeight: 1.1,
                animationDelay: '0.45s',
              }}
            >
              {weddingName}
            </h1>

            {dateStr && (
              <p
                className="text-stone-500 capitalize mb-2"
                style={{ fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.04em' }}
              >
                {dateStr}
              </p>
            )}

            {location && (
              <p className="text-stone-400 mb-5" style={{ fontWeight: 300, fontSize: '0.8rem' }}>
                📍 {location}
              </p>
            )}

            {(dateStr || location) && <div className="w-8 h-px bg-stone-200 mx-auto mb-5" />}

            {coupleMessage ? (
              <p
                className="text-stone-600 mb-6"
                style={{
                  fontFamily: 'var(--font-lato)',
                  fontWeight: 300,
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{coupleMessage}&rdquo;
              </p>
            ) : (
              <p
                className="text-stone-500 mb-6"
                style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }}
              >
                Nous sommes tellement heureux de vous compter parmi nos invités.<br />
                Votre présence rendra ce jour encore plus inoubliable.
              </p>
            )}

            {/* QR code */}
            <div className="flex flex-col items-center gap-2 mt-4 mb-6">
              <canvas ref={qrRef} width={120} height={120} style={{ borderRadius: 8 }} />
              <p
                className="text-stone-400"
                style={{ fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 300 }}
              >
                Votre lien personnel
              </p>
            </div>

            <a
              href={`/invite/${slug}`}
              className="inline-block text-xs text-[#4a5240] border border-[#4a5240]/40 px-5 py-2.5 rounded-full hover:bg-[#4a5240] hover:text-white transition"
              style={{ fontWeight: 300, letterSpacing: '0.06em' }}
            >
              ← Retour
            </a>
          </div>

          <p
            className="text-center mt-6 text-[10px] text-stone-400 tracking-widest uppercase"
            style={{ fontWeight: 300 }}
          >
            Envoyé avec ♥ via{' '}
            <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '0.75rem' }}>
              Kaatch
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
