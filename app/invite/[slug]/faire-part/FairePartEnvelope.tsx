'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  weddingName: string
  dateStr: string | null
  location: string | null
  coupleMessage: string | null
  coverImageUrl: string | null
  slug: string
}

type Phase = 'curtain-closed' | 'opening' | 'revealed'

// 24 deterministic sparkle particles
const SPARKS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * 360
  const dist = 80 + (i % 3) * 40
  const rad = (angle * Math.PI) / 180
  const tx = Math.round(Math.cos(rad) * dist)
  const ty = Math.round(Math.sin(rad) * dist)
  return {
    tx,
    ty,
    delay: (i % 4) * 100,
    color: (['#c9a96e', '#fff', '#f5f0e8', '#4a5240'] as const)[i % 4],
  }
})

export default function FairePartEnvelope({
  weddingName,
  dateStr,
  location,
  coupleMessage,
  coverImageUrl,
  slug,
}: Props) {
  const [phase, setPhase] = useState<Phase>('curtain-closed')
  const [sparksVisible, setSparksVisible] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('opening')
      setSparksVisible(true)
    }, 800)
    const t2 = setTimeout(() => setPhase('revealed'), 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // QR code generation
  useEffect(() => {
    if (phase !== 'revealed' || !qrRef.current) return
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://kaatch.fr'}/invite/${slug}`
    import('qrcode')
      .then((QRCode) => {
        QRCode.toCanvas(qrRef.current!, url, {
          width: 120,
          margin: 1,
          color: { dark: '#2d3228', light: '#ffffff' },
        })
      })
      .catch(() => {})
  }, [phase, slug])

  const handleDownload = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#f5f0e8'
    ctx.fillRect(0, 0, 600, 900)

    // Top stripe gradient
    const topGrad = ctx.createLinearGradient(0, 0, 600, 0)
    topGrad.addColorStop(0, '#4a5240')
    topGrad.addColorStop(1, '#2d3228')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, 600, 8)

    // Cover image (if available)
    let yOffset = 40
    if (coverImageUrl) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject()
          img.src = coverImageUrl
        })
        // Draw circular avatar
        const cx = 300
        const cy = yOffset + 50
        const r = 50
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
        ctx.restore()
        yOffset += 120
      } catch {
        yOffset += 20
      }
    }

    // Ornament
    ctx.fillStyle = 'rgba(201,169,110,0.6)'
    ctx.font = '16px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText('✦ ✦ ✦', 300, yOffset)
    yOffset += 30

    // Subtitle
    ctx.fillStyle = '#78716c'
    ctx.font = '300 11px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Nous avons la joie de vous annoncer', 300, yOffset)
    yOffset += 50

    // Wedding name
    ctx.fillStyle = '#2d3228'
    ctx.font = 'bold 42px Georgia'
    ctx.textAlign = 'center'
    // Word wrap for long names
    const words = weddingName.split(' ')
    let line = ''
    const lines: string[] = []
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word
      if (ctx.measureText(testLine).width > 520) {
        lines.push(line)
        line = word
      } else {
        line = testLine
      }
    }
    lines.push(line)
    for (const l of lines) {
      ctx.fillText(l, 300, yOffset)
      yOffset += 52
    }
    yOffset += 10

    // Subtitle 2
    ctx.fillStyle = '#78716c'
    ctx.font = '300 11px Arial'
    ctx.fillText('et vous invitent à célébrer leur union', 300, yOffset)
    yOffset += 40

    // Divider
    ctx.strokeStyle = '#e7e5e4'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(220, yOffset)
    ctx.lineTo(380, yOffset)
    ctx.stroke()
    yOffset += 30

    // Date
    if (dateStr) {
      ctx.fillStyle = '#57534e'
      ctx.font = '500 20px Georgia'
      ctx.fillText(dateStr, 300, yOffset)
      yOffset += 30
    }

    // Location
    if (location) {
      ctx.fillStyle = '#a8a29e'
      ctx.font = '300 13px Arial'
      ctx.fillText(location, 300, yOffset)
      yOffset += 40
    }

    // Divider
    ctx.strokeStyle = '#e7e5e4'
    ctx.beginPath()
    ctx.moveTo(220, yOffset)
    ctx.lineTo(380, yOffset)
    ctx.stroke()
    yOffset += 30

    // Couple message
    if (coupleMessage) {
      ctx.fillStyle = '#78716c'
      ctx.font = 'italic 16px Georgia'
      // Wrap long messages
      const msgWords = coupleMessage.split(' ')
      let msgLine = ''
      const msgLines: string[] = []
      for (const word of msgWords) {
        const testLine = msgLine + (msgLine ? ' ' : '') + word
        if (ctx.measureText(testLine).width > 480) {
          msgLines.push(msgLine)
          msgLine = word
        } else {
          msgLine = testLine
        }
      }
      msgLines.push(msgLine)
      for (const l of msgLines) {
        ctx.fillText(`"${l}"`, 300, yOffset)
        yOffset += 26
      }
      yOffset += 20
    }

    // QR code
    if (qrRef.current) {
      const qrX = 300 - 60
      const qrY = yOffset
      ctx.drawImage(qrRef.current, qrX, qrY, 120, 120)
      yOffset += 130
      ctx.fillStyle = '#a8a29e'
      ctx.font = '300 10px Arial'
      ctx.fillText('Flashez pour nous rejoindre', 300, yOffset)
      yOffset += 20
    }

    // Bottom stripe gradient
    const botGrad = ctx.createLinearGradient(0, 0, 600, 0)
    botGrad.addColorStop(0, '#2d3228')
    botGrad.addColorStop(1, '#4a5240')
    ctx.fillStyle = botGrad
    ctx.fillRect(0, 892, 600, 8)

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `faire-part-${slug}.png`
    a.click()
  }

  const leftCurtainX = phase === 'curtain-closed' ? '0%' : '-100%'
  const rightCurtainX = phase === 'curtain-closed' ? '0%' : '100%'
  const curtainTransition = phase === 'opening' || phase === 'revealed'
    ? 'transform 1.4s ease-in-out'
    : 'none'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: phase === 'curtain-closed' ? '#1a2419' : '#f5f0e8',
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
        @keyframes curtain-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .curtain-pulse {
          animation: curtain-pulse 1.5s ease-in-out infinite;
        }
        @keyframes card-rise {
          0%   { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .card-rise {
          animation: card-rise 0.6s ease forwards;
        }
        @keyframes btn-fade {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .btn-fade {
          animation: btn-fade 0.5s ease forwards 0.4s;
          opacity: 0;
        }
      `}</style>

      {/* ── LEFT CURTAIN ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(180deg, #2d3228 0%, #1a2419 100%)',
          backgroundImage:
            'linear-gradient(180deg, #2d3228 0%, #1a2419 100%), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)',
          backgroundBlendMode: 'normal',
          transform: `translateX(${leftCurtainX})`,
          transition: curtainTransition,
          zIndex: 30,
          boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.3)',
        }}
      />

      {/* ── RIGHT CURTAIN ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(180deg, #2d3228 0%, #1a2419 100%)',
          backgroundImage:
            'linear-gradient(180deg, #2d3228 0%, #1a2419 100%), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)',
          backgroundBlendMode: 'normal',
          transform: `translateX(${rightCurtainX})`,
          transition: curtainTransition,
          zIndex: 30,
          boxShadow: 'inset 4px 0 12px rgba(0,0,0,0.3)',
        }}
      />

      {/* ── CENTER GOLD LINE ── */}
      {phase === 'curtain-closed' && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 1,
            height: '100%',
            background: 'rgba(201,169,110,0.4)',
            zIndex: 35,
          }}
        />
      )}

      {/* ── PULSING STAR (curtain-closed) ── */}
      {phase === 'curtain-closed' && (
        <div
          className="curtain-pulse"
          style={{
            position: 'absolute',
            zIndex: 40,
            color: '#c9a96e',
            fontSize: '2rem',
            userSelect: 'none',
          }}
        >
          ✦
        </div>
      )}

      {/* ── SPARKLE PARTICLES ── */}
      {(phase === 'opening' || phase === 'revealed') &&
        SPARKS.map((spark, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: spark.color,
              zIndex: 25,
              transform: sparksVisible
                ? `translate(calc(-50% + ${spark.tx}px), calc(-50% + ${spark.ty}px))`
                : 'translate(-50%, -50%)',
              opacity: sparksVisible ? 0 : 1,
              transition: `transform 1s ease-out ${spark.delay}ms, opacity 1s ease-out ${spark.delay}ms`,
              pointerEvents: 'none',
            }}
          />
        ))}

      {/* ── REVEALED CARD ── */}
      {phase === 'revealed' && (
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            width: '100%',
            maxWidth: 448,
            margin: '0 auto',
            padding: '24px 16px 40px',
            maxHeight: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Card */}
          <div
            className="card-rise"
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Top stripe */}
            <div
              style={{
                height: 6,
                background: 'linear-gradient(90deg, #4a5240 0%, #2d3228 100%)',
              }}
            />

            {/* Card body */}
            <div
              style={{
                padding: '40px 32px',
                textAlign: 'center',
              }}
            >
              {/* Cover image */}
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt={weddingName}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto 24px',
                    display: 'block',
                    boxShadow: '0 0 0 3px rgba(74,82,64,0.2)',
                  }}
                />
              )}

              {/* Ornament */}
              <div
                style={{
                  color: 'rgba(201,169,110,0.6)',
                  letterSpacing: '0.2em',
                  fontSize: '0.75rem',
                  marginBottom: 16,
                }}
              >
                ✦ ✦ ✦
              </div>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily: 'var(--font-lato)',
                  fontWeight: 300,
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#a8a29e',
                  marginBottom: 16,
                }}
              >
                Nous avons la joie de vous annoncer
              </p>

              {/* Wedding name */}
              <h1
                style={{
                  fontFamily: 'var(--font-lato)',
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 8vw, 3rem)',
                  color: '#2d3228',
                  lineHeight: 1.1,
                  marginBottom: 12,
                }}
              >
                {weddingName}
              </h1>

              <p
                style={{
                  fontFamily: 'var(--font-lato)',
                  fontWeight: 300,
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  color: '#a8a29e',
                  marginBottom: 24,
                }}
              >
                et vous invitent à célébrer leur union
              </p>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: '#f5f5f4',
                  margin: '0 auto 24px',
                  width: '60%',
                }}
              />

              {/* Date */}
              {dateStr && (
                <p
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    color: '#57534e',
                    textTransform: 'capitalize',
                    marginBottom: 6,
                  }}
                >
                  {dateStr}
                </p>
              )}

              {/* Location */}
              {location && (
                <p
                  style={{
                    fontFamily: 'var(--font-lato)',
                    fontWeight: 300,
                    fontSize: '0.75rem',
                    color: '#a8a29e',
                    marginBottom: 24,
                  }}
                >
                  {location}
                </p>
              )}

              {(dateStr || location) && (
                <div
                  style={{
                    height: 1,
                    background: '#f5f5f4',
                    margin: '0 auto 24px',
                    width: '60%',
                  }}
                />
              )}

              {/* Couple message */}
              {coupleMessage && (
                <>
                  <p
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: '1rem',
                      color: '#78716c',
                      lineHeight: 1.7,
                      marginBottom: 24,
                    }}
                  >
                    &ldquo;{coupleMessage}&rdquo;
                  </p>
                  <div
                    style={{
                      height: 1,
                      background: '#f5f5f4',
                      margin: '0 auto 24px',
                      width: '60%',
                    }}
                  />
                </>
              )}

              {/* QR code */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-lato)',
                    fontWeight: 300,
                    fontSize: '0.65rem',
                    color: '#d6d3d1',
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                  }}
                >
                  Flashez pour nous rejoindre
                </p>
                <canvas
                  ref={qrRef}
                  width={120}
                  height={120}
                  style={{ borderRadius: 8 }}
                />
              </div>
            </div>

            {/* Bottom stripe */}
            <div
              style={{
                height: 6,
                background: 'linear-gradient(90deg, #2d3228 0%, #4a5240 100%)',
              }}
            />
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="btn-fade"
            style={{
              marginTop: 24,
              background: '#4a5240',
              color: '#fff',
              borderRadius: 12,
              padding: '10px 24px',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-lato)',
              fontWeight: 300,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Télécharger le faire-part
          </button>

          {/* Back link */}
          <a
            href={`/invite/${slug}`}
            style={{
              marginTop: 12,
              fontSize: '0.75rem',
              color: '#a8a29e',
              fontFamily: 'var(--font-lato)',
              fontWeight: 300,
              textDecoration: 'none',
            }}
          >
            ← Retour
          </a>
        </div>
      )}
    </div>
  )
}
