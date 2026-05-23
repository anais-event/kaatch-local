'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Users, LayoutList, Sparkles, Share2 } from 'lucide-react'

export default function CreateModal({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)

  const categories = [
    {
      icon: Users,
      label: 'Personnes',
      color: 'text-blue-600',
      items: [
        { label: 'Ajouter un invité', href: `/mariage/${slug}/guests` },
        { label: 'Créer un groupe', href: `/mariage/${slug}/echanger` },
        { label: 'Assigner une table', href: `/mariage/${slug}/tables` },
      ],
    },
    {
      icon: LayoutList,
      label: 'Organisation',
      color: 'text-green-600',
      items: [
        { label: 'Étape du programme', href: `/mariage/${slug}/programme` },
        { label: 'Tâche checklist', href: `/mariage/${slug}/checklist` },
        { label: 'Ligne budget', href: `/mariage/${slug}/budget` },
        { label: 'Ajouter un prestataire', href: `/mariage/${slug}/prestataires` },
      ],
    },
    {
      icon: Sparkles,
      label: 'Créatif',
      color: 'text-purple-600',
      items: [
        { label: 'Moodboard', href: `/mariage/${slug}/imaginer/moodboards` },
        { label: 'Faire-part', href: `/mariage/${slug}/studio/faire-parts` },
        { label: 'Direction artistique', href: `/mariage/${slug}/imaginer/direction` },
      ],
    },
    {
      icon: Share2,
      label: 'Partage',
      color: 'text-orange-600',
      items: [
        { label: 'Code de partage', href: `/mariage/${slug}/partager` },
        { label: 'Envoyer faire-part', href: `/mariage/${slug}/invitations` },
        { label: 'Partager galerie photos', href: `/mariage/${slug}/photos` },
      ],
    },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-[#4a5240] hover:bg-[#2d3228] text-white rounded-3xl py-3.5 transition font-medium flex items-center justify-center gap-2"
      >
        <span>+</span>
        Créer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-stone-100 p-6 flex items-center justify-between">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.5rem' }} className="text-[#4a5240]">
                Créer
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(cat => {
                const Icon = cat.icon
                return (
                  <div key={cat.label}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                      <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }} className="text-stone-800">
                        {cat.label}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {cat.items.map(item => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition text-stone-700"
                          style={{ fontWeight: 400, fontSize: '0.9rem' }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
