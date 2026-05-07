'use client'

import { Fragment, useState, useMemo, useTransition } from 'react'
import FileUploadButton from './FileUploadButton'

type Category = { id: string; name: string; icon: string; color: string; budget_allocated: number }
type Item = { id: string; category_id: string; label: string; estimated_amount: number; status: string; description: string | null }
type Quote = { id: string; item_id: string; vendor_name: string | null; amount: number; paid_amount: number; currency: string; status: 'en_attente' | 'retenu' | 'refuse'; notes: string | null; due_date: string | null }
type BudgetFile = { id: string; quote_id: string | null; item_id: string | null; file_name: string; file_url: string; file_type: string | null }
type ContactBasic = { id: string; name: string; role: string; telephone: string | null; email: string | null }
type Actions = Record<string, (f: FormData) => Promise<void>>

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF']

function fmt(amount: number, currency: string) {
  try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount) }
  catch { return `${amount} ${currency}` }
}

const STATUS_CFG = [
  { key: 'devis',   label: 'Devis',   dot: '#d6d3d1', pill: '#f5f5f4', text: '#78716c' },
  { key: 'acompte', label: 'Acompte', dot: '#fbbf24', pill: '#fffbeb', text: '#b45309' },
  { key: 'solde',   label: 'Soldé',   dot: '#34d399', pill: '#ecfdf5', text: '#059669' },
]
const getStatus = (key: string) => STATUS_CFG.find(s => s.key === key) ?? STATUS_CFG[0]

function QuoteInlineForm({ slug, itemId, currencies, defaultValues, onSubmit, onCancel }: {
  slug: string; itemId: string; currencies: string[]
  defaultValues?: Quote; onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>; onCancel: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="bg-[#f5f0e8]/60 border border-stone-200 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input name="vendor_name" type="text" placeholder="Prestataire" defaultValue={defaultValues?.vendor_name ?? ''} autoFocus
          className="col-span-2 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
        <select name="currency" defaultValue={defaultValues?.currency ?? 'EUR'}
          className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white text-stone-700" style={{ fontWeight: 300 }}>
          {currencies.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="amount" type="number" placeholder="Montant devis (€)" min={0} defaultValue={defaultValues?.amount || ''} required
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
        <input name="paid_amount" type="number" placeholder="Déjà versé (€)" min={0} defaultValue={defaultValues?.paid_amount || ''}
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="due_date" type="date" defaultValue={defaultValues?.due_date ?? ''}
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-500" style={{ fontWeight: 300 }} />
        <input name="notes" type="text" placeholder="Notes" defaultValue={defaultValues?.notes ?? ''}
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-[#4a5240] text-white px-4 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-[#2d3228] transition" style={{ fontWeight: 300 }}>
          {defaultValues ? 'Enregistrer' : 'Ajouter'}
        </button>
        <button type="button" onClick={onCancel} className="text-stone-400 text-sm px-3 cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
      </div>
    </form>
  )
}

export default function BudgetBoard({ slug, weddingId, budgetTotal, budgetCurrency, categories, items, quotes, files, currencies, contacts, actions }: {
  slug: string; weddingId: string; budgetTotal: number; budgetCurrency: string
  categories: Category[]; items: Item[]; quotes: Quote[]; files: BudgetFile[]
  currencies: string[]; contacts: ContactBasic[]; actions: Actions
}) {
  const [search, setSearch] = useState('')
  const [editBudget, setEditBudget] = useState(false)
  const [addingCat, setAddingCat] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [addingQuoteFor, setAddingQuoteFor] = useState<string | null>(null)
  const [editingQuote, setEditingQuote] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [catAllocations, setCatAllocations] = useState<Record<string, number>>(
    Object.fromEntries(categories.map(c => [c.id, c.budget_allocated ?? 0]))
  )
  const [editingCatAlloc, setEditingCatAlloc] = useState<string | null>(null)
  const [catAllocValue, setCatAllocValue] = useState('')
  const [, startTransition] = useTransition()

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      quotes.filter(qt => qt.item_id === item.id).some(qt => qt.vendor_name?.toLowerCase().includes(q))
    )
  }, [items, quotes, search])

  function getEffective(item: Item) {
    const iQ = quotes.filter(q => q.item_id === item.id)
    const retained = iQ.find(q => q.status === 'retenu')
    if (retained) return { amount: retained.amount, paid: retained.paid_amount, currency: retained.currency, vendor: retained.vendor_name }
    if (iQ.length > 0) return { amount: iQ[0].amount, paid: iQ[0].paid_amount, currency: iQ[0].currency, vendor: iQ[0].vendor_name }
    return { amount: item.estimated_amount, paid: 0, currency: budgetCurrency, vendor: null }
  }

  async function call(action: string, data: Record<string, string>) {
    const fd = new FormData()
    fd.set('slug', slug)
    Object.entries(data).forEach(([k, v]) => fd.set(k, v))
    await actions[action](fd)
  }

  async function cycleStatus(item: Item) {
    const keys = STATUS_CFG.map(s => s.key)
    const next = keys[(keys.indexOf(item.status) + 1) % keys.length]
    await call('updateItemStatus', { id: item.id, status: next })
  }

  function toggleItem(id: string) {
    setExpandedItems(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function saveCatAlloc(catId: string) {
    const val = parseFloat(catAllocValue) || 0
    setCatAllocations(prev => ({ ...prev, [catId]: val }))
    setEditingCatAlloc(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('slug', slug)
      fd.set('id', catId)
      fd.set('allocated', String(val))
      await actions.updateCategoryAllocated(fd)
    })
  }

  function findContact(vendorName: string | null) {
    if (!vendorName) return null
    const vn = vendorName.toLowerCase()
    return contacts.find(c => c.name.toLowerCase().includes(vn) || vn.includes(c.name.toLowerCase()))
  }

  const totalEngaged   = filteredItems.reduce((s, i) => s + getEffective(i).amount, 0)
  const totalPaid      = filteredItems.reduce((s, i) => s + getEffective(i).paid, 0)
  const totalRemaining = totalEngaged - totalPaid
  const pctEngaged     = budgetTotal > 0 ? Math.min(100, (totalEngaged / budgetTotal) * 100) : 0
  const pctPaid        = budgetTotal > 0 ? Math.min(100, (totalPaid / budgetTotal) * 100) : 0

  const LABEL = { fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#a8a29e' }
  const AMT   = { fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '0.95rem' }

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* ── Résumé compact ── */}
      <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {editBudget ? (
              <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); await actions.setBudgetTotal(fd); setEditBudget(false) }}
                    className="flex gap-2 items-center">
                <input name="total" type="number" defaultValue={budgetTotal || ''} min={0} step={100} placeholder="Ex : 25000" autoFocus
                  className="border border-stone-200 rounded-xl px-3 py-1.5 outline-none focus:border-[#4a5240] text-stone-700 w-28 text-sm" style={{ fontWeight: 300 }} />
                <select name="currency" defaultValue={budgetCurrency}
                  className="border border-stone-200 rounded-xl px-2 py-1.5 outline-none text-stone-700 bg-white text-sm" style={{ fontWeight: 300 }}>
                  {currencies.map(c => <option key={c}>{c}</option>)}
                </select>
                <button type="submit" className="bg-[#4a5240] text-white px-3 py-1.5 rounded-xl text-sm cursor-pointer" style={{ fontWeight: 300 }}>OK</button>
                <button type="button" onClick={() => setEditBudget(false)} className="text-stone-400 text-sm cursor-pointer" style={{ fontWeight: 300 }}>✕</button>
              </form>
            ) : (
              <button onClick={() => setEditBudget(true)} className="flex items-center gap-2 cursor-pointer group">
                <span style={LABEL}>Enveloppe</span>
                <span style={{ ...AMT, color: '#2d3228' }}>{budgetTotal > 0 ? fmt(budgetTotal, budgetCurrency) : '—'}</span>
                <span className="text-[10px] text-stone-300 group-hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>✎</span>
              </button>
            )}
          </div>
          <div className="flex gap-5">
            <div className="text-right">
              <p style={LABEL}>Engagé</p>
              <p style={{ ...AMT, color: '#4a5240' }}>{fmt(totalEngaged, budgetCurrency)}</p>
            </div>
            <div className="text-right">
              <p style={LABEL}>Payé</p>
              <p style={{ ...AMT, color: '#16a34a' }}>{fmt(totalPaid, budgetCurrency)}</p>
            </div>
            <div className="text-right">
              <p style={LABEL}>Reste</p>
              <p style={{ ...AMT, color: totalRemaining > 0 ? '#b45309' : '#a8a29e' }}>{fmt(totalRemaining, budgetCurrency)}</p>
            </div>
          </div>
        </div>
        {budgetTotal > 0 && items.length > 0 && (
          <div className="mt-3">
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 transition-all" style={{ width: `${pctPaid}%` }} />
              <div className="bg-amber-300 transition-all" style={{ width: `${Math.max(0, pctEngaged - pctPaid)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Barre actions ── */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="w-4 h-4 text-stone-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un poste ou prestataire…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
            style={{ fontWeight: 300 }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 cursor-pointer text-xs">✕</button>}
        </div>
        {!addingCat && categories.length > 0 && (
          <button onClick={() => setAddingCat(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer shrink-0"
            style={{ fontWeight: 300 }}>
            + Catégorie
          </button>
        )}
      </div>

      {/* Formulaire nouvelle catégorie */}
      {addingCat && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228] mb-4">Nouvelle catégorie</p>
          <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); await actions.addCategory(fd); setAddingCat(false) }} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <input name="icon" type="text" defaultValue="💰" maxLength={2}
                className="w-12 border border-stone-200 rounded-xl px-2 py-2 text-center outline-none text-lg bg-white" />
              <input name="name" type="text" placeholder="Nom de la catégorie" required autoFocus
                className="flex-1 min-w-[160px] border border-stone-200 rounded-xl px-4 py-2 outline-none focus:border-[#4a5240] transition text-stone-700 text-sm bg-white" style={{ fontWeight: 300 }} />
              <input name="allocated" type="number" placeholder="Budget alloué (optionnel)" min={0}
                className="w-44 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#4a5240] transition text-stone-700 text-sm bg-white" style={{ fontWeight: 300 }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['#4a5240','#8b7355','#5c6bc0','#c06b8b','#e07b39','#9c6bb5','#3a8fa0','#b5763a','#888888'].map(c => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="color" value={c} className="sr-only peer" defaultChecked={c === '#4a5240'} />
                  <span className="w-7 h-7 rounded-full block border-2 border-transparent peer-checked:border-stone-500 peer-checked:scale-110 transition-all" style={{ backgroundColor: c }} />
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-[#4a5240] text-white px-5 py-2 rounded-xl text-sm cursor-pointer" style={{ fontWeight: 300 }}>Créer</button>
              <button type="button" onClick={() => setAddingCat(false)} className="text-stone-400 text-sm px-3 cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* ── État vide ── */}
      {categories.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-stone-100">
          <p style={{ fontWeight: 300, fontSize: '1rem' }} className="text-stone-400 mb-2">Aucune catégorie</p>
          <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300 mb-6">Commencez avec nos suggestions ou créez les vôtres</p>
          <button onClick={async () => { const fd = new FormData(); fd.set('slug', slug); await actions.initDefaultCategories(fd) }}
            className="bg-[#4a5240] text-white px-6 py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer mr-3" style={{ fontWeight: 300 }}>
            Catégories suggérées
          </button>
          <button onClick={() => setAddingCat(true)}
            className="border border-[#4a5240] text-[#4a5240] px-6 py-2.5 rounded-xl text-sm hover:bg-[#4a5240] hover:text-white transition cursor-pointer" style={{ fontWeight: 300 }}>
            Créer manuellement
          </button>
        </div>
      ) : (
        /* ── Tableau groupé par catégorie ── */
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="border-b border-stone-100">
                {['Poste', 'Prestataire retenu', 'Montant', 'Payé', 'Reste', 'Statut', ''].map((h, i) => (
                  <th key={i} className={`px-4 py-3 ${i <= 1 ? 'text-left' : i === 6 ? 'text-center' : 'text-right'}`}
                      style={LABEL}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const catItems = filteredItems.filter(i => i.category_id === cat.id)
                const catEngaged = catItems.reduce((s, i) => s + getEffective(i).amount, 0)
                const catPaid    = catItems.reduce((s, i) => s + getEffective(i).paid, 0)
                const alloc      = catAllocations[cat.id] ?? 0
                const overBudget = alloc > 0 && catEngaged > alloc

                return (
                  <Fragment key={cat.id}>
                    {/* ── Category header row ── */}
                    <tr className="border-b border-stone-100" style={{ background: cat.color + '08' }}>
                      <td className="px-4 py-2.5" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span style={{ fontWeight: 500, fontSize: '0.82rem', color: '#2d3228' }}>{cat.icon} {cat.name}</span>
                          <span style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e' }}>{catItems.length} poste{catItems.length !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span style={{ fontWeight: 500, fontSize: '0.82rem', color: overBudget ? '#ef4444' : '#44403c' }}>
                          {catEngaged > 0 ? fmt(catEngaged, budgetCurrency) : <span style={{ color: '#d6d3d1' }}>—</span>}
                        </span>
                        {alloc > 0 && (
                          <span style={{ fontWeight: 300, fontSize: '0.68rem', color: '#a8a29e', display: 'block' }}>
                            / {fmt(alloc, budgetCurrency)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {catPaid > 0
                          ? <span style={{ fontWeight: 500, fontSize: '0.82rem', color: '#16a34a' }}>{fmt(catPaid, budgetCurrency)}</span>
                          : <span style={{ color: '#d6d3d1' }}>—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {catEngaged > catPaid
                          ? <span style={{ fontWeight: 300, fontSize: '0.82rem', color: '#b45309' }}>{fmt(catEngaged - catPaid, budgetCurrency)}</span>
                          : <span style={{ color: '#d6d3d1' }}>—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {/* Budget alloué éditable */}
                        {editingCatAlloc === cat.id ? (
                          <input type="number" value={catAllocValue}
                            onChange={e => setCatAllocValue(e.target.value)}
                            onBlur={() => saveCatAlloc(cat.id)}
                            onKeyDown={e => { if (e.key === 'Enter') saveCatAlloc(cat.id); if (e.key === 'Escape') setEditingCatAlloc(null) }}
                            autoFocus
                            className="w-24 text-right border border-[#4a5240]/40 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-[#4a5240]"
                            placeholder="Budget" style={{ fontWeight: 300 }} />
                        ) : (
                          <button onClick={() => { setEditingCatAlloc(cat.id); setCatAllocValue(String(alloc || '')) }}
                            title="Définir le budget alloué"
                            className="text-xs text-stone-300 hover:text-[#4a5240] transition cursor-pointer"
                            style={{ fontWeight: 300, background: 'transparent', border: 'none' }}>
                            {alloc > 0 ? `alloué: ${fmt(alloc, budgetCurrency)}` : '+ budget alloué'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={async () => { if (!confirm(`Supprimer "${cat.name}" ?`)) return; await call('deleteCategory', { id: cat.id }) }}
                          className="text-[10px] text-stone-200 hover:text-red-400 transition cursor-pointer" style={{ fontWeight: 300 }}>
                          Supprimer
                        </button>
                      </td>
                    </tr>

                    {/* ── Item rows ── */}
                    {catItems.map(item => {
                      const eff = getEffective(item)
                      const st  = getStatus(item.status)
                      const iQuotes = quotes.filter(q => q.item_id === item.id)
                      const activeQ = iQuotes.filter(q => q.status !== 'refuse')
                      const retained = iQuotes.find(q => q.status === 'retenu')
                      const isExpanded = expandedItems.has(item.id)
                      const contact = findContact(eff.vendor)
                      const remaining = eff.amount - eff.paid

                      return (
                        <Fragment key={item.id}>
                          <tr
                            className={`border-b border-stone-50 hover:bg-stone-50/40 transition group cursor-pointer ${isExpanded ? 'bg-[#f5f0e8]/20' : ''}`}
                            onClick={() => { if (editingItem !== item.id) toggleItem(item.id) }}
                          >
                            {/* Poste */}
                            <td className="px-4 pl-8 py-3" onClick={e => { if (editingItem === item.id) e.stopPropagation() }}>
                              {editingItem === item.id ? (
                                <form className="flex gap-2 items-center" onClick={e => e.stopPropagation()}
                                  onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('id', item.id); await actions.updateItem(fd); setEditingItem(null) }}>
                                  <input name="label" defaultValue={item.label} required autoFocus
                                    className="border border-[#4a5240] rounded-lg px-2 py-1 text-sm outline-none bg-white text-stone-700 w-36" style={{ fontWeight: 400 }} />
                                  <input name="estimated" type="number" defaultValue={item.estimated_amount || ''} placeholder="Estimé €" min={0}
                                    className="w-20 border border-stone-200 rounded-lg px-2 py-1 text-sm outline-none bg-white text-stone-700" style={{ fontWeight: 300 }} />
                                  <button type="submit" className="bg-[#4a5240] text-white px-2 py-1 rounded-lg text-xs cursor-pointer" style={{ fontWeight: 300 }}>OK</button>
                                  <button type="button" onClick={() => setEditingItem(null)} className="text-stone-400 text-xs cursor-pointer">✕</button>
                                </form>
                              ) : (
                                <span style={{ fontWeight: 400, fontSize: '0.85rem', color: '#44403c' }}>{item.label}</span>
                              )}
                            </td>

                            {/* Prestataire */}
                            <td className="px-4 py-3">
                              {eff.vendor ? (
                                contact ? (
                                  <a href={`/mariage/${slug}/contacts`} onClick={e => e.stopPropagation()}
                                     className="flex items-center gap-1 hover:text-[#4a5240] transition"
                                     style={{ fontWeight: 300, fontSize: '0.82rem', color: '#4a5240' }}>
                                    {eff.vendor} ↗
                                  </a>
                                ) : (
                                  <span style={{ fontWeight: 300, fontSize: '0.82rem', color: '#78716c' }}>{eff.vendor}</span>
                                )
                              ) : (
                                <span style={{ color: '#d6d3d1', fontSize: '0.82rem' }}>—</span>
                              )}
                            </td>

                            {/* Montant */}
                            <td className="px-4 py-3 text-right">
                              {eff.amount > 0
                                ? <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#44403c' }}>{fmt(eff.amount, eff.currency)}</span>
                                : <span style={{ color: '#d6d3d1' }}>—</span>}
                            </td>

                            {/* Payé */}
                            <td className="px-4 py-3 text-right">
                              {eff.paid > 0
                                ? <span style={{ fontWeight: 400, fontSize: '0.9rem', color: '#16a34a' }}>{fmt(eff.paid, eff.currency)}</span>
                                : <span style={{ color: '#d6d3d1' }}>—</span>}
                            </td>

                            {/* Reste */}
                            <td className="px-4 py-3 text-right">
                              {remaining > 0
                                ? <span style={{ fontWeight: 300, fontSize: '0.88rem', color: '#b45309' }}>{fmt(remaining, eff.currency)}</span>
                                : eff.paid > 0
                                  ? <span style={{ fontSize: '0.78rem', color: '#16a34a' }}>✓ soldé</span>
                                  : <span style={{ color: '#d6d3d1' }}>—</span>}
                            </td>

                            {/* Statut */}
                            <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                              <button onClick={() => cycleStatus(item)} title="Changer le statut"
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full cursor-pointer transition"
                                style={{ fontWeight: 300, fontSize: '0.7rem', background: st.pill, color: st.text }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                                {st.label}
                              </button>
                            </td>

                            {/* Devis + actions */}
                            <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                {activeQ.length > 0 ? (
                                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full" style={{ fontWeight: 300 }}>
                                    {activeQ.length} devis{retained ? ' ✦' : ''}
                                  </span>
                                ) : (
                                  <button onClick={() => { setAddingQuoteFor(item.id); if (!expandedItems.has(item.id)) toggleItem(item.id) }}
                                    className="text-xs text-stone-300 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
                                    + devis
                                  </button>
                                )}
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => setEditingItem(item.id)} title="Modifier"
                                    className="p-1 text-stone-300 hover:text-[#4a5240] transition cursor-pointer rounded">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                    </svg>
                                  </button>
                                  <button onClick={async () => { if (!confirm('Supprimer ce poste ?')) return; await call('deleteItem', { id: item.id }) }}
                                    className="p-1 text-stone-300 hover:text-red-400 transition cursor-pointer rounded">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* ── Devis panel ── */}
                          {isExpanded && (
                            <tr className="border-b border-stone-50">
                              <td colSpan={7} className="px-8 py-4 bg-[#f5f0e8]/20">
                                <div className="space-y-3">

                                  {/* Contact info */}
                                  {contact && (
                                    <div className="flex items-center gap-3 flex-wrap text-xs bg-white rounded-xl px-4 py-2.5 border border-stone-100 w-fit">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a5240] shrink-0" />
                                      <span style={{ fontWeight: 300, color: '#a8a29e' }}>{contact.role}</span>
                                      <span style={{ fontWeight: 500, color: '#2d3228' }}>{contact.name}</span>
                                      {contact.telephone && <a href={`tel:${contact.telephone}`} className="text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>{contact.telephone}</a>}
                                      {contact.email && <a href={`mailto:${contact.email}`} className="text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>{contact.email}</a>}
                                    </div>
                                  )}

                                  {/* Quote cards */}
                                  {iQuotes.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {iQuotes.map(quote => {
                                        const isRet = quote.status === 'retenu'
                                        const isRef = quote.status === 'refuse'
                                        const qFiles = files.filter(f => f.quote_id === quote.id)

                                        return editingQuote === quote.id ? (
                                          <div key={quote.id} className="w-full">
                                            <QuoteInlineForm slug={slug} itemId={item.id} currencies={CURRENCIES} defaultValues={quote}
                                              onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('id', quote.id); await actions.updateQuote(fd); setEditingQuote(null) }}
                                              onCancel={() => setEditingQuote(null)} />
                                          </div>
                                        ) : (
                                          <div key={quote.id} onClick={() => setEditingQuote(quote.id)}
                                            className={`relative flex flex-col gap-1.5 px-4 py-3 rounded-xl border cursor-pointer transition min-w-[140px] max-w-[200px] ${
                                              isRet ? 'bg-[#4a5240] border-[#4a5240]' :
                                              isRef ? 'bg-stone-50 border-stone-100 opacity-40' :
                                              'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'}`}>
                                            {isRet && <span className="absolute -top-2 left-3 text-[9px] bg-white text-[#4a5240] px-1.5 py-0.5 rounded-full font-semibold">✦ Retenu</span>}
                                            <p style={{ fontWeight: isRet ? 500 : 400, fontSize: '0.82rem', color: isRet ? 'white' : '#44403c' }}>
                                              {quote.vendor_name || <span className="italic opacity-40">Prestataire</span>}
                                            </p>
                                            <p style={{ fontWeight: 600, fontSize: '1.15rem', lineHeight: 1, color: isRet ? 'white' : '#2d3228' }}>
                                              {fmt(quote.amount, quote.currency)}
                                            </p>
                                            {quote.paid_amount > 0 && (
                                              <p style={{ fontWeight: 300, fontSize: '0.65rem', color: isRet ? 'rgba(255,255,255,0.7)' : '#16a34a' }}>
                                                {fmt(quote.paid_amount, quote.currency)} versé
                                              </p>
                                            )}
                                            {quote.due_date && (
                                              <p style={{ fontWeight: 300, fontSize: '0.65rem', color: isRet ? 'rgba(255,255,255,0.6)' : '#b45309' }}>
                                                Échéance {new Date(quote.due_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                              </p>
                                            )}
                                            {quote.notes && (
                                              <p style={{ fontWeight: 300, fontSize: '0.65rem', color: isRet ? 'rgba(255,255,255,0.6)' : '#a8a29e' }} className="truncate">
                                                {quote.notes}
                                              </p>
                                            )}
                                            {qFiles.length > 0 && (
                                              <div className="flex flex-wrap gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
                                                {qFiles.map(f => (
                                                  <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer"
                                                    className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${isRet ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'} hover:opacity-80`}>
                                                    {f.file_type?.includes('pdf') ? '📄' : '🖼️'} {f.file_name.slice(0, 10)}…
                                                  </a>
                                                ))}
                                              </div>
                                            )}
                                            <div className="flex gap-1 mt-1 flex-wrap" onClick={e => e.stopPropagation()}>
                                              {!isRet && !isRef && (
                                                <button onClick={() => call('retainQuote', { id: quote.id, item_id: item.id })}
                                                  className="text-[10px] px-2 py-0.5 rounded-full border border-[#4a5240]/30 text-[#4a5240] hover:bg-[#4a5240] hover:text-white transition cursor-pointer" style={{ fontWeight: 400 }}>
                                                  Retenir
                                                </button>
                                              )}
                                              {isRet && (
                                                <button onClick={() => call('retainQuote', { id: quote.id, item_id: item.id })}
                                                  className="text-[10px] text-white/50 hover:text-white cursor-pointer" style={{ fontWeight: 300 }}>
                                                  Annuler
                                                </button>
                                              )}
                                              {!isRet && !isRef && (
                                                <button onClick={() => call('refuseQuote', { id: quote.id })}
                                                  className="text-[10px] text-stone-300 hover:text-red-400 cursor-pointer" style={{ fontWeight: 300 }}>
                                                  Refuser
                                                </button>
                                              )}
                                              <FileUploadButton slug={slug} weddingId={weddingId} quoteId={quote.id} onSave={actions.saveBudgetFileMeta} />
                                              <button onClick={() => call('deleteQuote', { id: quote.id })}
                                                className="p-0.5 text-stone-200 hover:text-red-400 cursor-pointer ml-auto">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      })}
                                      {addingQuoteFor !== item.id && (
                                        <button onClick={() => setAddingQuoteFor(item.id)}
                                          className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl border-2 border-dashed border-stone-200 text-stone-300 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer min-w-[80px]">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                          </svg>
                                          <span style={{ fontWeight: 300, fontSize: '0.68rem' }}>Devis</span>
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {iQuotes.length === 0 && addingQuoteFor !== item.id && (
                                    <button onClick={() => setAddingQuoteFor(item.id)}
                                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                      </svg>
                                      Ajouter un premier devis
                                    </button>
                                  )}

                                  {addingQuoteFor === item.id && (
                                    <QuoteInlineForm slug={slug} itemId={item.id} currencies={CURRENCIES}
                                      onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('item_id', item.id); await actions.addQuote(fd); setAddingQuoteFor(null) }}
                                      onCancel={() => setAddingQuoteFor(null)} />
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}

                    {/* ── Add item row ── */}
                    <tr className="border-b border-stone-100">
                      <td colSpan={7} className="px-8 py-2.5">
                        {addingItemFor === cat.id ? (
                          <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('category_id', cat.id); await actions.addItem(fd); setAddingItemFor(null) }}
                                className="flex gap-2 flex-wrap items-center">
                            <input name="label" type="text" placeholder="Nom du poste" required autoFocus
                              className="flex-1 min-w-[140px] border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
                            <input name="estimated" type="number" placeholder="Budget estimé (€)" min={0}
                              className="w-36 border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
                            <button type="submit" className="bg-[#4a5240] text-white px-4 py-1.5 rounded-xl text-sm cursor-pointer" style={{ fontWeight: 300 }}>Créer</button>
                            <button type="button" onClick={() => setAddingItemFor(null)} className="text-stone-400 text-sm cursor-pointer" style={{ fontWeight: 300 }}>✕</button>
                          </form>
                        ) : (
                          <button onClick={() => setAddingItemFor(cat.id)}
                            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Ajouter un poste
                          </button>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>

            {/* ── Total footer ── */}
            {items.length > 0 && (
              <tfoot>
                <tr className="bg-stone-50/60 border-t-2 border-stone-100">
                  <td colSpan={2} className="px-4 py-3">
                    <span style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em', color: '#a8a29e', textTransform: 'uppercase' }}>
                      Total — {items.length} poste{items.length > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#44403c' }}>{fmt(totalEngaged, budgetCurrency)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#16a34a' }}>{fmt(totalPaid, budgetCurrency)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#b45309' }}>{fmt(totalRemaining, budgetCurrency)}</span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}
