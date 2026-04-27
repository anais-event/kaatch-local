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
}

type Phase = 'curtain-closed' | 'opening' | 'revealed'

export default function FairePartEnvelope({
  weddingName,
  dateStr,
  location,
  coupleMessage,
  coverImageUrl,
  slug,
  personalUrl,
}: Props) {
  const [phase, setPhase] = useState<Phase>('curtain-closed')
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('opening'), 600)
    const t2 = setTimeout(() => setPhase('revealed'), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'revealed' || !qrRef.current) return
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(qrRef.current!, personalUrl, {
        width: 110,
        margin: 1,
        color: { dark: '#2d3228', light: '#ffffff' },
      }).catch(() => {})
    })
  }, [phase, personalUrl])

  const handleDownload = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#fdfcf8'
    ctx.fillRect(0, 0, 600, 900)

    // Top stripe
    const topGrad = ctx.createLinearGradient(0, 0, 600, 0)
    topGrad.addColorStop(0, '#4a5240')
    topGrad.addColorStop(1, '#2d3228')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, 600, 6)

    let y = 50

    // Cover image
    if (coverImageUrl) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = coverImageUrl })
        const r = 48
        ctx.save()
        ctx.beginPath()
        ctx.arc(300, y + r, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, 300 - r, y, r * 2, r * 2)
        ctx.restore()
        // Ring
        ctx.strokeStyle = 'rgba(74,82,64,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(300, y + r, r + 2, 0, Math.PI * 2)
        ctx.stroke()
        y += 120
      } catch { y += 20 }
    }

    // Ornament
    ctx.fillStyle = '#c9a96e'
    ctx.font = '14px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('✦', 300, y)
    y += 36

    // Vous êtes invité(e)
    ctx.fillStyle = '#a8a29e'
    ctx.font = '300 11px Arial, sans-serif'
    ctx.letterSpacing = '0.15em'
    ctx.fillText('VOUS ÊTES INVITÉ(E)', 300, y)
    y += 56

    // Wedding name — big
    ctx.fillStyle = '#2d3228'
    ctx.font = 'italic 52px Georgia, serif'
    const words = weddingName.split(' ')
    let line = ''
    const lines: string[] = []
    for (const w of words) {
      const test = line + (line ? ' ' : '') + w
      if (ctx.measureText(test).width > 500) { lines.push(line); line = w } else { line = test }
    }
    lines.push(line)
    for (const l of lines) { ctx.fillText(l, 300, y); y += 58 }
    y += 10

    // Divider
    ctx.strokeStyle = '#e7e5e4'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(240, y); ctx.lineTo(360, y); ctx.stroke()
    y += 30

    // Date
    if (dateStr) {
      ctx.fillStyle = '#57534e'
      ctx.font = '500 18px Georgia, serif'
      ctx.fillText(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 300, y)
      y += 28
    }

    // Location
    if (location) {
      ctx.fillStyle = '#a8a29e'
      ctx.font = '300 13px Arial, sans-serif'
      ctx.fillText(location, 300, y)
      y += 36
    }

    if (dateStr || location) {
      ctx.strokeStyle = '#e7e5e4'
      ctx.beginPath(); ctx.moveTo(240, y); ctx.lineTo(360, y); ctx.stroke()
      y += 30
    }

    // Couple message
    if (coupleMessage) {
      ctx.fillStyle = '#78716c'
      ctx.font = 'italic 15px Georgia, serif'
      const msgWords = coupleMessage.replace(/\r?\n.*/, '').split(' ')
      let ml = ''
      const mls: string[] = []
      for (const w of msgWords) {
        const t = ml + (ml ? ' ' : '') + w
        if (ctx.measureText(t).width > 460) { mls.push(ml); ml = w } else { ml = t }
      }
      mls.push(ml)
      for (const l of mls) { ctx.fillText(`"${l}"`, 300, y); y += 24 }
      y += 20
    }

    // QR code
    if (qrRef.current) {
      ctx.drawImage(qrRef.current, 245, y, 110, 110)
      y += 120
      ctx.fillStyle = '#d6d3d1'
      ctx.font = '300 10px Arial, sans-serif'
      ctx.fillText('Flashez pour accéder à votre espace', 300, y)
    }

    // Bottom stripe
    const botGrad = ctx.createLinearGradient(0, 0, 600, 0)
    botGrad.addColorStop(0, '#2d3228')
    botGrad.addColorStop(1, '#4a5240')
    ctx.fillStyle = botGrad
    ctx.fillRect(0, 894, 600, 6)

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `faire-part-${weddingName.toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: phase === 'curtain-closed' ? '#1a2419' : '#f5f0e8',
      transition: 'background 0.8s ease',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }}>
      <style>{`
        @keyframes open-left  { from { transform: translateX(0) } to { transform: translateX(-100%) } }
        @keyframes open-right { from { transform: translateX(0) } to { transform: translateX(100%) } }
        @keyframes card-rise  { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fade-up    { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .curtain-l { animation: open-left  1.2s ease-in-out forwards; }
        .curtain-r { animation: open-right 1.2s ease-in-out forwards; }
        .card-rise { animation: card-rise  0.6s ease forwards; }
        .fade-up   { animation: fade-up    0.5s ease forwards 0.5s; opacity:0; }
      `}</style>

      {/* Curtains */}
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-l' : ''}
        style={{ position:'absolute', top:0, left:0, width:'50%', height:'100%', zIndex:30,
          background:'linear-gradient(180deg,#2d3228 0%,#1a2419 100%)',
          boxShadow:'inset -4px 0 12px rgba(0,0,0,0.3)' }} />
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-r' : ''}
        style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', zIndex:30,
          background:'linear-gradient(180deg,#2d3228 0%,#1a2419 100%)',
          boxShadow:'inset 4px 0 12px rgba(0,0,0,0.3)' }} />

      {/* Star (before open) */}
      {phase === 'curtain-closed' && (
        <div style={{ position:'absolute', zIndex:40, color:'#c9a96e', fontSize:'2rem' }}>✦</div>
      )}

      {/* Card */}
      {phase === 'revealed' && (
        <div style={{
          position:'relative', zIndex:20, width:'100%', maxWidth:420,
          margin:'0 auto', padding:'24px 16px 40px',
          maxHeight:'100vh', overflowY:'auto',
          display:'flex', flexDirection:'column', alignItems:'center',
        }}>
          <div className="card-rise" style={{
            width:'100%', background:'#fff', borderRadius:20,
            boxShadow:'0 25px 60px -12px rgba(0,0,0,0.2)',
            overflow:'hidden',
          }}>
            {/* Top stripe */}
            <div style={{ height:5, background:'linear-gradient(90deg,#4a5240,#2d3228)' }} />

            <div style={{ padding:'36px 28px', textAlign:'center' }}>

              {/* Cover image */}
              {coverImageUrl && (
                <img src={coverImageUrl} alt={weddingName}
                  style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover',
                    margin:'0 auto 24px', display:'block',
                    boxShadow:'0 0 0 3px rgba(74,82,64,0.15), 0 4px 12px rgba(0,0,0,0.1)' }} />
              )}

              {/* Ornament */}
              <p style={{ color:'#c9a96e', letterSpacing:'0.3em', fontSize:'0.7rem', marginBottom:20 }}>✦</p>

              {/* Vous êtes invité(e) */}
              <p style={{
                fontFamily:'var(--font-lato)', fontWeight:300,
                fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase',
                color:'#b8b0a6', marginBottom:16,
              }}>
                Vous êtes invité(e)
              </p>

              {/* Wedding name */}
              <h1 style={{
                fontFamily:'var(--font-cormorant)', fontWeight:400, fontStyle:'italic',
                fontSize:'clamp(2rem, 9vw, 2.8rem)', color:'#2d3228',
                lineHeight:1.1, marginBottom:20,
              }}>
                {weddingName}
              </h1>

              {/* Divider */}
              <div style={{ height:1, background:'linear-gradient(90deg,transparent,#e7e5e4,transparent)', margin:'0 auto 20px', width:'70%' }} />

              {/* Date */}
              {dateStr && (
                <p style={{
                  fontFamily:'var(--font-cormorant)', fontWeight:500,
                  fontSize:'1rem', color:'#57534e', textTransform:'capitalize', marginBottom:6,
                }}>
                  {dateStr}
                </p>
              )}

              {/* Location */}
              {location && (
                <p style={{
                  fontFamily:'var(--font-lato)', fontWeight:300,
                  fontSize:'0.78rem', color:'#a8a29e', marginBottom:20,
                }}>
                  {location}
                </p>
              )}

              {/* Couple message */}
              {coupleMessage && (
                <>
                  <div style={{ height:1, background:'linear-gradient(90deg,transparent,#e7e5e4,transparent)', margin:'0 auto 20px', width:'70%' }} />
                  <p style={{
                    fontFamily:'var(--font-cormorant)', fontStyle:'italic', fontWeight:400,
                    fontSize:'1rem', color:'#78716c', lineHeight:1.75, marginBottom:20,
                  }}>
                    &ldquo;{coupleMessage.split('\n')[0]}&rdquo;
                  </p>
                </>
              )}

              {/* QR code */}
              <div style={{ height:1, background:'linear-gradient(90deg,transparent,#e7e5e4,transparent)', margin:'0 auto 20px', width:'70%' }} />
              <p style={{
                fontFamily:'var(--font-lato)', fontWeight:300,
                fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase',
                color:'#d6d3d1', marginBottom:12,
              }}>
                Votre espace personnel
              </p>
              <canvas ref={qrRef} width={110} height={110}
                style={{ borderRadius:8, display:'block', margin:'0 auto' }} />

            </div>

            {/* Bottom stripe */}
            <div style={{ height:5, background:'linear-gradient(90deg,#2d3228,#4a5240)' }} />
          </div>

          {/* Buttons */}
          <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginTop:20 }}>
            <button onClick={handleDownload}
              style={{
                background:'#4a5240', color:'#fff', borderRadius:12,
                padding:'10px 28px', fontSize:'0.82rem',
                fontFamily:'var(--font-lato)', fontWeight:300,
                border:'none', cursor:'pointer', letterSpacing:'0.05em',
              }}>
              Télécharger le faire-part
            </button>
            <a href={`/invite/${slug}`}
              style={{
                fontSize:'0.72rem', color:'#b8b0a6',
                fontFamily:'var(--font-lato)', fontWeight:300, textDecoration:'none',
              }}>
              ← Retour à mon espace
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
