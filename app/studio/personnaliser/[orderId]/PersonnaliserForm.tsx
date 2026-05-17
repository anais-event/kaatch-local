'use client'

import { useState } from 'react'

type OrderData = {
  id: string
  ambiance_id: string
  products: string[]
  quantities: Record<string, number>
  total_cents: number
  wedding_info: { name1: string; name2: string; date: string; lieu: string } | null
  personalization: Record<string, unknown> | null
  status: string
}

const PRODUCT_LABELS: Record<string, string> = {
  save_the_date: '📅 Save the date',
  faire_part: '💌 Faire-part',
  menu: '🍽️ Menu',
  marque_place: '🏷️ Marque-place',
  numero_table: '🔢 Numéro de table',
  plan_table: '🗺️ Plan de table',
  plan_ceremonie: '⛪ Plan de cérémonie',
}

export default function PersonnaliserForm({ order }: { order: OrderData }) {
  const w = order.wedding_info
  const p = order.personalization ?? {}

  const [form, setForm] = useState({
    prenom1: (p.prenom1 as string) || w?.name1 || '',
    prenom2: (p.prenom2 as string) || w?.name2 || '',
    date: (p.date as string) || w?.date || '',
    lieu: (p.lieu as string) || w?.lieu || '',
    message: (p.message as string) || (p.coupleMessage as string) || '',
  })
  const [step, setStep] = useState<'form' | 'sending' | 'done' | 'error'>('form')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('sending')
    try {
      const body = new FormData()
      body.append('orderId', order.id)
      body.append('prenom1', form.prenom1)
      body.append('prenom2', form.prenom2)
      body.append('date', form.date)
      body.append('lieu', form.lieu)
      body.append('message', form.message)
      const res = await fetch('/api/studio/personnaliser', { method: 'POST', body })
      if (!res.ok) throw new Error()
      setStep('done')
    } catch {
      setStep('error')
    }
  }

  if (step === 'done') {
    return (
      <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-5" style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="max-w-md text-center">
          <div className="text-4xl mb-5">✨</div>
          <h1 className="mb-3" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '2rem', color: '#2d3228' }}>Impression lancée !</h1>
          <p style={{ fontWeight: 300, fontSize: '0.92rem', color: '#78716c', lineHeight: 1.8 }}>Vos créations ont été transmises à notre imprimeur. Vous recevrez un email de suivi sous 24h.</p>
        </div>
      </main>
    )
  }

  if (order.status === 'sent_to_gelato' || order.status === 'perso_done') {
    return (
      <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-5" style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="max-w-md text-center">
          <div className="text-4xl mb-5">📦</div>
          <h1 className="mb-3" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '2rem', color: '#2d3228' }}>Commande déjà en cours</h1>
          <p style={{ fontWeight: 300, fontSize: '0.92rem', color: '#78716c', lineHeight: 1.8 }}>Vos créations sont en cours de production. Vous recevrez un email avec le suivi de livraison.</p>
          <p className="mt-4" style={{ fontWeight: 300, fontSize: '0.78rem', color: '#a8a29e' }}>
            Une question ? <a href="mailto:bonjour@kaatch.fr" style={{ color: '#4a5240', fontWeight: 500 }}>bonjour@kaatch.fr</a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-5 py-10" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '2rem', color: '#2d3228' }}>Confirmez vos informations</h1>
          <p style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c', lineHeight: 1.7 }}>Vérifiez que tout est correct avant de lancer l&apos;impression.</p>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
            <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#2d3228' }}>Votre commande</p>
          </div>
          {(order.products ?? []).map((productId: string) => {
            const qty = order.quantities?.[productId] ?? 0
            if (qty === 0) return null
            return (
              <div key={productId} className="flex justify-between items-center px-5 py-3 border-b border-stone-50 last:border-0">
                <span style={{ fontWeight: 400, fontSize: '0.82rem', color: '#44403c' }}>{PRODUCT_LABELS[productId] ?? productId}</span>
                <span style={{ fontWeight: 300, fontSize: '0.78rem', color: '#a8a29e' }}>× {qty}</span>
              </div>
            )
          })}
          {order.total_cents > 0 && (
            <div className="flex justify-between items-center px-5 py-3 bg-stone-50 border-t border-stone-100">
              <span style={{ fontWeight: 300, fontSize: '0.72rem', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total payé</span>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1rem', color: '#2d3228' }}>{(order.total_cents / 100).toFixed(2)} €</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom 1" value={form.prenom1} onChange={v => setForm(f => ({ ...f, prenom1: v }))} required />
            <Field label="Prénom 2" value={form.prenom2} onChange={v => setForm(f => ({ ...f, prenom2: v }))} required />
          </div>
          <Field label="Date du mariage" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} required />
          <Field label="Lieu" value={form.lieu} onChange={v => setForm(f => ({ ...f, lieu: v }))} placeholder="Château de Vallery" />
          <div>
            <label className="block mb-1.5" style={{ fontWeight: 500, fontSize: '0.72rem', color: '#a8a29e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Message personnalisé <span style={{ fontWeight: 300 }}>(optionnel)</span></label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Avec toute notre joie..." className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#4a5240] outline-none transition-colors resize-y" style={{ fontWeight: 300, fontSize: '0.88rem', color: '#2d3228', lineHeight: 1.7 }} />
          </div>

          {step === 'error' && (
            <p style={{ fontWeight: 300, fontSize: '0.82rem', color: '#dc2626' }}>Erreur. Contactez-nous à bonjour@kaatch.fr</p>
          )}

          <button type="submit" disabled={step === 'sending'} className="w-full py-3.5 rounded-xl transition-all" style={{ background: '#2d3228', color: '#fff', fontWeight: 500, fontSize: '0.92rem', cursor: step === 'sending' ? 'wait' : 'pointer', opacity: step === 'sending' ? 0.65 : 1 }}>
            {step === 'sending' ? 'Envoi en cours…' : "Confirmer et lancer l'impression →"}
          </button>
        </form>

      </div>
    </main>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block mb-1.5" style={{ fontWeight: 500, fontSize: '0.72rem', color: '#a8a29e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#4a5240] outline-none transition-colors" style={{ fontWeight: 300, fontSize: '0.88rem', color: '#2d3228' }} />
    </div>
  )
}
