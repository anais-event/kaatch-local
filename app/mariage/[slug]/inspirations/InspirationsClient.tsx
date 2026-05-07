'use client'

import { useState, useTransition } from 'react'

type InspiItem = {
  id: string
  category: string
  title: string
  description: string | null
  url: string | null
  image_url: string | null
  budget_note: string | null
}

type Props = {
  slug: string
  weddingId: string
  items: InspiItem[]
  visibleCats: string[]
  toggleCatVisibility: (fd: FormData) => Promise<void>
  addItem: (fd: FormData) => Promise<void>
  deleteItem: (fd: FormData) => Promise<void>
  updateItem: (fd: FormData) => Promise<void>
}

const CATS = [
  { key: 'menu',      label: 'Menu',      icon: '🍽️' },
  { key: 'boissons',  label: 'Boissons',  icon: '🥂' },
  { key: 'deco',      label: 'Déco',      icon: '🌸' },
  { key: 'theme',     label: 'Thème',     icon: '✨' },
  { key: 'tenue',     label: 'Tenues',    icon: '👗' },
]

function isYoutube(url: string) { return url.includes('youtube.com') || url.includes('youtu.be') }
function isPinterest(url: string) { return url.includes('pinterest') }
function isImage(url: string) { return /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(url) }

function UrlPreview({ url }: { url: string }) {
  if (!url) return null
  if (isImage(url)) {
    return (
      <img src={url} alt="" className="w-full h-32 object-cover rounded-xl mt-2" style={{ border: '1px solid #e7e5e4' }} />
    )
  }
  const domain = (() => { try { return new URL(url).hostname.replace('www.', '') } catch { return url } })()
  const icon = isPinterest(url) ? '📌' : isYoutube(url) ? '▶️' : '🔗'
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       className="flex items-center gap-2 mt-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100 hover:border-[#4a5240]/30 transition group"
       style={{ fontWeight: 300, fontSize: '0.75rem', color: '#78716c' }}>
      <span>{icon}</span>
      <span className="truncate group-hover:text-[#4a5240] transition">{domain}</span>
      <span className="ml-auto text-stone-300 shrink-0">↗</span>
    </a>
  )
}

function AddForm({ slug, weddingId, category, onDone, addItem }: {
  slug: string; weddingId: string; category: string; onDone: () => void
  addItem: (fd: FormData) => Promise<void>
}) {
  const [, startTransition] = useTransition()
  return (
    <form onSubmit={e => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      fd.set('slug', slug)
      fd.set('wedding_id', weddingId)
      fd.set('category', category)
      startTransition(async () => { await addItem(fd); onDone() })
    }} className="bg-[#f5f0e8]/60 border border-stone-200 rounded-2xl p-4 space-y-2.5">
      <input name="title" required autoFocus placeholder="Titre ou nom de l'idée *"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
        style={{ fontWeight: 300 }} />
      <textarea name="description" placeholder="Description, notes…" rows={2}
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition resize-none"
        style={{ fontWeight: 300 }} />
      <input name="url" type="url" placeholder="Lien Pinterest, Instagram, site…"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
        style={{ fontWeight: 300 }} />
      <input name="image_url" type="url" placeholder="Lien image directe (optionnel)"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
        style={{ fontWeight: 300 }} />
      <input name="budget_note" placeholder="Note budget (ex: environ 2 000 €)"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
        style={{ fontWeight: 300 }} />
      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="bg-[#4a5240] text-white px-5 py-2 rounded-xl text-sm cursor-pointer hover:bg-[#2d3228] transition"
          style={{ fontWeight: 300 }}>
          Ajouter
        </button>
        <button type="button" onClick={onDone}
          className="text-stone-400 text-sm px-3 cursor-pointer"
          style={{ fontWeight: 300 }}>
          Annuler
        </button>
      </div>
    </form>
  )
}

function ItemCard({ item, slug, deleteItem, updateItem }: {
  item: InspiItem; slug: string
  deleteItem: (fd: FormData) => Promise<void>
  updateItem: (fd: FormData) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [, startTransition] = useTransition()
  const displayUrl = item.image_url || item.url

  if (editing) {
    return (
      <form onSubmit={e => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        fd.set('slug', slug)
        fd.set('id', item.id)
        startTransition(async () => { await updateItem(fd); setEditing(false) })
      }} className="bg-white border-2 border-[#4a5240]/20 rounded-2xl p-4 space-y-2.5">
        <input name="title" required defaultValue={item.title}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
          style={{ fontWeight: 300 }} />
        <textarea name="description" rows={2} defaultValue={item.description ?? ''}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition resize-none"
          style={{ fontWeight: 300 }} />
        <input name="url" type="url" defaultValue={item.url ?? ''}
          placeholder="Lien"
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
          style={{ fontWeight: 300 }} />
        <input name="image_url" type="url" defaultValue={item.image_url ?? ''}
          placeholder="Lien image directe"
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
          style={{ fontWeight: 300 }} />
        <input name="budget_note" defaultValue={item.budget_note ?? ''}
          placeholder="Note budget"
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white text-stone-700 outline-none focus:border-[#4a5240] transition"
          style={{ fontWeight: 300 }} />
        <div className="flex gap-2 pt-1">
          <button type="submit"
            className="bg-[#4a5240] text-white px-4 py-1.5 rounded-xl text-sm cursor-pointer hover:bg-[#2d3228] transition"
            style={{ fontWeight: 300 }}>
            Enregistrer
          </button>
          <button type="button" onClick={() => setEditing(false)}
            className="text-stone-400 text-sm px-3 cursor-pointer" style={{ fontWeight: 300 }}>
            Annuler
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-sm transition group">
      {item.image_url && isImage(item.image_url) && (
        <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-stone-800">{item.title}</p>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
            <button onClick={() => setEditing(true)}
              className="p-1 text-stone-300 hover:text-[#4a5240] transition cursor-pointer rounded">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
            <button onClick={() => {
              if (!confirm('Supprimer cette inspiration ?')) return
              const fd = new FormData()
              fd.set('slug', slug)
              fd.set('id', item.id)
              startTransition(async () => { await deleteItem(fd) })
            }} className="p-1 text-stone-300 hover:text-red-400 transition cursor-pointer rounded">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {item.description && (
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-500 mb-2 leading-relaxed">
            {item.description}
          </p>
        )}
        {item.budget_note && (
          <p style={{ fontWeight: 300, fontSize: '0.72rem' }}
             className="text-[#4a5240] bg-[#f5f0e8] px-2.5 py-1 rounded-lg inline-block mb-2">
            💰 {item.budget_note}
          </p>
        )}
        {displayUrl && !item.image_url && <UrlPreview url={displayUrl} />}
        {item.image_url && item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 mt-2 text-xs text-stone-400 hover:text-[#4a5240] transition"
             style={{ fontWeight: 300 }}>
            <span>🔗</span>
            <span className="truncate">{(() => { try { return new URL(item.url).hostname.replace('www.','') } catch { return item.url } })()}</span>
            <span className="ml-auto">↗</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default function InspirationsClient({ slug, weddingId, items, visibleCats, toggleCatVisibility, addItem, deleteItem, updateItem }: Props) {
  const [activeTab, setActiveTab] = useState('menu')
  const [adding, setAdding] = useState(false)
  const [, startTransition] = useTransition()

  const cat = CATS.find(c => c.key === activeTab)!
  const catItems = items.filter(i => i.category === activeTab)
  const isVisible = visibleCats.includes(activeTab)

  function handleToggleVisibility() {
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('wedding_id', weddingId)
    fd.set('cat', activeTab)
    fd.set('visible', String(isVisible))
    startTransition(() => toggleCatVisibility(fd))
  }

  return (
    <div style={{ fontFamily: 'var(--font-lato)' }}>
      {/* Category tabs */}
      <div className="flex border-b-2 border-stone-200 mb-6 gap-1 overflow-x-auto">
        {CATS.map(c => (
          <button key={c.key} onClick={() => { setActiveTab(c.key); setAdding(false) }}
            className={`px-5 py-3 text-sm rounded-t-lg border-b-2 -mb-0.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === c.key
                ? 'bg-white border-[#4a5240] text-[#2d3228] shadow-sm'
                : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-white/60'
            }`}
            style={{ fontWeight: activeTab === c.key ? 600 : 300, fontSize: '0.92rem', background: activeTab === c.key ? 'white' : 'transparent' }}>
            {c.icon} {c.label}
            {visibleCats.includes(c.key) && (
              <span style={{ fontSize: '0.55rem', marginLeft: 5, color: '#4a5240' }} title="Visible invités">●</span>
            )}
            {items.filter(i => i.category === c.key).length > 0 && (
              <span style={{
                fontSize: '0.62rem', marginLeft: 4, background: activeTab === c.key ? '#4a5240' : '#e7e5e4',
                color: activeTab === c.key ? 'white' : '#a8a29e', borderRadius: 999, padding: '1px 6px',
              }}>
                {items.filter(i => i.category === c.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add button + visibility toggle */}
      <div className="flex items-center justify-between mb-5 gap-3">
        {!adding ? (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
            style={{ fontWeight: 300 }}>
            + Ajouter {cat.icon} {cat.label}
          </button>
        ) : <div />}
        <button onClick={handleToggleVisibility}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition cursor-pointer shrink-0 ${
            isVisible
              ? 'bg-[#4a5240]/10 text-[#4a5240] border-[#4a5240]/30 hover:bg-[#4a5240]/20'
              : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300 hover:text-stone-600'
          }`}
          style={{ fontWeight: 300 }}>
          <span>{isVisible ? '👁' : '🙈'}</span>
          <span>{isVisible ? 'Visible invités' : 'Masqué'}</span>
        </button>
      </div>

      {adding && (
        <div className="mb-5">
          <AddForm slug={slug} weddingId={weddingId} category={activeTab} onDone={() => setAdding(false)} addItem={addItem} />
        </div>
      )}

      {/* Grid */}
      {catItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <p style={{ fontSize: '2rem' }} className="mb-3">{cat.icon}</p>
          <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400">
            Aucune inspiration {cat.label.toLowerCase()} pour l'instant
          </p>
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-300 mt-1">
            Ajoutez des idées, liens Pinterest, images, notes budget…
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catItems.map(item => (
            <ItemCard key={item.id} item={item} slug={slug} deleteItem={deleteItem} updateItem={updateItem} />
          ))}
        </div>
      )}
    </div>
  )
}
