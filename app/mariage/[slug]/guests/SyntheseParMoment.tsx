'use client'

import { useState } from 'react'

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  rsvp_status: string
  invited_parts: string[] | null
  guest_type: string | null
}

const ALL_PARTS = ['ceremonie', 'vin_honneur', 'reception']

const RSVP_DOT: Record<string, string> = {
  confirme:   'bg-emerald-400',
  en_attente: 'bg-stone-300',
  decline:    'bg-red-300',
}
const RSVP_LABEL: Record<string, string> = {
  confirme:   'Confirmé',
  en_attente: 'En attente',
  decline:    'Décliné',
}

export default function SyntheseParMoment({
  guests,
  partsLabels,
}: {
  guests: Guest[]
  partsLabels: Record<string, string>
}) {
  const [openPart, setOpenPart] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
         className="text-stone-400 uppercase mb-4">
        Par moment
      </p>
      <div className="space-y-2">
        {ALL_PARTS.map(part => {
          const forPart = guests.filter(g => {
            const parts = g.invited_parts
            return !parts || parts.includes(part)
          })
          const totalForPart = forPart.length
          const confirmedForPart = forPart.filter(g => g.rsvp_status === 'confirme').length
          const isOpen = openPart === part

          return (
            <div key={part}>
              <button
                onClick={() => setOpenPart(isOpen ? null : part)}
                className="w-full flex items-center gap-3 group cursor-pointer"
              >
                <span style={{ fontWeight: 300, fontSize: '0.78rem', width: '8rem', flexShrink: 0, textAlign: 'left' }}
                      className="text-stone-500 group-hover:text-[#4a5240] transition">
                  {partsLabels[part]}
                </span>
                <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4a5240] rounded-full transition-all"
                       style={{ width: `${totalForPart > 0 ? (confirmedForPart / totalForPart) * 100 : 0}%` }} />
                </div>
                <span style={{ fontWeight: 300, fontSize: '0.75rem' }}
                      className="text-stone-400 tabular-nums shrink-0 text-right"
                      title={`${confirmedForPart} confirmés sur ${totalForPart} invités`}>
                  <span className="text-stone-600">{confirmedForPart}</span>
                  <span className="text-stone-300">/{totalForPart}</span>
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                     className={`w-3 h-3 text-stone-300 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="mt-2 ml-[8.5rem] space-y-0.5">
                  {forPart.length === 0 ? (
                    <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 py-1">
                      Aucun invité
                    </p>
                  ) : (
                    forPart.map(g => {
                      const name = [g.first_name, g.last_name].filter(Boolean).join(' ')
                      const rsvp = g.rsvp_status as string
                      return (
                        <div key={g.id} className="flex items-center gap-2 py-1 border-b border-stone-50 last:border-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${RSVP_DOT[rsvp] ?? 'bg-stone-200'}`} />
                          <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-700 flex-1 truncate">
                            {name}
                            {g.guest_type === 'enfant' && <span className="text-stone-300 ml-1 text-[10px]">enfant</span>}
                          </span>
                          <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400 shrink-0">
                            {RSVP_LABEL[rsvp] ?? rsvp}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
