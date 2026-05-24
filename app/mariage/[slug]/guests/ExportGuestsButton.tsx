'use client'

import { useState } from 'react'

type Guest = {
  first_name: string
  last_name?: string | null
  nickname?: string | null
  email?: string | null
  telephone?: string | null
  relation?: string | null
  guest_type?: string | null
  rsvp_status?: string | null
  invite_sent_at?: string | null
  table_id?: string | null
  dietary_notes?: string | null
}

type Table = { id: string; name: string }

type Props = {
  guests: Guest[]
  weddingName: string
  tables?: Table[]
}

const RSVP_LABELS: Record<string, string> = {
  confirme: 'Confirmé',
  decline: 'Décliné',
  en_attente: 'En attente',
}

export default function ExportGuestsButton({ guests, weddingName, tables = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<'excel' | 'csv' | 'traiteur' | null>(null)

  async function exportExcel() {
    setLoading('excel')
    setOpen(false)
    try {
      const XLSX = await import('xlsx')
      const rows = guests.map(g => ({
        Prénom: g.first_name,
        Nom: g.last_name ?? '',
        Surnom: g.nickname ?? '',
        Email: g.email ?? '',
        Téléphone: g.telephone ?? '',
        Lien: g.relation ?? '',
        Type: g.guest_type ?? 'adulte',
        RSVP: RSVP_LABELS[g.rsvp_status ?? ''] ?? 'En attente',
        'Invitation envoyée': g.invite_sent_at
          ? new Date(g.invite_sent_at).toLocaleDateString('fr-FR')
          : '',
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      // Column widths
      ws['!cols'] = [14, 14, 12, 28, 16, 12, 8, 12, 18].map(w => ({ wch: w }))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Invités')
      XLSX.writeFile(wb, `invites-${weddingName.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
    } finally {
      setLoading(null)
    }
  }

  async function exportTraiteur() {
    setLoading('traiteur')
    setOpen(false)
    try {
      const XLSX = await import('xlsx')
      const confirmed = guests.filter(g => g.rsvp_status === 'confirme')
      const rows = confirmed.map(g => {
        const table = tables.find(t => t.id === g.table_id)
        const isEnfant = g.guest_type === 'enfant'
        const hasDietary = !!g.dietary_notes
        return {
          Prénom: g.first_name,
          Nom: g.last_name ?? '',
          Table: table?.name ?? '—',
          Type: isEnfant ? 'Enfant' : 'Adulte',
          'Menu enfant': isEnfant ? 'Oui' : '',
          'Régime / Allergie': g.dietary_notes ?? '',
          'Sans alcool': (isEnfant || hasDietary) ? 'À vérifier' : '',
        }
      })
      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [14, 14, 16, 8, 12, 30, 12].map(w => ({ wch: w }))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Traiteur')
      XLSX.writeFile(wb, `traiteur-${weddingName.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
    } finally {
      setLoading(null)
    }
  }

  function exportCsv() {
    setLoading('csv')
    setOpen(false)
    const headers = ['Prénom', 'Nom', 'Surnom', 'Email', 'Téléphone', 'Lien', 'Type', 'RSVP', 'Invitation envoyée']
    const rows = guests.map(g => [
      g.first_name,
      g.last_name ?? '',
      g.nickname ?? '',
      g.email ?? '',
      g.telephone ?? '',
      g.relation ?? '',
      g.guest_type ?? 'adulte',
      RSVP_LABELS[g.rsvp_status ?? ''] ?? 'En attente',
      g.invite_sent_at ? new Date(g.invite_sent_at).toLocaleDateString('fr-FR') : '',
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invites-${weddingName.toLowerCase().replace(/\s+/g, '-')}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setLoading(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 border border-stone-200 bg-white text-stone-600 px-3 py-1.5 rounded-xl text-xs hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
      >
        {loading ? (
          <span className="animate-pulse">Export…</span>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v1.25A1.25 1.25 0 004.25 19h11.5A1.25 1.25 0 0017 17.75V16.5M10 3.5v9m0 0l-3-3m3 3l3-3" />
            </svg>
            Exporter
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-stone-100 rounded-xl shadow-lg z-50 min-w-[140px] overflow-hidden">
          <button
            onClick={exportExcel}
            className="w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition cursor-pointer"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            <span>📊</span> Excel (.xlsx)
          </button>
          <button
            onClick={exportCsv}
            className="w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition cursor-pointer border-t border-stone-50"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            <span>📄</span> CSV
          </button>
          <button
            onClick={exportTraiteur}
            className="w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition cursor-pointer border-t border-stone-50"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            <span>🍽️</span> Export traiteur
          </button>
        </div>
      )}
    </div>
  )
}
