'use client'

import { useState, useTransition } from 'react'

type Guest = {
  id: string
  first_name: string
  nickname: string | null
  email: string | null
  telephone: string | null
  relation: string | null
  rsvp_status: 'en_attente' | 'confirme' | 'decline'
}

const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

const RSVP_CONFIG = {
  en_attente: { label: '⏳ En attente', classes: 'bg-gray-100 text-gray-500' },
  confirme:   { label: '✅ Confirmé',   classes: 'bg-green-100 text-green-700' },
  decline:    { label: '❌ Décliné',    classes: 'bg-red-100 text-red-500' },
}

type Props = {
  guests: Guest[]
  slug: string
  setRsvp: (formData: FormData) => Promise<void>
  deleteGuest: (formData: FormData) => Promise<void>
  updateGuest: (formData: FormData) => Promise<void>
}

export default function GuestList({ guests, slug, setRsvp, deleteGuest, updateGuest }: Props) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'nom' | 'relation' | 'rsvp'>('date')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = guests
    .filter(g =>
      g.first_name.toLowerCase().includes(search.toLowerCase()) ||
      g.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      g.relation?.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'nom') return a.first_name.localeCompare(b.first_name)
      if (sortBy === 'relation') return (a.relation ?? '').localeCompare(b.relation ?? '')
      if (sortBy === 'rsvp') return a.rsvp_status.localeCompare(b.rsvp_status)
      return 0
    })

  return (
    <div>
      {/* Barre recherche + tri */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Rechercher un invité..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          <option value="date">Trier par date</option>
          <option value="nom">Trier par prénom</option>
          <option value="relation">Trier par lien</option>
          <option value="rsvp">Trier par RSVP</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 italic text-center py-8">Aucun résultat</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((guest) => (
            <div key={guest.id} className="border border-gray-100 rounded-xl overflow-hidden">
              {editingId === guest.id ? (
                /* Mode édition */
                <form
                  action={async (formData) => {
                    startTransition(async () => {
                      await updateGuest(formData)
                      setEditingId(null)
                    })
                  }}
                  className="p-4 bg-rose-50 grid grid-cols-2 gap-3"
                >
                  <input type="hidden" name="id" value={guest.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={guest.first_name}
                    placeholder="Prénom *"
                    required
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <input
                    type="text"
                    name="nickname"
                    defaultValue={guest.nickname ?? ''}
                    placeholder="Surnom"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <input
                    type="email"
                    name="email"
                    defaultValue={guest.email ?? ''}
                    placeholder="Email"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <input
                    type="tel"
                    name="telephone"
                    defaultValue={guest.telephone ?? ''}
                    placeholder="Téléphone"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <select
                    name="relation"
                    defaultValue={guest.relation ?? ''}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    <option value="">Lien de parenté</option>
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 bg-rose-600 text-white rounded-lg py-1.5 text-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-1.5 text-sm hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                /* Mode affichage */
                <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-gray-800">
                      {guest.first_name}
                      {guest.nickname && <span className="text-gray-400 font-normal text-sm ml-1">({guest.nickname})</span>}
                      {guest.relation && (
                        <span className="ml-2 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{guest.relation}</span>
                      )}
                    </p>
                    {guest.email && <p className="text-sm text-gray-400">✉️ {guest.email}</p>}
                    {guest.telephone && <p className="text-sm text-gray-400">📞 {guest.telephone}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sélecteur RSVP */}
                    <form action={setRsvp}>
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <select
                        name="rsvp_status"
                        defaultValue={guest.rsvp_status}
                        onChange={e => {
                          const form = e.target.closest('form') as HTMLFormElement
                          form.requestSubmit()
                        }}
                        className={`text-sm px-3 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300 ${RSVP_CONFIG[guest.rsvp_status].classes}`}
                      >
                        <option value="en_attente">⏳ En attente</option>
                        <option value="confirme">✅ Confirmé</option>
                        <option value="decline">❌ Décliné</option>
                      </select>
                    </form>

                    {/* Bouton éditer */}
                    <button
                      onClick={() => setEditingId(guest.id)}
                      className="text-gray-300 hover:text-blue-400 transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>

                    {/* Bouton supprimer */}
                    <form action={deleteGuest}>
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
