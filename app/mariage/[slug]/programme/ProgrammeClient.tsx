'use client'

import dynamic from 'next/dynamic'
import { useState, useRef } from 'react'

const ProgrammeMap = dynamic(() => import('./ProgrammeMap'), { ssr: false })

type Step = {
  id: string
  title: string
  description?: string
  address?: string
  time?: string
  icon?: string
  position: number
  visible_to_guests: boolean
}

type Props = {
  slug: string
  steps: Step[]
  icons: string[]
  addStep: (formData: FormData) => Promise<void>
  deleteStep: (formData: FormData) => Promise<void>
  updateStep: (formData: FormData) => Promise<void>
}

export default function ProgrammeClient({ slug, steps, icons, addStep, deleteStep, updateStep }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addFormKey, setAddFormKey] = useState(0)

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
             style={{ fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Programme</p>
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
              className="text-[#2d3228] leading-none">
            Programme de la journée
          </h1>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div />
          <a
            href={`/mariage/${slug}/programme/recap`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-stone-200 bg-white text-stone-600 px-3 py-1.5 rounded-xl text-xs hover:border-[#4a5240] hover:text-[#4a5240] transition shrink-0"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Imprimer / PDF
          </a>
        </div>

        {/* Timeline */}
        {steps.length > 0 && (
          <div className="mb-8 relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-stone-200" />
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={step.id} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#4a5240] text-white flex items-center justify-center text-sm font-semibold shadow z-10 relative">
                    {i + 1}
                  </div>

                  <div className={`flex-1 bg-white/80 rounded-2xl p-4 shadow-sm transition ${!step.visible_to_guests ? 'opacity-60' : ''}`}>
                    {editingId === step.id ? (
                      <EditForm
                        step={step}
                        slug={slug}
                        onSave={async (fd) => { await updateStep(fd); setEditingId(null) }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 cursor-pointer" onClick={() => setEditingId(step.id)}>
                            {step.time && (
                              <p className="text-xs text-[#4a5240] mb-1"
                                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.1em' }}>
                                {step.time}
                              </p>
                            )}
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem' }}
                                className="text-stone-800">{step.title}</h3>
                            {step.description && (
                              <p className="text-sm text-stone-500 mt-1"
                                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                                {step.description}
                              </p>
                            )}
                            {step.address && (
                              <p className="text-xs text-stone-400 mt-1.5 flex items-center gap-1"
                                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                                <span>📍</span> {step.address}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Toggle visible */}
                            <VisibleToggle stepId={step.id} slug={slug} visible={step.visible_to_guests} updateStep={updateStep} step={step} />
                            {/* Delete */}
                            <form action={deleteStep}>
                              <input type="hidden" name="id" value={step.id} />
                              <input type="hidden" name="slug" value={slug} />
                              <button type="submit" className="text-stone-300 hover:text-red-400 transition text-lg cursor-pointer">
                                ×
                              </button>
                            </form>
                          </div>
                        </div>
                        {!step.visible_to_guests && (
                          <p className="text-xs text-stone-300 mt-2 italic" style={{ fontWeight: 300 }}>
                            Non visible par les invités
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire ajout */}
        <div className="bg-white/70 rounded-3xl p-6 shadow-sm mb-6">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.6rem' }}
              className="text-[#2d3228] mb-4">
            Ajouter un moment
          </h2>
          <form
            key={addFormKey}
            action={async (fd) => { await addStep(fd); setAddFormKey(k => k + 1) }}
            className="space-y-3"
          >
            <input type="hidden" name="slug" value={slug} />

            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="title" placeholder="Titre *" required
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <input type="text" name="time" placeholder="Heure (ex: 14h30)"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            </div>

            <input type="text" name="address" placeholder="Lieu / adresse (optionnel)"
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />

            <textarea name="description" placeholder="Description (optionnelle)" rows={2}
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 resize-none"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />

            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              + Ajouter ce moment
            </button>
          </form>
        </div>

        {/* Carte */}
        {steps.length > 0 && (
          <div className="rounded-3xl overflow-hidden shadow-sm">
            <ProgrammeMap steps={steps} />
          </div>
        )}

      </div>
    </div>
  )
}

// ---- Sub-components ----

function VisibleToggle({ stepId, slug, visible, updateStep, step }: {
  stepId: string
  slug: string
  visible: boolean
  updateStep: (fd: FormData) => Promise<void>
  step: Step
}) {
  const [optimistic, setOptimistic] = useState(visible)

  async function toggle() {
    setOptimistic(v => !v)
    const fd = new FormData()
    fd.set('id', stepId)
    fd.set('slug', slug)
    fd.set('title', step.title)
    fd.set('description', step.description ?? '')
    fd.set('address', step.address ?? '')
    fd.set('time', step.time ?? '')
    fd.set('icon', step.icon ?? '✨')
    fd.set('visible_to_guests', optimistic ? 'false' : 'true')
    await updateStep(fd)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={optimistic ? 'Visible par les invités – cliquer pour masquer' : 'Masqué – cliquer pour rendre visible'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer shrink-0 ${optimistic ? 'bg-[#4a5240]' : 'bg-stone-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${optimistic ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

function EditForm({ step, slug, onSave, onCancel }: {
  step: Step
  slug: string
  onSave: (fd: FormData) => Promise<void>
  onCancel: () => void
}) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      action={async (fd) => { await onSave(fd) }}
      className="space-y-2"
    >
      <input type="hidden" name="id" value={step.id} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="visible_to_guests" value={step.visible_to_guests ? 'true' : 'false'} />

      <div className="grid grid-cols-2 gap-2">
        <input type="text" name="title" defaultValue={step.title} placeholder="Titre *" required
          className="border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
        <input type="text" name="time" defaultValue={step.time || ''} placeholder="Heure (ex: 14h30)"
          className="border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
      </div>

      <input type="text" name="address" defaultValue={step.address || ''} placeholder="Lieu / adresse (optionnel)"
        className="w-full border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />

      <textarea name="description" defaultValue={step.description || ''} placeholder="Description (optionnelle)" rows={2}
        className="w-full border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 resize-none"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />

      <div className="flex gap-2">
        <button type="submit"
          className="flex-1 bg-[#4a5240] text-white py-2 rounded-full hover:bg-[#2d3228] transition"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}>
          Enregistrer
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 border border-stone-200 text-stone-500 py-2 rounded-full hover:bg-stone-50 transition"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}>
          Annuler
        </button>
      </div>
    </form>
  )
}
