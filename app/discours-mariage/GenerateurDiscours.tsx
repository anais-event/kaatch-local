'use client'

import { useState, useRef, useCallback, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { assembleDiscours } from '@/lib/discours-templates'

const SAGE      = '#4a5240'
const SAGE_DARK = '#2d3228'
const BODY      = 'var(--font-body)'
const DISPLAY   = 'var(--font-display)'

type DiscoursType = 'temoin-mariee' | 'temoin-marie' | 'maries' | 'parents' | 'toast'
type Ton          = 'humour' | 'emotion' | 'equilibre'
type Duree        = 'court' | 'moyen' | 'long'
type Step         = 'form' | 'generating' | 'result'

function sanitize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x00-\x7E]/g, '')
}

const TYPE_OPTIONS = [
  { value: 'temoin-mariee' as DiscoursType, icon: '💃', label: 'Témoin de la mariée', desc: 'Best woman, demoiselle d\'honneur' },
  { value: 'temoin-marie'  as DiscoursType, icon: '🤵', label: 'Témoin du marié',     desc: 'Best man, garçon d\'honneur' },
  { value: 'maries'        as DiscoursType, icon: '💍', label: 'Vœux des mariés',     desc: 'Ce que vous vous dites l\'un à l\'autre' },
  { value: 'parents'       as DiscoursType, icon: '👨‍👩‍👧', label: 'Parents',          desc: 'Discours des parents des mariés' },
  { value: 'toast'         as DiscoursType, icon: '🥂', label: 'Toast',               desc: 'Remerciements, fin de repas' },
]

const TON_OPTIONS = [
  { value: 'humour'    as Ton, icon: '😄', label: 'Humour',    desc: 'Léger, drôle, anecdotes marrantes' },
  { value: 'emotion'   as Ton, icon: '💛', label: 'Émotion',   desc: 'Sincère, touchant, profond' },
  { value: 'equilibre' as Ton, icon: '⚖️',  label: 'Les deux', desc: 'Humour et émotion alternés' },
]

const DUREE_OPTIONS = [
  { value: 'court' as Duree, icon: '⚡', label: '~2 min', desc: '300-350 mots' },
  { value: 'moyen' as Duree, icon: '🎯', label: '~5 min', desc: '650-750 mots' },
  { value: 'long'  as Duree, icon: '🎤', label: '~10 min', desc: '1300-1500 mots' },
]

const TYPE_LABELS: Record<DiscoursType, string> = {
  'temoin-mariee': 'Témoin de la mariée',
  'temoin-marie':  'Témoin du marié',
  'maries':        'Vœux des mariés',
  'parents':       'Parents',
  'toast':         'Toast',
}

function ChoiceGrid<T extends string>({
  options, value, onChange, cols = 3,
}: {
  options: { value: T; icon: string; label: string; desc?: string }[]
  value: T | null
  onChange: (v: T) => void
  cols?: 2 | 3 | 5
}) {
  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3'
  return (
    <div className={`grid gap-2.5 ${gridClass}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`p-3.5 rounded-xl border-2 text-left transition-all ${
            value === opt.value ? 'border-[#4a5240]' : 'border-stone-100 hover:border-stone-200 bg-white'
          }`}
          style={{ backgroundColor: value === opt.value ? `${SAGE}12` : undefined }}
        >
          <span className="text-xl block mb-1.5">{opt.icon}</span>
          <p className="text-sm text-stone-800" style={{ fontWeight: value === opt.value ? 500 : 400, fontFamily: BODY }}>
            {opt.label}
          </p>
          {opt.desc && (
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed" style={{ fontWeight: 300, fontFamily: BODY }}>
              {opt.desc}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-stone-700 mb-3" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.95rem', color: SAGE_DARK }}>
      {children}
    </p>
  )
}

function FormSection({ children }: { children: React.ReactNode }) {
  return <div className="mb-7">{children}</div>
}

export default function GenerateurDiscours() {
  const [type,    setType]    = useState<DiscoursType | null>(null)
  const [prenom1, setPrenom1] = useState('')
  const [prenom2, setPrenom2] = useState('')
  const [auteur,  setAuteur]  = useState('')
  const [ton,     setTon]     = useState<Ton | null>(null)
  const [duree,   setDuree]   = useState<Duree>('moyen')

  const [step,       setStep]       = useState<Step>('form')
  const [streamText, setStreamText] = useState('')
  const [editText,   setEditText]   = useState('')
  const [error,      setError]      = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)

  const [emailGiven,      setEmailGiven]      = useState(false)
  const [showEmailModal,  setShowEmailModal]  = useState(false)
  const [emailInput,      setEmailInput]      = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try { setEmailGiven(!!localStorage.getItem('kaatch_discours_email')) } catch {}
  }, [])

  const canGenerate = !!(type && prenom1.trim() && prenom2.trim() && ton)

  const wordCount   = editText.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.round(wordCount / 130))

  const doGenerate = useCallback(() => {
    if (!canGenerate || !ton) return
    setShowEmailModal(false)
    setStep('generating')
    setStreamText('')
    setError(null)

    if (timerRef.current) clearInterval(timerRef.current)

    const fullText = assembleDiscours(ton, duree, prenom1, prenom2, auteur)
    const CHUNK = 10
    let i = 0

    timerRef.current = setInterval(() => {
      i = Math.min(i + CHUNK, fullText.length)
      setStreamText(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setEditText(fullText)
        setStep('result')
        try {
          const c = parseInt(localStorage.getItem('kaatch_discours_count') || '0', 10)
          localStorage.setItem('kaatch_discours_count', String(c + 1))
        } catch {}
      }
    }, 16)
  }, [canGenerate, ton, duree, prenom1, prenom2, auteur])

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return
    try {
      const count = parseInt(localStorage.getItem('kaatch_discours_count') || '0', 10)
      const email = localStorage.getItem('kaatch_discours_email')
      if (count >= 1 && !email) {
        setShowEmailModal(true)
        return
      }
    } catch {}
    doGenerate()
  }, [canGenerate, doGenerate])

  const handleEmailSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    const em = emailInput.trim()
    if (!em) return
    setEmailSubmitting(true)
    try {
      await fetch('/api/discours-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em }),
      })
      localStorage.setItem('kaatch_discours_email', em)
      setEmailGiven(true)
    } catch {}
    setEmailSubmitting(false)
    doGenerate()
  }, [emailInput, doGenerate])

  const handleAbort = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setStep('form')
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [editText])

  const handlePDF = useCallback(() => {
    const typeLabel = type ? TYPE_LABELS[type] : 'Discours'
    const bodyHtml = editText
      .split(/\n\n+/)
      .filter(p => p.trim())
      .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
      .join('')

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Discours ${prenom1} &amp; ${prenom2}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet">
<style>
  @page { margin: 18mm 22mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Lato', sans-serif; font-weight: 300; color: #3a3733; background: #f5f0e8; }
  .page { background: white; max-width: 700px; margin: 0 auto; padding: 56px 64px 52px; min-height: 100vh; }
  .header { text-align: center; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #e5dfd4; }
  .ornament { display: block; color: #4a5240; font-size: 18px; letter-spacing: 14px; margin-bottom: 20px; }
  .type-label { font-family: 'Lato', sans-serif; font-size: 11px; font-weight: 400; letter-spacing: 3.5px; text-transform: uppercase; color: #4a5240; margin-bottom: 12px; }
  .names { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 300; font-style: italic; color: #2d3228; line-height: 1.15; }
  .amp { color: #4a5240; }
  .body p { font-size: 13.5px; line-height: 2.1; margin-bottom: 20px; text-align: justify; hyphens: auto; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5dfd4; text-align: center; font-size: 10px; color: #b0a89f; letter-spacing: 1.5px; text-transform: uppercase; }
  @media print { body { background: white; } .page { max-width: 100%; padding: 0; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <span class="ornament">— ✦ —</span>
    <div class="type-label">${typeLabel}</div>
    <div class="names">${prenom1} <span class="amp">&amp;</span> ${prenom2}</div>
  </div>
  <div class="body">${bodyHtml}</div>
  <div class="footer">Généré par Kaatch &nbsp;·&nbsp; kaatch.fr/discours-mariage</div>
</div>
<script>document.fonts.ready.then(() => { window.print() })<\/script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
  }, [editText, type, prenom1, prenom2])

  const EmailModal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
         style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <p style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: SAGE_DARK, fontSize: '1.55rem', fontWeight: 300 }}>
          Votre discours est prêt ✨
        </p>
        <p className="text-stone-500 text-sm mt-3 mb-6 leading-relaxed" style={{ fontWeight: 300, fontFamily: BODY }}>
          Pour continuer à générer gratuitement,<br />laissez simplement votre email.
        </p>
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            placeholder="votre@email.com"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-700 text-sm focus:outline-none focus:border-[#4a5240] transition"
            style={{ fontWeight: 300, fontFamily: BODY }}
          />
          <button
            type="submit"
            disabled={emailSubmitting}
            className="w-full py-3 rounded-xl text-white text-sm transition"
            style={{ backgroundColor: emailSubmitting ? '#a8b0a0' : SAGE, fontWeight: 400, fontFamily: BODY }}
          >
            {emailSubmitting ? 'Envoi…' : 'Continuer gratuitement →'}
          </button>
        </form>
        <button
          onClick={() => setShowEmailModal(false)}
          className="mt-3 text-xs text-stone-400 hover:text-stone-500 transition"
          style={{ fontWeight: 300, fontFamily: BODY }}
        >
          Non merci
        </button>
      </div>
    </div>
  )

  // ─── FORM ────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <>
      {showEmailModal && EmailModal}
      <div style={{ fontFamily: BODY }} className="pt-24 pb-20 px-5 md:px-10">
        <div className="max-w-2xl mx-auto">

          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#2C3B2E] mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Outils gratuits · Kaatch
            </p>
            <h1 className="text-[#2C3B2E] mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Générateur de discours
            </h1>
            <p className="text-stone-500 text-base leading-relaxed max-w-lg" style={{ fontWeight: 300 }}>
              Renseignez quelques informations — l'IA génère votre discours en direct.
              Éditable, exportable en PDF, sans inscription.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm" style={{ fontWeight: 300 }}>
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 md:p-8 space-y-0">

            <FormSection>
              <FormLabel>Qui fait le discours ?</FormLabel>
              <ChoiceGrid options={TYPE_OPTIONS} value={type} onChange={setType} cols={5} />
            </FormSection>

            <FormSection>
              <FormLabel>Les mariés</FormLabel>
              <div className="flex gap-3">
                <input
                  value={prenom1}
                  onChange={e => setPrenom1(e.target.value)}
                  placeholder="Prénom 1"
                  className="flex-1 text-sm bg-stone-50 rounded-xl border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }}
                />
                <span className="flex items-center text-stone-300 text-lg">&</span>
                <input
                  value={prenom2}
                  onChange={e => setPrenom2(e.target.value)}
                  placeholder="Prénom 2"
                  className="flex-1 text-sm bg-stone-50 rounded-xl border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }}
                />
              </div>
            </FormSection>

            <FormSection>
              <FormLabel>
                Votre prénom{' '}
                <span className="text-stone-400 text-xs ml-1" style={{ fontWeight: 300, fontFamily: BODY }}>optionnel</span>
              </FormLabel>
              <input
                value={auteur}
                onChange={e => setAuteur(e.target.value)}
                placeholder="Pour personnaliser le discours"
                className="w-full text-sm bg-stone-50 rounded-xl border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }}
              />
            </FormSection>

            <FormSection>
              <FormLabel>Le ton</FormLabel>
              <ChoiceGrid options={TON_OPTIONS} value={ton} onChange={setTon} cols={3} />
            </FormSection>

            <FormSection>
              <FormLabel>Durée souhaitée</FormLabel>
              <ChoiceGrid options={DUREE_OPTIONS} value={duree} onChange={setDuree} cols={3} />
            </FormSection>

            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full py-4 text-base text-white rounded-xl transition-all"
                style={{
                  background: canGenerate ? `linear-gradient(135deg, ${SAGE} 0%, ${SAGE_DARK} 100%)` : '#d4d0ca',
                  fontWeight: 500,
                  fontFamily: BODY,
                  cursor: canGenerate ? 'pointer' : 'not-allowed',
                  boxShadow: canGenerate ? `0 4px 20px ${SAGE}40` : 'none',
                }}
              >
                ✨ Générer mon discours
              </button>
              {!canGenerate && (
                <p className="text-center text-xs text-stone-400 mt-2" style={{ fontWeight: 300 }}>
                  Remplissez les champs obligatoires pour continuer
                </p>
              )}
            </div>

          </div>

          <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: SAGE_DARK }}>
            <p className="text-white mb-1.5" style={{ fontWeight: 300, fontSize: '1rem' }}>
              Pour votre mariage en entier
            </p>
            <p className="text-stone-300 text-sm mb-4 leading-relaxed" style={{ fontWeight: 300 }}>
              Invitations, plan de table, photos, programme — tout sur Kaatch, gratuitement.
            </p>
            <Link href="/auth" className="inline-block px-5 py-2.5 bg-white rounded-xl text-sm font-medium hover:bg-stone-100 transition" style={{ color: SAGE_DARK }}>
              Créer mon espace mariage →
            </Link>
          </div>

        </div>
      </div>
      </>
    )
  }

  // ─── GENERATING ──────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div style={{ fontFamily: BODY }} className="pt-24 pb-20 px-5 md:px-10">
        <div className="max-w-2xl mx-auto">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 mb-1 uppercase tracking-widest" style={{ fontWeight: 300 }}>
                Génération en cours…
              </p>
              <h2 className="text-xl text-stone-800" style={{ fontWeight: 300 }}>
                {type ? TYPE_LABELS[type] : 'Discours'}
                {prenom1 && prenom2 && (
                  <span className="text-stone-400"> · {prenom1} & {prenom2}</span>
                )}
              </h2>
            </div>
            <button
              onClick={handleAbort}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-400 text-sm hover:text-stone-600 hover:border-stone-300 transition"
              style={{ fontWeight: 300 }}
            >
              Annuler
            </button>
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-1.5 mb-4 px-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: SAGE,
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
            <span className="text-xs text-stone-400 ml-2" style={{ fontWeight: 300 }}>
              Claude rédige votre discours…
            </span>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(0.85); }
              50% { opacity: 1; transform: scale(1); }
            }
          `}</style>

          <div
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 md:p-8 min-h-[300px]"
            style={{ backgroundColor: '#fdfcf8' }}
          >
            {streamText ? (
              <div className="whitespace-pre-wrap text-stone-700 leading-relaxed" style={{ fontWeight: 300, fontSize: '0.95rem', fontFamily: BODY }}>
                {streamText}
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                  style={{
                    backgroundColor: SAGE,
                    animation: 'blink 1s step-end infinite',
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-stone-300 text-sm" style={{ fontWeight: 300 }}>En cours…</p>
              </div>
            )}
            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
          </div>

        </div>
      </div>
    )
  }

  // ─── RESULT ──────────────────────────────────────────────────────
  return (
    <>
    {showEmailModal && EmailModal}
    <div style={{ fontFamily: BODY }} className="pt-24 pb-20 px-5 md:px-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-stone-400 mb-1 uppercase tracking-widest" style={{ fontWeight: 300 }}>
              Votre discours
            </p>
            <h2 className="text-xl text-stone-800" style={{ fontWeight: 300 }}>
              {type ? TYPE_LABELS[type] : 'Discours'}
              <span className="text-stone-400"> · {prenom1} & {prenom2}</span>
            </h2>
            <p className="text-xs text-stone-400 mt-1" style={{ fontWeight: 300 }}>
              {wordCount} mots · environ {readingTime} min de lecture
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStep('form')}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-500 text-xs hover:border-stone-300 transition"
              style={{ fontWeight: 300 }}
            >
              ← Modifier les paramètres
            </button>
            <button
              onClick={handleGenerate}
              className="px-3 py-2 rounded-xl border text-xs transition"
              style={{ borderColor: SAGE, color: SAGE, fontWeight: 400 }}
            >
              ↺ Régénérer
            </button>
          </div>
        </div>

        {/* Editable speech */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-stone-50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SAGE }} />
            <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
              Texte éditable — cliquez pour modifier
            </p>
          </div>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={Math.max(16, editText.split('\n').length + 4)}
            className="w-full px-6 py-5 focus:outline-none resize-none text-stone-700 leading-relaxed"
            style={{
              fontFamily: BODY,
              fontWeight: 300,
              fontSize: '0.97rem',
              lineHeight: 1.85,
              background: '#fdfcf8',
              border: 'none',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition"
            style={{
              borderColor: copied ? SAGE : '#e7e5e4',
              color: copied ? SAGE : '#78716c',
              backgroundColor: copied ? `${SAGE}08` : 'white',
              fontWeight: 400,
            }}
          >
            {copied ? '✓ Copié !' : '⎘ Copier'}
          </button>
          <button
            onClick={handlePDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-stone-200 text-stone-600 text-sm hover:border-stone-300 transition"
            style={{ fontWeight: 300 }}
          >
            📄 Télécharger PDF
          </button>
        </div>

        <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: SAGE_DARK }}>
          <p className="text-white mb-1" style={{ fontWeight: 300 }}>
            Vous organisez le mariage de {prenom1} & {prenom2} ?
          </p>
          <p className="text-stone-300 text-sm mb-4 leading-relaxed" style={{ fontWeight: 300 }}>
            Kaatch centralise invités, faire-part, plan de table, photos et programme. Gratuit.
          </p>
          <Link href="/auth" className="inline-block px-5 py-2.5 bg-white rounded-xl text-sm font-medium hover:bg-stone-100 transition" style={{ color: SAGE_DARK }}>
            Créer mon espace mariage →
          </Link>
        </div>

      </div>
    </div>
    </>
  )
}
