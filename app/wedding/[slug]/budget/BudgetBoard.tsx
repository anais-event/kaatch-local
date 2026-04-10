'use client'

import { useState } from 'react'

type Category = {
  id: string; name: string; icon: string; color: string; budget_allocated: number
}
type Item = {
  id: string; category_id: string; label: string; vendor_name: string | null
  estimated_amount: number; actual_amount: number; paid_amount: number
  currency: string; status: 'devis' | 'acompte' | 'solde'; due_date: string | null; notes: string | null
}

const STATUS_CONFIG = {
  devis:   { label: 'Devis',   color: 'bg-stone-100 text-stone-500',   dot: 'bg-stone-400' },
  acompte: { label: 'Acompte', color: 'bg-amber-50 text-amber-600',    dot: 'bg-amber-400' },
  solde:   { label: 'Soldé',   color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' },
}

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export default function BudgetBoard({
  slug, weddingId, budgetTotal, budgetCurrency, categories, items, currencies,
  setBudgetTotal, addCategory, deleteCategory, addItem, updateItem, deleteItem, initDefaultCategories,
}: {
  slug: string; weddingId: string; budgetTotal: number; budgetCurrency: string
  categories: Category[]; items: Item[]; currencies: string[]
  setBudgetTotal: (f: FormData) => Promise<void>
  addCategory: (f: FormData) => Promise<void>
  deleteCategory: (f: FormData) => Promise<void>
  addItem: (f: FormData) => Promise<void>
  updateItem: (f: FormData) => Promise<void>
  deleteItem: (f: FormData) => Promise<void>
  initDefaultCategories: (f: FormData) => Promise<void>
}) {
  const [editBudget, setEditBudget] = useState(false)
  const [addingCat, setAddingCat] = useState(false)
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [expandedCat, setExpandedCat] = useState<Set<string>>(new Set(categories.map(c => c.id)))

  // Totaux globaux (dans la devise principale — on fait confiance à l'utilisateur pour la cohérence)
  const totalEstimated = items.reduce((s, i) => s + (i.estimated_amount || 0), 0)
  const totalActual = items.reduce((s, i) => s + (i.actual_amount || 0), 0)
  const totalPaid = items.reduce((s, i) => s + (i.paid_amount || 0), 0)
  const totalRemaining = totalActual - totalPaid
  const pct = budgetTotal > 0 ? Math.min(100, (totalActual / budgetTotal) * 100) : 0

  async function handleSetBudget(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('slug', slug)
    await setBudgetTotal(fd)
    setEditBudget(false)
  }

  async function handleAddCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('slug', slug)
    await addCategory(fd)
    setAddingCat(false)
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" et toutes ses dépenses ?`)) return
    const fd = new FormData(); fd.set('slug', slug); fd.set('id', id)
    await deleteCategory(fd)
  }

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>, catId: string) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('slug', slug); fd.set('category_id', catId)
    await addItem(fd)
    setAddingItemFor(null)
  }

  async function handleUpdateItem(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('slug', slug); fd.set('id', id)
    await updateItem(fd)
    setEditingItem(null)
  }

  async function handleDeleteItem(id: string) {
    if (!confirm('Supprimer cette dépense ?')) return
    const fd = new FormData(); fd.set('slug', slug); fd.set('id', id)
    await deleteItem(fd)
  }

  async function handleInit() {
    const fd = new FormData(); fd.set('slug', slug)
    await initDefaultCategories(fd)
  }

  const itemsForCat = (catId: string) => items.filter(i => i.category_id === catId)

  const catTotal = (catId: string) => {
    const its = itemsForCat(catId)
    return {
      estimated: its.reduce((s, i) => s + (i.estimated_amount || 0), 0),
      actual: its.reduce((s, i) => s + (i.actual_amount || 0), 0),
      paid: its.reduce((s, i) => s + (i.paid_amount || 0), 0),
    }
  }

  // Palette de couleurs prédéfinies pour nouvelles catégories
  const COLOR_PALETTE = ['#4a5240','#8b7355','#5c6bc0','#c06b8b','#e07b39','#9c6bb5','#3a8fa0','#b5763a','#3a6ea0','#888']

  return (
    <div className="space-y-6">

      {/* ── Enveloppe globale ── */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.2em' }}
               className="text-stone-400 uppercase mb-1">Enveloppe globale</p>
            {editBudget ? (
              <form onSubmit={handleSetBudget} className="flex items-center gap-2 flex-wrap">
                <input name="total" type="number" defaultValue={budgetTotal || ''} min={0} step={100}
                  placeholder="Ex : 25000"
                  className="border border-stone-200 rounded-xl px-4 py-2 outline-none focus:border-[#4a5240] text-stone-700 w-36"
                  style={{ fontWeight: 300, fontSize: '0.95rem' }} autoFocus />
                <select name="currency" defaultValue={budgetCurrency}
                  className="border border-stone-200 rounded-xl px-3 py-2 outline-none text-stone-700 bg-white"
                  style={{ fontWeight: 300, fontSize: '0.85rem' }}>
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="submit"
                  className="bg-[#4a5240] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
                  style={{ fontWeight: 300 }}>OK</button>
                <button type="button" onClick={() => setEditBudget(false)}
                  className="text-stone-400 text-sm cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
              </form>
            ) : (
              <button onClick={() => setEditBudget(true)}
                className="flex items-baseline gap-2 group cursor-pointer">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.2rem', lineHeight: 1 }}
                      className="text-[#2d3228]">
                  {budgetTotal > 0 ? fmt(budgetTotal, budgetCurrency) : '— €'}
                </span>
                <span className="text-xs text-stone-300 group-hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
                  {budgetTotal > 0 ? 'modifier' : 'définir le budget'}
                </span>
              </button>
            )}
          </div>

          {/* Résumé rapide */}
          {items.length > 0 && (
            <div className="flex gap-4 text-right shrink-0">
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Engagé</p>
                <p style={{ fontWeight: 500, fontSize: '1rem' }} className="text-stone-700">{fmt(totalActual, budgetCurrency)}</p>
              </div>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Payé</p>
                <p style={{ fontWeight: 500, fontSize: '1rem' }} className="text-emerald-600">{fmt(totalPaid, budgetCurrency)}</p>
              </div>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Reste</p>
                <p style={{ fontWeight: 500, fontSize: '1rem' }} className="text-amber-600">{fmt(totalRemaining, budgetCurrency)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Barre de progression globale */}
        {budgetTotal > 0 && (
          <div>
            <div className="flex justify-between text-xs text-stone-400 mb-1.5" style={{ fontWeight: 300 }}>
              <span>{Math.round(pct)}% engagé</span>
              <span>{fmt(budgetTotal - totalActual, budgetCurrency)} disponible</span>
            </div>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
              {/* Payé */}
              <div className="h-full flex rounded-full overflow-hidden">
                <div className="bg-emerald-400 transition-all" style={{ width: `${budgetTotal > 0 ? (totalPaid/budgetTotal)*100 : 0}%` }} />
                <div className="bg-amber-300 transition-all" style={{ width: `${budgetTotal > 0 ? (totalRemaining/budgetTotal)*100 : 0}%` }} />
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs text-stone-400" style={{ fontWeight: 300 }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Payé
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-400" style={{ fontWeight: 300 }}>
                <span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />Reste à payer
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-400" style={{ fontWeight: 300 }}>
                <span className="w-2 h-2 rounded-full bg-stone-100 border border-stone-200 inline-block" />Disponible
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Catégories vides — état initial ── */}
      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
          <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.4rem' }}
             className="text-stone-400 mb-2">Aucune catégorie</p>
          <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300 mb-6">
            Commencez avec nos catégories prédéfinies ou créez les vôtres
          </p>
          <button onClick={handleInit}
            className="bg-[#4a5240] text-white px-6 py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer mr-3"
            style={{ fontWeight: 300 }}>
            Utiliser les catégories suggérées
          </button>
          <button onClick={() => setAddingCat(true)}
            className="border border-[#4a5240] text-[#4a5240] px-6 py-2.5 rounded-xl text-sm hover:bg-[#4a5240] hover:text-white transition cursor-pointer"
            style={{ fontWeight: 300 }}>
            Créer manuellement
          </button>
        </div>
      )}

      {/* ── Liste des catégories ── */}
      {categories.map(cat => {
        const totals = catTotal(cat.id)
        const catItems = itemsForCat(cat.id)
        const isExpanded = expandedCat.has(cat.id)
        const catPct = cat.budget_allocated > 0 ? Math.min(100, (totals.actual / cat.budget_allocated) * 100) : null

        return (
          <div key={cat.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">

            {/* Header catégorie */}
            <div className="px-5 py-4 flex items-center gap-3 cursor-pointer"
                 onClick={() => setExpandedCat(prev => {
                   const s = new Set(prev)
                   s.has(cat.id) ? s.delete(cat.id) : s.add(cat.id)
                   return s
                 })}>
              {/* Couleur + icône */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
                   style={{ backgroundColor: cat.color + '20', border: `1.5px solid ${cat.color}40` }}>
                {cat.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-[#2d3228]">
                    {cat.name}
                  </h3>
                  <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                    {catItems.length} poste{catItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {catPct !== null && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                           style={{ width: `${catPct}%`, backgroundColor: cat.color }} />
                    </div>
                    <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400 shrink-0">
                      {Math.round(catPct)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Totaux cat */}
              {catItems.length > 0 && (
                <div className="text-right shrink-0 hidden sm:block">
                  <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">
                    {fmt(totals.actual, budgetCurrency)}
                  </p>
                  {totals.paid > 0 && totals.paid < totals.actual && (
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-emerald-500">
                      {fmt(totals.paid, budgetCurrency)} payé
                    </p>
                  )}
                  {totals.paid === totals.actual && totals.paid > 0 && (
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-emerald-500">✓ Soldé</p>
                  )}
                </div>
              )}

              <span className="text-stone-300 text-sm ml-1">{isExpanded ? '▲' : '▼'}</span>
            </div>

            {/* Items */}
            {isExpanded && (
              <div className="border-t border-stone-50">
                {catItems.length === 0 && addingItemFor !== cat.id && (
                  <p style={{ fontWeight: 300, fontSize: '0.8rem' }}
                     className="text-stone-300 italic text-center py-4">
                    Aucune dépense — ajoutez-en une ci-dessous
                  </p>
                )}

                {catItems.map(item => (
                  <div key={item.id} className="border-b border-stone-50 last:border-0">
                    {editingItem === item.id ? (
                      <ItemForm
                        slug={slug} currencies={currencies}
                        defaultValues={item}
                        onSubmit={e => handleUpdateItem(e, item.id)}
                        onCancel={() => setEditingItem(null)}
                        catColor={cat.color}
                      />
                    ) : (
                      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/50 group transition">
                        {/* Statut dot */}
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CONFIG[item.status].dot}`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700 truncate">
                              {item.label}
                            </p>
                            {item.vendor_name && (
                              <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 truncate">
                                {item.vendor_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CONFIG[item.status].color}`}
                                  style={{ fontWeight: 400 }}>
                              {STATUS_CONFIG[item.status].label}
                            </span>
                            {item.due_date && (
                              <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">
                                échéance {new Date(item.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Montants */}
                        <div className="text-right shrink-0">
                          <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">
                            {fmt(item.actual_amount || item.estimated_amount, item.currency)}
                          </p>
                          {item.paid_amount > 0 && (
                            <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-emerald-500">
                              {fmt(item.paid_amount, item.currency)} payé
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button onClick={() => setEditingItem(item.id)}
                            className="p-1.5 text-stone-300 hover:text-[#4a5240] transition cursor-pointer rounded-lg hover:bg-stone-100">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-stone-300 hover:text-red-400 transition cursor-pointer rounded-lg hover:bg-red-50">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Formulaire ajout */}
                {addingItemFor === cat.id ? (
                  <ItemForm
                    slug={slug} currencies={currencies}
                    onSubmit={e => handleAddItem(e, cat.id)}
                    onCancel={() => setAddingItemFor(null)}
                    catColor={cat.color}
                  />
                ) : (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-stone-50">
                    <button onClick={() => setAddingItemFor(cat.id)}
                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer"
                      style={{ fontWeight: 300 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Ajouter une dépense
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-xs text-stone-200 hover:text-red-400 transition cursor-pointer" style={{ fontWeight: 300 }}>
                      Supprimer la catégorie
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Ajouter une catégorie ── */}
      {addingCat ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228] mb-4">Nouvelle catégorie</p>
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="flex gap-2">
              <input name="icon" type="text" defaultValue="💰" maxLength={2}
                className="w-12 border border-stone-200 rounded-xl px-3 py-2 text-center outline-none text-lg bg-white"
                placeholder="🎵" />
              <input name="name" type="text" placeholder="Nom de la catégorie" required
                className="flex-1 border border-stone-200 rounded-xl px-4 py-2 outline-none focus:border-[#4a5240] transition text-stone-700 text-sm bg-white"
                style={{ fontWeight: 300 }} />
              <input name="allocated" type="number" placeholder="Budget alloué" min={0}
                className="w-32 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#4a5240] transition text-stone-700 text-sm bg-white"
                style={{ fontWeight: 300 }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['#4a5240','#8b7355','#5c6bc0','#c06b8b','#e07b39','#9c6bb5','#3a8fa0','#b5763a','#888888'].map(c => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="color" value={c} className="sr-only peer" defaultChecked={c === '#4a5240'} />
                  <span className="w-7 h-7 rounded-full block border-2 border-transparent peer-checked:border-stone-400 peer-checked:scale-110 transition-all"
                        style={{ backgroundColor: c }} />
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="bg-[#4a5240] text-white px-5 py-2 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
                style={{ fontWeight: 300 }}>Créer</button>
              <button type="button" onClick={() => setAddingCat(false)}
                className="text-stone-400 text-sm px-4 cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={() => setAddingCat(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm cursor-pointer"
          style={{ fontWeight: 300 }}>
          + Ajouter une catégorie
        </button>
      )}

    </div>
  )
}

// ── Formulaire dépense (add + edit) ──
function ItemForm({ slug, currencies, defaultValues, onSubmit, onCancel, catColor }: {
  slug: string
  currencies: string[]
  defaultValues?: Item
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  onCancel: () => void
  catColor: string
}) {
  return (
    <form onSubmit={onSubmit}
          className="px-5 py-4 bg-stone-50/50 border-t border-stone-100 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input name="label" type="text" placeholder="Intitulé *" required
          defaultValue={defaultValues?.label}
          className="col-span-2 sm:col-span-2 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition bg-white text-stone-700"
          style={{ fontWeight: 300 }} />
        <input name="vendor" type="text" placeholder="Prestataire"
          defaultValue={defaultValues?.vendor_name ?? ''}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition bg-white text-stone-700"
          style={{ fontWeight: 300 }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input name="estimated" type="number" min={0} step={1} placeholder="Estimé (€)"
          defaultValue={defaultValues?.estimated_amount || ''}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition bg-white text-stone-700"
          style={{ fontWeight: 300 }} />
        <input name="actual" type="number" min={0} step={1} placeholder="Réel (€)"
          defaultValue={defaultValues?.actual_amount || ''}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition bg-white text-stone-700"
          style={{ fontWeight: 300 }} />
        <input name="paid" type="number" min={0} step={1} placeholder="Payé (€)"
          defaultValue={defaultValues?.paid_amount || ''}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition bg-white text-stone-700"
          style={{ fontWeight: 300 }} />
        <select name="currency" defaultValue={defaultValues?.currency || 'EUR'}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none bg-white text-stone-700"
          style={{ fontWeight: 300 }}>
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        {(['devis','acompte','solde'] as const).map(s => (
          <label key={s} className="cursor-pointer">
            <input type="radio" name="status" value={s} className="sr-only peer"
              defaultChecked={(defaultValues?.status ?? 'devis') === s} />
            <span className={`text-xs px-3 py-1.5 rounded-full border transition peer-checked:font-medium cursor-pointer ${
              s === 'devis'   ? 'border-stone-200 text-stone-500 peer-checked:bg-stone-100 peer-checked:border-stone-400' :
              s === 'acompte' ? 'border-amber-200 text-amber-600 peer-checked:bg-amber-50 peer-checked:border-amber-400' :
                               'border-emerald-200 text-emerald-600 peer-checked:bg-emerald-50 peer-checked:border-emerald-400'
            }`} style={{ fontWeight: 300 }}>
              {s === 'devis' ? 'Devis' : s === 'acompte' ? 'Acompte versé' : 'Soldé ✓'}
            </span>
          </label>
        ))}
        <input name="due_date" type="date" defaultValue={defaultValues?.due_date ?? ''}
          className="ml-auto border border-stone-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white text-stone-600"
          style={{ fontWeight: 300 }}
          title="Date d'échéance" />
      </div>
      <div className="flex gap-2">
        <button type="submit"
          className="px-5 py-2 rounded-xl text-white text-sm transition cursor-pointer hover:opacity-90"
          style={{ backgroundColor: catColor, fontWeight: 300 }}>
          {defaultValues ? 'Enregistrer' : 'Ajouter'}
        </button>
        <button type="button" onClick={onCancel}
          className="text-stone-400 text-sm px-3 cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
      </div>
    </form>
  )
}
