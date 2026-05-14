'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  guest_type?: string | null
  rsvp_status?: string | null
}

type Product = { key: string; label: string }

type Selection = Record<string, Record<string, boolean>>

// Tous les produits possibles (ordre fixe)
const ALL_PRODUCTS: Product[] = [
  { key: 'save_the_date', label: 'Save the date' },
  { key: 'faire_part',    label: 'Faire-part' },
  { key: 'menu',          label: 'Menu' },
  { key: 'marque_place',  label: 'Marque-place' },
  { key: 'programme',     label: 'Programme' },
]

// Produits qui ne vont pas dans le tableau destinataires (grand format uniquement)
const EXCLUDED_FROM_DEST = new Set(['plan_table', 'numeros_table'])

function cleanName(n: string | null | undefined) {
  if (!n) return ''
  return n.split(' ').filter(p => p && p !== 'null').join(' ')
}

type Famille = { famille: string; members: Guest[] }

function buildFamilles(orderedGuests: Guest[]): Famille[] {
  const map = new Map<string, Guest[]>()
  for (const g of orderedGuests) {
    const key = cleanName(g.last_name) || g.id
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(g)
  }
  return Array.from(map.entries()).map(([famille, members]) => ({ famille, members }))
}

function CheckCircle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer
        ${checked ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300 hover:border-[#4a5240]/60 bg-white'}`}
    >
      {checked && (
        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

export default function DestinatairesClient({
  slug, weddingName, guests, collectionData, savedData, onSave,
}: {
  slug: string
  weddingName: string
  guests: Guest[]
  collectionData: unknown
  savedData: unknown
  onSave: (data: unknown, progress: number) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const storageKey = `studio_dest_${slug}`
  const orderKey   = `studio_dest_order_${slug}`

  // Dériver les produits actifs depuis la collection
  const PRODUCTS = useMemo<Product[]>(() => {
    if (collectionData && typeof collectionData === 'object') {
      const coll = collectionData as Record<string, { checked: boolean; download?: boolean }>
      return ALL_PRODUCTS.filter(p =>
        !EXCLUDED_FROM_DEST.has(p.key) &&
        coll[p.key]?.checked &&
        !coll[p.key]?.download  // les produits "téléchargement" ne vont pas dans les destinataires
      )
    }
    return ALL_PRODUCTS
  }, [collectionData])

  // Ordre drag & drop
  const [guestOrder, setGuestOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(orderKey)
        if (saved) {
          const order: string[] = JSON.parse(saved)
          const valid = order.filter(id => guests.some(g => g.id === id))
          const added = guests.filter(g => !valid.includes(g.id)).map(g => g.id)
          return [...valid, ...added]
        }
      } catch {}
    }
    return guests.map(g => g.id)
  })

  const orderedGuests = useMemo(
    () => guestOrder.map(id => guests.find(g => g.id === id)).filter(Boolean) as Guest[],
    [guestOrder, guests]
  )
  const familles = useMemo(() => buildFamilles(orderedGuests), [orderedGuests])

  const [selection, setSelection] = useState<Selection>(() => {
    if (savedData && typeof savedData === 'object') {
      const s = savedData as { selection?: Selection }
      return s.selection ?? (savedData as Selection)
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          return parsed.selection ?? parsed
        }
      } catch {}
    }
    return {}
  })

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(storageKey, JSON.stringify(selection)), 800)
    return () => clearTimeout(t)
  }, [selection, storageKey])
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(orderKey, JSON.stringify(guestOrder)), 800)
    return () => clearTimeout(t)
  }, [guestOrder, orderKey])

  function toggleKey(key: string, product: string) {
    setSelection(prev => ({
      ...prev,
      [key]: { ...prev[key], [product]: !prev[key]?.[product] },
    }))
  }

  function toggleCol(product: string) {
    const keys: string[] = []
    for (const { famille, members } of familles) {
      if (members.length > 1) keys.push(`famille:${famille}`)
      else keys.push(`guest:${members[0].id}`)
    }
    for (const { members } of familles) {
      if (members.length > 1) members.forEach(m => keys.push(`guest:${m.id}`))
    }
    const allChecked = keys.length > 0 && keys.every(k => selection[k]?.[product])
    setSelection(prev => {
      const next = { ...prev }
      for (const k of keys) next[k] = { ...next[k], [product]: !allChecked }
      return next
    })
  }

  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const p of PRODUCTS) {
      let count = 0
      for (const { famille, members } of familles) {
        if (members.length > 1) {
          if (selection[`famille:${famille}`]?.[p.key]) count++
          for (const m of members) if (selection[`guest:${m.id}`]?.[p.key]) count++
        } else {
          if (selection[`guest:${members[0].id}`]?.[p.key]) count++
        }
      }
      t[p.key] = count
    }
    return t
  }, [selection, familles, PRODUCTS])

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  const dragId    = useRef<string | null>(null)
  const dropId    = useRef<string | null>(null)
  const [dragging, setDragging]     = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  function onDragStart(e: React.DragEvent, guestId: string) {
    dragId.current = guestId
    setDragging(guestId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', guestId)
  }

  function onDragOver(e: React.DragEvent, guestId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dropId.current !== guestId) {
      dropId.current = guestId
      setDropTarget(guestId)
    }
  }

  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    const sourceId = dragId.current
    if (!sourceId || sourceId === targetId) return
    setGuestOrder(prev => {
      const next = [...prev]
      const from = next.indexOf(sourceId)
      const to   = next.indexOf(targetId)
      if (from === -1 || to === -1) return prev
      next.splice(from, 1)
      next.splice(to, 0, sourceId)
      return next
    })
  }

  function onDragEnd() {
    dragId.current = null
    dropId.current = null
    setDragging(null)
    setDropTarget(null)
  }

  if (PRODUCTS.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center" style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="text-center max-w-sm px-6">
          <p style={{ fontSize: '2rem' }} className="mb-4">📋</p>
          <p style={{ fontWeight: 600, fontSize: '1rem' }} className="text-[#2d3228] mb-2">Aucun produit sélectionné</p>
          <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-500 mb-6">
            Commencez par choisir vos créations dans l'étape 01 — Collection.
          </p>
          <a href={`/mariage/${slug}/studio/collection`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4a5240] text-white rounded-lg"
            style={{ fontWeight: 400, fontSize: '0.82rem' }}>
            Configurer ma collection →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* En-tête */}
      <div className="max-w-5xl mx-auto px-4 py-8 pb-4">
        <a href={`/mariage/${slug}/studio`}
          className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors mb-5"
          style={{ fontWeight: 300, fontSize: '0.75rem' }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Studio créatif
        </a>
        <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">
          02 · Vos destinataires
        </p>
        <h1 style={{ fontWeight: 600, fontSize: '1.3rem', lineHeight: 1.2 }} className="text-[#2d3228] mb-1">
          Personnalisez vos envois
        </h1>
        <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500">
          La ligne <strong style={{ fontWeight: 500 }}>Famille</strong> compte comme 1 envoi — ex: 1 faire-part par famille.
          Glissez <span className="inline-block">⠿</span> pour réorganiser.
        </p>
      </div>

      {/* Tableau */}
      <div className="max-w-5xl mx-auto px-0 sm:px-4 pb-40">
        <div className="bg-white border-y border-stone-100 sm:rounded-xl sm:border sm:shadow-sm overflow-hidden">

          {/* Header sticky */}
          <div className="sticky top-0 z-10 bg-white border-b border-stone-100">
            <div className="flex items-end">
              <div className="w-8 flex-shrink-0" />
              <div className="flex-1 min-w-[120px] px-3 py-3">
                <span style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.15em' }} className="text-stone-400 uppercase">
                  Invité
                </span>
              </div>
              {PRODUCTS.map(p => {
                const keys: string[] = []
                for (const { famille, members } of familles) {
                  keys.push(members.length > 1 ? `famille:${famille}` : `guest:${members[0].id}`)
                  if (members.length > 1) members.forEach(m => keys.push(`guest:${m.id}`))
                }
                const allChecked = keys.length > 0 && keys.every(k => selection[k]?.[p.key])
                return (
                  <button key={p.key} onClick={() => toggleCol(p.key)}
                    className="group flex flex-col items-center gap-1.5 px-2 py-3 flex-shrink-0"
                    style={{ width: 'clamp(64px, 13vw, 96px)' }}
                    title={`Tout sélectionner : ${p.label}`}>
                    <span style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.03em' }}
                      className="text-stone-400 group-hover:text-[#4a5240] transition-colors text-center leading-tight">
                      {p.label}
                    </span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                      ${allChecked ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-200 group-hover:border-[#4a5240]/50'}`}>
                      {allChecked && (
                        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Corps */}
          {familles.map(({ famille, members }, fi) => {
            const isMulti = members.length > 1
            const familleKey = `famille:${famille}`

            return (
              <div key={famille} className={fi > 0 ? 'border-t border-stone-100' : ''}>

                {/* Ligne famille (seulement si multi) */}
                {isMulti && (
                  <div className="flex items-center bg-stone-50/80">
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                      <span className="text-stone-200 text-xs select-none">⠿</span>
                    </div>
                    <div className="flex-1 min-w-[120px] px-3 py-2 flex items-center gap-2">
                      <span style={{ fontWeight: 500, fontSize: '0.75rem' }} className="text-stone-600">
                        Famille {famille}
                      </span>
                      <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400">
                        {members.length} pers. · 1 envoi
                      </span>
                    </div>
                    {PRODUCTS.map(p => (
                      <div key={p.key} className="flex items-center justify-center flex-shrink-0 py-2"
                        style={{ width: 'clamp(64px, 13vw, 96px)' }}>
                        <CheckCircle
                          checked={!!selection[familleKey]?.[p.key]}
                          onChange={() => toggleKey(familleKey, p.key)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Membres */}
                {members.map((guest, gi) => {
                  const guestKey = `guest:${guest.id}`
                  const isDragged  = dragging === guest.id
                  const isDropOver = dropTarget === guest.id && dragging !== guest.id
                  return (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={e => onDragStart(e, guest.id)}
                      onDragOver={e => onDragOver(e, guest.id)}
                      onDrop={e => onDrop(e, guest.id)}
                      onDragEnd={onDragEnd}
                      className={`flex items-center transition-all duration-100
                        ${isDragged  ? 'opacity-30 bg-stone-50' : ''}
                        ${isDropOver ? 'border-t-2 border-[#4a5240] bg-[#4a5240]/5' : 'hover:bg-stone-50/40'}
                        ${!isDragged && !isDropOver && gi < members.length - 1 ? 'border-b border-stone-50' : ''}`}
                    >
                      <div className="w-8 flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing">
                        <span className="text-stone-300 hover:text-stone-400 transition-colors select-none text-sm">⠿</span>
                      </div>

                      <div className={`flex-1 min-w-[120px] px-3 py-2.5 flex items-center gap-2 ${isMulti ? 'pl-5' : ''}`}>
                        <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-700">
                          {cleanName(guest.first_name)}
                          {cleanName(guest.last_name) && (
                            <span className="text-stone-400"> {cleanName(guest.last_name)}</span>
                          )}
                        </span>
                        {guest.guest_type === 'enfant' && (
                          <span style={{ fontWeight: 300, fontSize: '0.6rem' }}
                            className="text-stone-300 border border-stone-200 rounded-full px-1.5 py-0.5">
                            enfant
                          </span>
                        )}
                      </div>

                      {PRODUCTS.map(p => (
                        <div key={p.key} className="flex items-center justify-center flex-shrink-0"
                          style={{ width: 'clamp(64px, 13vw, 96px)' }}>
                          <CheckCircle
                            checked={!!selection[guestKey]?.[p.key]}
                            onChange={() => toggleKey(guestKey, p.key)}
                          />
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Totaux */}
          <div className="flex items-center border-t border-stone-200 bg-stone-50">
            <div className="w-8 flex-shrink-0" />
            <div className="flex-1 min-w-[120px] px-3 py-3">
              <span style={{ fontWeight: 400, fontSize: '0.72rem', letterSpacing: '0.1em' }} className="text-stone-500 uppercase">
                Total
              </span>
            </div>
            {PRODUCTS.map(p => (
              <div key={p.key} className="flex items-center justify-center flex-shrink-0 py-3"
                style={{ width: 'clamp(64px, 13vw, 96px)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }} className="text-[#4a5240]">
                  {totals[p.key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Récap */}
        <div className="px-4 sm:px-0 mt-4">
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-50">
              <p style={{ fontWeight: 600, fontSize: '0.88rem' }} className="text-[#2d3228]">Récapitulatif</p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2">
              {PRODUCTS.filter(p => totals[p.key] > 0).map(p => (
                <div key={p.key} className="flex items-center justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-600">
                    {totals[p.key]} × {p.label}
                  </span>
                  <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400">— €</span>
                </div>
              ))}
              {grandTotal === 0 && (
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-300 text-center py-1">
                  Aucune sélection
                </p>
              )}
            </div>
            {grandTotal > 0 && (
              <div className="px-5 py-3 border-t border-stone-50 flex justify-between bg-stone-50/50">
                <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                  {grandTotal} créations sélectionnées
                </span>
                <span style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500">Total à définir</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre bas */}
      <div className="fixed bottom-0 left-0 right-0 md:left-56 z-40 bg-white/95 backdrop-blur border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={() => router.push(`/mariage/${slug}/studio`)}
            style={{ fontWeight: 300, fontSize: '0.82rem' }}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour au studio
          </button>
          <div className="flex items-center gap-3">
            <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 hidden sm:block">
              Sauvegardé automatiquement
            </span>
            <button
              onClick={async () => {
                if (grandTotal === 0 || saving) return
                setSaving(true)
                await onSave({ selection, guestOrder }, grandTotal > 0 ? 100 : 0)
                router.push(`/mariage/${slug}/studio`)
              }}
              disabled={grandTotal === 0 || saving}
              style={{ fontWeight: 400, fontSize: '0.8rem', letterSpacing: '0.03em' }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all
                ${grandTotal > 0 && !saving ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]' : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}>
              {saving ? 'Sauvegarde…' : 'Valider mes envois'}
              {!saving && <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>}
            </button>
          </div>
        </div>
        <div className="h-safe-bottom" />
      </div>
    </div>
  )
}
