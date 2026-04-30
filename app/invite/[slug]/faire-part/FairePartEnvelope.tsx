'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  weddingName: string
  dateStr: string | null
  location: string | null
  coupleMessage: string | null
  coverImageUrl: string | null
  slug: string
  personalUrl: string
  paid?: boolean
}

type Phase = 'curtain-closed' | 'opening' | 'revealed'

const BG = '#4a5639'
const NIGHT = '#0b1209'
const GOLD = '#c9a96e'

const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: (i * 31 + 7) % 100,
  y: (i * 47 + 13) % 100,
  size: 1 + (i % 4) * 0.6,
  delay: ((i * 0.41) % 5).toFixed(2),
  duration: (2.2 + (i % 6) * 0.55).toFixed(2),
  color: i % 5 === 0 ? '#e2c97e' : i % 5 === 1 ? '#c9a96e' : i % 5 === 2 ? '#f5e6c0' : 'rgba(255,255,255,0.85)',
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

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (i * 37 + 3) % 100,
  delay: ((i * 0.22) % 3).toFixed(2),
  duration: (3.5 + (i % 5) * 0.4).toFixed(2),
  size: 6 + (i % 4) * 2,
  color: ['rgba(201,169,110,0.45)', 'rgba(255,255,255,0.12)', 'rgba(180,200,150,0.35)', 'rgba(226,201,126,0.4)'][i % 4],
  side: i % 2 === 0 ? 'petal-l' : 'petal-r',
  rotate: (i * 53) % 360,
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
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
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
      {/* Outer ring */}
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke="url(#goldRing1)" strokeWidth="1.8" />
      {/* Inner ring */}
      <circle cx={r} cy={r} r={r2 - 2} fill="none" stroke="url(#goldRing2)" strokeWidth="1.2" opacity="0.7" />
      {/* Small decorative dots on outer ring */}
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
  const cx = size / 2
  return (
    <svg width={size * 0.7} height={50} viewBox={`0 0 ${size * 0.7} 50`} fill="none"
         style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      <g opacity="0.85">
        {/* Center stem */}
        <path d={`M${size*0.35} 50 Q${size*0.35} 28 ${size*0.35} 8`} stroke="rgba(160,130,80,0.5)" strokeWidth="0.8" />
        {/* Left leaves */}
        <path d={`M${size*0.35} 30 C${size*0.2} 10 ${size*0.05} 15 ${size*0.12} 28 C${size*0.05} 15 ${size*0.22} 8 ${size*0.35} 30Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${size*0.35} 20 C${size*0.22} 3 ${size*0.1} 6 ${size*0.16} 18 C${size*0.1} 6 ${size*0.25} 0 ${size*0.35} 20Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${size*0.35} 38 C${size*0.15} 22 ${size*0} 28 ${size*0.08} 40 C${size*0} 28 ${size*0.18} 20 ${size*0.35} 38Z`} fill="rgba(165,195,140,0.65)" />
        {/* Right leaves */}
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
        {/* Center large leaves */}
        <path d={`M${hw*0.5} 15 C${hw*0.28} -5 ${hw*0.08} 5 ${hw*0.18} 22 C${hw*0.08} 5 ${hw*0.3} -8 ${hw*0.5} 15Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${hw*0.5} 15 C${hw*0.72} -5 ${hw*0.92} 5 ${hw*0.82} 22 C${hw*0.92} 5 ${hw*0.7} -8 ${hw*0.5} 15Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${hw*0.5} 28 C${hw*0.22} 8 ${hw*0} 18 ${hw*0.1} 34 C${hw*0} 18 ${hw*0.24} 6 ${hw*0.5} 28Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${hw*0.5} 28 C${hw*0.78} 8 ${hw} 18 ${hw*0.9} 34 C${hw} 18 ${hw*0.76} 6 ${hw*0.5} 28Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${hw*0.5} 40 C${hw*0.3} 22 ${hw*0.12} 30 ${hw*0.2} 44 C${hw*0.12} 30 ${hw*0.32} 20 ${hw*0.5} 40Z`} fill="rgba(165,195,140,0.65)" />
        <path d={`M${hw*0.5} 40 C${hw*0.7} 22 ${hw*0.88} 30 ${hw*0.8} 44 C${hw*0.88} 30 ${hw*0.68} 20 ${hw*0.5} 40Z`} fill="rgba(165,195,140,0.65)" />
        <path d={`M${hw*0.5} 50 C${hw*0.35} 38 ${hw*0.22} 44 ${hw*0.28} 55 C${hw*0.22} 44 ${hw*0.37} 36 ${hw*0.5} 50Z`} fill="rgba(150,180,125,0.6)" />
        <path d={`M${hw*0.5} 50 C${hw*0.65} 38 ${hw*0.78} 44 ${hw*0.72} 55 C${hw*0.78} 44 ${hw*0.63} 36 ${hw*0.5} 50Z`} fill="rgba(150,180,125,0.6)" />
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
      {/* Main leaf shape */}
      <path d="M38 5 Q12 15 8 45 Q14 58 26 52 Q40 46 38 5Z" fill="url(#gLeaf)" opacity="0.9" />
      {/* Highlight */}
      <path d="M33 10 Q16 18 14 40 Q18 50 27 46 Q36 42 33 10Z" fill="rgba(226,201,126,0.35)" />
      {/* Veins */}
      <path d="M38 5 Q22 25 16 52" stroke="rgba(120,80,30,0.5)" strokeWidth="0.8" fill="none" />
      <path d="M30 12 Q22 28 20 46" stroke="rgba(120,80,30,0.35)" strokeWidth="0.5" fill="none" />
      <path d="M36 20 Q28 32 24 50" stroke="rgba(120,80,30,0.3)" strokeWidth="0.5" fill="none" />
      {/* Sub-leaf at bottom */}
      <path d="M20 52 Q5 45 3 58 Q8 66 18 62 Q28 58 20 52Z" fill="url(#gLeaf)" opacity="0.7" />
    </svg>
  )
}

function CornerAccents() {
  const L = 28, T = 1.5
  const C = '#c9a96e'
  const style: React.CSSProperties = { position: 'absolute', pointerEvents: 'none' }
  return (
    <>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, top: 16, left: 16 }}>
        <path d={`M${L} ${T} L${T} ${T} L${T} ${L}`} fill="none" stroke={C} strokeWidth={T} opacity="0.7" />
      </svg>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, top: 16, right: 16 }}>
        <path d={`M0 ${T} L${L - T} ${T} L${L - T} ${L}`} fill="none" stroke={C} strokeWidth={T} opacity="0.7" />
      </svg>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, bottom: 16, left: 16 }}>
        <path d={`M${T} 0 L${T} ${L - T} L${L} ${L - T}`} fill="none" stroke={C} strokeWidth={T} opacity="0.7" />
      </svg>
      <svg width={L} height={L} viewBox={`0 0 ${L} ${L}`} style={{ ...style, bottom: 16, right: 16 }}>
        <path d={`M${L - T} 0 L${L - T} ${L - T} L0 ${L - T}`} fill="none" stroke={C} strokeWidth={T} opacity="0.7" />
      </svg>
    </>
  )
}

async function drawFairePartCanvasNew(
  personalUrl: string,
  weddingName: string,
  dateStr: string | null,
  location: string | null,
  coupleMessage: string | null,
  qrCanvas: HTMLCanvasElement | null
): Promise<string> {
  // Get actual font family names from CSS variables (next/font assigns obfuscated names)
  const cssVars = getComputedStyle(document.documentElement)
  const FONT_D = cssVars.getPropertyValue('--font-cormorant').trim() || '"Cormorant Garamond", Georgia, serif'
  const FONT_B = cssVars.getPropertyValue('--font-lato').trim() || 'Lato, sans-serif'

  // Wait for fonts to be loaded in the page before drawing
  await document.fonts.ready

  const W = 600, H = 980
  const DPR = 2
  const canvas = document.createElement('canvas')
  canvas.width = W * DPR; canvas.height = H * DPR
  const ctx = canvas.getContext('2d')!
  ctx.scale(DPR, DPR)
  ctx.textAlign = 'center'

  // ─── BACKGROUND ───
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, W, H)

  // ─── DARK GREEN HEADER ───
  ctx.fillStyle = '#4a5639'
  ctx.fillRect(0, 0, W, 220)

  // ─── HEADER: small caps label ───
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = `300 10px ${FONT_B}`
  ctx.letterSpacing = '0.22em'
  ctx.fillText('VOUS ÊTES INVITÉS AU MARIAGE DE', W / 2, 44)
  ctx.letterSpacing = '0'

  // ─── NAMES ───
  const [name1, name2] = parseNames(weddingName)
  ctx.fillStyle = '#ffffff'
  if (name2) {
    ctx.font = `italic 600 50px ${FONT_D}`
    ctx.fillText(name1, W / 2, 106)
    ctx.fillStyle = '#c9a96e'
    ctx.font = `italic 300 18px ${FONT_D}`
    ctx.fillText('&', W / 2, 132)
    ctx.fillStyle = '#ffffff'
    ctx.font = `italic 600 50px ${FONT_D}`
    ctx.fillText(name2, W / 2, 192)
  } else {
    ctx.font = `italic 600 50px ${FONT_D}`
    ctx.fillText(name1, W / 2, 154)
  }

  // ─── GOLD SEPARATOR LINE ───
  const lineY = 238
  const grad = ctx.createLinearGradient(80, lineY, W - 80, lineY)
  grad.addColorStop(0, 'rgba(201,169,110,0)'); grad.addColorStop(0.5, 'rgba(201,169,110,0.6)'); grad.addColorStop(1, 'rgba(201,169,110,0)')
  ctx.strokeStyle = grad; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(80, lineY); ctx.lineTo(W - 80, lineY); ctx.stroke()

  // ─── DATE ───
  let contentY = 278
  if (dateStr) {
    const d = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
    ctx.fillStyle = '#2d3228'
    ctx.font = `italic 300 19px ${FONT_D}`
    ctx.fillText(d, W / 2, contentY)
    contentY += 32
  }

  // ─── LOCATION ───
  if (location) {
    ctx.fillStyle = '#7a8070'
    ctx.font = `300 11px ${FONT_B}`
    ctx.letterSpacing = '0.1em'
    ctx.fillText(location.replace(/\n/g, ' · ').toUpperCase(), W / 2, contentY)
    ctx.letterSpacing = '0'
    contentY += 30
  }

  // ─── COUPLE MESSAGE ───
  if (coupleMessage) {
    contentY += 16
    // Ornament
    ctx.fillStyle = '#c9a96e'
    ctx.globalAlpha = 0.5
    ctx.font = '11px serif'
    ctx.fillText('◆', W / 2, contentY)
    ctx.globalAlpha = 1
    contentY += 24

    ctx.fillStyle = '#5a5a52'
    ctx.font = `italic 300 16px ${FONT_D}`
    const maxW = W - 120
    const words = coupleMessage.split(/\s+/)
    let line = '', lines: string[] = []
    for (const w of words) {
      const t = line + (line ? ' ' : '') + w
      if (ctx.measureText(t).width > maxW) { lines.push(line); line = w } else line = t
    }
    if (line) lines.push(line)
    for (const l of lines.slice(0, 6)) {
      ctx.fillText(l, W / 2, contentY)
      contentY += 26
    }
  }

  // ─── QR CODE ZONE ───
  const qrTop = Math.max(contentY + 40, 660)
  ctx.fillStyle = '#7a8070'
  ctx.font = `300 9px ${FONT_B}`
  ctx.letterSpacing = '0.18em'
  ctx.fillText('VOTRE ESPACE PERSONNEL', W / 2, qrTop)
  ctx.letterSpacing = '0'

  const qrSize = 116
  const qrX = W / 2 - qrSize / 2
  const qrY2 = qrTop + 14

  // Light cream bg behind QR
  ctx.fillStyle = '#ede8df'
  ctx.beginPath()
  ctx.roundRect(qrX - 8, qrY2 - 8, qrSize + 16, qrSize + 16, 8)
  ctx.fill()

  if (qrCanvas) {
    ctx.drawImage(qrCanvas, qrX, qrY2, qrSize, qrSize)
  } else {
    const QR = await import('qrcode')
    const qrDataUrl = await QR.default.toDataURL(personalUrl, {
      width: qrSize * 2, margin: 1,
      color: { dark: '#2d3a22', light: '#ede8df' },
    })
    const qrImg = new Image()
    await new Promise<void>(r => { qrImg.onload = () => r(); qrImg.src = qrDataUrl })
    ctx.drawImage(qrImg, qrX, qrY2, qrSize, qrSize)
  }

  // ─── FOOTER ───
  ctx.fillStyle = 'rgba(74,86,57,0.3)'
  ctx.font = `300 9px ${FONT_B}`
  ctx.letterSpacing = '0.12em'
  ctx.fillText('KAATCH.FR', W / 2, H - 18)
  ctx.letterSpacing = '0'

  return canvas.toDataURL('image/png')
}

export default function FairePartEnvelope({
  weddingName, dateStr, location, coupleMessage, coverImageUrl, slug, personalUrl, paid = true,
}: Props) {
  const [phase, setPhase] = useState<Phase>('curtain-closed')
  const [showPetals, setShowPetals] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [name1, name2] = parseNames(weddingName)

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('opening'); setShowPetals(true) }, 600)
    const t2 = setTimeout(() => setPhase('revealed'), 1900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'revealed' || !qrRef.current) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(qrRef.current!, personalUrl, {
        width: 100, margin: 1,
        color: { dark: '#2d3a22', light: '#f0ede4' },
      }).catch(() => {})
    })
  }, [phase, personalUrl])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const dataUrl = await drawFairePartCanvasNew(
        personalUrl, weddingName, dateStr, location, coupleMessage, qrRef.current
      )
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `faire-part-${weddingName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  const RING = 270

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: NIGHT,
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
        .curtain-l { animation: open-left  1.3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .curtain-r { animation: open-right 1.3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .card-rise { animation: card-rise  0.8s ease forwards; }
        .fade-up   { animation: fade-up    0.5s ease forwards 0.7s; opacity:0; }
        .star-pulse { animation: star-pulse 1.6s ease-in-out infinite; }
        .twinkle   { animation-name:twinkle; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        .sparkle   { animation-name:sparkle-spin; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        .glow      { animation-name:glow-pulse; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
        @keyframes petal-fall-l {
          0%   { transform:translateY(-60px) rotate(0deg) translateX(0px); opacity:1; }
          80%  { transform:translateY(80vh) rotate(240deg) translateX(-28px); opacity:0.5; }
          100% { transform:translateY(110vh) rotate(360deg) translateX(-14px); opacity:0; }
        }
        @keyframes petal-fall-r {
          0%   { transform:translateY(-60px) rotate(0deg) translateX(0px); opacity:1; }
          80%  { transform:translateY(80vh) rotate(-240deg) translateX(28px); opacity:0.5; }
          100% { transform:translateY(110vh) rotate(-360deg) translateX(14px); opacity:0; }
        }
        .petal-l { animation-name:petal-fall-l; animation-timing-function:ease-in; animation-fill-mode:forwards; }
        .petal-r { animation-name:petal-fall-r; animation-timing-function:ease-in; animation-fill-mode:forwards; }
      `}</style>

      {/* ── STARFIELD (always visible) ── */}
      <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>

        {/* Radial gold glows */}
        <div className="glow" style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)',
          width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(201,169,110,0.22) 0%, transparent 65%)',
          animationDuration:'6s', animationDelay:'0s' }} />
        <div className="glow" style={{ position:'absolute', bottom:'20%', left:'30%',
          width:250, height:250, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(201,169,110,0.14) 0%, transparent 65%)',
          animationDuration:'8s', animationDelay:'2s' }} />
        <div className="glow" style={{ position:'absolute', top:'40%', right:'15%',
          width:200, height:200, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,220,160,0.1) 0%, transparent 65%)',
          animationDuration:'7s', animationDelay:'1s' }} />

        {/* Tiny twinkling stars */}
        {STARS.map(s => (
          s.cross ? (
            <div key={s.id} className="sparkle"
              style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
                color: s.color, fontSize: s.size * 6,
                animationDuration:`${s.duration}s`, animationDelay:`${s.delay}s`,
                lineHeight:1, transform:'translate(-50%,-50%)' }}>
              ✦
            </div>
          ) : (
            <div key={s.id} className="twinkle"
              style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
                width: s.size, height: s.size, borderRadius:'50%',
                background: s.color,
                animationDuration:`${s.duration}s`, animationDelay:`${s.delay}s`,
                transform:'translate(-50%,-50%)' }} />
          )
        ))}

        {/* Larger gold sparkles */}
        {SPARKLES.map(s => (
          <div key={s.id} className="sparkle"
            style={{ position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
              color:'rgba(201,169,110,0.65)', fontSize: s.size,
              animationDuration:`${s.duration}s`, animationDelay:`${s.delay}s`,
              lineHeight:1, transform:'translate(-50%,-50%)' }}>
            ✧
          </div>
        ))}
      </div>

      {/* Curtains */}
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-l' : ''}
        style={{ position:'absolute', top:0, left:0, width:'50%', height:'100%', zIndex:30,
          background:'linear-gradient(180deg,#0e1a0b 0%,#060e04 100%)',
          boxShadow:'inset -8px 0 20px rgba(0,0,0,0.6)' }} />
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-r' : ''}
        style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', zIndex:30,
          background:'linear-gradient(180deg,#0e1a0b 0%,#060e04 100%)',
          boxShadow:'inset 8px 0 20px rgba(0,0,0,0.6)' }} />

      {/* Gold center line */}
      {phase === 'curtain-closed' && (
        <div style={{ position:'absolute', left:'50%', top:0, width:1, height:'100%',
          background:'rgba(201,169,110,0.4)', zIndex:35 }} />
      )}

      {/* Pulsing star */}
      {phase === 'curtain-closed' && (
        <div className="star-pulse"
          style={{ position:'absolute', zIndex:40, color:GOLD, fontSize:'2.2rem' }}>✦</div>
      )}

      {/* Petals */}
      {showPetals && PETALS.map(p => (
        <div key={p.id} className={p.side}
          style={{ position:'absolute', top:0, left:`${p.left}%`,
            width:p.size, height:p.size, borderRadius:'50% 0 50% 0',
            background:p.color, opacity:0.9, zIndex:28, pointerEvents:'none',
            animationDuration:`${p.duration}s`, animationDelay:`${p.delay}s`,
            transform:`rotate(${p.rotate}deg)` }} />
      ))}

      {/* Main content */}
      {phase === 'revealed' && (
        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:440,
          margin:'0 auto', padding:'28px 16px 60px' }}>

          {/* ── RECTO ── */}
          <div className="card-rise" style={{
            background: BG,
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            padding: '36px 20px 44px',
            textAlign: 'center',
            marginBottom: 4,
            border: '1px solid rgba(201,169,110,0.15)',
          }}>
            {/* Top text */}
            <p style={{ color:'rgba(255,255,255,0.82)', fontFamily:'Georgia, serif',
              fontStyle:'italic', fontSize:'1rem', margin:'0 0 28px' }}>
              Vous êtes invités au mariage de
            </p>

            {/* Ring */}
            <div style={{ position:'relative', width:RING, height:RING, margin:'0 auto 28px' }}>
              <GoldRingDecor size={RING} />
              <TopLeavesSVG size={RING} />
              <BottomLeavesSVG size={RING} />
              <GoldLeafSVG />

              {/* Names */}
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:2 }}>
                <p style={{ color:'#fff', fontFamily:'Georgia, serif', fontWeight:600,
                  fontSize:'clamp(1.2rem,5vw,1.65rem)', letterSpacing:'0.12em',
                  textTransform:'uppercase', margin:0, lineHeight:1.1 }}>
                  {name1}
                </p>
                <p style={{ color:GOLD, fontFamily:'Georgia, serif', fontSize:'1.1rem',
                  margin:'3px 0', lineHeight:1 }}>
                  &amp;
                </p>
                {name2 && (
                  <p style={{ color:'#fff', fontFamily:'Georgia, serif', fontWeight:600,
                    fontSize:'clamp(1.2rem,5vw,1.65rem)', letterSpacing:'0.12em',
                    textTransform:'uppercase', margin:0, lineHeight:1.1 }}>
                    {name2}
                  </p>
                )}
                {dateStr && (
                  <p style={{ color:'rgba(255,255,255,0.78)', fontFamily:'Georgia, serif',
                    fontStyle:'italic', fontSize:'0.85rem', marginTop:10, lineHeight:1.4,
                    padding:'0 20px' }}>
                    {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {location && (
              <p style={{ color:'rgba(255,255,255,0.7)', fontFamily:'Georgia, serif',
                fontStyle:'italic', fontSize:'0.9rem', lineHeight:1.7, margin:0 }}>
                {location}
              </p>
            )}
            <p style={{ color:'rgba(255,255,255,0.45)', fontFamily:'Georgia, serif',
              fontStyle:'italic', fontSize:'0.78rem', marginTop:8 }}>
              pour célébrer ce moment d&apos;amour
            </p>
          </div>

          {/* ── VERSO ── */}
          <div style={{ position:'relative', background:'#4c5a3b', borderRadius:3,
            padding:'50px 32px 52px', textAlign:'center', marginBottom:20,
            boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
            border:'1px solid rgba(201,169,110,0.15)' }}>
            <CornerAccents />

            {/* Message */}
            {coupleMessage ? (
              <div style={{ position:'relative', zIndex:1, padding:'10px 16px' }}>
                {coupleMessage.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i} style={{ color:'rgba(255,255,255,0.88)', fontFamily:'Georgia, serif',
                    fontStyle:'italic', fontSize:'0.95rem', lineHeight:1.85,
                    margin:'0 0 10px' }}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{ color:'rgba(255,255,255,0.5)', fontFamily:'Georgia, serif',
                fontStyle:'italic', fontSize:'0.9rem' }}>
                Nous sommes ravis de vous compter parmi nous.
              </p>
            )}

            {/* Confirm */}
            <div style={{ position:'relative', zIndex:1, marginTop:24 }}>
              <p style={{ color:'rgba(255,255,255,0.7)', fontFamily:'Arial, sans-serif',
                fontWeight:300, fontSize:'0.62rem', letterSpacing:'0.16em',
                textTransform:'uppercase', margin:'0 0 4px' }}>
                Merci de nous confirmer votre présence
              </p>
              <p style={{ color:GOLD, fontSize:'1.1rem', margin:'0 0 14px' }}>↓</p>

              {/* QR */}
              <canvas ref={qrRef} width={100} height={100}
                style={{ borderRadius:8, display:'block', margin:'0 auto' }} />

              {/* Hearts */}
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:8,
                color:'rgba(201,169,110,0.55)', fontSize:'12px' }}>
                <span>♡</span><span>♡</span><span>♡</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="fade-up" style={{ display:'flex', flexDirection:'column',
            alignItems:'center', gap:10 }}>
            {paid ? (
              <button onClick={handleDownload} disabled={downloading}
                style={{ background:GOLD, color:'#2d3a22', borderRadius:10,
                  padding:'11px 32px', fontSize:'0.82rem',
                  fontFamily:'var(--font-lato)', fontWeight:600,
                  border:'none', cursor:'pointer', letterSpacing:'0.05em',
                  opacity: downloading ? 0.6 : 1 }}>
                {downloading ? '…Génération' : '↓ Télécharger le faire-part'}
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
