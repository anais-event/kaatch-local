'use client'

import { useEffect, useRef, forwardRef } from 'react'

export type ThemeKey = 'classique' | 'champetre' | 'romantique'

export const THEMES: Record<ThemeKey, {
  label: string
  bg: string
  night: string
  curtain: string
  curtainShadow: string
  accent: string
  starColors: string[]
  sparkleColor: string
  glowColor: string
  textColor: string
  subtleText: string
  borderColor: string
  confirmText: string
  qrDark: string
  qrLight: string
}> = {
  classique: {
    label: 'Classique',
    bg: '#4a5639',
    night: '#0b1209',
    curtain: '#0e1a0b',
    curtainShadow: 'rgba(0,0,0,0.6)',
    accent: '#c9a96e',
    starColors: ['#e2c97e', '#c9a96e', '#f5e6c0', 'rgba(255,255,255,0.85)'],
    sparkleColor: 'rgba(201,169,110,0.65)',
    glowColor: 'rgba(201,169,110,0.22)',
    textColor: 'rgba(255,255,255,0.82)',
    subtleText: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(201,169,110,0.15)',
    confirmText: 'rgba(255,255,255,0.7)',
    qrDark: '#2d3a22',
    qrLight: '#f0ede4',
  },
  champetre: {
    label: 'Champetre',
    bg: '#c5d4b0',
    night: '#ebeee4',
    curtain: '#a8c090',
    curtainShadow: 'rgba(60,80,40,0.25)',
    accent: '#5a7040',
    starColors: ['#5a7040', '#82a060', '#a8c088', 'rgba(80,100,55,0.55)'],
    sparkleColor: 'rgba(80,110,55,0.45)',
    glowColor: 'rgba(90,120,60,0.14)',
    textColor: 'rgba(36,46,22,0.9)',
    subtleText: 'rgba(36,46,22,0.5)',
    borderColor: 'rgba(90,110,60,0.25)',
    confirmText: 'rgba(36,46,22,0.7)',
    qrDark: '#2d4018',
    qrLight: '#ebeee4',
  },
  romantique: {
    label: 'Romantique',
    bg: '#6b3a4a',
    night: '#1a0a14',
    curtain: '#2d1220',
    curtainShadow: 'rgba(0,0,0,0.55)',
    accent: '#d4a0b0',
    starColors: ['#d4a0b0', '#e8c4d0', '#f5dde5', 'rgba(255,200,220,0.75)'],
    sparkleColor: 'rgba(210,150,175,0.6)',
    glowColor: 'rgba(210,150,175,0.18)',
    textColor: 'rgba(255,235,245,0.88)',
    subtleText: 'rgba(255,220,235,0.5)',
    borderColor: 'rgba(210,150,175,0.2)',
    confirmText: 'rgba(255,225,238,0.7)',
    qrDark: '#3d1828',
    qrLight: '#f5e8f0',
  },
}

export function parseNames(name: string): [string, string | null] {
  const m = name.match(/^(.+?)\s+[&]\s+(.+)$/i)
  if (m) return [m[1].trim(), m[2].trim()]
  const m2 = name.match(/^(.+?)\s+et\s+(.+)$/i)
  if (m2) return [m2[1].trim(), m2[2].trim()]
  return [name, null]
}

export function GoldRingDecor({ size }: { size: number }) {
  const r = size / 2
  const r2 = r - 12
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="goldRing1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2c97e" />
          <stop offset="40%" stopColor="#c9a96e" />
          <stop offset="75%" stopColor="#a07840" />
          <stop offset="100%" stopColor="#d4b96e" />
        </linearGradient>
        <linearGradient id="goldRing2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4b96e" />
          <stop offset="50%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#e2c97e" />
        </linearGradient>
      </defs>
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke="url(#goldRing1)" strokeWidth="1.8" />
      <circle cx={r} cy={r} r={r2 - 2} fill="none" stroke="url(#goldRing2)" strokeWidth="1.2" opacity="0.7" />
      {[0, 90, 180, 270].map(deg => {
        const rad = (deg * Math.PI) / 180
        const cx2 = r + (r - 2) * Math.cos(rad)
        const cy2 = r + (r - 2) * Math.sin(rad)
        return <circle key={deg} cx={cx2} cy={cy2} r="3" fill="none" stroke="url(#goldRing1)" strokeWidth="1.2" />
      })}
    </svg>
  )
}

export function TopLeavesSVG({ size }: { size: number }) {
  return (
    <svg width={size * 0.7} height={50} viewBox={`0 0 ${size * 0.7} 50`} fill="none"
         style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      <g opacity="0.85">
        <path d={`M${size*0.35} 50 Q${size*0.35} 28 ${size*0.35} 8`} stroke="rgba(160,130,80,0.5)" strokeWidth="0.8" />
        <path d={`M${size*0.35} 30 C${size*0.2} 10 ${size*0.05} 15 ${size*0.12} 28 C${size*0.05} 15 ${size*0.22} 8 ${size*0.35} 30Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${size*0.35} 20 C${size*0.22} 3 ${size*0.1} 6 ${size*0.16} 18 C${size*0.1} 6 ${size*0.25} 0 ${size*0.35} 20Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${size*0.35} 38 C${size*0.15} 22 ${size*0} 28 ${size*0.08} 40 C${size*0} 28 ${size*0.18} 20 ${size*0.35} 38Z`} fill="rgba(165,195,140,0.65)" />
        <path d={`M${size*0.35} 30 C${size*0.5} 10 ${size*0.65} 15 ${size*0.58} 28 C${size*0.65} 15 ${size*0.48} 8 ${size*0.35} 30Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${size*0.35} 20 C${size*0.48} 3 ${size*0.6} 6 ${size*0.54} 18 C${size*0.6} 6 ${size*0.45} 0 ${size*0.35} 20Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${size*0.35} 38 C${size*0.55} 22 ${size*0.7} 28 ${size*0.62} 40 C${size*0.7} 28 ${size*0.52} 20 ${size*0.35} 38Z`} fill="rgba(165,195,140,0.65)" />
      </g>
    </svg>
  )
}

export function BottomLeavesSVG({ size }: { size: number }) {
  const hw = size * 0.9
  return (
    <svg width={hw} height={65} viewBox={`0 0 ${hw} 65`} fill="none"
         style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      <g opacity="0.85">
        <path d={`M${hw*0.5} 0 Q${hw*0.5} 30 ${hw*0.5} 58`} stroke="rgba(160,130,80,0.5)" strokeWidth="0.8" />
        <path d={`M${hw*0.5} 15 C${hw*0.28} -5 ${hw*0.08} 5 ${hw*0.18} 22 C${hw*0.08} 5 ${hw*0.3} -8 ${hw*0.5} 15Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${hw*0.5} 15 C${hw*0.72} -5 ${hw*0.92} 5 ${hw*0.82} 22 C${hw*0.92} 5 ${hw*0.7} -8 ${hw*0.5} 15Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${hw*0.5} 28 C${hw*0.22} 8 ${hw*0} 18 ${hw*0.1} 34 C${hw*0} 18 ${hw*0.24} 6 ${hw*0.5} 28Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${hw*0.5} 28 C${hw*0.78} 8 ${hw*1} 18 ${hw*0.9} 34 C${hw*1} 18 ${hw*0.76} 6 ${hw*0.5} 28Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${hw*0.5} 40 C${hw*0.3} 22 ${hw*0.12} 30 ${hw*0.2} 44 C${hw*0.12} 30 ${hw*0.32} 20 ${hw*0.5} 40Z`} fill="rgba(165,195,140,0.65)" />
        <path d={`M${hw*0.5} 40 C${hw*0.7} 22 ${hw*0.88} 30 ${hw*0.8} 44 C${hw*0.88} 30 ${hw*0.68} 20 ${hw*0.5} 40Z`} fill="rgba(165,195,140,0.65)" />
      </g>
    </svg>
  )
}

export function GoldLeafSVG() {
  return (
    <svg width="45" height="70" viewBox="0 0 45 70" fill="none"
         style={{ position: 'absolute', left: -6, top: '42%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2c97e" />
          <stop offset="50%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#a07840" />
        </linearGradient>
      </defs>
      <path d="M38 5 Q12 15 8 45 Q14 58 26 52 Q40 46 38 5Z" fill="url(#gLeaf)" opacity="0.9" />
      <path d="M33 10 Q16 18 14 40 Q18 50 27 46 Q36 42 33 10Z" fill="rgba(226,201,126,0.35)" />
      <path d="M38 5 Q22 25 16 52" stroke="rgba(120,80,30,0.5)" strokeWidth="0.8" fill="none" />
      <path d="M20 52 Q5 45 3 58 Q8 66 18 62 Q28 58 20 52Z" fill="url(#gLeaf)" opacity="0.7" />
    </svg>
  )
}

export function CornerAccents({ color }: { color: string }) {
  const L = 28, T = 1.5
  const style: React.CSSProperties = { position: 'absolute', pointerEvents: 'none' }
  return (
    <>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, top: 16, left: 16 }}>
        <path d={`M${L} ${T} L${T} ${T} L${T} ${L}`} fill="none" stroke={color} strokeWidth={T} opacity="0.7" />
      </svg>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, top: 16, right: 16 }}>
        <path d={`M0 ${T} L${L - T} ${T} L${L - T} ${L}`} fill="none" stroke={color} strokeWidth={T} opacity="0.7" />
      </svg>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, bottom: 16, left: 16 }}>
        <path d={`M${T} 0 L${T} ${L - T} L${L} ${L - T}`} fill="none" stroke={color} strokeWidth={T} opacity="0.7" />
      </svg>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, bottom: 16, right: 16 }}>
        <path d={`M${L - T} 0 L${L - T} ${L - T} L0 ${L - T}`} fill="none" stroke={color} strokeWidth={T} opacity="0.7" />
      </svg>
    </>
  )
}

type CardProps = {
  weddingName: string
  dateStr: string | null
  location: string | null
  coupleMessage: string | null
  personalUrl: string
  themeKey?: string
}

/**
 * Shared faire-part card (RECTO + VERSO).
 * Used by FairePartEnvelope (with animations) and CopyLinkButton (off-screen, for download).
 * QR code is drawn on mount — no animation phase dependency.
 */
export const FairePartCard = forwardRef<HTMLDivElement, CardProps>(
  function FairePartCard({ weddingName, dateStr, location, coupleMessage, personalUrl, themeKey: themeKeyProp }, ref) {
    const qrRef = useRef<HTMLCanvasElement>(null)
    const themeKey: ThemeKey = (['classique', 'champetre', 'romantique'] as const).includes(themeKeyProp as ThemeKey)
      ? (themeKeyProp as ThemeKey)
      : 'classique'
    const t = THEMES[themeKey]
    const [name1, name2] = parseNames(weddingName)
    const RING = 270

    useEffect(() => {
      if (!qrRef.current) return
      import('qrcode').then(QRCode => {
        QRCode.toCanvas(qrRef.current!, personalUrl, {
          width: 100, margin: 1,
          color: { dark: t.qrDark, light: t.qrLight },
        }).catch(() => {})
      })
    }, [personalUrl, t.qrDark, t.qrLight])

    return (
      <div ref={ref} style={{ background: t.night, padding: '20px 0 20px' }}>

        {/* RECTO */}
        <div className="card-rise" style={{
          background: t.bg,
          borderRadius: 3,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          padding: '36px 20px 44px',
          textAlign: 'center',
          marginBottom: 4,
          border: `1px solid ${t.borderColor}`,
        }}>
          <p style={{ color: t.textColor, fontFamily: 'Georgia, serif',
            fontStyle: 'italic', fontSize: '1rem', margin: '0 0 28px' }}>
            Vous êtes invités au mariage de
          </p>

          <div style={{ position: 'relative', width: RING, height: RING, margin: '0 auto 28px' }}>
            <GoldRingDecor size={RING} />
            <TopLeavesSVG size={RING} />
            <BottomLeavesSVG size={RING} />
            <GoldLeafSVG />

            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <p style={{ color: t.textColor, fontFamily: 'Georgia, serif', fontWeight: 600,
                fontSize: 'clamp(1.2rem,5vw,1.65rem)', letterSpacing: '0.12em',
                textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
                {name1}
              </p>
              <p style={{ color: t.accent, fontFamily: 'Georgia, serif', fontSize: '1.1rem',
                margin: '3px 0', lineHeight: 1 }}>
                &amp;
              </p>
              {name2 && (
                <p style={{ color: t.textColor, fontFamily: 'Georgia, serif', fontWeight: 600,
                  fontSize: 'clamp(1.2rem,5vw,1.65rem)', letterSpacing: '0.12em',
                  textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
                  {name2}
                </p>
              )}
              {dateStr && (
                <p style={{ color: t.textColor, fontFamily: 'Georgia, serif',
                  fontStyle: 'italic', fontSize: '0.85rem', marginTop: 10, lineHeight: 1.4,
                  padding: '0 20px' }}>
                  {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
                </p>
              )}
            </div>
          </div>

          {location && (
            <p style={{ color: t.subtleText, fontFamily: 'Georgia, serif',
              fontStyle: 'italic', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              {location}
            </p>
          )}
          <p style={{ color: t.subtleText, fontFamily: 'Georgia, serif',
            fontStyle: 'italic', fontSize: '0.78rem', marginTop: 8 }}>
            pour célébrer ce moment d&apos;amour
          </p>
        </div>

        {/* VERSO */}
        <div style={{ position: 'relative', background: t.bg, borderRadius: 3,
          padding: '50px 32px 52px', textAlign: 'center', marginBottom: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          border: `1px solid ${t.borderColor}` }}>
          <CornerAccents color={t.accent} />

          {coupleMessage ? (
            <div style={{ position: 'relative', zIndex: 1, padding: '10px 16px' }}>
              {coupleMessage.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} style={{ color: t.textColor, fontFamily: 'Georgia, serif',
                  fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.85,
                  margin: '0 0 10px' }}>
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p style={{ color: t.subtleText, fontFamily: 'Georgia, serif',
              fontStyle: 'italic', fontSize: '0.9rem' }}>
              Nous sommes ravis de vous compter parmi nous.
            </p>
          )}

          <div style={{ position: 'relative', zIndex: 1, marginTop: 24 }}>
            <p style={{ color: t.confirmText, fontFamily: 'Arial, sans-serif',
              fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.16em',
              textTransform: 'uppercase', margin: '0 0 4px' }}>
              Merci de nous confirmer votre présence
            </p>
            <p style={{ color: t.accent, fontSize: '1.1rem', margin: '0 0 14px' }}>↓</p>

            <canvas ref={qrRef} width={100} height={100}
              style={{ borderRadius: 8, display: 'block', margin: '0 auto' }} />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8,
              color: `${t.accent}88`, fontSize: '12px' }}>
              <span>♡</span><span>♡</span><span>♡</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
