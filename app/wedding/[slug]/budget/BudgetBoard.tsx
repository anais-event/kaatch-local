'use client'

import { useState, useMemo } from 'react'
import FileUploadButton from './FileUploadButton'

type Category = { id: string; name: string; icon: string; color: string; budget_allocated: number }
type Item = { id: string; category_id: string; label: string; estimated_amount: number; status: string; description: string | null }
type Quote = { id: string; item_id: string; vendor_name: string | null; amount: number; paid_amount: number; currency: string; status: 'en_attente' | 'retenu' | 'refuse'; notes: string | null }
type BudgetFile = { id: string; quote_id: string | null; item_id: string | null; file_name: string; file_url: string; file_type: string | null }
type Actions = Record<string, (f: FormData) => Promise<void>>

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF']

function fmt(amount: number, currency: string) {
  try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount) }
  catch { return `${amount} ${currency}` }
}

const STATUS_OPTIONS = [
  { key: 'devis',   label: 'Devis',   dot: 'bg-stone-300',  pill: 'bg-stone-100 text-stone-500' },
  { key: 'acompte', label: 'Acompte', dot: 'bg-amber-400',  pill: 'bg-amber-50 text-amber-600' },
  { key: 'solde',   label: 'Soldé',   dot: 'bg-emerald-400',pill: 'bg-emerald-50 text-emerald-600' },
]
const getStatus = (key: string) => STATUS_OPTIONS.find(s => s.key === key) ?? STATUS_OPTIONS[0]

/* ── TableView sub-component ── */
function TableView({ categories, items, quotes, budgetCurrency, getItemEffective, editingItem, setEditingItem, onCycleStatus, onSwitchToCards, actions, slug }: {
  categories: Category[]
  items: Item[]
  quotes: Quote[]
  budgetCurrency: string
  getItemEffective: (item: Item) => { amount: number; paid: number; currency: string; vendor: string | null }
  editingItem: string | null
  setEditingItem: (id: string | null) => void
  onCycleStatus: (item: Item) => Promise<void>
  onSwitchToCards: (itemId: string) => void
  actions: Actions
  slug: string
}) {
  const totalEngaged = items.reduce((s, i) => s + getItemEffective(i).amount, 0)
  const totalPaid    = items.reduce((s, i) => s + getItemEffective(i).paid, 0)
  const totalRemaining = totalEngaged - totalPaid

  const getCat = (catId: string) => categories.find(c => c.id === catId)

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-stone-50">
            {['Catégorie', 'Poste', 'Statut', 'Prestataire retenu', 'Montant', 'Payé', 'Reste', 'Devis'].map(h => (
              <th key={h} className="px-4 py-3 text-left"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em', color: '#a8a29e', textTransform: 'uppercase' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const cat = getCat(item.category_id)
            const eff = getItemEffective(item)
            const st = getStatus(item.status)
            const iQuotes = quotes.filter(q => q.item_id === item.id && q.status !== 'refuse')
            const remaining = eff.amount - eff.paid

            return (
              <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition group">
                {/* Catégorie */}
                <td className="px-4 py-3">
                  {cat && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span style={{ fontWeight: 300, fontSize: '0.8rem', fontFamily: 'var(--font-lato)' }} className="text-stone-500 whitespace-nowrap">
                        {cat.icon} {cat.name}
                      </span>
                    </div>
                  )}
                </td>

                {/* Poste (editable) */}
                <td className="px-4 py-3">
                  {editingItem === item.id ? (
                    <form className="flex gap-2 items-center flex-wrap"
                      onSubmit={async e => {
                        e.preventDefault()
                        const fd = new FormData(e.currentTarget)
                        fd.set('slug', slug)
                        fd.set('id', item.id)
                        await actions.updateItem(fd)
                        setEditingItem(null)
                      }}>
                      <input name="label" defaultValue={item.label} required autoFocus
                        className="border border-[#4a5240] rounded-lg px-2 py-1 text-sm outline-none bg-white text-stone-700 w-36" style={{ fontWeight: 400 }} />
                      <input name="estimated" type="number" defaultValue={item.estimated_amount || ''} placeholder="Estimé" min={0}
                        className="w-20 border border-stone-200 rounded-lg px-2 py-1 text-sm outline-none bg-white text-stone-700" style={{ fontWeight: 300 }} />
                      <button type="submit" className="bg-[#4a5240] text-white px-2 py-1 rounded-lg text-xs cursor-pointer" style={{ fontWeight: 300 }}>OK</button>
                      <button type="button" onClick={() => setEditingItem(null)} className="text-stone-400 text-xs cursor-pointer">✕</button>
                    </form>
                  ) : (
                    <span onClick={() => setEditingItem(item.id)}
                      className="cursor-pointer text-stone-700 hover:text-[#4a5240] transition"
                      style={{ fontWeight: 400, fontSize: '0.85rem', fontFamily: 'var(--font-lato)' }}>
                      {item.label}
                    </span>
                  )}
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  <button onClick={() => onCycleStatus(item)}
                    className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition ${st.pill}`}
                    style={{ fontWeight: 300, fontSize: '0.72rem', fontFamily: 'var(--font-lato)' }}>
                    {st.label}
                  </button>
                </td>

                {/* Prestataire retenu */}
                <td className="px-4 py-3">
                  <span style={{ fontWeight: 300, fontSize: '0.82rem', fontFamily: 'var(--font-lato)' }} className="text-stone-500">
                    {eff.vendor ?? <span className="text-stone-300">—</span>}
                  </span>
                </td>

                {/* Montant */}
                <td className="px-4 py-3 text-right">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1rem' }} className="text-stone-700">
                    {fmt(eff.amount, eff.currency)}
                  </span>
                </td>

                {/* Payé */}
                <td className="px-4 py-3 text-right">
                  {eff.paid > 0
                    ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1rem' }} className="text-emerald-600">{fmt(eff.paid, eff.currency)}</span>
                    : <span className="text-stone-300" style={{ fontWeight: 300, fontSize: '0.8rem' }}>—</span>
                  }
                </td>

                {/* Reste */}
                <td className="px-4 py-3 text-right">
                  {remaining > 0
                    ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1rem' }} className="text-amber-500">{fmt(remaining, eff.currency)}</span>
                    : <span className="text-emerald-500" style={{ fontWeight: 400, fontSize: '0.8rem' }}>✓</span>
                  }
                </td>

                {/* Devis */}
                <td className="px-4 py-3 text-center">
                  {iQuotes.length > 0
                    ? <button onClick={() => onSwitchToCards(item.id)}
                        className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full hover:bg-[#4a5240] hover:text-white transition cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        {iQuotes.length}
                      </button>
                    : <span className="text-stone-200" style={{ fontWeight: 300, fontSize: '0.8rem' }}>—</span>
                  }
                </td>
              </tr>
            )
          })}
        </tbody>
        {items.length > 0 && (
          <tfoot>
            <tr className="bg-stone-50/50 border-t border-stone-100">
              <td colSpan={4} className="px-4 py-3">
                <span style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em', fontFamily: 'var(--font-lato)' }} className="text-stone-400 uppercase">
                  Total — {items.length} poste{items.length > 1 ? 's' : ''}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }} className="text-stone-700">{fmt(totalEngaged, budgetCurrency)}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }} className="text-emerald-600">{fmt(totalPaid, budgetCurrency)}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }} className="text-amber-500">{fmt(totalRemaining, budgetCurrency)}</span>
              </td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export default function BudgetBoard({ slug, weddingId, budgetTotal, budgetCurrency, categories, items, quotes, files, currencies, actions }: {
  slug: string; weddingId: string; budgetTotal: number; budgetCurrency: string
  categories: Category[]; items: Item[]; quotes: Quote[]; files: BudgetFile[]; currencies: string[]; actions: Actions
}) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'cartes' | 'tableau'>('cartes')
  const [editBudget, setEditBudget] = useState(false)
  const [addingCat, setAddingCat] = useState(false)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(categories.map(c => c.id)))
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [addingQuoteFor, setAddingQuoteFor] = useState<string | null>(null)
  const [editingQuote, setEditingQuote] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(item => {
      if (item.label.toLowerCase().includes(q)) return true
      return quotes.filter(qt => qt.item_id === item.id).some(qt => qt.vendor_name?.toLowerCase().includes(q))
    })
  }, [items, quotes, search])

  const getItemEffective = (item: Item) => {
    const iQuotes = quotes.filter(q => q.item_id === item.id)
    const retained = iQuotes.find(q => q.status === 'retenu')
    if (retained) return { amount: retained.amount, paid: retained.paid_amount, currency: retained.currency, vendor: retained.vendor_name }
    if (iQuotes.length > 0) {
      const first = iQuotes[0]
      return { amount: first.amount, paid: first.paid_amount, currency: first.currency, vendor: first.vendor_name }
    }
    return { amount: item.estimated_amount, paid: 0, currency: budgetCurrency, vendor: null }
  }

  const totalEngaged = filteredItems.reduce((s, i) => s + getItemEffective(i).amount, 0)
  const totalPaid    = filteredItems.reduce((s, i) => s + getItemEffective(i).paid, 0)
  const totalRemaining = totalEngaged - totalPaid
  const pctEngaged   = budgetTotal > 0 ? Math.min(100, (totalEngaged / budgetTotal) * 100) : 0

  async function call(action: string, data: Record<string, string>) {
    const fd = new FormData()
    fd.set('slug', slug)
    Object.entries(data).forEach(([k, v]) => fd.set(k, v))
    await actions[action](fd)
  }

  const toggleCat  = (id: string) => setExpandedCats(prev  => { const s = new Set(prev);  s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleItem = (id: string) => setExpandedItems(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const handleCycleStatus = async (item: Item) => {
    const opts = STATUS_OPTIONS.map(s => s.key)
    const next = opts[(opts.indexOf(item.status) + 1) % opts.length]
    await call('updateItemStatus', { id: item.id, status: next })
  }

  const handleSwitchToCards = (itemId: string) => {
    setViewMode('cartes')
    setExpandedItems(prev => { const s = new Set(prev); s.add(itemId); return s })
    // also expand the category containing this item
    const item = items.find(i => i.id === itemId)
    if (item) setExpandedCats(prev => { const s = new Set(prev); s.add(item.category_id); return s })
  }

  return (
    <div className="space-y-4">

      {/* ── Enveloppe globale ── */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
          <div className="flex-1">
            <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">Enveloppe globale</p>
            {editBudget ? (
              <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); await actions.setBudgetTotal(fd); setEditBudget(false) }} className="flex gap-2 flex-wrap">
                <input name="total" type="number" defaultValue={budgetTotal || ''} min={0} step={100} placeholder="Ex : 25000" autoFocus
                  className="border border-stone-200 rounded-xl px-4 py-2 outline-none focus:border-[#4a5240] text-stone-700 w-32 text-sm" style={{ fontWeight: 300 }} />
                <select name="currency" defaultValue={budgetCurrency}
                  className="border border-stone-200 rounded-xl px-3 py-2 outline-none text-stone-700 bg-white text-sm" style={{ fontWeight: 300 }}>
                  {currencies.map(c => <option key={c}>{c}</option>)}
                </select>
                <button type="submit" className="bg-[#4a5240] text-white px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ fontWeight: 300 }}>OK</button>
                <button type="button" onClick={() => setEditBudget(false)} className="text-stone-400 text-sm cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
              </form>
            ) : (
              <button onClick={() => setEditBudget(true)} className="flex items-baseline gap-2 group cursor-pointer">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2.2rem', lineHeight: 1 }} className="text-[#2d3228]">
                  {budgetTotal > 0 ? fmt(budgetTotal, budgetCurrency) : '— Définir le budget'}
                </span>
                <span className="text-xs text-stone-300 group-hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>modifier</span>
              </button>
            )}
          </div>
          {items.length > 0 && (
            <div className="flex gap-5 text-right shrink-0">
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Engagé</p>
                <p style={{ fontWeight: 500, fontSize: '1rem' }} className="text-stone-700">{fmt(totalEngaged, budgetCurrency)}</p>
              </div>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Payé</p>
                <p style={{ fontWeight: 500, fontSize: '1rem' }} className="text-emerald-600">{fmt(totalPaid, budgetCurrency)}</p>
              </div>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Reste</p>
                <p style={{ fontWeight: 500, fontSize: '1rem' }} className="text-amber-600">{fmt(totalRemaining, budgetCurrency)}</p>
              </div>
            </div>
          )}
        </div>
        {budgetTotal > 0 && items.length > 0 && (
          <>
            <div className="flex justify-between text-xs text-stone-400 mb-1.5" style={{ fontWeight: 300 }}>
              <span>{Math.round(pctEngaged)}% de l'enveloppe engagé</span>
              <span>{fmt(Math.max(0, budgetTotal - totalEngaged), budgetCurrency)} disponible</span>
            </div>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 transition-all" style={{ width: `${budgetTotal > 0 ? (totalPaid/budgetTotal)*100 : 0}%` }} />
              <div className="bg-amber-300 transition-all" style={{ width: `${budgetTotal > 0 ? (totalRemaining/budgetTotal)*100 : 0}%` }} />
            </div>
            <div className="flex gap-4 mt-1.5">
              {[['bg-emerald-400','Payé'],['bg-amber-300','Reste à payer'],['bg-stone-100 border border-stone-200','Disponible']].map(([cls,lbl]) => (
                <span key={lbl} className="flex items-center gap-1 text-xs text-stone-400" style={{ fontWeight: 300 }}>
                  <span className={`w-2 h-2 rounded-full ${cls}`}/>{lbl}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Barre recherche + toggle vue + bouton catégorie ── */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un poste ou prestataire…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
            style={{ fontWeight: 300 }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 cursor-pointer">✕</button>}
        </div>

        {/* Vue toggle */}
        {categories.length > 0 && (
          <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={() => setViewMode('cartes')}
              className={`px-3 py-2 text-xs flex items-center gap-1.5 transition cursor-pointer ${viewMode === 'cartes' ? 'bg-[#4a5240] text-white' : 'text-stone-400 hover:text-[#4a5240]'}`}
              style={{ fontWeight: 300 }}>
              <span>☰</span><span className="hidden sm:inline">Cartes</span>
            </button>
            <button onClick={() => setViewMode('tableau')}
              className={`px-3 py-2 text-xs flex items-center gap-1.5 transition cursor-pointer border-l border-stone-200 ${viewMode === 'tableau' ? 'bg-[#4a5240] text-white' : 'text-stone-400 hover:text-[#4a5240]'}`}
              style={{ fontWeight: 300 }}>
              <span>⊞</span><span className="hidden sm:inline">Tableau</span>
            </button>
          </div>
        )}

        {categories.length > 0 && !addingCat && (
          <button onClick={() => setAddingCat(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer shrink-0"
            style={{ fontWeight: 300 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Catégorie</span>
          </button>
        )}
      </div>

      {/* Formulaire nouvelle catégorie */}
      {addingCat && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228] mb-4">Nouvelle catégorie</p>
          <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); await actions.addCategory(fd); setAddingCat(false) }} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <input name="icon" type="text" defaultValue="💰" maxLength={2} className="w-12 border border-stone-200 rounded-xl px-2 py-2 text-center outline-none text-lg bg-white" />
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
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }} className="text-stone-400 mb-2">Aucune catégorie</p>
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
      ) : viewMode === 'tableau' ? (
        /* ── Vue Tableau ── */
        <TableView
          categories={categories}
          items={filteredItems}
          quotes={quotes}
          budgetCurrency={budgetCurrency}
          getItemEffective={getItemEffective}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          onCycleStatus={handleCycleStatus}
          onSwitchToCards={handleSwitchToCards}
          actions={actions}
          slug={slug}
        />
      ) : (
        /* ── Accordéon catégories (vue Cartes) ── */
        <div className="space-y-3">
          {categories.map(cat => {
            const catItems = filteredItems.filter(i => i.category_id === cat.id)
            const isOpen = expandedCats.has(cat.id)
            const catTotal = catItems.reduce((s, i) => s + getItemEffective(i).amount, 0)
            const catPaid  = catItems.reduce((s, i) => s + getItemEffective(i).paid, 0)
            const pct = cat.budget_allocated > 0 ? Math.min(100, catTotal / cat.budget_allocated * 100) : null

            return (
              <div key={cat.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">

                {/* Header catégorie */}
                <div className="px-5 py-4 flex items-center gap-3 cursor-pointer select-none" onClick={() => toggleCat(cat.id)}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                       style={{ backgroundColor: cat.color + '20', border: `1.5px solid ${cat.color}40` }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-[#2d3228]">{cat.name}</h3>
                      <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{catItems.length} poste{catItems.length !== 1 ? 's' : ''}</span>
                    </div>
                    {pct !== null && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                        </div>
                        <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">{Math.round(pct)}% du budget alloué</span>
                      </div>
                    )}
                  </div>
                  {catItems.length > 0 && (
                    <div className="text-right hidden sm:block shrink-0">
                      <p style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-stone-700">{fmt(catTotal, budgetCurrency)}</p>
                      {catPaid > 0 && <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-emerald-500">{fmt(catPaid, budgetCurrency)} payé</p>}
                    </div>
                  )}
                  <span className="text-stone-300 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
                </div>

                {/* Contenu catégorie */}
                {isOpen && (
                  <div className="border-t border-stone-50">

                    {catItems.length === 0 && addingItemFor !== cat.id && (
                      <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-300 italic text-center py-5">Aucun poste dans cette catégorie</p>
                    )}

                    {/* ── Postes ── */}
                    {catItems.map(item => {
                      const iQuotes = quotes.filter(q => q.item_id === item.id)
                      const retained = iQuotes.find(q => q.status === 'retenu')
                      const activeQuotes = iQuotes.filter(q => q.status !== 'refuse')
                      const eff = getItemEffective(item)
                      const isItemOpen = expandedItems.has(item.id)
                      const st = getStatus(item.status)
                      const paidPct = eff.amount > 0 ? Math.min(100, (eff.paid / eff.amount) * 100) : 0

                      return (
                        <div key={item.id} className="border-b border-stone-50 last:border-0">

                          {/* Ligne poste */}
                          <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/40 group transition">

                            {/* Statut — clic pour cycler */}
                            <button title="Changer le statut"
                              onClick={async e => {
                                e.stopPropagation()
                                await handleCycleStatus(item)
                              }}
                              className="shrink-0 cursor-pointer group/dot">
                              <span className={`w-2.5 h-2.5 rounded-full block transition group-hover/dot:scale-125 ${st.dot}`} />
                            </button>

                            {/* Nom du poste */}
                            {editingItem === item.id ? (
                              <form className="flex-1 flex gap-2 flex-wrap items-center"
                                onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('id', item.id); await actions.updateItem(fd); setEditingItem(null) }}>
                                <input name="label" defaultValue={item.label} required autoFocus
                                  className="flex-1 min-w-[140px] border border-[#4a5240] rounded-lg px-3 py-1 text-sm outline-none bg-white text-stone-700" style={{ fontWeight: 400 }} />
                                <input name="estimated" type="number" defaultValue={item.estimated_amount || ''} placeholder="Estimé" min={0}
                                  className="w-24 border border-stone-200 rounded-lg px-3 py-1 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
                                <button type="submit" className="bg-[#4a5240] text-white px-3 py-1 rounded-lg text-sm cursor-pointer" style={{ fontWeight: 300 }}>OK</button>
                                <button type="button" onClick={() => setEditingItem(null)} className="text-stone-400 text-sm cursor-pointer">✕</button>
                              </form>
                            ) : (
                              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleItem(item.id)}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700">{item.label}</p>
                                  {retained?.vendor_name && (
                                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">· {retained.vendor_name}</span>
                                  )}
                                  {activeQuotes.length > 0 && (
                                    <span style={{ fontWeight: 300, fontSize: '0.66rem' }} className="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
                                      {activeQuotes.length} devis{retained ? ' · retenu ✦' : activeQuotes.length > 1 ? ' · à choisir' : ''}
                                    </span>
                                  )}
                                </div>
                                {/* Mini barre payé/reste */}
                                {eff.amount > 0 && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-20 h-1 bg-stone-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${paidPct}%` }} />
                                    </div>
                                    <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400">
                                      {paidPct > 0 ? `${Math.round(paidPct)}% payé` : <span className={st.pill.split(' ')[1]}>{st.label}</span>}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Montant + actions */}
                            {editingItem !== item.id && (<>
                              <div className="text-right shrink-0">
                                <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{fmt(eff.amount, eff.currency)}</p>
                                {eff.paid > 0 && eff.paid < eff.amount && (
                                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-amber-500">{fmt(eff.amount - eff.paid, eff.currency)} restant</p>
                                )}
                                {eff.paid > 0 && eff.paid >= eff.amount && (
                                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-emerald-500">Soldé ✓</p>
                                )}
                              </div>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                                <button onClick={() => setEditingItem(item.id)} title="Modifier"
                                  className="p-1.5 text-stone-300 hover:text-[#4a5240] transition cursor-pointer rounded-lg hover:bg-stone-100">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                  </svg>
                                </button>
                                <button onClick={async () => { if (!confirm('Supprimer ce poste ?')) return; await call('deleteItem', { id: item.id }) }}
                                  className="p-1.5 text-stone-300 hover:text-red-400 transition cursor-pointer rounded-lg hover:bg-red-50">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </>)}
                          </div>

                          {/* ── Devis (comparaison) ── */}
                          {isItemOpen && (
                            <div className="bg-[#f5f0e8]/40 px-5 py-4 border-t border-stone-50 space-y-3">
                              {/* Cards devis côte à côte */}
                              {iQuotes.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {iQuotes.map(quote => {
                                    const isRetenu = quote.status === 'retenu'
                                    const isRefuse = quote.status === 'refuse'
                                    const filesForQuote = files.filter(f => f.quote_id === quote.id)

                                    return editingQuote === quote.id ? (
                                      <div key={quote.id} className="w-full">
                                        <QuoteForm slug={slug} itemId={item.id} currencies={CURRENCIES} defaultValues={quote}
                                          onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('id', quote.id); await actions.updateQuote(fd); setEditingQuote(null) }}
                                          onCancel={() => setEditingQuote(null)} />
                                      </div>
                                    ) : (
                                      <div key={quote.id} onClick={() => setEditingQuote(quote.id)}
                                        className={`relative flex flex-col gap-1.5 px-4 py-3 rounded-xl border cursor-pointer transition min-w-[150px] max-w-[220px] ${
                                          isRetenu ? 'bg-[#4a5240] border-[#4a5240]' :
                                          isRefuse  ? 'bg-stone-50 border-stone-100 opacity-40' :
                                          'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'
                                        }`}>
                                        {isRetenu && <span className="absolute -top-2 left-3 text-[9px] bg-white text-[#4a5240] px-1.5 py-0.5 rounded-full font-semibold">✦ Retenu</span>}

                                        <p style={{ fontWeight: isRetenu ? 500 : 400, fontSize: '0.82rem' }}
                                           className={isRetenu ? 'text-white' : 'text-stone-700'}>
                                          {quote.vendor_name || <span className="italic opacity-40">Prestataire</span>}
                                        </p>
                                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem', lineHeight: 1 }}
                                           className={isRetenu ? 'text-white' : 'text-[#2d3228]'}>
                                          {fmt(quote.amount, quote.currency)}
                                        </p>
                                        {quote.paid_amount > 0 && (
                                          <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className={isRetenu ? 'text-white/70' : 'text-emerald-500'}>
                                            {fmt(quote.paid_amount, quote.currency)} payé
                                          </p>
                                        )}
                                        {quote.notes && (
                                          <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className={`truncate ${isRetenu ? 'text-white/60' : 'text-stone-400'}`}>
                                            {quote.notes}
                                          </p>
                                        )}

                                        {/* Fichiers joints */}
                                        {filesForQuote.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
                                            {filesForQuote.map(f => (
                                              <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer"
                                                className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${isRetenu ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'} hover:opacity-80`}>
                                                {f.file_type?.includes('pdf') ? '📄' : '🖼️'} {f.file_name.slice(0, 12)}…
                                              </a>
                                            ))}
                                          </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-1 mt-1 flex-wrap" onClick={e => e.stopPropagation()}>
                                          {!isRetenu && !isRefuse && (
                                            <button onClick={() => call('retainQuote', { id: quote.id, item_id: item.id })}
                                              className="text-[10px] px-2 py-0.5 rounded-full border border-[#4a5240]/30 text-[#4a5240] hover:bg-[#4a5240] hover:text-white transition cursor-pointer" style={{ fontWeight: 400 }}>
                                              Retenir
                                            </button>
                                          )}
                                          {isRetenu && (
                                            <button onClick={() => call('retainQuote', { id: quote.id, item_id: item.id })}
                                              className="text-[10px] text-white/50 hover:text-white transition cursor-pointer" style={{ fontWeight: 300 }}>
                                              Annuler
                                            </button>
                                          )}
                                          {!isRetenu && !isRefuse && (
                                            <button onClick={() => call('refuseQuote', { id: quote.id })}
                                              className="text-[10px] text-stone-300 hover:text-red-400 transition cursor-pointer" style={{ fontWeight: 300 }}>
                                              Refuser
                                            </button>
                                          )}
                                          <FileUploadButton slug={slug} weddingId={weddingId} quoteId={quote.id} onSave={actions.saveBudgetFileMeta} />
                                          <button onClick={() => call('deleteQuote', { id: quote.id })}
                                            className="p-0.5 text-stone-200 hover:text-red-400 transition cursor-pointer ml-auto">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })}

                                  {/* + Ajouter un devis */}
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

                              {/* Formulaire ajout devis */}
                              {addingQuoteFor === item.id && (
                                <QuoteForm slug={slug} itemId={item.id} currencies={CURRENCIES}
                                  onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('item_id', item.id); await actions.addQuote(fd); setAddingQuoteFor(null) }}
                                  onCancel={() => setAddingQuoteFor(null)} />
                              )}

                              {/* Pas encore de devis */}
                              {iQuotes.length === 0 && addingQuoteFor !== item.id && (
                                <button onClick={() => setAddingQuoteFor(item.id)}
                                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                  Ajouter un premier devis
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Ajouter un poste */}
                    <div className="px-5 py-3 border-t border-stone-50 flex items-center justify-between gap-4">
                      {addingItemFor === cat.id ? (
                        <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('category_id', cat.id); await actions.addItem(fd); setAddingItemFor(null) }}
                              className="flex gap-2 flex-1 flex-wrap">
                          <input name="label" type="text" placeholder={ITEM_PLACEHOLDER[cat.name] ?? 'Nom du poste'} required autoFocus
                            className="flex-1 min-w-[160px] border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
                          <input name="estimated" type="number" placeholder="Budget estimé" min={0}
                            className="w-32 border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
                          <button type="submit" className="bg-[#4a5240] text-white px-4 py-1.5 rounded-xl text-sm cursor-pointer" style={{ fontWeight: 300 }}>Créer</button>
                          <button type="button" onClick={() => setAddingItemFor(null)} className="text-stone-400 text-sm cursor-pointer" style={{ fontWeight: 300 }}>✕</button>
                        </form>
                      ) : (
                        <button onClick={() => setAddingItemFor(cat.id)}
                          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer" style={{ fontWeight: 300 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Ajouter un poste
                        </button>
                      )}
                      <button onClick={async () => { if (!confirm(`Supprimer "${cat.name}" et tous ses postes ?`)) return; await call('deleteCategory', { id: cat.id }) }}
                        className="text-xs text-stone-200 hover:text-red-400 transition cursor-pointer shrink-0" style={{ fontWeight: 300 }}>
                        Supprimer la catégorie
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
  )
}

const ITEM_PLACEHOLDER: Record<string, string> = {
  'Lieu & réception': 'ex: Domaine de la Roseraie',
  'Traiteur': 'ex: Buffet cocktail',
  'Photo & vidéo': 'ex: Photographe',
  'Fleurs & déco': 'ex: Compositions florales',
  'Musique & DJ': 'ex: DJ pour la soirée',
  'Robe & costume': 'ex: Robe de mariée',
  'Transport': 'ex: Location voiture de prestige',
  'Faire-part': 'ex: Impressions faire-parts',
  'Lune de miel': 'ex: Vols aller-retour',
  'Divers': 'ex: Cadeaux invités',
}

function QuoteForm({ slug, itemId, currencies, defaultValues, onSubmit, onCancel }: {
  slug: string; itemId: string; currencies: string[]
  defaultValues?: Quote; onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>; onCancel: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input name="vendor_name" type="text" placeholder="Prestataire" defaultValue={defaultValues?.vendor_name ?? ''} autoFocus
          className="col-span-2 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
        <select name="currency" defaultValue={defaultValues?.currency ?? 'EUR'}
          className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white text-stone-700" style={{ fontWeight: 300 }}>
          {currencies.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="amount" type="number" placeholder="Montant devis" min={0} defaultValue={defaultValues?.amount || ''} required
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
        <input name="paid_amount" type="number" placeholder="Déjà payé" min={0} defaultValue={defaultValues?.paid_amount || ''}
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
      </div>
      <input name="notes" type="text" placeholder="Notes (optionnel)" defaultValue={defaultValues?.notes ?? ''}
        className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
      <div className="flex gap-2">
        <button type="submit" className="bg-[#4a5240] text-white px-4 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-[#2d3228] transition" style={{ fontWeight: 300 }}>
          {defaultValues ? 'Enregistrer' : 'Ajouter ce devis'}
        </button>
        <button type="button" onClick={onCancel} className="text-stone-400 text-sm px-3 cursor-pointer" style={{ fontWeight: 300 }}>Annuler</button>
      </div>
    </form>
  )
}
