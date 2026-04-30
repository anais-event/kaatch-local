'use client'

import { useState, useTransition } from 'react'

type Vendor = {
  id: string
  name: string
  category: string
  email: string | null
  phone: string | null
  website: string | null
  notes: string | null
  status: string
  montant_total: number | null
  acompte: number | null
  created_at: string
}

const CATEGORIES = [
  { label: 'Lieu & réception', icon: '🏛️' },
  { label: 'Traiteur', icon: '🍽️' },
  { label: 'Photo & vidéo', icon: '📸' },
  { label: 'Fleurs & déco', icon: '🌸' },
  { label: 'Musique & DJ', icon: '🎵' },
  { label: 'Robe & costume', icon: '👗' },
  { label: 'Transport', icon: '🚗' },
  { label: 'Faire-part', icon: '✉️' },
  { label: 'Coiffure & maquillage', icon: '💄' },
  { label: 'Gâteau', icon: '🎂' },
  { label: 'Animation', icon: '🎪' },
  { label: 'Autre', icon: '📦' },
]

const STATUSES = [
  { value: 'en_contact', label: 'En contact', color: 'bg-stone-100 text-stone-500' },
  { value: 'devis_recu', label: 'Devis reçu', color: 'bg-blue-50 text-blue-600' },
  { value: 'signe', label: 'Signé ✓', color: 'bg-emerald-50 text-emerald-600' },
  { value: 'acompte', label: 'Acompte versé', color: 'bg-amber-50 text-amber-600' },
  { value: 'solde', label: 'Soldé ✓✓', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'annule', label: 'Annulé', color: 'bg-red-50 text-red-500' },
]

function getStatus(val: string) {
  return STATUSES.find(s => s.value === val) ?? STATUSES[0]
}

function getCategoryIcon(cat: string) {
  return CATEGORIES.find(c => c.label === cat)?.icon ?? '📦'
}

const EMPTY_FORM = { name: '', category: CATEGORIES[0].label, email: '', phone: '', website: '', notes: '', status: 'en_contact', montant_total: '', acompte: '' }

export default function PrestatairesClient({ slug, weddingId, vendors, addPrestataire, updatePrestataire, deletePrestataire }: {
  slug: string
  weddingId: string
  vendors: Vendor[]
  addPrestataire: (f: FormData) => Promise<void>
  updatePrestataire: (f: FormData) => Promise<void>
  deletePrestataire: (f: FormData) => Promise<void>
}) {
  const [, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterCat, setFilterCat] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(v: Vendor) {
    setEditing(v)
    setForm({ name: v.name, category: v.category, email: v.email ?? '', phone: v.phone ?? '', website: v.website ?? '', notes: v.notes ?? '', status: v.status, montant_total: v.montant_total?.toString() ?? '', acompte: v.acompte?.toString() ?? '' })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('slug', slug)
    if (editing) {
      fd.set('id', editing.id)
      startTransition(() => updatePrestataire(fd))
    } else {
      fd.set('wedding_id', weddingId)
      startTransition(() => addPrestataire(fd))
    }
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return
    const fd = new FormData()
    fd.set('id', id)
    fd.set('slug', slug)
    startTransition(() => deletePrestataire(fd))
  }

  const usedCategories = [...new Set(vendors.map(v => v.category))]
  const filtered = filterCat ? vendors.filter(v => v.category === filterCat) : vendors
  const signed = vendors.filter(v => v.status === 'signe' || v.status === 'solde').length

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back link */}
        <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          ← Retour aux préparatifs
        </a>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
                className="text-[#2d3228]">Prestataires</h1>
            <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400">
              {vendors.length} prestataire{vendors.length !== 1 ? 's' : ''}
              {vendors.length > 0 && ` · ${signed} confirmé${signed !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={openAdd}
            className="text-sm bg-[#4a5240] text-white px-4 py-2 rounded-xl hover:bg-[#2d3228] transition cursor-pointer"
            style={{ fontWeight: 300 }}>
            + Ajouter
          </button>
        </div>

        {/* Filtres catégorie */}
        {usedCategories.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            <button onClick={() => setFilterCat('')}
              className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${!filterCat ? 'bg-[#4a5240] text-white' : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-200'}`}
              style={{ fontWeight: 300 }}>Tous</button>
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
                className={`px-3 py-1 rounded-full text-xs transition cursor-pointer ${filterCat === cat ? 'bg-[#4a5240] text-white' : 'bg-white text-stone-400 hover:text-stone-600 border border-stone-200'}`}
                style={{ fontWeight: 300 }}>
                {getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>
        )}

        {/* Liste */}
        {vendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300 }}
               className="text-stone-300 mb-2">Aucun prestataire pour l'instant</p>
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
              Ajoutez votre photographe, traiteur, fleuriste…
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(v => {
              const status = getStatus(v.status)
              const isExpanded = expandedId === v.id
              return (
                <div key={v.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                  {/* Row principale */}
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                       onClick={() => setExpandedId(isExpanded ? null : v.id)}>
                    <span className="text-xl shrink-0">{getCategoryIcon(v.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-[#2d3228] truncate">{v.name}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{v.category}</p>
                    </div>
                    {v.montant_total != null && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-stone-600" style={{ fontWeight: 300 }}>
                          {v.montant_total.toLocaleString('fr-FR')} €
                        </p>
                        {v.acompte != null && v.acompte > 0 && (
                          <p className="text-xs text-amber-500" style={{ fontWeight: 300 }}>
                            {v.acompte.toLocaleString('fr-FR')} € versé
                          </p>
                        )}
                      </div>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs shrink-0 ${status.color}`}
                          style={{ fontWeight: 300 }}>
                      {status.label}
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                         className={`w-4 h-4 text-stone-300 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Détails dépliés */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-stone-50 pt-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {v.phone && (
                          <a href={`tel:${v.phone}`} className="flex items-center gap-2 text-stone-600 hover:text-[#4a5240] transition">
                            <span className="text-stone-300">📞</span>
                            <span style={{ fontWeight: 300 }}>{v.phone}</span>
                          </a>
                        )}
                        {v.email && (
                          <a href={`mailto:${v.email}`} className="flex items-center gap-2 text-stone-600 hover:text-[#4a5240] transition">
                            <span className="text-stone-300">✉️</span>
                            <span style={{ fontWeight: 300 }} className="truncate">{v.email}</span>
                          </a>
                        )}
                        {v.website && (
                          <a href={v.website} target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-2 text-stone-600 hover:text-[#4a5240] transition col-span-full">
                            <span className="text-stone-300">🔗</span>
                            <span style={{ fontWeight: 300 }} className="truncate">{v.website}</span>
                          </a>
                        )}
                      </div>
                      {v.montant_total != null && (
                        <div className="flex gap-4 text-sm bg-stone-50 rounded-xl px-3 py-2.5">
                          <div>
                            <p className="text-xs text-stone-400 mb-0.5" style={{ fontWeight: 300 }}>Devis total</p>
                            <p className="text-stone-700" style={{ fontWeight: 400 }}>{v.montant_total.toLocaleString('fr-FR')} €</p>
                          </div>
                          {v.acompte != null && (
                            <div>
                              <p className="text-xs text-stone-400 mb-0.5" style={{ fontWeight: 300 }}>Acompte versé</p>
                              <p className="text-amber-600" style={{ fontWeight: 400 }}>{v.acompte.toLocaleString('fr-FR')} €</p>
                            </div>
                          )}
                          {v.montant_total != null && v.acompte != null && v.acompte > 0 && (
                            <div>
                              <p className="text-xs text-stone-400 mb-0.5" style={{ fontWeight: 300 }}>Reste à payer</p>
                              <p className="text-[#4a5240]" style={{ fontWeight: 400 }}>{(v.montant_total - v.acompte).toLocaleString('fr-FR')} €</p>
                            </div>
                          )}
                        </div>
                      )}
                      {v.notes && (
                        <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-500 bg-stone-50 rounded-xl px-3 py-2 italic">
                          {v.notes}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => openEdit(v)}
                          className="text-xs text-[#4a5240] border border-[#4a5240]/30 px-3 py-1.5 rounded-lg hover:bg-[#4a5240]/5 transition cursor-pointer"
                          style={{ fontWeight: 300 }}>
                          ✏ Modifier
                        </button>
                        <button onClick={() => handleDelete(v.id, v.name)}
                          className="text-xs text-red-400 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          style={{ fontWeight: 300 }}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal ajout/édition */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
             onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
                  className="text-[#2d3228]">
                {editing ? 'Modifier' : 'Nouveau prestataire'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 text-xl cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nom */}
              <input name="name" required defaultValue={form.name} placeholder="Nom du prestataire *"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm"
                style={{ fontWeight: 300 }} />

              {/* Catégorie */}
              <select name="category" defaultValue={form.category}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm bg-white"
                style={{ fontWeight: 300 }}>
                {CATEGORIES.map(c => (
                  <option key={c.label} value={c.label}>{c.icon} {c.label}</option>
                ))}
              </select>

              {/* Statut */}
              <select name="status" defaultValue={form.status}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm bg-white"
                style={{ fontWeight: 300 }}>
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {/* Montants */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2.5">
                  <span className="text-stone-300 text-xs shrink-0" style={{ fontWeight: 300 }}>€</span>
                  <input name="montant_total" type="number" min="0" step="1" defaultValue={form.montant_total}
                    placeholder="Devis total"
                    className="flex-1 text-stone-700 outline-none text-sm bg-transparent"
                    style={{ fontWeight: 300 }} />
                </div>
                <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2.5">
                  <span className="text-stone-300 text-xs shrink-0" style={{ fontWeight: 300 }}>€</span>
                  <input name="acompte" type="number" min="0" step="1" defaultValue={form.acompte}
                    placeholder="Acompte versé"
                    className="flex-1 text-stone-700 outline-none text-sm bg-transparent"
                    style={{ fontWeight: 300 }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input name="phone" defaultValue={form.phone} placeholder="Téléphone"
                  className="border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm"
                  style={{ fontWeight: 300 }} />
                <input name="email" type="email" defaultValue={form.email} placeholder="Email"
                  className="border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm"
                  style={{ fontWeight: 300 }} />
              </div>

              <input name="website" defaultValue={form.website} placeholder="Site web"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm"
                style={{ fontWeight: 300 }} />

              <textarea name="notes" defaultValue={form.notes} placeholder="Notes, remarques…" rows={3}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm resize-none"
                style={{ fontWeight: 300 }} />

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-stone-200 rounded-xl text-stone-400 text-sm hover:border-stone-300 transition cursor-pointer"
                  style={{ fontWeight: 300 }}>Annuler</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  {editing ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
