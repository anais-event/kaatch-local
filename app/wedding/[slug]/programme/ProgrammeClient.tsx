'use client'

import dynamic from 'next/dynamic'
import AddressInput from './AddressInput'
import { useState } from 'react'

const ProgrammeMap = dynamic(() => import('./ProgrammeMap'), { ssr: false })

type Step = {
  id: string
  title: string
  description?: string
  address?: string
  time?: string
  icon?: string
  position: number
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

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-8">
          Programme de la journée
        </h1>

        {/* Timeline */}
        {steps.length > 0 && (
          <div className="mb-8 relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-stone-200" />
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.id} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#4a5240] text-white flex items-center justify-center text-sm font-semibold shadow z-10 relative">
                    {i + 1}
                  </div>

                  <div className="flex-1 bg-white/80 rounded-2xl p-4 shadow-sm">
                    {editingId === step.id ? (
                      /* Mode édition */
                      <form
                        action={async (formData) => {
                          await updateStep(formData)
                          setEditingId(null)
                        }}
                        className="space-y-2"
                      >
                        <input type="hidden" name="id" value={step.id} />
                        <input type="hidden" name="slug" value={slug} />

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            name="title"
                            defaultValue={step.title}
                            placeholder="Titre *"
                            required
                            className="border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
                          />
                          <input
                            type="text"
                            name="time"
                            defaultValue={step.time || ''}
                            placeholder="Heure (ex: 14h30)"
                            className="border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
                          />
                        </div>

                        <input
                          type="text"
                          name="address"
                          defaultValue={step.address || ''}
                          placeholder="Adresse"
                          className="w-full border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
                        />

                        <textarea
                          name="description"
                          defaultValue={step.description || ''}
                          placeholder="Description (optionnelle)"
                          rows={2}
                          className="w-full border border-stone-200 rounded-xl px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 resize-none"
                          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
                        />

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-[#4a5240] text-white py-2 rounded-full hover:bg-[#2d3228] transition"
                            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                          >
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex-1 border border-stone-200 text-stone-500 py-2 rounded-full hover:bg-stone-50 transition"
                            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Mode affichage */
                      <div className="flex justify-between items-start">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setEditingId(step.id)}
                        >
                          {step.time && (
                            <p className="text-xs text-[#4a5240] mb-1"
                               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.1em' }}>
                              {step.time}
                            </p>
                          )}
                          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                              className="text-stone-800">{step.title}</h3>
                          {step.description && (
                            <p className="text-sm text-stone-500 mt-1"
                               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                              {step.description}
                            </p>
                          )}
                          {step.address && (
                            <p className="text-xs text-stone-400 mt-1"
                               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                              📍 {step.address}
                            </p>
                          )}
                          <p className="text-xs text-stone-300 mt-2"
                             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                            Cliquer pour modifier
                          </p>
                        </div>
                        <form action={deleteStep}>
                          <input type="hidden" name="id" value={step.id} />
                          <input type="hidden" name="slug" value={slug} />
                          <button type="submit" className="text-stone-300 hover:text-red-400 transition text-lg ml-2">
                            ×
                          </button>
                        </form>
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
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '1.6rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-4">
            Ajouter un moment
          </h2>
          <form action={addStep} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />

            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="title" placeholder="Titre *" required
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <input type="text" name="time" placeholder="Heure (ex: 14h30)"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            </div>

            <AddressInput />

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
