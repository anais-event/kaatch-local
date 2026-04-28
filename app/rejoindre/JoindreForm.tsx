'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'name' | 'code' | 'qr'

export default function JoindreForm() {
  const [tab, setTab] = useState<Tab>('name')
  const router = useRouter()

  // ── Shared styles ──
  const inputClass = "w-full border border-stone-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 placeholder-stone-300"
  const inputStyle = { fontFamily: 'var(--font-lato)', fontWeight: 300 } as const
  const btnPrimary = "w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50 text-sm"
  const btnStyle = { fontFamily: 'var(--font-lato)', fontWeight: 300 } as const

  // ── Tab: Mon nom (search by name across all weddings) ──
  const [nameFirst, setNameFirst] = useState('')
  const [nameLast, setNameLast] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState('')

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
      setNameError(data.message || "Nom introuvable. Vérifiez avec les mariés.")
    }
  }

  // ── Tab: J'ai un code (code + nom en une seule étape) ──
  const [code, setCode] = useState('')
  const [codeFirst, setCodeFirst] = useState('')
  const [codeLast, setCodeLast] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeError, setCodeError] = useState('')

  async function handleCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !codeFirst.trim() || !codeLast.trim()) return
    setCodeLoading(true)
    setCodeError('')

    // Step 1: find wedding by code
    const resCode = await fetch(`/api/wedding-by-code?code=${code.trim().toUpperCase()}`)
    const dataCode = await resCode.json()
    if (!dataCode.ok) {
      setCodeLoading(false)
      setCodeError(dataCode.message || "Code introuvable. Vérifiez avec les mariés.")
      return
    }

    // Step 2: auth by name
    const resAuth = await fetch('/api/guest-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingId: dataCode.wedding.id,
        weddingSlug: dataCode.wedding.slug,
        firstName: codeFirst.trim(),
        lastName: codeLast.trim(),
      }),
    })
    const dataAuth = await resAuth.json()
    setCodeLoading(false)
    if (dataAuth.ok) {
      router.push(`/invite/${dataCode.wedding.slug}`)
    } else {
      setCodeError(dataAuth.message || "Nom introuvable sur la liste. Vérifiez l'orthographe.")
    }
  }

  // ── Tab: QR code ──
  const [scanning, setScanning] = useState(false)
  const [qrError, setQrError] = useState('')
  const [qrLoading, setQrLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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
      const codeMatch = text.match(/\/p\/([A-Z0-9\-]+)/i)
      if (codeMatch) {
        setQrLoading(true)
        const res = await fetch(`/api/wedding-by-code?code=${codeMatch[1].toUpperCase()}`)
        const data = await res.json()
        setQrLoading(false)
        if (data.ok) {
          router.push(`/p/${codeMatch[1].toUpperCase()}`)
        } else {
          setQrError('QR code invalide.')
        }
        return
      }
      const tokenMatch = text.match(/\/i\/([a-z0-9]+)/i)
      if (tokenMatch) { router.push(`/i/${tokenMatch[1]}`); return }
      if (text.startsWith('http')) { router.push(text); return }
      setQrError('QR code non reconnu. Essayez avec le code.')
    } catch {
      setScanning(false)
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
      setQrError("Impossible d'accéder à la caméra. Utilisez le code à la place.")
    }
  }

  function stopScanner() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
    setScanning(false)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'name', label: 'Mon prénom / nom' },
    { id: 'code', label: "J'ai un code" },
    { id: 'qr',   label: 'QR code 📷' },
  ]

  return (
    <div className="space-y-5 w-full">
      {/* Tab switcher */}
      <div className="flex bg-stone-100 rounded-2xl p-1 gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setNameError(''); setCodeError(''); setQrError('') }}
            className={`flex-1 py-2 px-1 rounded-xl text-xs transition leading-tight ${tab === t.id ? 'bg-white shadow-sm text-[#2d3228]' : 'text-stone-400 hover:text-stone-600'}`}
            style={{ fontFamily: 'var(--font-lato)', fontWeight: tab === t.id ? 500 : 300 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Mon nom ── */}
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
              <p className="text-xl mb-1">🚫</p>
              <p style={{ ...inputStyle, fontSize: '0.82rem' }} className="text-red-500">{nameError}</p>
            </div>
          )}
          <button type="submit" disabled={nameLoading} className={btnPrimary} style={btnStyle}>
            {nameLoading ? 'Recherche…' : 'Accéder au mariage →'}
          </button>
          <p className="text-xs text-stone-400 text-center" style={{ fontWeight: 300 }}>
            Votre prénom/nom doit correspondre à la liste des mariés.
          </p>
        </form>
      )}

      {/* ── Tab: Code ── */}
      {tab === 'code' && (
        <form onSubmit={handleCode} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Code — ex: SOPHIE-JULIEN-2028"
            className={inputClass + ' text-center tracking-wider'}
            style={inputStyle}
            autoFocus
          />
          <input
            type="text"
            placeholder="Prénom *"
            value={codeFirst}
            onChange={e => setCodeFirst(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Nom *"
            value={codeLast}
            onChange={e => setCodeLast(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          {codeError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
              <p className="text-xl mb-1">🚫</p>
              <p style={{ ...inputStyle, fontSize: '0.82rem' }} className="text-red-500">{codeError}</p>
            </div>
          )}
          <button type="submit" disabled={codeLoading} className={btnPrimary} style={btnStyle}>
            {codeLoading ? 'Vérification…' : 'Accéder au mariage →'}
          </button>
        </form>
      )}

      {/* ── Tab: QR ── */}
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
          {qrLoading && <p className="text-center text-sm text-stone-400" style={inputStyle}>Vérification…</p>}
          {qrError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
              <p style={{ ...inputStyle, fontSize: '0.82rem' }} className="text-red-500">{qrError}</p>
            </div>
          )}
          <p className="text-xs text-stone-400 text-center" style={{ fontWeight: 300 }}>
            Scannez le QR code sur votre faire-part ou sur les tables.
          </p>
        </div>
      )}
    </div>
  )
}
