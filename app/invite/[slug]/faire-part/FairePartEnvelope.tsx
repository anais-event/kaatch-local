'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { FairePartCard, THEMES, parseNames, type ThemeKey } from './FairePartCard'

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
  guestId?: string | null
  inviteToken?: string | null
  rsvpStatus?: string | null
  plusOneAllowed?: boolean
  plusOneCount?: number
  dietary?: string | null
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
  guestId = null, inviteToken = null, rsvpStatus = null, plusOneAllowed = false, plusOneCount = 0, dietary = null,
}: Props) {
  const [phase, setPhase] = useState<Phase>('curtain-closed')
  const [showRain, setShowRain] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [rsvp, setRsvp] = useState<string | null>(rsvpStatus)
  const [rsvpBusy, setRsvpBusy] = useState(false)
  const [party, setParty] = useState<number>(plusOneCount || 0)
  const [diet, setDiet] = useState<string>(dietary || '')
  const [detailsBusy, setDetailsBusy] = useState(false)
  const [detailsSaved, setDetailsSaved] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)

  async function respond(status: 'confirme' | 'decline') {
    if (!inviteToken || rsvpBusy) return
    setRsvpBusy(true)
    const prev = rsvp
    setRsvp(status) // optimiste
    setDetailsSaved(false)
    try {
      const supabase = createClient()
      // Écriture via RPC SECURITY DEFINER (le token = capacité) — l'UPDATE direct
      // est bloqué par la RLS pour les invités anonymes.
      const { error } = await supabase.rpc('guest_rsvp', {
        p_token: inviteToken,
        p_status: status,
        p_plus_one_count: status === 'confirme' && plusOneAllowed ? party : 0,
        p_dietary: status === 'confirme' ? (diet.trim() || null) : null,
      })
      if (error) { setRsvp(prev); return }
      if (status === 'decline') setParty(0)
      fetch('/api/rsvp-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, slug }),
      }).catch(() => {})
    } catch {
      setRsvp(prev)
    } finally {
      setRsvpBusy(false)
    }
  }

  async function saveDetails() {
    if (!inviteToken || detailsBusy) return
    setDetailsBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('guest_rsvp', {
        p_token: inviteToken,
        p_status: 'confirme',
        p_plus_one_count: plusOneAllowed ? party : 0,
        p_dietary: diet.trim() || null,
      })
      if (!error) {
        setDetailsSaved(true)
        setTimeout(() => setDetailsSaved(false), 2500)
      }
    } finally {
      setDetailsBusy(false)
    }
  }

  const themeKey: ThemeKey = (['classique', 'champetre', 'romantique'] as const).includes(themeProp as ThemeKey)
    ? (themeProp as ThemeKey)
    : 'classique'
  const t = THEMES[themeKey]

  // Couleurs UI adaptées au thème (champetre = fond clair → texte foncé)
  const isLight = themeKey === 'champetre'
  const uiText = t.textColor
  const uiSubtle = t.subtleText
  const uiFaint = isLight ? 'rgba(36,46,22,0.45)' : 'rgba(255,255,255,0.4)'
  const uiPanelBg = isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.07)'
  const uiPanelBorder = t.borderColor
  const uiFieldBg = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.08)'
  const uiFieldBorder = isLight ? 'rgba(36,46,22,0.22)' : 'rgba(255,255,255,0.18)'
  const uiBtnText = isLight ? '#2d4018' : '#2d3a22'

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('opening'); setShowRain(true) }, 600)
    const t2 = setTimeout(() => setPhase('revealed'), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Faire-part PDF vectoriel (A5) — dessiné à la main, typo nette, imprimable.
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const [{ jsPDF }, QRCode] = await Promise.all([
        import('jspdf'),
        import('qrcode').then(m => m.default),
      ])

      const W = 148, H = 210 // A5 portrait
      const CX = W / 2
      const accent = t.accent
      const INK = '#2d3228'
      const BODY = '#6f6a5f'
      const SUBTLE = '#9a9384'
      const PAPER: [number, number, number] = [247, 244, 236]

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })

      // Papier crème
      pdf.setFillColor(...PAPER)
      pdf.rect(0, 0, W, H, 'F')

      // Double cadre fin
      pdf.setDrawColor(accent)
      pdf.setLineWidth(0.5); pdf.rect(9, 9, W - 18, H - 18)
      pdf.setLineWidth(0.15); pdf.rect(11.5, 11.5, W - 23, H - 23)

      const [name1, name2] = parseNames(weddingName)

      // Intro
      let y = 34
      pdf.setFont('times', 'italic'); pdf.setFontSize(11); pdf.setTextColor(SUBTLE)
      pdf.text('Vous êtes invités au mariage de', CX, y, { align: 'center' })

      // Noms
      y += 20
      pdf.setFont('times', 'bold'); pdf.setFontSize(29); pdf.setTextColor(INK)
      pdf.setCharSpace(2)
      pdf.text((name1 || weddingName).toUpperCase(), CX, y, { align: 'center' })
      if (name2) {
        y += 9
        pdf.setCharSpace(0); pdf.setFont('times', 'italic'); pdf.setFontSize(15); pdf.setTextColor(accent)
        pdf.text('&', CX, y, { align: 'center' })
        y += 11
        pdf.setFont('times', 'bold'); pdf.setFontSize(29); pdf.setTextColor(INK); pdf.setCharSpace(2)
        pdf.text(name2.toUpperCase(), CX, y, { align: 'center' })
      }
      pdf.setCharSpace(0)

      // Filet doré
      y += 11
      pdf.setDrawColor(accent); pdf.setLineWidth(0.4)
      pdf.line(CX - 16, y, CX + 16, y)
      pdf.setFontSize(9); pdf.setTextColor(accent); pdf.setFont('times', 'normal')
      pdf.text('•', CX, y + 0.6, { align: 'center' })

      // Date
      if (dateStr) {
        y += 10
        pdf.setFont('times', 'italic'); pdf.setFontSize(12); pdf.setTextColor(INK)
        pdf.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), CX, y, { align: 'center' })
      }
      // Lieu
      if (location) {
        y += 7
        pdf.setFont('times', 'italic'); pdf.setFontSize(10.5); pdf.setTextColor(SUBTLE)
        pdf.text(location, CX, y, { align: 'center' })
      }

      // Message des mariés
      y += 16
      const message = coupleMessage?.trim()
        || 'Nous sommes tellement heureux de vous compter parmi nos invités.\nVotre présence rendra ce jour inoubliable.'
      pdf.setFont('times', 'italic'); pdf.setFontSize(11.5); pdf.setTextColor(BODY)
      const lines = message.split('\n').flatMap(l => pdf.splitTextToSize(l, W - 46) as string[])
      lines.forEach(line => { pdf.text(line, CX, y, { align: 'center' }); y += 6.4 })

      // Signature
      y += 4
      pdf.setFont('times', 'italic'); pdf.setFontSize(11); pdf.setTextColor(accent)
      pdf.text(`— ${weddingName}`, CX, y, { align: 'center' })

      // QR (ancré vers le bas)
      const qrDataUrl = await QRCode.toDataURL(personalUrl, {
        width: 600, margin: 1, color: { dark: INK, light: '#f7f4ec' },
      })
      const qrSize = 30
      const qrY = Math.min(Math.max(y + 12, 150), H - 42)
      pdf.setFont('times', 'normal'); pdf.setFontSize(8); pdf.setTextColor(SUBTLE)
      pdf.text('SCANNEZ POUR VOTRE ESPACE & RSVP', CX, qrY - 4, { align: 'center', charSpace: 0.5 })
      pdf.addImage(qrDataUrl, 'PNG', CX - qrSize / 2, qrY, qrSize, qrSize)

      // Pied
      pdf.setFont('times', 'italic'); pdf.setFontSize(8.5); pdf.setTextColor(SUBTLE)
      pdf.text('Réalisé avec Kaatch', CX, H - 16, { align: 'center' })

      pdf.save(`faire-part-${weddingName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.pdf`)
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
            background: uiFieldBg, backdropFilter:'blur(8px)',
            border:`1px solid ${uiFieldBorder}`, borderRadius:99,
            padding:'6px 14px', display:'flex', alignItems:'center', gap:6,
            color: uiText, textDecoration:'none',
            fontFamily:'var(--font-lato)', fontWeight:300, fontSize:'0.75rem',
            letterSpacing:'0.04em', transition:'all 0.2s' }}>
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

          {/* RSVP — répondre directement depuis le faire-part */}
          {guestId && (
            <div className="fade-up" style={{
              marginTop: 20, marginBottom: 20,
              background: uiPanelBg,
              border: `1px solid ${uiPanelBorder}`,
              borderRadius: 16, padding: '20px 22px', textAlign: 'center',
            }}>
              {rsvp === 'confirme' ? (
                <>
                  <p style={{ fontFamily:'var(--font-cormorant)', fontStyle:'italic', fontWeight:500,
                    fontSize:'1.3rem', color: t.accent, marginBottom:4 }}>
                    ✓ Votre présence est confirmée
                  </p>
                  <p style={{ fontFamily:'var(--font-lato)', fontWeight:300, fontSize:'0.75rem',
                    color: uiSubtle, marginBottom:16 }}>
                    Les mariés ont hâte de vous voir !
                  </p>

                  {/* Détails : accompagnants + régime */}
                  <div style={{ textAlign:'left', display:'flex', flexDirection:'column', gap:14,
                    borderTop:`1px solid ${uiPanelBorder}`, paddingTop:16, marginBottom:14 }}>
                    {plusOneAllowed && (
                      <div>
                        <label style={{ display:'block', fontFamily:'var(--font-lato)', fontWeight:300,
                          fontSize:'0.75rem', color: uiSubtle, marginBottom:8 }}>
                          Combien d&apos;accompagnants ?
                        </label>
                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                          <button type="button" onClick={() => setParty(n => Math.max(0, n - 1))}
                            style={{ width:36, height:36, borderRadius:'50%',
                              background: uiFieldBg, border:`1px solid ${uiFieldBorder}`,
                              color: uiText, fontSize:'1.1rem', cursor:'pointer',
                              display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
                            −
                          </button>
                          <span style={{ fontFamily:'var(--font-cormorant)', fontStyle:'italic',
                            fontWeight:500, fontSize:'1.5rem', color: uiText, minWidth:24, textAlign:'center' }}>
                            {party}
                          </span>
                          <button type="button" onClick={() => setParty(n => Math.min(20, n + 1))}
                            style={{ width:36, height:36, borderRadius:'50%',
                              background: uiFieldBg, border:`1px solid ${uiFieldBorder}`,
                              color: uiText, fontSize:'1.1rem', cursor:'pointer',
                              display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
                            +
                          </button>
                          <span style={{ fontFamily:'var(--font-lato)', fontWeight:300, fontSize:'0.72rem',
                            color: uiFaint }}>
                            {party === 0 ? 'Je viens seul(e)' : `soit ${party + 1} personnes`}
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <label style={{ display:'block', fontFamily:'var(--font-lato)', fontWeight:300,
                        fontSize:'0.75rem', color: uiSubtle, marginBottom:8 }}>
                        Régime alimentaire, allergies ? <span style={{ color: uiFaint }}>(optionnel)</span>
                      </label>
                      <textarea value={diet} onChange={e => setDiet(e.target.value)} rows={2}
                        placeholder="Végétarien, sans gluten, allergie…"
                        style={{ width:'100%', resize:'none', borderRadius:10,
                          background: uiFieldBg, border:`1px solid ${uiFieldBorder}`,
                          color: uiText, padding:'10px 12px', fontFamily:'var(--font-lato)', fontWeight:300,
                          fontSize:'0.82rem', outline:'none' }} />
                    </div>
                    <button type="button" onClick={saveDetails} disabled={detailsBusy}
                      style={{ background: detailsSaved ? uiPanelBg : t.accent,
                        color: detailsSaved ? uiText : uiBtnText,
                        border: detailsSaved ? `1px solid ${uiFieldBorder}` : 'none',
                        borderRadius:10, padding:'10px', cursor:'pointer',
                        fontFamily:'var(--font-lato)', fontWeight:600, fontSize:'0.8rem',
                        letterSpacing:'0.03em', opacity: detailsBusy ? 0.6 : 1, transition:'all 0.2s' }}>
                      {detailsBusy ? '…' : detailsSaved ? '✓ Enregistré' : 'Enregistrer mes infos'}
                    </button>
                  </div>

                  <button onClick={() => respond('decline')} disabled={rsvpBusy}
                    style={{ background:'none', border:'none', cursor:'pointer',
                      color: uiFaint, fontFamily:'var(--font-lato)', fontWeight:300,
                      fontSize:'0.72rem', textDecoration:'underline' }}>
                    Annuler ma présence
                  </button>
                </>
              ) : rsvp === 'decline' ? (
                <>
                  <p style={{ fontFamily:'var(--font-cormorant)', fontStyle:'italic', fontWeight:500,
                    fontSize:'1.3rem', color: uiText, marginBottom:4 }}>
                    Réponse enregistrée
                  </p>
                  <p style={{ fontFamily:'var(--font-lato)', fontWeight:300, fontSize:'0.75rem',
                    color: uiSubtle, marginBottom:12 }}>
                    Vous nous manquerez…
                  </p>
                  <button onClick={() => respond('confirme')} disabled={rsvpBusy}
                    style={{ background:'none', border:'none', cursor:'pointer',
                      color: t.accent, fontFamily:'var(--font-lato)', fontWeight:300,
                      fontSize:'0.72rem', textDecoration:'underline' }}>
                    Finalement, je serai présent(e)
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontFamily:'var(--font-cormorant)', fontStyle:'italic', fontWeight:500,
                    fontSize:'1.4rem', color: uiText, marginBottom:14 }}>
                    Serez-vous des nôtres&nbsp;?
                  </p>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => respond('confirme')} disabled={rsvpBusy}
                      style={{ flex:1, background: t.accent,
                        color: uiBtnText,
                        border:'none', borderRadius:10, padding:'12px', cursor:'pointer',
                        fontFamily:'var(--font-lato)', fontWeight:600, fontSize:'0.82rem',
                        letterSpacing:'0.03em', opacity: rsvpBusy ? 0.6 : 1 }}>
                      🥂 Avec plaisir
                    </button>
                    <button onClick={() => respond('decline')} disabled={rsvpBusy}
                      style={{ flex:1, background: uiFieldBg, color: uiSubtle,
                        border:`1px solid ${uiFieldBorder}`, borderRadius:10, padding:'12px',
                        cursor:'pointer', fontFamily:'var(--font-lato)', fontWeight:400, fontSize:'0.82rem',
                        opacity: rsvpBusy ? 0.6 : 1 }}>
                      Je ne pourrai pas
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

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
                <div style={{ background: uiFieldBg, borderRadius:10,
                  padding:'11px 32px', fontSize:'0.82rem',
                  fontFamily:'var(--font-lato)', fontWeight:400, color: uiFaint,
                  letterSpacing:'0.05em', cursor:'default' }}>
                  🔒 Téléchargement — Formule Mariage
                </div>
              </div>
            )}
            <a href={`/invite/${slug}`}
              style={{ fontSize:'0.72rem', color: uiFaint,
                fontFamily:'var(--font-lato)', fontWeight:300, textDecoration:'none' }}>
              ← Retour à mon espace
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
