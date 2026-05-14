'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

const BODY = 'var(--font-lato)'
const DISPLAY = 'var(--font-cormorant)'

export default function PersonnaliserPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [step, setStep] = useState<'form' | 'sending' | 'done' | 'error'>('form')

  const [form, setForm] = useState({
    prenom1: '',
    prenom2: '',
    date: '',
    lieu: '',
    message: '',
    file: null as File | null,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('sending')

    try {
      const body = new FormData()
      body.append('orderId', orderId)
      body.append('prenom1', form.prenom1)
      body.append('prenom2', form.prenom2)
      body.append('date', form.date)
      body.append('lieu', form.lieu)
      body.append('message', form.message)
      if (form.file) body.append('file', form.file)

      const res = await fetch('/api/studio/personnaliser', { method: 'POST', body })
      if (!res.ok) throw new Error()
      setStep('done')
    } catch {
      setStep('error')
    }
  }

  if (step === 'done') {
    return (
      <main style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 20 }}>✨</div>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '2rem', color: '#2d3228', marginBottom: 12 }}>
            Votre commande est lancée !
          </h1>
          <p style={{ fontFamily: BODY, fontWeight: 300, color: '#78716c', lineHeight: 1.8 }}>
            Nous avons transmis vos informations à notre imprimeur. Vous recevrez un email de suivi dans 24h.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>

        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '2.2rem', color: '#2d3228', marginBottom: 8 }}>
            Personnalisez votre commande
          </h1>
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.9rem', color: '#78716c' }}>
            Ces informations seront intégrées dans votre papeterie avant impression.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', border: '1px solid #e7e3dc', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Prénom marié·e 1" value={form.prenom1} onChange={v => setForm(f => ({ ...f, prenom1: v }))} required />
            <Field label="Prénom marié·e 2" value={form.prenom2} onChange={v => setForm(f => ({ ...f, prenom2: v }))} required />
          </div>

          <Field label="Date du mariage" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} required />
          <Field label="Lieu de la cérémonie" value={form.lieu} onChange={v => setForm(f => ({ ...f, lieu: v }))} placeholder="Château de Villiers, Paris" />

          <div>
            <label style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.82rem', color: '#57534e', display: 'block', marginBottom: 6 }}>
              Message personnalisé <span style={{ color: '#a8a29e', fontWeight: 300 }}>(optionnel)</span>
            </label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3}
              placeholder="Ex : Avec toute notre joie de vous avoir à nos côtés..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e7e3dc', fontFamily: BODY, fontWeight: 300, fontSize: '0.9rem', color: '#2d3228', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontFamily: BODY, fontWeight: 500, fontSize: '0.82rem', color: '#57534e', display: 'block', marginBottom: 6 }}>
              Fichier graphique <span style={{ color: '#a8a29e', fontWeight: 300 }}>(PDF ou image — optionnel)</span>
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => setForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
              style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: '#57534e' }}
            />
            {form.file && (
              <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.78rem', color: '#4a5240', marginTop: 4 }}>
                ✓ {form.file.name}
              </p>
            )}
          </div>

          {step === 'error' && (
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.85rem', color: '#dc2626' }}>
              Une erreur est survenue. Contactez-nous à bonjour@kaatch.fr
            </p>
          )}

          <button
            type="submit"
            disabled={step === 'sending'}
            style={{ background: '#2d3228', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px', fontFamily: BODY, fontWeight: 500, fontSize: '0.92rem', cursor: step === 'sending' ? 'wait' : 'pointer', marginTop: 4 }}
          >
            {step === 'sending' ? 'Envoi en cours...' : 'Valider et lancer l\'impression →'}
          </button>

        </form>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.82rem', color: '#57534e', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e7e3dc', fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem', color: '#2d3228', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  )
}
