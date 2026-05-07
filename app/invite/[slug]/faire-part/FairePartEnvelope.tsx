'use client'

import { useState, useEffect, useRef } from 'react'
import { FairePartCard, THEMES, type ThemeKey } from './FairePartCard'

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

export default function FairePartEnvelope({
  weddingName, dateStr, location, coupleMessage, coverImageUrl, slug, personalUrl, paid = true, theme: themeProp,
}: Props) {
  const [phase, setPhase] = useState<Phase>('curtain-closed')
  const [showRain, setShowRain] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)

  const themeKey: ThemeKey = (['classique', 'champetre', 'romantique'] as const).includes(themeProp as ThemeKey)
    ? (themeProp as ThemeKey)
    : 'classique'
  const t = THEMES[themeKey]

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('opening'); setShowRain(true) }, 600)
    const t2 = setTimeout(() => setPhase('revealed'), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

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

      {/* STARFIELD */}
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

      {/* Gold rain */}
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

          <FairePartCard
            ref={cardsRef}
            weddingName={weddingName}
            dateStr={dateStr}
            location={location}
            coupleMessage={coupleMessage}
            personalUrl={personalUrl}
            themeKey={themeKey}
          />

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
