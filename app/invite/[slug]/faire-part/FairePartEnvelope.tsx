'use client'

import { useState, useEffect, useRef } from 'react'

type ThemeKey = 'classique' | 'champetre' | 'romantique'

type Props = {
  weddingName: string
  dateStr: string | null
  location: string | null
  coupleMessage: string | null
  coverImageUrl: string | null
  slug: string
  personalUrl: string
  paid?: boolean
  theme?: string
}

type Phase = 'curtain-closed' | 'opening' | 'revealed'

const THEMES: Record<ThemeKey, {
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
    label: 'Champêtre',
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

const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: (i * 31 + 7) % 100,
  y: (i * 47 + 13) % 100,
  size: 1 + (i % 4) * 0.6,
  delay: ((i * 0.41) % 5).toFixed(2),
  duration: (2.2 + (i % 6) * 0.55).toFixed(2),
  cross: i % 14 === 0,
}))

const SPARKLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: (i * 73 + 11) % 90 + 5,
  y: (i * 53 + 17) % 85 + 5,
  size: 10 + (i % 3) * 6,
  delay: ((i * 0.9) % 3).toFixed(2),
  duration: (3 + (i % 4) * 0.8).toFixed(2),
}))

const GOLD_RAIN = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  left: (i * 41 + 5) % 100,
  delay: ((i * 0.18) % 4).toFixed(2),
  duration: (4.5 + (i % 7) * 0.6).toFixed(2),
  size: [10, 12, 14, 9, 16, 11][i % 6],
  symbol: (['✦', '✧', '✦', '★', '✧', '✦'] as const)[i % 6],
  drift: ((i % 3) - 1) * 18,
  opacity: 0.55 + (i % 5) * 0.09,
}))

function parseNames(name: string): [string, string | null] {
  const m = name.match(/^(.+?)\s+[&]\s+(.+)$/i)
  if (m) return [m[1].trim(), m[2].trim()]
  const m2 = name.match(/^(.+?)\s+et\s+(.+)$/i)
  if (m2) return [m2[1].trim(), m2[2].trim()]
  return [name, null]
}

function GoldRingDecor({ size }: { size: number }) {
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

function TopLeavesSVG({ size }: { size: number }) {
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

function BottomLeavesSVG({ size }: { size: number }) {
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

function GoldLeafSVG() {
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

function CornerAccents({ color }: { color: string }) {
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

export default function FairePartEnvelope({
  weddingName, dateStr, location, coupleMessage, coverImageUrl, slug, personalUrl, paid = true, theme: themeProp,
}: Props) {
  const [phase, setPhase] = useState<Phase>('curtain-closed')
  const [showRain, setShowRain] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [name1, name2] = parseNames(weddingName)

  const themeKey: ThemeKey = (['classique', 'champetre', 'romantique'] as const).includes(themeProp as ThemeKey)
    ? (themeProp as ThemeKey)
    : 'classique'
  const t = THEMES[themeKey]

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('opening'); setShowRain(true) }, 600)
    const t2 = setTimeout(() => setPhase('revealed'), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'revealed' || !qrRef.current) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(qrRef.current!, personalUrl, {
        width: 100, margin: 1,
        color: { dark: t.qrDark, light: t.qrLight },
      }).catch(() => {})
    })
  }, [phase, personalUrl, t.qrDark, t.qrLight])

  const handleDownload = async () => {
    if (!cardsRef.current) return
    setDownloading(true)
    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf'),
      ])
      const canvas = await html2canvas(cardsRef.current, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: t.night, logging: false,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.93)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.height / canvas.width
      const imgH = pdfW * ratio
      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'JPEG', 0, (pdfH - imgH) / 2, pdfW, imgH)
      } else {
        const scale = pdfH / imgH
        const scaledW = pdfW * scale
        pdf.addImage(imgData, 'JPEG', (pdfW - scaledW) / 2, 0, scaledW, pdfH)
      }
      pdf.save(`faire-part-${weddingName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } finally {
      setDownloading(false)
    }
  }

  const RING = 270

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: t.night,
      overflow: phase === 'revealed' ? 'auto' : 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: phase === 'revealed' ? 'flex-start' : 'center',
      zIndex: 50,
    }}>
      <style>{`
        @keyframes open-left  { from { transform:translateX(0) } to { transform:translateX(-100%) } }
        @keyframes open-right { from { transform:translateX(0) } to { transform:translateX(100%) } }
        @keyframes card-rise  { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fade-up    { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes star-pulse { 0%,100% { opacity:.4; transform:scale(1) } 50% { opacity:1; transform:scale(1.25) } }
        @keyframes twinkle {
          0%,100% { opacity:0.15; transform:scale(0.7); }
          50%     { opacity:1;    transform:scale(1.3); }
        }
        @keyframes sparkle-spin {
          0%   { opacity:0.3; transform:scale(0.8) rotate(0deg); }
          40%  { opacity:1;   transform:scale(1.3) rotate(72deg); }
          100% { opacity:0.3; transform:scale(0.8) rotate(144deg); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity:0.06; transform:scale(1); }
          50%     { opacity:0.18; transform:scale(1.15); }
        }
        .curtain-l { animation: open-left  2.8s cubic-bezier(0.7,0,0.3,1) forwards; }
        .curtain-r { animation: open-right 2.8s cubic-bezier(0.7,0,0.3,1) forwards; }
        .card-rise { animation: card-rise  0.8s ease forwards; }
        .fade-up   { animation: fade-up    0.5s ease forwards 0.7s; opacity:0; }
        .star-pulse { animation: star-pulse 1.6s ease-in-out infinite; }
        .twinkle   { animation-name:twinkle; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        .sparkle   { animation-name:sparkle-spin; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        .glow      { animation-name:glow-pulse; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        @keyframes gold-fall {
          0%   { transform:translateY(-80px) translateX(0px) rotate(0deg) scale(1);   opacity:0; }
          8%   { opacity:1; }
          70%  { opacity:0.85; }
          100% { transform:translateY(115vh) translateX(var(--drift)) rotate(180deg) scale(0.6); opacity:0; }
        }
        .gold-star { animation-name:gold-fall; animation-timing-function:cubic-bezier(0.25,0.46,0.45,0.94); animation-fill-mode:forwards; }
      `}</style>

      {/* ── STARFIELD ── */}
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
        <div className="glow" style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)',
          width:400, height:400, borderRadius:'50%',
          background:`radial-gradient(circle, ${t.glowColor} 0%, transparent 65%)`,
          animationDuration:'6s', animationDelay:'0s' }} />
        <div className="glow" style={{ position:'absolute', bottom:'20%', left:'30%',
          width:250, height:250, borderRadius:'50%',
          background:`radial-gradient(circle, ${t.glowColor.replace('0.22','0.14').replace('0.18','0.11').replace('0.15','0.10')} 0%, transparent 65%)`,
          animationDuration:'8s', animationDelay:'2s' }} />

        {STARS.map(s => (
          s.cross ? (
            <div key={s.id} className="sparkle"
              style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
                color: t.starColors[s.id % 4],
                fontSize: s.size * 6,
                animationDuration:`${s.duration}s`, animationDelay:`${s.delay}s`,
                lineHeight:1, transform:'translate(-50%,-50%)' }}>
              ✦
            </div>
          ) : (
            <div key={s.id} className="twinkle"
              style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
                width: s.size, height: s.size, borderRadius:'50%',
                background: t.starColors[s.id % 4],
                animationDuration:`${s.duration}s`, animationDelay:`${s.delay}s`,
                transform:'translate(-50%,-50%)' }} />
          )
        ))}

        {SPARKLES.map(s => (
          <div key={s.id} className="sparkle"
            style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
              color: t.sparkleColor, fontSize: s.size,
              animationDuration:`${s.duration}s`, animationDelay:`${s.delay}s`,
              lineHeight:1, transform:'translate(-50%,-50%)' }}>
            ✧
          </div>
        ))}
      </div>

      {/* Curtains */}
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-l' : ''}
        style={{ position:'absolute', top:0, left:0, width:'50%', height:'100%', zIndex:30,
          background:`linear-gradient(180deg,${t.curtain} 0%,${t.night} 100%)`,
          boxShadow:`inset -8px 0 20px ${t.curtainShadow}` }} />
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-r' : ''}
        style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', zIndex:30,
          background:`linear-gradient(180deg,${t.curtain} 0%,${t.night} 100%)`,
          boxShadow:`inset 8px 0 20px ${t.curtainShadow}` }} />

      {phase === 'curtain-closed' && (
        <div style={{ position:'absolute', left:'50%', top:0, width:1, height:'100%',
          background:`${t.accent}66`, zIndex:35 }} />
      )}
      {phase === 'curtain-closed' && (
        <div className="star-pulse"
          style={{ position:'absolute', zIndex:40, color:t.accent, fontSize:'2.2rem' }}>✦</div>
      )}

      {/* Pluie de symboles */}
      {showRain && GOLD_RAIN.map(s => (
        <div key={s.id} className="gold-star"
          style={{ position:'absolute', top:0, left:`${s.left}%`,
            color: t.starColors[s.id % t.starColors.length],
            fontSize: s.size, lineHeight:1,
            opacity: s.opacity, zIndex:28, pointerEvents:'none',
            animationDuration:`${s.duration}s`, animationDelay:`${s.delay}s`,
            ['--drift' as string]: `${s.drift}px`,
            transform:'translate(-50%, 0)' }}>
          {s.symbol}
        </div>
      ))}

      {/* Close button */}
      {phase === 'revealed' && (
        <a href={`/invite/${slug}`}
          style={{ position:'fixed', top:14, right:16, zIndex:60,
            background:'rgba(255,255,255,0.12)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.18)', borderRadius:99,
            padding:'6px 14px', display:'flex', alignItems:'center', gap:6,
            color:'rgba(255,255,255,0.75)', textDecoration:'none',
            fontFamily:'var(--font-lato)', fontWeight:300, fontSize:'0.75rem',
            letterSpacing:'0.04em', transition:'all 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Mon espace
        </a>
      )}

      {/* Main content */}
      {phase === 'revealed' && (
        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:440,
          margin:'0 auto', padding:'28px 16px 60px' }}>

          <div ref={cardsRef} style={{ background: t.night, padding: '20px 0 20px' }}>

          {/* ── RECTO ── */}
          <div className="card-rise" style={{
            background: t.bg,
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            padding: '36px 20px 44px',
            textAlign: 'center',
            marginBottom: 4,
            border: `1px solid ${t.borderColor}`,
          }}>
            <p style={{ color: t.textColor, fontFamily:'Georgia, serif',
              fontStyle:'italic', fontSize:'1rem', margin:'0 0 28px' }}>
              Vous êtes invités au mariage de
            </p>

            <div style={{ position:'relative', width:RING, height:RING, margin:'0 auto 28px' }}>
              <GoldRingDecor size={RING} />
              <TopLeavesSVG size={RING} />
              <BottomLeavesSVG size={RING} />
              <GoldLeafSVG />

              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:2 }}>
                <p style={{ color: t.textColor, fontFamily:'Georgia, serif', fontWeight:600,
                  fontSize:'clamp(1.2rem,5vw,1.65rem)', letterSpacing:'0.12em',
                  textTransform:'uppercase', margin:0, lineHeight:1.1 }}>
                  {name1}
                </p>
                <p style={{ color: t.accent, fontFamily:'Georgia, serif', fontSize:'1.1rem',
                  margin:'3px 0', lineHeight:1 }}>
                  &amp;
                </p>
                {name2 && (
                  <p style={{ color: t.textColor, fontFamily:'Georgia, serif', fontWeight:600,
                    fontSize:'clamp(1.2rem,5vw,1.65rem)', letterSpacing:'0.12em',
                    textTransform:'uppercase', margin:0, lineHeight:1.1 }}>
                    {name2}
                  </p>
                )}
                {dateStr && (
                  <p style={{ color: t.textColor, fontFamily:'Georgia, serif',
                    fontStyle:'italic', fontSize:'0.85rem', marginTop:10, lineHeight:1.4,
                    padding:'0 20px' }}>
                    {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
                  </p>
                )}
              </div>
            </div>

            {location && (
              <p style={{ color: t.subtleText, fontFamily:'Georgia, serif',
                fontStyle:'italic', fontSize:'0.9rem', lineHeight:1.7, margin:0 }}>
                {location}
              </p>
            )}
            <p style={{ color: t.subtleText, fontFamily:'Georgia, serif',
              fontStyle:'italic', fontSize:'0.78rem', marginTop:8 }}>
              pour célébrer ce moment d&apos;amour
            </p>
          </div>

          {/* ── VERSO ── */}
          <div style={{ position:'relative', background: t.bg, borderRadius:3,
            padding:'50px 32px 52px', textAlign:'center', marginBottom:20,
            boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
            border: `1px solid ${t.borderColor}` }}>
            <CornerAccents color={t.accent} />

            {coupleMessage ? (
              <div style={{ position:'relative', zIndex:1, padding:'10px 16px' }}>
                {coupleMessage.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i} style={{ color: t.textColor, fontFamily:'Georgia, serif',
                    fontStyle:'italic', fontSize:'0.95rem', lineHeight:1.85,
                    margin:'0 0 10px' }}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{ color: t.subtleText, fontFamily:'Georgia, serif',
                fontStyle:'italic', fontSize:'0.9rem' }}>
                Nous sommes ravis de vous compter parmi nous.
              </p>
            )}

            <div style={{ position:'relative', zIndex:1, marginTop:24 }}>
              <p style={{ color: t.confirmText, fontFamily:'Arial, sans-serif',
                fontWeight:300, fontSize:'0.62rem', letterSpacing:'0.16em',
                textTransform:'uppercase', margin:'0 0 4px' }}>
                Merci de nous confirmer votre présence
              </p>
              <p style={{ color: t.accent, fontSize:'1.1rem', margin:'0 0 14px' }}>↓</p>

              {/* QR clickable — redirige vers espace invité */}
              <a href={personalUrl} target="_blank" rel="noopener noreferrer"
                 style={{ display:'block', width:100, margin:'0 auto', borderRadius:8, overflow:'hidden',
                   cursor:'pointer', transition:'opacity 0.2s', opacity:1 }}
                 onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                 onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                 title="Ouvrir mon espace invité">
                <canvas ref={qrRef} width={100} height={100}
                  style={{ borderRadius:8, display:'block' }} />
              </a>

              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:8,
                color:`${t.accent}88`, fontSize:'12px' }}>
                <span>♡</span><span>♡</span><span>♡</span>
              </div>
            </div>
          </div>
          </div>

          {/* Buttons */}
          <div className="fade-up" style={{ display:'flex', flexDirection:'column',
            alignItems:'center', gap:10 }}>
            {paid ? (
              <button onClick={handleDownload} disabled={downloading}
                style={{ background: t.accent, color: themeKey === 'champetre' ? '#2d4018' : '#2d3a22',
                  borderRadius:10, padding:'11px 32px', fontSize:'0.82rem',
                  fontFamily:'var(--font-lato)', fontWeight:600,
                  border:'none', cursor:'pointer', letterSpacing:'0.05em',
                  opacity: downloading ? 0.6 : 1 }}>
                {downloading ? '…Génération en cours' : '↓ Télécharger le faire-part (PDF)'}
              </button>
            ) : (
              <div style={{ textAlign:'center' }}>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10,
                  padding:'11px 32px', fontSize:'0.82rem',
                  fontFamily:'var(--font-lato)', fontWeight:400, color:'rgba(255,255,255,0.35)',
                  letterSpacing:'0.05em', cursor:'default' }}>
                  🔒 Téléchargement — Formule Mariage
                </div>
              </div>
            )}
            <a href={`/invite/${slug}`}
              style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)',
                fontFamily:'var(--font-lato)', fontWeight:300, textDecoration:'none' }}>
              ← Retour à mon espace
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
