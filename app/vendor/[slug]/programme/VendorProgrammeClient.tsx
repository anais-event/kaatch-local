'use client'

import { useState, useTransition, useRef } from 'react'

type Step = {
  id: string
  title: string
  description?: string | null
  address?: string | null
  time?: string | null
  icon?: string | null
  note: string
}

type Props = {
  slug: string
  vendorId: string
  weddingName: string
  weddingDate: string | null
  steps: Step[]
  saveNote: (fd: FormData) => Promise<void>
}

function NoteCell({ step, vendorId, slug, saveNote }: {
  step: Step
  vendorId: string
  slug: string
  saveNote: (fd: FormData) => Promise<void>
}) {
  const [value, setValue] = useState(step.note)
  const [saved, setSaved] = useState(true)
  const [pending, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onChange(v: string) {
    setValue(v)
    setSaved(false)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      startTransition(async () => {
        const fd = new FormData()
        fd.set('vendor_id', vendorId)
        fd.set('step_id', step.id)
        fd.set('content', v)
        fd.set('slug', slug)
        await saveNote(fd)
        setSaved(true)
      })
    }, 800)
  }

  return (
    <div className="relative h-full">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Vos notes pour ce moment..."
        rows={3}
        className="w-full h-full bg-[#f5f0e8] border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 outline-none focus:border-[#4a5240] transition resize-none"
        style={{ fontWeight: 300, minHeight: 72 }}
      />
      {!saved && (
        <span className="absolute bottom-2 right-2 text-[9px] text-stone-300" style={{ fontWeight: 300 }}>
          {pending ? 'Sauvegarde...' : 'Non sauvegardé'}
        </span>
      )}
    </div>
  )
}

export default function VendorProgrammeClient({ slug, vendorId, weddingName, weddingDate, steps, saveNote }: Props) {
  function handlePrint() {
    window.print()
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { background: white !important; padding: 0 !important; }
          body { background: white !important; }
          textarea { border: 1px solid #ddd !important; background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#f5f0e8] print-page" style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 no-print">
            <div>
              <a href={`/vendor/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
                 style={{ fontWeight: 300 }}>
                {"←"} Retour au tableau de bord
              </a>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
                  className="text-[#2d3228] mb-1">Programme du jour J</h1>
              {weddingDate && (
                <p className="text-stone-400" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
                  📅 {weddingDate}
                </p>
              )}
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-stone-200 bg-white text-stone-600 rounded-xl text-sm hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer"
              style={{ fontWeight: 300 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Imprimer / PDF
            </button>
          </div>

          {/* Print header (visible only in print) */}
          <div className="hidden print:block mb-6">
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.6rem' }}
                className="text-[#2d3228]">{weddingName} — Programme du jour J</h1>
            {weddingDate && (
              <p className="text-stone-500 text-sm mt-1">{weddingDate}</p>
            )}
          </div>

          {steps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300 }}
                 className="text-stone-300">Programme non encore défini</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="text-[10px] text-stone-400 uppercase tracking-wider px-1 no-print" style={{ fontWeight: 400 }}>
                  Vos notes
                </div>
                <div className="hidden print:block text-[10px] text-stone-400 uppercase tracking-wider px-1" style={{ fontWeight: 400 }}>
                  Vos notes
                </div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider px-1" style={{ fontWeight: 400 }}>
                  Programme des mariés
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={step.id} className="grid grid-cols-2 gap-4 items-start">
                    {/* Left: notes presta */}
                    <div className="no-print">
                      <NoteCell step={step} vendorId={vendorId} slug={slug} saveNote={saveNote} />
                    </div>
                    {/* Print version of notes */}
                    <div className="hidden print:block bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-600 min-h-[72px]" style={{ fontWeight: 300 }}>
                      {step.note || ''}
                    </div>

                    {/* Right: programme mariés */}
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                      <div className="flex gap-3">
                        <div className="shrink-0 text-right w-12">
                          {step.time && (
                            <p className="text-sm text-[#4a5240]" style={{ fontWeight: 500 }}>{step.time}</p>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2d3228]" style={{ fontWeight: 400, fontSize: '0.95rem' }}>
                            {step.icon && <span className="mr-1">{step.icon}</span>}
                            {step.title}
                          </p>
                          {step.description && (
                            <p className="text-stone-400 mt-1" style={{ fontWeight: 300, fontSize: '0.82rem' }}>
                              {step.description}
                            </p>
                          )}
                          {step.address && (
                            <p className="text-stone-400 mt-1" style={{ fontWeight: 300, fontSize: '0.78rem' }}>
                              📍 {step.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-center text-xs text-stone-300 mt-8 no-print" style={{ fontWeight: 300 }}>
            Vos notes sont sauvegardées automatiquement
          </p>
        </div>
      </div>
    </>
  )
}
