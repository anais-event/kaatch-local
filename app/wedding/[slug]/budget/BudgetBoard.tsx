'use client'

import { useState, useMemo } from 'react'

type Category = { id: string; name: string; icon: string; color: string; budget_allocated: number }
type Item = { id: string; category_id: string; label: string; estimated_amount: number; status: string; description: string | null }
type Quote = { id: string; item_id: string; vendor_name: string | null; amount: number; paid_amount: number; currency: string; status: 'en_attente' | 'retenu' | 'refuse'; notes: string | null; due_date: string | null }
type Actions = Record<string, (f: FormData) => Promise<void>>
type View = 'liste' | 'tableau' | 'colonnes'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF']

function fmt(amount: number, currency: string) {
  try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount) }
  catch { return `${amount} ${currency}` }
}

function statusLabel(s: string) {
  return s === 'devis' ? 'Devis' : s === 'acompte' ? 'Acompte' : s === 'solde' ? 'Soldé' : s
}
function statusColor(s: string) {
  return s === 'solde' ? 'bg-emerald-50 text-emerald-600' : s === 'acompte' ? 'bg-amber-50 text-amber-600' : 'bg-stone-100 text-stone-500'
}
function statusDot(s: string) {
  return s === 'solde' ? 'bg-emerald-400' : s === 'acompte' ? 'bg-amber-400' : 'bg-stone-300'
}

export default function BudgetBoard({ slug, weddingId, budgetTotal, budgetCurrency, categories, items, quotes, currencies, actions }: {
  slug: string; weddingId: string; budgetTotal: number; budgetCurrency: string
  categories: Category[]; items: Item[]; quotes: Quote[]; currencies: string[]; actions: Actions
}) {
  const [view, setView] = useState<View>('liste')
  const [search, setSearch] = useState('')
  const [editBudget, setEditBudget] = useState(false)
  const [addingCat, setAddingCat] = useState(false)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(categories.map(c => c.id)))
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [addingQuoteFor, setAddingQuoteFor] = useState<string | null>(null)
  const [editingQuote, setEditingQuote] = useState<string | null>(null)

  // Filtrage search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(item => {
      if (item.label.toLowerCase().includes(q)) return true
      const itemQuotes = quotes.filter(qt => qt.item_id === item.id)
      return itemQuotes.some(qt => qt.vendor_name?.toLowerCase().includes(q))
    })
  }, [items, quotes, search])

  // Calcul des totaux (basé sur devis retenus ou estimated si pas de devis)
  const getItemEffective = (item: Item) => {
    const itemQuotes = quotes.filter(q => q.item_id === item.id)
    const retained = itemQuotes.find(q => q.status === 'retenu')
    if (retained) return { amount: retained.amount, paid: retained.paid_amount, currency: retained.currency, vendor: retained.vendor_name }
    if (itemQuotes.length > 0) {
      const cheapest = [...itemQuotes].sort((a, b) => a.amount - b.amount)[0]
      return { amount: cheapest.amount, paid: cheapest.paid_amount, currency: cheapest.currency, vendor: cheapest.vendor_name }
    }
    return { amount: item.estimated_amount, paid: 0, currency: budgetCurrency, vendor: null }
  }

  const totalEngaged = filteredItems.reduce((s, i) => s + getItemEffective(i).amount, 0)
  const totalPaid = filteredItems.reduce((s, i) => s + getItemEffective(i).paid, 0)
  const totalRemaining = totalEngaged - totalPaid
  const pct = budgetTotal > 0 ? Math.min(100, (totalEngaged / budgetTotal) * 100) : 0

  async function call(action: string, data: Record<string, string>) {
    const fd = new FormData()
    fd.set('slug', slug)
    Object.entries(data).forEach(([k, v]) => fd.set(k, v))
    await actions[action](fd)
  }

  const toggleCat = (id: string) => setExpandedCats(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleItem = (id: string) => setExpandedItems(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const itemsForCat = (catId: string) => filteredItems.filter(i => i.category_id === catId)
  const quotesForItem = (itemId: string) => quotes.filter(q => q.item_id === itemId)

  return (
    <div className="space-y-5">

      {/* ── Enveloppe + contrôles ── */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
          {/* Budget total */}
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
                <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">
                  {budgetTotal > 0 ? fmt(budgetTotal, budgetCurrency) : '— Définir le budget'}
                </span>
                <span className="text-xs text-stone-300 group-hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>modifier</span>
              </button>
            )}
          </div>
          {/* Stats */}
          {items.length > 0 && (
            <div className="flex gap-4 sm:gap-6 text-right shrink-0">
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Engagé</p>
                <p style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-stone-700">{fmt(totalEngaged, budgetCurrency)}</p>
              </div>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Payé</p>
                <p style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-emerald-600">{fmt(totalPaid, budgetCurrency)}</p>
              </div>
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase">Reste</p>
                <p style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-amber-600">{fmt(totalRemaining, budgetCurrency)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Barre progression */}
        {budgetTotal > 0 && (
          <div>
            <div className="flex justify-between text-xs text-stone-400 mb-1.5" style={{ fontWeight: 300 }}>
              <span>{Math.round(pct)}% engagé</span>
              <span>{fmt(Math.max(0, budgetTotal - totalEngaged), budgetCurrency)} restant</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 transition-all" style={{ width: `${budgetTotal > 0 ? (totalPaid/budgetTotal)*100 : 0}%` }} />
              <div className="bg-amber-300 transition-all" style={{ width: `${budgetTotal > 0 ? (totalRemaining/budgetTotal)*100 : 0}%` }} />
            </div>
            <div className="flex gap-4 mt-1.5">
              {[['bg-emerald-400','Payé'],['bg-amber-300',"Reste à payer"],['bg-stone-100 border border-stone-200','Disponible']].map(([cls,lbl]) => (
                <span key={lbl} className="flex items-center gap-1 text-xs text-stone-400" style={{ fontWeight: 300 }}>
                  <span className={`w-2 h-2 rounded-full ${cls}`} />{lbl}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Barre search + toggle vues ── */}
      <div className="flex gap-3 items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un poste ou un prestataire…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
            style={{ fontWeight: 300 }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 cursor-pointer">✕</button>
          )}
        </div>
        {/* Vue toggle */}
        <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden shrink-0">
          {([['liste','☰','Liste'],['tableau','⊞','Tableau'],['colonnes','⣿','Colonnes']] as const).map(([v, icon, lbl]) => (
            <button key={v} onClick={() => setView(v as View)}
              className={`px-3 py-2.5 text-xs transition flex items-center gap-1.5 cursor-pointer ${view === v ? 'bg-[#4a5240] text-white' : 'text-stone-400 hover:text-[#4a5240]'}`}
              style={{ fontWeight: 300 }}>
              <span>{icon}</span>
              <span className="hidden sm:inline">{lbl}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Vues ── */}
      {categories.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-stone-100">
          <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.4rem' }} className="text-stone-400 mb-2">Aucune catégorie</p>
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
      ) : view === 'liste' ? (
        <ListView
          slug={slug} categories={categories} items={filteredItems} quotes={quotes} budgetCurrency={budgetCurrency}
          expandedCats={expandedCats} expandedItems={expandedItems} addingItemFor={addingItemFor} addingQuoteFor={addingQuoteFor} editingQuote={editingQuote}
          toggleCat={toggleCat} toggleItem={toggleItem}
          setAddingItemFor={setAddingItemFor} setAddingQuoteFor={setAddingQuoteFor} setEditingQuote={setEditingQuote}
          itemsForCat={itemsForCat} quotesForItem={quotesForItem} getItemEffective={getItemEffective}
          currencies={CURRENCIES} actions={actions} call={call}
        />
      ) : view === 'tableau' ? (
        <TableView items={filteredItems} quotes={quotes} categories={categories} budgetCurrency={budgetCurrency} getItemEffective={getItemEffective} />
      ) : (
        <KanbanView slug={slug} items={filteredItems} quotes={quotes} categories={categories} budgetCurrency={budgetCurrency} getItemEffective={getItemEffective} actions={actions} />
      )}

      {/* Ajouter catégorie */}
      {categories.length > 0 && (
        addingCat ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228] mb-4">Nouvelle catégorie</p>
            <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); await actions.addCategory(fd); setAddingCat(false) }} className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <input name="icon" type="text" defaultValue="💰" maxLength={2}
                  className="w-12 border border-stone-200 rounded-xl px-2 py-2 text-center outline-none text-lg bg-white" />
                <input name="name" type="text" placeholder="Nom de la catégorie" required
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
        ) : (
          <button onClick={() => setAddingCat(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm cursor-pointer" style={{ fontWeight: 300 }}>
            + Ajouter une catégorie
          </button>
        )
      )}
    </div>
  )
}

// ════════════════════════════════════════
// VUE LISTE
// ════════════════════════════════════════
function ListView({ slug, categories, items, quotes, budgetCurrency, expandedCats, expandedItems, addingItemFor, addingQuoteFor, editingQuote, toggleCat, toggleItem, setAddingItemFor, setAddingQuoteFor, setEditingQuote, itemsForCat, quotesForItem, getItemEffective, currencies, actions, call }: any) {
  return (
    <div className="space-y-3">
      {categories.map((cat: Category) => {
        const catItems = itemsForCat(cat.id)
        const isOpen = expandedCats.has(cat.id)
        const catTotal = catItems.reduce((s: number, i: Item) => s + getItemEffective(i).amount, 0)
        const catPaid = catItems.reduce((s: number, i: Item) => s + getItemEffective(i).paid, 0)
        const pct = cat.budget_allocated > 0 ? Math.min(100, catTotal / cat.budget_allocated * 100) : null

        return (
          <div key={cat.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            {/* Header cat */}
            <div className="px-5 py-4 flex items-center gap-3 cursor-pointer" onClick={() => toggleCat(cat.id)}>
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
                    <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                    <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400 shrink-0">{Math.round(pct)}%</span>
                  </div>
                )}
              </div>
              {catItems.length > 0 && (
                <div className="text-right hidden sm:block shrink-0">
                  <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{fmt(catTotal, budgetCurrency)}</p>
                  {catPaid > 0 && <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-emerald-500">{fmt(catPaid, budgetCurrency)} payé</p>}
                </div>
              )}
              <span className="text-stone-300 text-sm">{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
              <div className="border-t border-stone-50">
                {catItems.length === 0 && addingItemFor !== cat.id && (
                  <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-300 italic text-center py-4">Aucun poste</p>
                )}

                {catItems.map((item: Item) => {
                  const iQuotes = quotesForItem(item.id)
                  const retained = iQuotes.find((q: Quote) => q.status === 'retenu')
                  const isItemOpen = expandedItems.has(item.id)
                  const eff = getItemEffective(item)

                  return (
                    <div key={item.id} className="border-b border-stone-50 last:border-0">
                      {/* Ligne poste */}
                      <div className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/50 group transition">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(item.status)}`} />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleItem(item.id)}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700">{item.label}</p>
                            {retained?.vendor_name && (
                              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">· {retained.vendor_name}</span>
                            )}
                            {iQuotes.length > 0 && (
                              <span style={{ fontWeight: 300, fontSize: '0.68rem' }}
                                    className="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
                                {iQuotes.length} devis
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(item.status)}`} style={{ fontWeight: 400 }}>
                            {statusLabel(item.status)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{fmt(eff.amount, eff.currency)}</p>
                          {eff.paid > 0 && <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-emerald-500">{fmt(eff.paid, eff.currency)} payé</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button onClick={() => { setAddingQuoteFor(item.id); if (!expandedItems.has(item.id)) toggleItem(item.id) }}
                            className="p-1.5 text-stone-300 hover:text-[#4a5240] transition cursor-pointer rounded-lg hover:bg-stone-100" title="Ajouter un devis">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                          <button onClick={async () => { if (!confirm('Supprimer ce poste ?')) return; await call('deleteItem', { id: item.id }) }}
                            className="p-1.5 text-stone-300 hover:text-red-400 transition cursor-pointer rounded-lg hover:bg-red-50">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Devis du poste */}
                      {isItemOpen && (
                        <div className="bg-stone-50/50 px-5 pb-3 pt-1 space-y-2 border-t border-stone-50">
                          {iQuotes.map((quote: Quote) => (
                            <div key={quote.id}>
                              {editingQuote === quote.id ? (
                                <QuoteForm slug={slug} itemId={item.id} currencies={currencies} defaultValues={quote}
                                  onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('id', quote.id); await actions.updateQuote(fd); setEditingQuote(null) }}
                                  onCancel={() => setEditingQuote(null)} />
                              ) : (
                                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition group ${
                                  quote.status === 'retenu' ? 'bg-[#4a5240]/5 border-[#4a5240]/20' :
                                  quote.status === 'refuse' ? 'bg-stone-100/50 border-stone-200 opacity-50' :
                                  'bg-white border-stone-100'
                                }`}>
                                  {quote.status === 'retenu' && <span className="text-[#4a5240] text-xs shrink-0">✦</span>}
                                  {quote.status === 'refuse' && <span className="text-stone-300 text-xs shrink-0">✕</span>}
                                  {quote.status === 'en_attente' && <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />}

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                      <p style={{ fontWeight: quote.status === 'retenu' ? 500 : 300, fontSize: '0.85rem' }}
                                         className={quote.status === 'retenu' ? 'text-[#4a5240]' : 'text-stone-600'}>
                                        {quote.vendor_name || 'Prestataire non renseigné'}
                                      </p>
                                      {quote.status === 'retenu' && <span className="text-[10px] bg-[#4a5240] text-white px-1.5 py-0.5 rounded-full" style={{ fontWeight: 400 }}>Retenu</span>}
                                      {quote.status === 'refuse' && <span className="text-[10px] text-stone-400" style={{ fontWeight: 300 }}>Refusé</span>}
                                    </div>
                                    {quote.notes && <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 truncate">{quote.notes}</p>}
                                    {quote.due_date && <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">échéance {new Date(quote.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>}
                                  </div>

                                  <div className="text-right shrink-0">
                                    <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{fmt(quote.amount, quote.currency)}</p>
                                    {quote.paid_amount > 0 && <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-emerald-500">{fmt(quote.paid_amount, quote.currency)} payé</p>}
                                  </div>

                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                                    {quote.status !== 'retenu' && (
                                      <button onClick={() => call('retainQuote', { id: quote.id, item_id: item.id })}
                                        className="text-[10px] px-2 py-1 rounded-lg bg-[#4a5240]/10 text-[#4a5240] hover:bg-[#4a5240] hover:text-white transition cursor-pointer" style={{ fontWeight: 400 }}>
                                        Retenir
                                      </button>
                                    )}
                                    {quote.status === 'en_attente' && (
                                      <button onClick={() => call('refuseQuote', { id: quote.id })}
                                        className="text-[10px] px-2 py-1 rounded-lg text-stone-400 hover:text-red-400 transition cursor-pointer" style={{ fontWeight: 300 }}>
                                        Refuser
                                      </button>
                                    )}
                                    <button onClick={() => setEditingQuote(quote.id)}
                                      className="p-1.5 text-stone-300 hover:text-[#4a5240] cursor-pointer rounded-lg hover:bg-stone-100 transition">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                      </svg>
                                    </button>
                                    <button onClick={() => call('deleteQuote', { id: quote.id })}
                                      className="p-1.5 text-stone-300 hover:text-red-400 cursor-pointer rounded-lg hover:bg-red-50 transition">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {addingQuoteFor === item.id ? (
                            <QuoteForm slug={slug} itemId={item.id} currencies={currencies}
                              onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('item_id', item.id); await actions.addQuote(fd); setAddingQuoteFor(null) }}
                              onCancel={() => setAddingQuoteFor(null)} />
                          ) : (
                            <button onClick={() => setAddingQuoteFor(item.id)}
                              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer mt-1" style={{ fontWeight: 300 }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Ajouter un devis
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Ajouter poste */}
                <div className="px-5 py-3 border-t border-stone-50 flex items-center justify-between">
                  {addingItemFor === cat.id ? (
                    <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('slug', slug); fd.set('category_id', cat.id); await actions.addItem(fd); setAddingItemFor(null) }}
                          className="flex gap-2 flex-1 flex-wrap">
                      <input name="label" type="text" placeholder="Nom du poste (ex: Photographe)" required autoFocus
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
                  <button onClick={async () => { if (!confirm(`Supprimer "${cat.name}" ?`)) return; await call('deleteCategory', { id: cat.id }) }}
                    className="text-xs text-stone-200 hover:text-red-400 transition cursor-pointer ml-4" style={{ fontWeight: 300 }}>
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════
// VUE TABLEAU
// ════════════════════════════════════════
function TableView({ items, quotes, categories, budgetCurrency, getItemEffective }: any) {
  const [sortBy, setSortBy] = useState<string>('cat')
  const [sortDir, setSortDir] = useState<1|-1>(1)

  const getCat = (catId: string) => categories.find((c: Category) => c.id === catId)

  const sorted = [...items].sort((a: Item, b: Item) => {
    const ea = getItemEffective(a), eb = getItemEffective(b)
    if (sortBy === 'label') return sortDir * a.label.localeCompare(b.label)
    if (sortBy === 'amount') return sortDir * (ea.amount - eb.amount)
    if (sortBy === 'paid') return sortDir * (ea.paid - eb.paid)
    if (sortBy === 'status') return sortDir * a.status.localeCompare(b.status)
    return sortDir * (getCat(a.category_id)?.name ?? '').localeCompare(getCat(b.category_id)?.name ?? '')
  })

  const Th = ({ field, label }: { field: string; label: string }) => (
    <th className="text-left px-4 py-3 cursor-pointer hover:text-[#4a5240] transition select-none"
        style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.12em' }}
        onClick={() => { setSortBy(field); setSortDir(sortBy === field ? sortDir * -1 as 1|-1 : 1) }}>
      {label} {sortBy === field ? (sortDir === 1 ? '↑' : '↓') : ''}
    </th>
  )

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-stone-100 text-stone-400 uppercase">
            <tr>
              <Th field="cat" label="Catégorie" />
              <Th field="label" label="Poste" />
              <th className="text-left px-4 py-3" style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.12em' }}>Prestataire retenu</th>
              <Th field="amount" label="Montant" />
              <Th field="paid" label="Payé" />
              <th className="text-left px-4 py-3" style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.12em' }}>Reste</th>
              <Th field="status" label="Statut" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((item: Item) => {
              const cat = getCat(item.category_id)
              const eff = getItemEffective(item)
              return (
                <tr key={item.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat?.icon}</span>
                      <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-500 hidden sm:inline">{cat?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700">{item.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-500">{eff.vendor || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-stone-700">{fmt(eff.amount, eff.currency)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight: 300, fontSize: '0.88rem' }} className="text-emerald-600">{eff.paid > 0 ? fmt(eff.paid, eff.currency) : '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight: 300, fontSize: '0.88rem' }} className={eff.amount - eff.paid > 0 ? 'text-amber-600' : 'text-stone-300'}>
                      {eff.amount - eff.paid > 0 ? fmt(eff.amount - eff.paid, eff.currency) : '✓'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full ${statusColor(item.status)}`} style={{ fontWeight: 400 }}>
                      {statusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {items.length > 0 && (
            <tfoot className="border-t-2 border-stone-100 bg-stone-50/50">
              <tr>
                <td colSpan={3} className="px-4 py-3">
                  <span style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-500">{items.length} postes</span>
                </td>
                <td className="px-4 py-3"><span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-stone-700">{fmt(items.reduce((s: number, i: Item) => s + getItemEffective(i).amount, 0), budgetCurrency)}</span></td>
                <td className="px-4 py-3"><span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-emerald-600">{fmt(items.reduce((s: number, i: Item) => s + getItemEffective(i).paid, 0), budgetCurrency)}</span></td>
                <td className="px-4 py-3"><span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-amber-600">{fmt(items.reduce((s: number, i: Item) => s + Math.max(0, getItemEffective(i).amount - getItemEffective(i).paid), 0), budgetCurrency)}</span></td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
        {items.length === 0 && (
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-300 italic text-center py-10">Aucun poste</p>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// VUE COLONNES (KANBAN)
// ════════════════════════════════════════
function KanbanView({ slug, items, quotes, categories, budgetCurrency, getItemEffective, actions }: any) {
  const columns = [
    { key: 'devis',   label: 'Devis', color: 'bg-stone-100 text-stone-500',    dot: 'bg-stone-300' },
    { key: 'acompte', label: 'Acompte versé', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' },
    { key: 'solde',   label: 'Soldé ✓', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' },
  ]

  const getCat = (catId: string) => categories.find((c: Category) => c.id === catId)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {columns.map(col => {
        const colItems = items.filter((i: Item) => i.status === col.key)
        const colTotal = colItems.reduce((s: number, i: Item) => s + getItemEffective(i).amount, 0)
        return (
          <div key={col.key} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            {/* Header colonne */}
            <div className="px-4 py-3 border-b border-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span style={{ fontWeight: 500, fontSize: '0.82rem' }} className="text-stone-700">{col.label}</span>
                <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">({colItems.length})</span>
              </div>
              {colTotal > 0 && (
                <span style={{ fontWeight: 400, fontSize: '0.78rem' }} className="text-stone-500">{fmt(colTotal, budgetCurrency)}</span>
              )}
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2 min-h-[100px]">
              {colItems.map((item: Item) => {
                const cat = getCat(item.category_id)
                const eff = getItemEffective(item)
                const iQuotes = quotes.filter((q: Quote) => q.item_id === item.id)
                return (
                  <div key={item.id} className="border border-stone-100 rounded-xl p-3 hover:border-stone-200 transition">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.85rem' }} className="text-stone-700">{item.label}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm">{cat?.icon}</span>
                          <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{cat?.name}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p style={{ fontWeight: 600, fontSize: '0.88rem' }} className="text-stone-700">{fmt(eff.amount, eff.currency)}</p>
                        {eff.paid > 0 && <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-emerald-500">{fmt(eff.paid, eff.currency)} payé</p>}
                      </div>
                    </div>
                    {eff.vendor && (
                      <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mt-1">✦ {eff.vendor}</p>
                    )}
                    {iQuotes.length > 1 && (
                      <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 mt-1">{iQuotes.length} devis comparés</p>
                    )}
                    {/* Changer statut */}
                    <div className="flex gap-1 mt-2">
                      {columns.filter(c => c.key !== col.key).map(c => (
                        <button key={c.key}
                          onClick={async () => { const fd = new FormData(); fd.set('slug', slug); fd.set('id', item.id); fd.set('status', c.key); await actions.updateItemStatus(fd) }}
                          className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition ${c.color}`}
                          style={{ fontWeight: 300 }}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
              {colItems.length === 0 && (
                <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-300 italic text-center py-4">Aucun poste</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════
// FORMULAIRE DEVIS
// ════════════════════════════════════════
function QuoteForm({ slug, itemId, currencies, defaultValues, onSubmit, onCancel }: {
  slug: string; itemId: string; currencies: string[]
  defaultValues?: Quote; onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>; onCancel: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="bg-stone-50 border border-stone-100 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input name="vendor_name" type="text" placeholder="Prestataire" defaultValue={defaultValues?.vendor_name ?? ''}
          className="col-span-2 sm:col-span-2 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
        <select name="currency" defaultValue={defaultValues?.currency ?? 'EUR'}
          className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white text-stone-700" style={{ fontWeight: 300 }}>
          {currencies.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <input name="amount" type="number" placeholder="Montant devis" min={0} defaultValue={defaultValues?.amount || ''} required
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
        <input name="paid_amount" type="number" placeholder="Déjà payé" min={0} defaultValue={defaultValues?.paid_amount || ''}
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700" style={{ fontWeight: 300 }} />
        <input name="due_date" type="date" defaultValue={defaultValues?.due_date ?? ''}
          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none bg-white text-stone-600" style={{ fontWeight: 300 }} />
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
