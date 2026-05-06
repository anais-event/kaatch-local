'use client'

import { useState, useTransition } from 'react'

type Category = { id: string; name: string; icon: string; color: string; budget_allocated: number }
type Item = { id: string; category_id: string | null }
type Quote = { id: string; item_id: string; amount: number; paid_amount: number; status: string }

function computeStats(cat: Category, items: Item[], quotes: Quote[]) {
  const catItemIds = new Set(items.filter(i => i.category_id === cat.id).map(i => i.id))
  const retained = quotes.filter(q => catItemIds.has(q.item_id) && q.status === 'retenu')
  const engage = retained.reduce((s, q) => s + (q.amount ?? 0), 0)
  const paye = retained.reduce((s, q) => s + (q.paid_amount ?? 0), 0)
  return { engage, paye, reste: engage - paye }
}

function fmt(n: number, currency: string) {
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} ${currency}`
}

type Props = {
  slug: string
  budgetTotal: number
  budgetCurrency: string
  categories: Category[]
  items: Item[]
  quotes: Quote[]
  updateCategoryAllocated: (fd: FormData) => Promise<void>
}

export default function BudgetGlobalView({ slug, budgetTotal, budgetCurrency, categories, items, quotes, updateCategoryAllocated }: Props) {
  const [allocations, setAllocations] = useState<Record<string, number>>(
    Object.fromEntries(categories.map(c => [c.id, c.budget_allocated ?? 0]))
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [, startTransition] = useTransition()

  function startEdit(catId: string) {
    setEditingId(catId)
    setEditValue(String(allocations[catId] || ''))
  }

  function saveEdit(catId: string) {
    const val = parseFloat(editValue) || 0
    setAllocations(prev => ({ ...prev, [catId]: val }))
    setEditingId(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('slug', slug)
      fd.set('id', catId)
      fd.set('allocated', String(val))
      await updateCategoryAllocated(fd)
    })
  }

  const allStats = categories.map(c => ({
    ...c,
    allocated: allocations[c.id] ?? 0,
    ...computeStats(c, items, quotes),
  }))

  const totalAllocated = allStats.reduce((s, c) => s + c.allocated, 0)
  const totalEngage = allStats.reduce((s, c) => s + c.engage, 0)
  const totalPaye = allStats.reduce((s, c) => s + c.paye, 0)
  const totalReste = totalEngage - totalPaye

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Enveloppe', value: budgetTotal, color: '#2d3228' },
            { label: 'Budget prévu', value: totalAllocated, color: '#4a5240' },
            { label: 'Engagé', value: totalEngage, color: '#e07b39' },
            { label: 'Payé', value: totalPaye, color: '#16a34a' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-[0.62rem] text-stone-400 uppercase tracking-widest mb-1" style={{ fontWeight: 300 }}>{s.label}</p>
              <p className="text-lg tabular-nums" style={{ fontWeight: 600, color: s.color }}>{fmt(s.value, budgetCurrency)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-stone-100">
                {['Catégorie', 'Budget prévu ✎', 'Engagé', 'Payé', 'Reste'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[0.62rem] text-stone-400 uppercase tracking-widest ${i === 0 ? 'text-left' : 'text-right'}`}
                      style={{ fontWeight: 300 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {allStats.map(cat => (
                <tr key={cat.id} className="hover:bg-stone-50/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm text-stone-700" style={{ fontWeight: 300 }}>{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {editingId === cat.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(cat.id)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                        autoFocus
                        className="w-28 text-right border border-[#4a5240]/40 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#4a5240]"
                        style={{ fontWeight: 300 }}
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(cat.id)}
                        className="text-sm tabular-nums hover:text-[#4a5240] transition cursor-pointer group"
                        style={{ fontWeight: cat.allocated > 0 ? 400 : 300, color: cat.allocated > 0 ? '#44403c' : '#d6d3d1', background: 'transparent', border: 'none' }}
                        title="Cliquer pour modifier"
                      >
                        {cat.allocated > 0 ? fmt(cat.allocated, budgetCurrency) : '— modifier'}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm tabular-nums" style={{ fontWeight: 300, color: cat.engage > 0 ? '#e07b39' : '#d6d3d1' }}>
                    {cat.engage > 0 ? fmt(cat.engage, budgetCurrency) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm tabular-nums" style={{ fontWeight: 300, color: cat.paye > 0 ? '#16a34a' : '#d6d3d1' }}>
                    {cat.paye > 0 ? fmt(cat.paye, budgetCurrency) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm tabular-nums" style={{ fontWeight: 300, color: cat.engage > 0 ? (cat.reste < 0 ? '#ef4444' : '#92400e') : '#d6d3d1' }}>
                    {cat.engage > 0 ? fmt(cat.reste, budgetCurrency) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-100 bg-stone-50/60">
                <td className="px-5 py-3.5 text-sm text-stone-700" style={{ fontWeight: 500 }}>Total</td>
                <td className="px-5 py-3.5 text-right text-sm tabular-nums text-stone-700" style={{ fontWeight: 500 }}>{fmt(totalAllocated, budgetCurrency)}</td>
                <td className="px-5 py-3.5 text-right text-sm tabular-nums" style={{ fontWeight: 500, color: '#e07b39' }}>{fmt(totalEngage, budgetCurrency)}</td>
                <td className="px-5 py-3.5 text-right text-sm tabular-nums text-emerald-700" style={{ fontWeight: 500 }}>{fmt(totalPaye, budgetCurrency)}</td>
                <td className="px-5 py-3.5 text-right text-sm tabular-nums" style={{ fontWeight: 500, color: '#92400e' }}>{fmt(totalReste, budgetCurrency)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="px-5 py-3 text-[0.68rem] text-stone-300 border-t border-stone-50" style={{ fontWeight: 300 }}>
          Cliquez sur un montant « Budget prévu » pour le modifier en ligne.
        </p>
      </div>
    </div>
  )
}
