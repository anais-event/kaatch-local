'use client'

import { useState, useEffect, type FormEvent } from 'react'

const SAGE      = '#4a5240'
const SAGE_DARK = '#2d3228'
const CREAM     = '#f5f0e8'
const WHITE     = '#fffdf9'
const TEXT_MID  = '#5a5549'
const TEXT_SOFT = '#847d73'
const BODY      = 'var(--font-body)'

const LS_KEY = 'kaatch_email_captured'
const DELAY_MS = 12000

export default function EmailPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return
    } catch {}

    const t = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => setVisible(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setLoading(true)
    try {
      await fetch('/api/discours-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      localStorage.setItem(LS_KEY, '1')
    } catch {}
    setLoading(false)
    setSubmitted(true)
    setTimeout(() => setVisible(false), 2200)
  }

  if (!visible) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(45,50,40,0.35)',
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.3s ease both',
        }}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rester en contact"
        style={{
          position: 'fixed',
          bottom: 'clamp(1.5rem, 4vw, 3rem)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: 'min(92vw, 420px)',
          background: WHITE,
          borderRadius: 18,
          padding: '2rem 2rem 1.6rem',
          boxShadow: '0 24px 60px rgba(45,50,40,0.18), 0 4px 16px rgba(45,50,40,0.08)',
          animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
          fontFamily: BODY,
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Fermer"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: TEXT_SOFT, fontSize: '1.1rem', lineHeight: 1,
            padding: '0.2rem 0.4rem', borderRadius: 4,
          }}
        >
          ×
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0 0.8rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🌿</div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: SAGE_DARK, marginBottom: '0.3rem' }}>
              C&apos;est noté, merci !
            </p>
            <p style={{ fontSize: '0.82rem', fontWeight: 300, color: TEXT_MID }}>
              On se retrouvera dans votre boîte mail.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: SAGE,
              background: 'rgba(74,82,64,0.08)',
              padding: '0.25rem 0.7rem', borderRadius: 100,
              marginBottom: '1rem',
            }}>
              Kaatch
            </div>

            <h2 style={{
              fontWeight: 700, fontSize: '1.1rem',
              color: SAGE_DARK, marginBottom: '0.4rem', lineHeight: 1.2,
            }}>
              On reste en contact&nbsp;?
            </h2>
            <p style={{
              fontSize: '0.83rem', fontWeight: 300,
              color: TEXT_MID, lineHeight: 1.6, marginBottom: '1.3rem',
            }}>
              On partage les nouveautés de Kaatch, les coulisses du projet
              et parfois des conseils pour organiser votre mariage sans prise de tête.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '1.5px solid rgba(74,82,64,0.2)',
                  fontSize: '0.88rem', fontWeight: 300,
                  fontFamily: BODY, color: SAGE_DARK,
                  background: CREAM, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = SAGE }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(74,82,64,0.2)' }}
              />
              <button
                type="submit"
                disabled={loading || !email.includes('@')}
                style={{
                  padding: '0.8rem',
                  borderRadius: 8, border: 'none',
                  background: loading ? 'rgba(74,82,64,0.5)' : SAGE,
                  color: WHITE, fontSize: '0.88rem', fontWeight: 500,
                  fontFamily: BODY, cursor: loading ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Envoi…' : "Je m'inscris"}
              </button>
            </form>

            <p style={{
              marginTop: '0.9rem', fontSize: '0.7rem',
              color: TEXT_SOFT, textAlign: 'center', lineHeight: 1.5,
            }}>
              Pas de spam. Pas de revente. Désabonnement en un clic.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}
