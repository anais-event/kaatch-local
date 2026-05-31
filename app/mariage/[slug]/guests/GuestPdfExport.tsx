'use client'
import { toDateLocale } from '@/lib/locale-map'
import { useLocale } from 'next-intl'

import { useState, useRef } from 'react'

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  relation: string | null
  rsvp_status: string | null
  guest_type: string | null
  dietary_notes: string | null
  invited_parts: string[] | null
}

type Props = {
  guests: Guest[]
  weddingName: string
  weddingDate: string | null
}

const RSVP_LABELS: Record<string, string> = {
  confirme: 'Confirmé',
  en_attente: 'En attente',
  decline: 'Décliné',
}

export default function GuestPdfExport({ guests, weddingName, weddingDate }: Props) {
  const [loading, setLoading] = useState<null | 'liste' | 'synthese'>(null)
  const synthRef = useRef<HTMLDivElement>(null)

  const confirmed  = guests.filter(g => g.rsvp_status === 'confirme').length
  const pending    = guests.filter(g => g.rsvp_status === 'en_attente').length
  const declined   = guests.filter(g => g.rsvp_status === 'decline').length
  const adultes    = guests.filter(g => !g.guest_type || g.guest_type === 'adulte').length
  const ados       = guests.filter(g => g.guest_type === 'ado').length
  const enfants    = guests.filter(g => g.guest_type === 'enfant').length
  const animaux    = guests.filter(g => g.guest_type === 'animal').length
  const withDietary = guests.filter(g => g.dietary_notes)

  const fmtDate = weddingDate
    ? new Date(weddingDate + 'T00:00:00').toLocaleDateString(toDateLocale('fr'), { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  async function exportSynthese() {
    if (!synthRef.current) return
    setLoading('synthese')
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(synthRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = pdf.internal.pageSize.getWidth()
      const imgH = (canvas.height / canvas.width) * W
      pdf.addImage(imgData, 'PNG', 0, 0, W, imgH)
      pdf.save(`${weddingName} — Synthese invites.pdf`)
    } finally {
      setLoading(null)
    }
  }

  async function exportListe() {
    setLoading('liste')
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210
      const MARGIN = 15
      const COL = W - MARGIN * 2

      // Header — elegant minimal
      let y = 18
      pdf.setTextColor(44, 50, 40)
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(18)
      pdf.text(weddingName, MARGIN, y)
      y += 5
      if (fmtDate) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(168, 162, 158)
        pdf.text(fmtDate, MARGIN, y)
        y += 5
      }
      pdf.setLineWidth(0.3)
      pdf.setDrawColor(210, 210, 200)
      pdf.line(MARGIN, y, W - MARGIN, y)
      y += 7

      // Subtitle
      pdf.setTextColor(44, 50, 40)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.text('Liste des invites', MARGIN, y)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7.5)
      pdf.setTextColor(120, 113, 108)
      y += 5
      pdf.text(`${guests.length} invite${guests.length > 1 ? 's' : ''} · ${confirmed} confirme${confirmed > 1 ? 's' : ''} · ${pending} en attente`, MARGIN, y)

      // Column headers
      y += 9
      const cols = [
        { label: 'Prenom / Nom',       x: MARGIN,       w: 52 },
        { label: 'Lien',               x: MARGIN + 52,  w: 28 },
        { label: 'RSVP',               x: MARGIN + 80,  w: 25 },
        { label: 'Type',               x: MARGIN + 105, w: 18 },
        { label: 'Regime / Attention', x: MARGIN + 123, w: 62 },
      ]
      pdf.setFillColor(245, 240, 232)
      pdf.rect(MARGIN, y - 4.5, COL, 7, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(7)
      pdf.setTextColor(74, 82, 64)
      cols.forEach(c => pdf.text(c.label, c.x, y))
      y += 5

      // Rows
      pdf.setFont('helvetica', 'normal')
      const sorted = [...guests].sort((a, b) => a.first_name.localeCompare(b.first_name))
      sorted.forEach((g, i) => {
        if (y > 272) { pdf.addPage(); y = 18 }
        if (i % 2 === 0) {
          pdf.setFillColor(250, 249, 247)
          pdf.rect(MARGIN, y - 4, COL, 6.5, 'F')
        }
        const name = [g.first_name, g.last_name].filter(Boolean).join(' ')
        pdf.setFontSize(7.5)
        pdf.setTextColor(44, 50, 40)
        pdf.text(name.slice(0, 26), MARGIN, y)
        pdf.setTextColor(120, 113, 108)
        if (g.relation) pdf.text(g.relation.slice(0, 13), MARGIN + 52, y)
        if (g.rsvp_status === 'confirme') pdf.setTextColor(22, 163, 74)
        else if (g.rsvp_status === 'decline') pdf.setTextColor(239, 68, 68)
        else pdf.setTextColor(120, 113, 108)
        pdf.text(RSVP_LABELS[g.rsvp_status ?? 'en_attente'] ?? 'En attente', MARGIN + 80, y)
        pdf.setTextColor(120, 113, 108)
        if (g.guest_type === 'enfant') pdf.text('Enfant', MARGIN + 105, y)
        else if (g.guest_type === 'ado') pdf.text('Ado', MARGIN + 105, y)
        else if (g.guest_type === 'animal') pdf.text('Animal', MARGIN + 105, y)
        if (g.dietary_notes) {
          pdf.setTextColor(180, 83, 9)
          pdf.text(g.dietary_notes.slice(0, 32), MARGIN + 123, y)
        }
        y += 6.5
      })

      pdf.setTextColor(200, 200, 200)
      pdf.setFontSize(6.5)
      pdf.text('Genere avec Kaatch', MARGIN, 290)
      pdf.save(`${weddingName} — Liste invites.pdf`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button onClick={exportSynthese} disabled={!!loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition disabled:opacity-50 cursor-pointer"
          style={{ fontWeight: 300 }}>
          {loading === 'synthese'
            ? <span className="text-white/70">Génération…</span>
            : '↓ Synthèse traiteur (PDF)'}
        </button>
        <button onClick={exportListe} disabled={!!loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl text-sm hover:border-[#4a5240] hover:text-[#4a5240] transition disabled:opacity-50 cursor-pointer"
          style={{ fontWeight: 300 }}>
          {loading === 'liste'
            ? <span className="text-stone-400">Génération…</span>
            : '↓ Liste complète (PDF)'}
        </button>
      </div>

      {/* Synthèse render target — off-screen, A4 width 794px */}
      <div aria-hidden style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
        <div ref={synthRef} style={{ width: 794, backgroundColor: '#ffffff', fontFamily: 'Lato, sans-serif', padding: '40px 48px', boxSizing: 'border-box' }}>

          {/* Header — minimal elegant */}
          <div style={{ borderTop: '4px solid #4a5240', paddingTop: 24, marginBottom: 28 }}>
            <p style={{ fontSize: 10, fontWeight: 300, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: 10 }}>
              Synthèse invités — Document traiteur
            </p>
            <p style={{ fontSize: 30, fontWeight: 400, fontStyle: 'italic', color: '#2d3228', lineHeight: 1.1, marginBottom: fmtDate ? 6 : 0 }}>
              {weddingName}
            </p>
            {fmtDate && (
              <p style={{ fontSize: 12, fontWeight: 300, color: '#a8a29e', letterSpacing: '0.05em' }}>{fmtDate}</p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${4 + (ados > 0 ? 1 : 0) + (animaux > 0 ? 1 : 0)}, 1fr)`, gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total invités',  value: guests.length, color: '#2d3228' },
              { label: 'Confirmés',      value: confirmed,     color: '#16a34a' },
              { label: 'Adultes (18+)',  value: adultes,       color: '#4a5240' },
              ...(ados > 0 ? [{ label: 'Ados (12-18, sans alcool)', value: ados, color: '#b45309' }] : []),
              { label: 'Enfants (≤12)',  value: enfants,       color: '#e07b39' },
              ...(animaux > 0 ? [{ label: 'Animaux', value: animaux, color: '#a16207' }] : []),
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'white', borderRadius: 10, padding: '16px 20px', border: '1px solid #e7e5e4' }}>
                <p style={{ fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 10, fontWeight: 300, color: '#a8a29e', marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* RSVP breakdown */}
          <div style={{ backgroundColor: 'white', borderRadius: 10, padding: '18px 24px', marginBottom: 20, border: '1px solid #e7e5e4' }}>
            <p style={{ fontSize: 9, fontWeight: 300, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: 16 }}>
              Statuts RSVP
            </p>
            <div style={{ display: 'flex', gap: 36 }}>
              {[
                { label: 'Confirmés',  value: confirmed, color: '#16a34a' },
                { label: 'En attente', value: pending,   color: '#a8a29e' },
                { label: 'Déclinés',   value: declined,  color: '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: s.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 300, color: '#78716c' }}>{s.label}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div style={{ backgroundColor: 'white', borderRadius: 10, padding: '18px 24px', border: '1px solid #e7e5e4' }}>
            <p style={{ fontSize: 9, fontWeight: 300, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: 16 }}>
              Régimes & attentions particulières — {withDietary.length} invité{withDietary.length !== 1 ? 's' : ''}
            </p>
            {withDietary.length === 0 ? (
              <p style={{ fontSize: 13, fontWeight: 300, color: '#d6d3d1' }}>Aucune attention particulière renseignée.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {withDietary.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff7ed', borderRadius: 8, padding: '10px 16px', border: '1px solid #fed7aa' }}>
                    <span style={{ color: '#f97316', fontSize: 14, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>⚠</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#44403c', margin: '0 0 3px' }}>
                        {[g.first_name, g.last_name].filter(Boolean).join(' ')}
                        {g.guest_type === 'enfant' && (
                          <span style={{ fontSize: 10, fontWeight: 300, color: '#a8a29e', marginLeft: 8 }}>🧒 enfant</span>
                        )}
                        {g.guest_type === 'ado' && (
                          <span style={{ fontSize: 10, fontWeight: 300, color: '#a8a29e', marginLeft: 8 }}>🧑 ado (sans alcool)</span>
                        )}
                        {g.guest_type === 'animal' && (
                          <span style={{ fontSize: 10, fontWeight: 300, color: '#a8a29e', marginLeft: 8 }}>🐾 animal</span>
                        )}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 300, color: '#c2410c', margin: 0 }}>{g.dietary_notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p style={{ fontSize: 8, fontWeight: 300, color: '#e7e5e4', textAlign: 'right', marginTop: 20 }}>
            Généré avec Kaatch · {new Date().toLocaleDateString(toDateLocale('fr'))}
          </p>
        </div>
      </div>
    </>
  )
}
