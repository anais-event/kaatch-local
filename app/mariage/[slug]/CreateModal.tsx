'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { X, Users, LayoutList, Sparkles, Share2 } from 'lucide-react'

export default function CreateModal({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('wedding.create')

  const categories = [
    {
      icon: Users,
      label: t('people'),
      color: 'text-blue-600',
      items: [
        { label: t('addGuest'), href: `/mariage/${slug}/guests` },
        { label: t('messaging'), href: `/mariage/${slug}/messagerie` },
        { label: t('seatingChart'), href: `/mariage/${slug}/tables` },
      ],
    },
    {
      icon: LayoutList,
      label: t('organization'),
      color: 'text-green-600',
      items: [
        { label: t('programme'), href: `/mariage/${slug}/programme` },
        { label: t('checklist'), href: `/mariage/${slug}/checklist` },
        { label: t('budget'), href: `/mariage/${slug}/budget` },
        { label: t('vendors'), href: `/mariage/${slug}/prestataires` },
      ],
    },
    {
      icon: Sparkles,
      label: t('creative'),
      color: 'text-purple-600',
      items: [
        { label: t('creativeStudio'), href: `/mariage/${slug}/studio` },
        { label: t('inspiration'), href: `/mariage/${slug}/inspirations` },
        { label: t('accommodation'), href: `/mariage/${slug}/hebergements` },
      ],
    },
    {
      icon: Share2,
      label: t('sharing'),
      color: 'text-orange-600',
      items: [
        { label: t('shareQR'), href: `/mariage/${slug}/partager` },
        { label: t('photoGallery'), href: `/mariage/${slug}/photos` },
        { label: t('guestbook'), href: `/mariage/${slug}/livre-dor` },
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
        {t('create')}
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
                {t('create')}
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
