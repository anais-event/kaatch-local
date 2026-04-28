'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'code' | 'name' | 'qr'
type Step = 'input' | 'auth'

interface WeddingInfo {
  id: string
  slug: string
  name: string
}

export default function JoindreForm() {
  const [tab, setTab] = useState<Tab>('code')
  const [step, setStep] = useState<Step>('input')

  // Code tab
  const [code, setCode] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [wedding, setWedding] = useState<WeddingInfo | null>(null)

  // Auth step (after code or QR)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Name tab
  const [nameFirst, setNameFirst] = useState('')
  const [nameLast, setNameLast] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState('')

  // QR tab
  const [scanning, setScanning] = useState(false)
  const [qrError, setQrError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const router = useRouter()

  // ── Code: validate & fetch wedding info ──
  async function handleCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setCodeLoading(true)
    setCodeError('')
    const res = await fetch(`/api/wedding-by-code?code=${code.trim().toUpperCase()}`)
    const data = await res.json()
    setCodeLoading(false)
    if (data.ok) {
      setWedding(data.wedding)
      setStep('auth')
    } else {
      setCodeError(data.message || 'Code introuvable. Vérifiez avec les mariés.')
    }
  }

  // ── Auth: validate guest by name for a known wedding ──
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !wedding) return
    setAuthLoading(true)
    setAuthError('')
    const res = await fetch('/api/guest-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingId: wedding.id,
        weddingSlug: wedding.slug,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }),
    })
    const data = await res.json()
    setAuthLoading(false)
    if (data.ok) {
      router.push(`/invite/${wedding.slug}`)
    } else {
      setAuthError(data.message || "Nom introuvable sur la liste d'invités.")
    }
  }

  // ── Name: search across all weddings ──
  async function handleName(e: React.FormEvent) {
    e.preventDefault()
    if (!nameFirst.trim() || !nameLast.trim()) return
    setNameLoading(true)
    setNameError('')
    const res = await fetch('/api/guest-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: nameFirst.trim(), lastName: nameLast.trim() }),
    })
    const data = await res.json()
    setNameLoading(false)
    if (data.ok) {
      router.push(`/invite/${data.slug}`)
    } else {
      setNameError(data.message)
    }
  }

  // ── QR scanner ──
  async function startScanner() {
    setScanning(true)
    setQrError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current!)
      stream.getTracks().forEach(t => t.stop())
      setScanning(false)

      const text = result.getText()
      // Support /p/CODE and /i/TOKEN URLs
      const codeMatch = text.match(/\/p\/([A-Z0-9\-]+)/i)
      if (codeMatch) {
        const extracted = codeMatch[1].toUpperCase()
        setCodeLoading(true)
        const res = await fetch(`/api/wedding-by-code?code=${extracted}`)
        const data = await res.json()
        setCodeLoading(false)
        if (data.ok) {
          setWedding(data.wedding)
          setStep('auth')
          setTab('code')
        } else {
          setQrError('QR code invalide.')
        }
        return
      }
      // /i/token → redirect directly
      const tokenMatch = text.match(/\/i\/([a-z0-9]+)/i)
      if (tokenMatch) {
        router.push(`/i/${tokenMatch[1]}`)
        return
      }
      // raw URL
      if (text.startsWith('http')) {
        router.push(text)
        return
      }
      setQrError('QR code non reconnu.')
    } catch {
      setScanning(false)
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
      setQrError('Impossible de scanner. Utilisez le code à la place.')
    }
  }

  function stopScanner() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
    setScanning(false)
  }

  const inputClass = "w-full border border-stone-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
  const inputStyle = { fontFamily: 'var(--font-lato)', fontWeight: 300 } as const
  const btnPrimary = "w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"

  // ── Auth step (after code or QR) ──
  if (step === 'auth' && wedding) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-stone-100 rounded-2xl px-5 py-3 text-center mb-2">
          <p className="text-xs tracking-widest text-stone-400 uppercase mb-1" style={inputStyle}>Mariage trouvé</p>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.3rem' }} className="text-[#2d3228]">
            {wedding.name}
          </p>
        </div>
        <p className="text-sm text-stone-400 text-center" style={inputStyle}>
          Identifiez-vous pour accéder à votre espace
        </p>
        <form onSubmit={handleAuth} className="space-y-3">
          <input
            type="text"
            placeholder="Prénom *"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Nom *"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          {authError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl mb-1">🚫</p>
              <p style={{ ...inputStyle, fontSize: '0.85rem' }} className="text-red-500">{authError}</p>
            </div>
          )}
          <button type="submit" disabled={authLoading} className={btnPrimary} style={inputStyle}>
            {authLoading ? 'Vérification…' : 'Accéder au mariage →'}
          </button>
        </form>
        <button
          onClick={() => { setStep('input'); setAuthError(''); setFirstName(''); setLastName('') }}
          className="w-full text-sm text-stone-400 hover:text-[#4a5240] transition pt-1"
          style={inputStyle}
        >
          ← Changer de code
        </button>
      </div>
    )
  }

  // ── Tabs ──
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'code', label: 'Code', icon: '#' },
    { id: 'name', label: 'Mon nom', icon: '✦' },
    { id: 'qr', label: 'QR code', icon: '📷' },
  ]

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex bg-stone-100 rounded-2xl p-1 gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setCodeError(''); setNameError(''); setQrError('') }}
            className={`flex-1 py-2 rounded-xl text-sm transition ${tab === t.id ? 'bg-white shadow-sm text-[#2d3228]' : 'text-stone-400 hover:text-stone-600'}`}
            style={{ fontFamily: 'var(--font-lato)', fontWeight: tab === t.id ? 400 : 300 }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Code tab */}
      {tab === 'code' && (
        <form onSubmit={handleCode} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: SOPHIE-JULIEN-2028"
            className={inputClass + ' text-center tracking-wider'}
            style={inputStyle}
            autoFocus
          />
          {codeError && <p className="text-red-400 text-sm text-center" style={inputStyle}>{codeError}</p>}
          <button type="submit" disabled={codeLoading} className={btnPrimary} style={inputStyle}>
            {codeLoading ? 'Vérification…' : 'Continuer →'}
          </button>
        </form>
      )}

      {/* Name tab */}
      {tab === 'name' && (
        <form onSubmit={handleName} className="space-y-3">
          <input
            type="text"
            placeholder="Prénom *"
            value={nameFirst}
            onChange={e => setNameFirst(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
            autoFocus
          />
          <input
            type="text"
            placeholder="Nom *"
            value={nameLast}
            onChange={e => setNameLast(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          {nameError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl mb-1">🚫</p>
              <p style={{ ...inputStyle, fontSize: '0.85rem' }} className="text-red-500">{nameError}</p>
            </div>
          )}
          <button type="submit" disabled={nameLoading} className={btnPrimary} style={inputStyle}>
            {nameLoading ? 'Recherche…' : 'Accéder au mariage →'}
          </button>
        </form>
      )}

      {/* QR tab */}
      {tab === 'qr' && (
        <div className="space-y-3">
          {!scanning ? (
            <button
              onClick={startScanner}
              className="w-full border border-[#4a5240] text-[#4a5240] py-4 rounded-2xl hover:bg-[#4a5240] hover:text-white transition flex items-center justify-center gap-2 text-sm"
              style={inputStyle}
            >
              📷 Activer la caméra
            </button>
          ) : (
            <div className="space-y-3">
              <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
              <button
                onClick={stopScanner}
                className="w-full border border-stone-200 text-stone-400 py-2 rounded-xl hover:bg-stone-100 transition text-sm"
                style={inputStyle}
              >
                Annuler
              </button>
            </div>
          )}
          {codeLoading && <p className="text-center text-sm text-stone-400" style={inputStyle}>Vérification du QR…</p>}
          {qrError && <p className="text-red-400 text-sm text-center" style={inputStyle}>{qrError}</p>}
        </div>
      )}
    </div>
  )
}
