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
  gender?: string
}

const KAATCH_FIELDS = [
  { key: 'first_name', label: 'Prénom', required: true },
  { key: 'last_name', label: 'Nom de famille', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'telephone', label: 'Téléphone', required: false },
  { key: 'relation', label: 'Lien de parenté', required: false },
  { key: 'guest_type', label: 'Type (adulte/ado/enfant/animal)', required: false },
  { key: 'gender', label: 'Genre (homme/femme)', required: false },
]

// Tentative d'auto-détection par mots-clés
function autoDetect(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  const matchers: Record<string, string[]> = {
    first_name: ['prénom', 'prenom', 'firstname', 'first name', 'given'],
    last_name: ['nom', 'lastname', 'last name', 'surname', 'family'],
    email: ['email', 'mail', 'courriel', 'e-mail'],
    telephone: ['tel', 'phone', 'portable', 'mobile', 'gsm'],
    relation: ['relation', 'lien', 'parenté', 'parente', 'famille'],
    guest_type: ['type', 'catégorie', 'categorie'],
    gender: ['genre', 'gender', 'sexe', 'civilité', 'civilite'],
  }
  for (const [field, keywords] of Object.entries(matchers)) {
    for (const h of headers) {
      if (keywords.some(k => h.toLowerCase().includes(k))) {
        map[field] = h
        break
      }
    }
  }
  return map
}

export default function ImportGuests({ weddingId, slug }: { weddingId: string; slug: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; limit_reached: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const parsed = (XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, string>[])

    if (parsed.length === 0) return
    const hdrs = Object.keys(parsed[0])
    setHeaders(hdrs)
    setRows(parsed)
    setMapping(autoDetect(hdrs))
    setStep('map')
    setDone(false)
  }

  function applyMapping(): ParsedGuest[] {
    return rows.map(row => {
      const get = (field: string) => {
        const col = mapping[field]
        return col ? row[col]?.toString().trim() || undefined : undefined
      }
      return {
        first_name: get('first_name') || '',
        last_name: get('last_name'),
        email: get('email'),
        telephone: get('telephone'),
        relation: get('relation'),
        guest_type: get('guest_type') || 'adulte',
        gender: get('gender'),
      }
    }).filter(g => g.first_name)
  }

  async function handleImport() {
    const guests = applyMapping()
    if (!guests.length) return
    setLoading(true)
    const res = await fetch('/api/import-guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, guests }),
    })
    setLoading(false)
    if (res.ok) {
      const result = await res.json()
      setImportResult({ imported: result.imported, skipped: result.skipped ?? 0, limit_reached: result.limit_reached ?? false })
      setDone(true)
      setStep('upload')
      setOpen(false)
      setRows([])
      setHeaders([])
      setMapping({})
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    }
  }

  const preview = step !== 'upload' ? applyMapping().slice(0, 5) : []

  return (
    <div>
      <button
        onClick={() => { setOpen(!open); if (!open) setStep('upload') }}
        className="text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer underline underline-offset-2"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, background: 'transparent', border: 'none' }}>
        Importer depuis Excel / Google Sheets
      </button>

      {done && importResult && (
        <div className="mt-2">
          <p className="text-sm text-[#4a5240]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            {importResult.imported} invité{importResult.imported > 1 ? 's' : ''} importé{importResult.imported > 1 ? 's' : ''} avec succès.
          </p>
          {importResult.limit_reached && (
            <p className="text-xs text-amber-600 mt-1" style={{ fontWeight: 300 }}>
              {importResult.skipped} invité{importResult.skipped > 1 ? 's' : ''} ignoré{importResult.skipped > 1 ? 's' : ''} — limite de 20 atteinte.{' '}
              <a href="#" className="underline">Passer à la formule Mariage</a> pour importer sans limite.
            </p>
          )}
        </div>
      )}

      {open && (
        <div className="mt-4 bg-white rounded-xl p-6 shadow-sm border border-stone-100">
          <h3 style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '1.2rem' }}
              className="text-[#4a5240] mb-1">Importer une liste d'invités</h3>

          {step === 'upload' && (
            <>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                 className="text-stone-400 mb-4">
                Supporte Excel (.xlsx), Google Sheets (.xlsx) et CSV.<br />
                Pour Google Sheets : Fichier → Télécharger → Format .xlsx
              </p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile}
                className="w-full border border-stone-200 rounded-xl px-4 py-2 text-stone-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#f5f0e8] file:text-[#4a5240] file:cursor-pointer transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }} />
            </>
          )}

          {step === 'map' && (
            <>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                 className="text-stone-400 mb-4">
                {rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''}. Associe chaque champ à la bonne colonne de ton fichier.
              </p>

              <div className="space-y-3 mb-5">
                {KAATCH_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                           className="w-44 text-stone-600 shrink-0">
                      {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-600 outline-none focus:border-[#4a5240] transition"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}>
                      <option value="">— Ignorer —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Aperçu */}
              {preview.length > 0 && (
                <div className="mb-4">
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em' }}
                     className="text-stone-400 uppercase mb-2">Aperçu (5 premiers)</p>
                  <div className="space-y-1">
                    {preview.map((g, i) => (
                      <div key={i} className="text-sm text-stone-600 px-3 py-1.5 bg-[#f5f0e8] rounded-lg"
                           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                        <span className="font-medium">{g.first_name} {g.last_name}</span>
                        {g.email && <span className="text-stone-400 ml-2">· {g.email}</span>}
                        {g.telephone && <span className="text-stone-400 ml-2">· {g.telephone}</span>}
                      </div>
                    ))}
                    {rows.length > 5 && (
                      <p className="text-xs text-stone-300 px-3" style={{ fontWeight: 300 }}>
                        + {rows.length - 5} autre{rows.length - 5 > 1 ? 's' : ''}…
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setStep('upload'); if (fileRef.current) fileRef.current.value = '' }}
                  className="flex-1 border border-stone-200 text-stone-400 py-2 rounded-lg hover:border-stone-300 transition text-sm cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  Changer de fichier
                </button>
                <button onClick={handleImport} disabled={loading || !mapping['first_name']}
                  className="flex-1 bg-[#4a5240] text-white py-2 rounded-lg hover:bg-[#2d3228] transition disabled:opacity-40 text-sm cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  {loading ? 'Import en cours…' : `Importer ${rows.length} invité${rows.length > 1 ? 's' : ''}`}
                </button>
              </div>
              {!mapping['first_name'] && (
                <p className="text-xs text-red-400 mt-2 text-center" style={{ fontWeight: 300 }}>
                  Le champ Prénom est obligatoire.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
