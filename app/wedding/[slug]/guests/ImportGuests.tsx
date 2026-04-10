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
  metadata?: Record<string, string>
}

type CustomField = { label: string; column: string }

const KAATCH_FIELDS = [
  { key: 'first_name', label: 'Prénom', required: true },
  { key: 'last_name', label: 'Nom de famille', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'telephone', label: 'Téléphone', required: false },
  { key: 'relation', label: 'Lien de parenté', required: false },
  { key: 'guest_type', label: 'Type (adulte/enfant/animal)', required: false },
]

function autoDetect(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  const matchers: Record<string, string[]> = {
    first_name: ['prénom', 'prenom', 'firstname', 'first name', 'given'],
    last_name: ['nom', 'lastname', 'last name', 'surname', 'family'],
    email: ['email', 'mail', 'courriel', 'e-mail'],
    telephone: ['tel', 'phone', 'portable', 'mobile', 'gsm'],
    relation: ['relation', 'lien', 'parenté', 'parente', 'famille'],
    guest_type: ['type', 'catégorie', 'categorie'],
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
  const [step, setStep] = useState<'upload' | 'sheet' | 'map'>('upload')

  const [workbook, setWorkbook] = useState<{ sheetNames: string[]; wb: unknown } | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [customFields, setCustomFields] = useState<CustomField[]>([])

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
    setWorkbook({ sheetNames: wb.SheetNames, wb })
    setDone(false)
    if (wb.SheetNames.length === 1) {
      loadSheet(wb, wb.SheetNames[0], XLSX)
    } else {
      setSelectedSheet(wb.SheetNames[0])
      setStep('sheet')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function loadSheet(wb: any, sheetName: string, XLSX: any) {
    const ws = wb.Sheets[sheetName]
    const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    let headerRowIndex = 0
    for (let i = 0; i < Math.min(raw.length, 5); i++) {
      const nonEmpty = raw[i].filter(c => c && c.toString().trim() !== '').length
      if (nonEmpty >= 2) { headerRowIndex = i; break }
    }
    const parsed = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '', range: headerRowIndex })
    if (parsed.length === 0) return
    const hdrs = Object.keys(parsed[0]).filter(h => !h.startsWith('__EMPTY'))
    const cleanRows = parsed.map((row: Record<string, string>) => {
      const clean: Record<string, string> = {}
      hdrs.forEach(h => { clean[h] = row[h] || '' })
      return clean
    })
    setHeaders(hdrs)
    setRows(cleanRows)
    setMapping(autoDetect(hdrs))
    setCustomFields([])
    setStep('map')
  }

  async function confirmSheet() {
    if (!workbook || !selectedSheet) return
    const XLSX = await import('xlsx')
    loadSheet(workbook.wb, selectedSheet, XLSX)
  }

  function applyMapping(): ParsedGuest[] {
    return rows.map(row => {
      const get = (field: string) => {
        const col = mapping[field]
        return col ? row[col]?.toString().trim() || undefined : undefined
      }
      const meta: Record<string, string> = {}
      customFields.forEach(cf => {
        if (cf.label && cf.column) {
          const val = row[cf.column]?.toString().trim()
          if (val) meta[cf.label] = val
        }
      })
      return {
        first_name: get('first_name') || '',
        last_name: get('last_name'),
        email: get('email'),
        telephone: get('telephone'),
        relation: get('relation'),
        guest_type: get('guest_type') || 'adulte',
        metadata: Object.keys(meta).length > 0 ? meta : undefined,
      }
    }).filter(g => g.first_name)
  }

  function addCustomField() {
    setCustomFields(prev => [...prev, { label: '', column: '' }])
  }

  function updateCustomField(i: number, key: keyof CustomField, value: string) {
    setCustomFields(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: value } : f))
  }

  function removeCustomField(i: number) {
    setCustomFields(prev => prev.filter((_, idx) => idx !== i))
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
      setDone(true)
      setStep('upload')
      setOpen(false)
      setRows([]); setHeaders([]); setMapping({}); setWorkbook(null); setCustomFields([])
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    }
  }

  const preview = step === 'map' ? applyMapping().slice(0, 4) : []

  function reset() {
    setStep('upload')
    setWorkbook(null)
    setRows([]); setHeaders([]); setMapping({}); setCustomFields([])
    if (fileRef.current) fileRef.current.value = ''
  }

  // Colonnes pas encore utilisées dans les champs standards ni dans les autres custom fields
  const usedColumns = [
    ...Object.values(mapping),
    ...customFields.map(cf => cf.column),
  ].filter(Boolean)
  const unusedHeaders = headers.filter(h => !usedColumns.includes(h))

  return (
    <div className="mb-6">
      <button
        onClick={() => { setOpen(!open); if (!open) reset() }}
        className="text-sm border border-[#4a5240] text-[#4a5240] px-4 py-2 rounded-lg hover:bg-[#4a5240] hover:text-white transition cursor-pointer"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
        Importer depuis Excel / Google Sheets
      </button>

      {done && (
        <p className="mt-2 text-sm text-[#4a5240]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Invités importés avec succès !
        </p>
      )}

      {open && (
        <div className="mt-4 bg-white rounded-xl p-6 shadow-sm border border-stone-100">
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.2rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-1">Importer une liste d'invités</h3>

          {/* ÉTAPE 1 — Choisir le fichier */}
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

          {/* ÉTAPE 2 — Choisir la feuille */}
          {step === 'sheet' && workbook && (
            <>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                 className="text-stone-400 mb-4">
                Ce fichier contient {(workbook as { sheetNames: string[] }).sheetNames.length} feuilles. Laquelle contient les invités ?
              </p>
              <div className="space-y-2 mb-5">
                {(workbook as { sheetNames: string[] }).sheetNames.map(name => (
                  <label key={name}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition ${selectedSheet === name ? 'border-[#4a5240] bg-[#f5f0e8]' : 'border-stone-200 hover:border-stone-300'}`}>
                    <input type="radio" name="sheet" value={name}
                      checked={selectedSheet === name}
                      onChange={() => setSelectedSheet(name)}
                      className="accent-[#4a5240]" />
                    <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
                          className="text-stone-700">{name}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={reset}
                  className="flex-1 border border-stone-200 text-stone-400 py-2 rounded-lg hover:border-stone-300 transition text-sm cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  Changer de fichier
                </button>
                <button onClick={confirmSheet}
                  className="flex-1 bg-[#4a5240] text-white py-2 rounded-lg hover:bg-[#2d3228] transition text-sm cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  Utiliser cette feuille
                </button>
              </div>
            </>
          )}

          {/* ÉTAPE 3 — Mapper les colonnes */}
          {step === 'map' && (
            <>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                 className="text-stone-400 mb-4">
                {rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''}
                {selectedSheet ? ` · feuille "${selectedSheet}"` : ''}.
              </p>

              {/* Champs standards */}
              <div className="space-y-2.5 mb-4">
                {KAATCH_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.82rem' }}
                           className="w-40 text-stone-500 shrink-0">
                      {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-600 outline-none focus:border-[#4a5240] transition text-sm"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                      <option value="">— Ignorer —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Séparateur champs personnalisés */}
              <div className="border-t border-stone-100 pt-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em' }}
                     className="text-stone-400 uppercase">Champs personnalisés</p>
                  <button onClick={addCustomField}
                    disabled={unusedHeaders.length === 0}
                    className="text-xs text-[#4a5240] border border-[#4a5240] px-2.5 py-1 rounded-lg hover:bg-[#4a5240] hover:text-white transition disabled:opacity-30 cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    + Ajouter un champ
                  </button>
                </div>

                {customFields.length === 0 && (
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                     className="text-stone-300 italic">
                    {unusedHeaders.length > 0
                      ? `${unusedHeaders.length} colonne${unusedHeaders.length > 1 ? 's' : ''} non mappée${unusedHeaders.length > 1 ? 's' : ''} dans ton fichier (${unusedHeaders.join(', ')})`
                      : 'Toutes les colonnes sont mappées.'}
                  </p>
                )}

                <div className="space-y-2">
                  {customFields.map((cf, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {/* Nom du champ (libre) */}
                      <input
                        type="text"
                        placeholder="Nom du champ (ex: Table, RSVP…)"
                        value={cf.label}
                        onChange={e => updateCustomField(i, 'label', e.target.value)}
                        className="w-40 border border-stone-200 rounded-lg px-3 py-1.5 text-stone-600 outline-none focus:border-[#4a5240] transition text-sm shrink-0"
                        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                      {/* Colonne du fichier */}
                      <select
                        value={cf.column}
                        onChange={e => updateCustomField(i, 'column', e.target.value)}
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-600 outline-none focus:border-[#4a5240] transition text-sm"
                        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                        <option value="">— Colonne —</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      {/* Supprimer */}
                      <button onClick={() => removeCustomField(i)}
                        className="text-stone-300 hover:text-red-400 transition text-lg leading-none cursor-pointer px-1"
                        title="Supprimer">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aperçu */}
              {preview.length > 0 && (
                <div className="mb-4">
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em' }}
                     className="text-stone-400 uppercase mb-2">Aperçu</p>
                  <div className="space-y-1">
                    {preview.map((g, i) => (
                      <div key={i} className="text-sm text-stone-600 px-3 py-2 bg-[#f5f0e8] rounded-lg"
                           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                        <span className="font-medium">{g.first_name} {g.last_name}</span>
                        {g.email && <span className="text-stone-400 ml-2">· {g.email}</span>}
                        {g.telephone && <span className="text-stone-400 ml-2">· {g.telephone}</span>}
                        {g.metadata && Object.entries(g.metadata).map(([k, v]) => (
                          <span key={k} className="text-stone-400 ml-2">· {k}: {v}</span>
                        ))}
                      </div>
                    ))}
                    {rows.length > 4 && (
                      <p className="text-xs text-stone-300 px-3" style={{ fontWeight: 300 }}>
                        + {rows.length - 4} autre{rows.length - 4 > 1 ? 's' : ''}…
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={workbook && (workbook as { sheetNames: string[] }).sheetNames.length > 1 ? () => setStep('sheet') : reset}
                  className="flex-1 border border-stone-200 text-stone-400 py-2 rounded-lg hover:border-stone-300 transition text-sm cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  {workbook && (workbook as { sheetNames: string[] }).sheetNames.length > 1 ? 'Changer de feuille' : 'Changer de fichier'}
                </button>
                <button onClick={handleImport} disabled={loading || !mapping['first_name']}
                  className="flex-1 bg-[#4a5240] text-white py-2 rounded-lg hover:bg-[#2d3228] transition disabled:opacity-40 text-sm cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  {loading ? 'Import en cours…' : `Importer ${applyMapping().length} invité${applyMapping().length > 1 ? 's' : ''}`}
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
