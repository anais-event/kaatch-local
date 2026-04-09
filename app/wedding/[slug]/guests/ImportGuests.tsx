'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type ParsedGuest = {
  first_name: string
  last_name?: string
  email?: string
  telephone?: string
  relation?: string
  guest_type?: string
}

export default function ImportGuests({ weddingId, slug }: { weddingId: string; slug: string }) {
  const [open, setOpen] = useState(false)
  const [guests, setGuests] = useState<ParsedGuest[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

    const parsed: ParsedGuest[] = rows.map(row => {
      // Cherche les colonnes par nom (insensible à la casse)
      const get = (keys: string[]) => {
        for (const k of Object.keys(row)) {
          if (keys.some(key => k.toLowerCase().includes(key))) return row[k]?.toString().trim() || undefined
        }
        return undefined
      }

      return {
        first_name: get(['prénom', 'prenom', 'firstname', 'first']) || '',
        last_name: get(['nom', 'lastname', 'last', 'surname']),
        email: get(['email', 'mail', 'courriel']),
        telephone: get(['tel', 'phone', 'portable', 'mobile']),
        relation: get(['relation', 'lien', 'parenté', 'parente']),
        guest_type: get(['type', 'catégorie', 'categorie']) || 'adulte',
      }
    }).filter(g => g.first_name)

    setGuests(parsed)
    setDone(false)
  }

  async function handleImport() {
    setLoading(true)
    const res = await fetch('/api/import-guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, guests }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
      setGuests([])
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)}
        className="text-sm border border-[#4a5240] text-[#4a5240] px-4 py-2 rounded-full hover:bg-[#4a5240] hover:text-white transition"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
        📥 Importer depuis Excel / Google Sheets
      </button>

      {done && (
        <p className="mt-2 text-sm text-[#4a5240]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          ✅ Invités importés avec succès !
        </p>
      )}

      {open && (
        <div className="mt-4 bg-white/80 rounded-2xl p-5 shadow-sm border border-stone-100">
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.2rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-2">Importer une liste</h3>

          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
             className="text-stone-400 mb-3">
            Format accepté : Excel (.xlsx) ou CSV. Les colonnes reconnues : <strong>Prénom</strong>, Nom, Email, Téléphone, Relation, Type.
            <br />Pour Google Sheets : Fichier → Télécharger → .xlsx
          </p>

          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile}
            className="w-full border border-stone-200 rounded-xl px-4 py-2 text-stone-500 bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-[#f5f0e8] file:text-[#4a5240] transition mb-3"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }} />

          {guests.length > 0 && (
            <>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                 className="text-stone-600 mb-3">
                {guests.length} invité{guests.length > 1 ? 's' : ''} détecté{guests.length > 1 ? 's' : ''} :
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
                {guests.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-stone-600 px-2">
                    <span>{g.guest_type === 'enfant' ? '👶' : g.guest_type === 'animal' ? '🐾' : '🧑'}</span>
                    <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                      {g.first_name} {g.last_name} {g.email && `· ${g.email}`}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={handleImport} disabled={loading}
                className="w-full bg-[#4a5240] text-white py-2.5 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}>
                {loading ? 'Import en cours…' : `Importer ${guests.length} invité${guests.length > 1 ? 's' : ''}`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
