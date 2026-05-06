'use client'

import { useState } from 'react'
import CopyLinkButton from './CopyLinkButton'

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  nickname: string | null
  rsvp_status: 'en_attente' | 'confirme' | 'decline'
  gender: 'M' | 'F' | null
  invite_token: string | null
  invite_sent_at: string | null
  email: string | null
  telephone: string | null
}

type WeddingPreview = {
  name: string
  date: string | null
  location: string | null
  coverImageUrl: string | null
  coupleMessage: string | null
}

type Props = {
  guests: Guest[]
  slug: string
  baseUrl: string
  wedding: WeddingPreview
  weddingId: string
  paid: boolean
}

const RSVP_CONFIG = {
  en_attente: { label: 'En attente', bg: 'bg-stone-100', text: 'text-stone-500' },
  confirme:   { label: 'Confirmé',   bg: 'bg-emerald-50', text: 'text-emerald-600' },
  decline:    { label: 'Décliné',    bg: 'bg-red-50',    text: 'text-red-400' },
}

export default function InvitationsTab({ guests, slug, baseUrl, wedding, weddingId, paid }: Props) {
  const [filter, setFilter] = useState<'all' | 'notsent' | 'sent'>('all')

  const withToken = guests.filter(g => g.invite_token)
  const sentCount = guests.filter(g => g.invite_sent_at).length
  const noTokenCount = guests.filter(g => !g.invite_token).length

  const filtered = withToken.filter(g => {
    if (filter === 'sent') return !!g.invite_sent_at
    if (filter === 'notsent') return !g.invite_sent_at
    return true
  })

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Envoyés', value: sentCount, color: 'text-emerald-600' },
          { label: 'À envoyer', value: withToken.length - sentCount, color: 'text-amber-500' },
          { label: 'Sans lien', value: noTokenCount, color: 'text-stone-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-100 p-3 text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem', lineHeight: 1 }}
               className={s.color}>
              {s.value}
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.1em' }}
               className="text-stone-400 uppercase mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {([
          { key: 'all',     label: `Tous (${withToken.length})` },
          { key: 'notsent', label: `À envoyer (${withToken.length - sentCount})` },
          { key: 'sent',    label: `Envoyés (${sentCount})` },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs cursor-pointer transition ${
              filter === f.key
                ? 'bg-[#4a5240] text-white'
                : 'bg-white border border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240]'
            }`}
            style={{ fontWeight: 300 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Per-guest list */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-300">
              {filter === 'sent'
                ? 'Aucun faire-part envoyé pour le moment'
                : filter === 'notsent'
                  ? 'Tous les faire-parts ont été envoyés'
                  : 'Aucun invité avec un lien personnel'
              }
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-50">
            {filtered.map(g => {
              const guestName = [g.first_name, g.last_name].filter(Boolean).join(' ')
              const url = `${baseUrl}/i/${g.invite_token}`
              const rsvp = RSVP_CONFIG[g.rsvp_status]

              return (
                <li key={g.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#f5f0e8] flex items-center justify-center shrink-0">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '0.95rem' }}
                          className="text-[#4a5240]">
                      {g.first_name[0]?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-700 truncate">
                      {guestName}
                    </p>
                    {g.invite_sent_at ? (
                      <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-emerald-500 mt-0.5">
                        Envoyé {new Date(g.invite_sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    ) : (
                      <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 mt-0.5">
                        Pas encore envoyé
                      </p>
                    )}
                  </div>

                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${rsvp.bg} ${rsvp.text}`}
                        style={{ fontWeight: 300, fontSize: '0.65rem' }}>
                    {rsvp.label}
                  </span>

                  <CopyLinkButton
                    url={url}
                    guestName={guestName}
                    gender={g.gender}
                    slug={slug}
                    wedding={wedding}
                    guestId={g.id}
                    paid={paid}
                    weddingId={weddingId}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
