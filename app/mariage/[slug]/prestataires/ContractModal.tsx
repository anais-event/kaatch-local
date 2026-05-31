'use client'
import { toDateLocale } from '@/lib/locale-map'
import { useLocale } from 'next-intl'

import { useState, useMemo } from 'react'
import { getContractTemplate, type ContractField } from '@/lib/vendor-contracts'

type WeddingInfo = {
  name: string
  date: string | null
  location: string | null
}

type VendorInfo = {
  id: string
  name: string
  category: string
  email: string | null
  phone: string | null
}

type Props = {
  wedding: WeddingInfo
  vendor: VendorInfo
  defaultAmount?: number
  onClose: () => void
}

function formatDate(d: string | null): string {
  if (!d) return ''
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString(toDateLocale('fr'), { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return d }
}

export default function ContractModal({ wedding, vendor, defaultAmount, onClose }: Props) {
  const template = useMemo(() => getContractTemplate(vendor.category), [vendor.category])

  const [coupleNames, setCoupleNames] = useState(wedding.name)
  const [coupleAddress, setCoupleAddress] = useState('')
  const [coupleEmail, setCoupleEmail] = useState('')
  const [couplePhone, setCouplePhone] = useState('')
  const [vendorAddress, setVendorAddress] = useState('')
  const [vendorSiret, setVendorSiret] = useState('')
  const [weddingDate, setWeddingDate] = useState(wedding.date ?? '')
  const [weddingLocation, setWeddingLocation] = useState(wedding.location ?? '')
  const [contractCity, setContractCity] = useState('')
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [prestation, setPrestation] = useState(template.prestationDefault)
  const [extra, setExtra] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const f of template.extraFields) {
      init[f.key] = f.defaultValue ?? (f.key === 'price_total' && defaultAmount ? String(defaultAmount) : '')
    }
    return init
  })
  const [generating, setGenerating] = useState(false)

  function setField(key: string, value: string) {
    setExtra(prev => ({ ...prev, [key]: value }))
  }

  async function downloadPdf() {
    setGenerating(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const MARGIN = 18
      const PAGE_WIDTH = 210
      const PAGE_HEIGHT = 297
      const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
      let y = MARGIN

      function ensureSpace(needed: number) {
        if (y + needed > PAGE_HEIGHT - MARGIN) {
          pdf.addPage()
          y = MARGIN
        }
      }
      function writeWrapped(text: string, size: number, opts: { bold?: boolean; color?: [number, number, number]; align?: 'left' | 'center' } = {}) {
        pdf.setFont('helvetica', opts.bold ? 'bold' : 'normal')
        pdf.setFontSize(size)
        const [r, g, b] = opts.color ?? [45, 50, 40]
        pdf.setTextColor(r, g, b)
        const lines = pdf.splitTextToSize(text, CONTENT_WIDTH) as string[]
        const lineHeight = size * 0.42
        for (const line of lines) {
          ensureSpace(lineHeight + 1)
          if (opts.align === 'center') {
            pdf.text(line, PAGE_WIDTH / 2, y, { align: 'center' })
          } else {
            pdf.text(line, MARGIN, y)
          }
          y += lineHeight + 0.6
        }
      }
      function spacer(n: number) { y += n }
      function divider() {
        ensureSpace(4)
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.2)
        pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
        y += 3.5
      }

      // Header
      writeWrapped(template.title.toUpperCase(), 14, { bold: true, align: 'center', color: [74, 82, 64] })
      spacer(2)
      writeWrapped(coupleNames, 11, { align: 'center', color: [120, 113, 108] })
      if (weddingDate) writeWrapped(formatDate(weddingDate), 10, { align: 'center', color: [120, 113, 108] })
      spacer(3)
      divider()

      // Parties
      writeWrapped('ENTRE LES SOUSSIGNÉS', 9, { bold: true, color: [120, 113, 108] })
      spacer(1)
      writeWrapped(`Les mariés : ${coupleNames}`, 10, { bold: true })
      if (coupleAddress) writeWrapped(`Adresse : ${coupleAddress}`, 9, { color: [80, 80, 80] })
      const coupleContact = [coupleEmail, couplePhone].filter(Boolean).join(' — ')
      if (coupleContact) writeWrapped(coupleContact, 9, { color: [80, 80, 80] })
      writeWrapped('Ci-après désignés "les Mariés",', 9, { color: [120, 113, 108] })
      spacer(2)
      writeWrapped("D'UNE PART,", 9, { bold: true, color: [120, 113, 108] })
      spacer(2)
      writeWrapped(`Le prestataire : ${vendor.name}`, 10, { bold: true })
      writeWrapped(`Catégorie : ${vendor.category}`, 9, { color: [80, 80, 80] })
      if (vendorAddress) writeWrapped(`Adresse : ${vendorAddress}`, 9, { color: [80, 80, 80] })
      if (vendorSiret) writeWrapped(`SIRET : ${vendorSiret}`, 9, { color: [80, 80, 80] })
      const vendorContact = [vendor.email, vendor.phone].filter(Boolean).join(' — ')
      if (vendorContact) writeWrapped(vendorContact, 9, { color: [80, 80, 80] })
      writeWrapped('Ci-après désigné "le Prestataire",', 9, { color: [120, 113, 108] })
      spacer(2)
      writeWrapped("D'AUTRE PART,", 9, { bold: true, color: [120, 113, 108] })
      spacer(3)
      writeWrapped("IL A ÉTÉ CONVENU CE QUI SUIT :", 10, { bold: true })
      spacer(2)
      divider()

      // Article 1 — Objet
      writeWrapped('Article 1 — Objet du contrat', 11, { bold: true, color: [74, 82, 64] })
      spacer(1)
      writeWrapped(prestation, 10)
      spacer(3)

      // Article 2 — Date et lieu
      writeWrapped('Article 2 — Date et lieu de la prestation', 11, { bold: true, color: [74, 82, 64] })
      spacer(1)
      if (weddingDate) writeWrapped(`Date : ${formatDate(weddingDate)}`, 10)
      if (weddingLocation) writeWrapped(`Lieu : ${weddingLocation}`, 10)
      spacer(3)

      // Article 3 — Caractéristiques de la prestation (extra fields)
      const filledExtra = template.extraFields.filter(f =>
        !['price_total', 'price_deposit', 'deposit_date', 'balance_date'].includes(f.key) && (extra[f.key] ?? '').trim()
      )
      if (filledExtra.length > 0) {
        writeWrapped('Article 3 — Caractéristiques de la prestation', 11, { bold: true, color: [74, 82, 64] })
        spacer(1)
        for (const f of filledExtra) {
          writeWrapped(`${f.label} :`, 10, { bold: true })
          writeWrapped(extra[f.key], 10)
          spacer(1)
        }
        spacer(2)
      }

      // Article 4 — Conditions financières
      writeWrapped(`Article ${filledExtra.length > 0 ? '4' : '3'} — Conditions financières`, 11, { bold: true, color: [74, 82, 64] })
      spacer(1)
      const total = parseFloat(extra.price_total || '0')
      const deposit = parseFloat(extra.price_deposit || '0')
      const balance = Math.max(0, total - deposit)
      writeWrapped(`Montant total TTC : ${total.toFixed(2)} €`, 10, { bold: true })
      writeWrapped(`Acompte versé : ${deposit.toFixed(2)} €${extra.deposit_date ? ' — le ' + formatDate(extra.deposit_date) : ''}`, 10)
      writeWrapped(`Solde dû : ${balance.toFixed(2)} €${extra.balance_date ? ' — au plus tard le ' + formatDate(extra.balance_date) : ''}`, 10)
      spacer(3)

      // Clauses
      let articleNum = filledExtra.length > 0 ? 5 : 4
      for (const c of template.clauses) {
        writeWrapped(`Article ${articleNum} — ${c.title}`, 11, { bold: true, color: [74, 82, 64] })
        spacer(1)
        writeWrapped(c.body, 10)
        spacer(3)
        articleNum++
      }

      // Signatures
      ensureSpace(50)
      divider()
      writeWrapped(`Fait à ${contractCity || '………………'}, le ${formatDate(contractDate) || '………………'}, en deux exemplaires originaux.`, 10)
      spacer(8)
      ensureSpace(35)
      const colWidth = (CONTENT_WIDTH - 10) / 2
      const startY = y
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(45, 50, 40)
      pdf.text('Les Mariés', MARGIN, startY)
      pdf.text('Le Prestataire', MARGIN + colWidth + 10, startY)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text('(signature précédée de "Lu et approuvé")', MARGIN, startY + 5)
      pdf.text('(signature précédée de "Lu et approuvé")', MARGIN + colWidth + 10, startY + 5)
      pdf.setDrawColor(180, 180, 180)
      pdf.rect(MARGIN, startY + 8, colWidth, 25)
      pdf.rect(MARGIN + colWidth + 10, startY + 8, colWidth, 25)
      y = startY + 40

      // Footer page numbers
      const pageCount = (pdf as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(180, 180, 180)
        pdf.text(`${i} / ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: 'right' })
        pdf.text('Contrat généré avec Kaatch', MARGIN, PAGE_HEIGHT - 8)
      }

      const safeName = `${vendor.name.replace(/[^a-z0-9 -]/gi, '').slice(0, 40)}`.trim() || 'prestataire'
      pdf.save(`Contrat - ${safeName}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  function renderField(f: ContractField) {
    const value = extra[f.key] ?? ''
    const baseClass = 'w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition'
    if (f.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={e => setField(f.key, e.target.value)}
          placeholder={f.placeholder}
          rows={3}
          className={baseClass}
          style={{ fontWeight: 300, resize: 'vertical' }}
        />
      )
    }
    return (
      <input
        type={f.type}
        value={value}
        onChange={e => setField(f.key, e.target.value)}
        placeholder={f.placeholder}
        className={baseClass}
        style={{ fontWeight: 300 }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className="relative bg-[#f5f0e8] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
           style={{ fontFamily: 'var(--font-lato)' }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1" style={{ fontWeight: 400 }}>
              Contrat type — {vendor.category}
            </p>
            <h2 className="text-[#2d3228]" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600 }}>
              {template.title}
            </h2>
            <p className="text-xs text-stone-400 mt-1" style={{ fontWeight: 300 }}>{vendor.name}</p>
          </div>
          <button onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition cursor-pointer text-xl leading-none px-2">×</button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <section>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-3" style={{ fontWeight: 400 }}>Les mariés</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Noms des mariés</label>
                <input value={coupleNames} onChange={e => setCoupleNames(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Adresse</label>
                <input value={coupleAddress} onChange={e => setCoupleAddress(e.target.value)}
                  placeholder="Numéro, rue, code postal, ville"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={coupleEmail} onChange={e => setCoupleEmail(e.target.value)} placeholder="Email"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
                <input value={couplePhone} onChange={e => setCouplePhone(e.target.value)} placeholder="Téléphone"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-3" style={{ fontWeight: 400 }}>Le prestataire</p>
            <div className="space-y-2">
              <div className="text-sm text-stone-700" style={{ fontWeight: 400 }}>{vendor.name}</div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Adresse</label>
                <input value={vendorAddress} onChange={e => setVendorAddress(e.target.value)}
                  placeholder="Adresse complète du prestataire"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>SIRET</label>
                <input value={vendorSiret} onChange={e => setVendorSiret(e.target.value)}
                  placeholder="123 456 789 00012"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-3" style={{ fontWeight: 400 }}>Mariage</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Date</label>
                <input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Lieu</label>
                <input value={weddingLocation} onChange={e => setWeddingLocation(e.target.value)} placeholder="Lieu de la cérémonie"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-3" style={{ fontWeight: 400 }}>Objet du contrat</p>
            <textarea value={prestation} onChange={e => setPrestation(e.target.value)} rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
              style={{ fontWeight: 300, resize: 'vertical' }} />
          </section>

          <section>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-3" style={{ fontWeight: 400 }}>{"Détails de la prestation"}</p>
            <div className="space-y-2">
              {template.extraFields.map(f => (
                <div key={f.key}>
                  <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>{f.label}</label>
                  {renderField(f)}
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-3" style={{ fontWeight: 400 }}>Signature</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Ville</label>
                <input value={contractCity} onChange={e => setContractCity(e.target.value)} placeholder="Ex : Paris"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Date</label>
                <input type="date" value={contractDate} onChange={e => setContractDate(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#4a5240] transition"
                  style={{ fontWeight: 300 }} />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 bg-white">
          <p className="text-[10px] text-stone-400" style={{ fontWeight: 300 }}>
            Contrat type indicatif — à adapter à votre situation.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition cursor-pointer"
              style={{ fontWeight: 300 }}>Annuler</button>
            <button onClick={downloadPdf} disabled={generating}
              className="px-4 py-2 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              style={{ fontWeight: 400 }}>
              {generating ? 'Génération…' : (<>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v1.5A2.25 2.25 0 005.25 20.25h13.5A2.25 2.25 0 0021 18v-1.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" />
                </svg>
                Télécharger le PDF
              </>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
