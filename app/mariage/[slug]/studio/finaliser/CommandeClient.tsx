'use client'

import { useState } from 'react'

interface Props {
  weddingId: string
  weddingSlug: string
  totalQty: number
  printCount: number
}

interface ShippingForm {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2: string
  city: string
  postCode: string
  country: string
  email: string
  phone: string
}

const EMPTY: ShippingForm = {
  firstName: '', lastName: '', addressLine1: '', addressLine2: '',
  city: '', postCode: '', country: 'FR', email: '', phone: '',
}

export default function CommandeClient({ weddingId, weddingSlug, totalQty, printCount }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ShippingForm>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof ShippingForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gelato/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, weddingSlug, shipping: form }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue')
        return
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        // order placed without checkout URL (draft mode)
        window.location.href = `/mariage/${weddingSlug}/studio?commande=ok`
      }
    } catch {
      setError('Erreur réseau, réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const label = (text: string) => (
    <span style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.06em' }} className="text-stone-500 uppercase block mb-1">
      {text}
    </span>
  )

  const input = (field: keyof ShippingForm, placeholder: string, required = false) => (
    <input
      value={form[field]}
      onChange={set(field)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-[#2d3228] placeholder-stone-300 focus:outline-none focus:border-[#4a5240] transition-colors"
      style={{ fontWeight: 300, fontSize: '0.82rem' }}
    />
  )

  if (!open) {
    return (
      <div className="bg-[#2d3228] rounded-xl p-5 text-center">
        <p style={{ fontWeight: 300, fontSize: '0.75rem', color: '#a8a29e', letterSpacing: '0.08em' }} className="uppercase mb-1">
          Prêt à commander
        </p>
        <p style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }} className="mb-1">
          {totalQty} créations · {printCount} produit{printCount > 1 ? 's' : ''}
        </p>
        <p style={{ fontWeight: 300, fontSize: '0.78rem', color: '#78716c' }} className="mb-4">
          Impression professionnelle · Livraison à domicile
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 rounded-lg text-[#2d3228] transition-all hover:opacity-90"
          style={{ background: '#f5f0e8', fontWeight: 500, fontSize: '0.88rem' }}
        >
          Passer commande ✨
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#2d3228] rounded-xl overflow-hidden">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.72rem', color: '#a8a29e', letterSpacing: '0.08em' }} className="uppercase mb-0.5">
            Adresse de livraison
          </p>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
            {totalQty} créations · {printCount} produit{printCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-stone-400 hover:text-stone-200 transition-colors"
          style={{ fontSize: '1.2rem', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      <form onSubmit={submit} className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            {label('Prénom *')}
            {input('firstName', 'Marie', true)}
          </div>
          <div>
            {label('Nom *')}
            {input('lastName', 'Dupont', true)}
          </div>
        </div>

        <div>
          {label('Email *')}
          {input('email', 'marie@exemple.fr', true)}
        </div>

        <div>
          {label('Adresse *')}
          {input('addressLine1', '12 rue des Fleurs', true)}
        </div>

        <div>
          {label("Complément d'adresse")}
          {input('addressLine2', 'Appartement 3B')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            {label('Code postal *')}
            {input('postCode', '75001', true)}
          </div>
          <div>
            {label('Ville *')}
            {input('city', 'Paris', true)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            {label('Pays *')}
            <select
              value={form.country}
              onChange={set('country')}
              required
              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-[#2d3228] focus:outline-none focus:border-[#4a5240] transition-colors"
              style={{ fontWeight: 300, fontSize: '0.82rem' }}
            >
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="LU">Luxembourg</option>
              <option value="CA">Canada</option>
              <option value="US">États-Unis</option>
            </select>
          </div>
          <div>
            {label('Téléphone')}
            {input('phone', '+33 6 12 34 56 78')}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/40 rounded-lg px-3 py-2">
            <p style={{ fontWeight: 400, fontSize: '0.78rem' }} className="text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-[#2d3228] transition-all hover:opacity-90 disabled:opacity-60 mt-2"
          style={{ background: '#f5f0e8', fontWeight: 500, fontSize: '0.88rem' }}
        >
          {loading ? 'Génération des PDFs en cours…' : 'Confirmer la commande ✨'}
        </button>

        <p style={{ fontWeight: 300, fontSize: '0.65rem', color: '#78716c', textAlign: 'center' }}>
          Vous serez redirigé vers Gelato pour finaliser le paiement
        </p>
      </form>
    </div>
  )
}
