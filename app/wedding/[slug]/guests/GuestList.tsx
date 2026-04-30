'use client'

import { useState, useTransition } from 'react'
import CopyLinkButton from './CopyLinkButton'
import PublipostagePanel from './PublipostagePanel'

const PARTS_LABELS: Record<string, string> = {
  ceremonie: '💒 Cérémonie',
  vin_honneur: '🥂 Vin d\'honneur',
  reception: '🎉 Réception',
}
const ALL_PARTS = ['ceremonie', 'vin_honneur', 'reception']

type Guest = {
  id: string
  wedding_id: string
  first_name: string
  last_name: string | null
  nickname: string | null
  email: string | null
  telephone: string | null
  relation: string | null
  rsvp_status: 'en_attente' | 'confirme' | 'decline'
  gender: 'M' | 'F' | null
  table_id: string | null
  guest_message: string | null
  invite_token: string | null
  invite_sent_at: string | null
  invited_parts: string[] | null
}

type Table = { id: string; name: string }

type WeddingPreview = {
  name: string
  date: string | null
  location: string | null
  coverImageUrl: string | null
  coupleMessage: string | null
}

const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

type Props = {
  guests: Guest[]
  tables: Table[]
  slug: string
  baseUrl: string
  wedding: WeddingPreview
  setRsvp: (fd: FormData) => Promise<void>
  deleteGuest: (fd: FormData) => Promise<void>
  updateGuest: (fd: FormData) => Promise<void>
  paid?: boolean
  weddingId?: string
}

const RSVP = {
  en_attente: { label: 'En attente', bg: 'bg-stone-100', text: 'text-stone-500' },
  confirme:   { label: 'Confirmé',   bg: 'bg-emerald-50', text: 'text-emerald-600' },
  decline:    { label: 'Décliné',    bg: 'bg-red-50',     text: 'text-red-400' },
}

function Avatar({ name, gender }: { name: string; gender: 'M' | 'F' | null }) {
  const initials = name.slice(0, 1).toUpperCase()
  const color = gender === 'F' ? 'bg-rose-100 text-rose-400' : gender === 'M' ? 'bg-sky-100 text-sky-500' : 'bg-stone-100 text-stone-400'
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}
         style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
      {initials}
    </div>
  )
}

function formatSentDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const PREVIEW_COUNT = 6

export default function GuestList({ guests, tables, slug, baseUrl, wedding, setRsvp, deleteGuest, updateGuest, paid = true, weddingId }: Props) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'nom' | 'rsvp' | 'relation'>('nom')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [isPending, startTransition] = useTransition()
  const resolvedWeddingId = weddingId ?? guests[0]?.wedding_id ?? ''

  const filtered = guests
    .filter(g => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        g.first_name.toLowerCase().includes(q) ||
        (g.last_name ?? '').toLowerCase().includes(q) ||
        (g.email ?? '').toLowerCase().includes(q) ||
        (g.relation ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'rsvp') {
        const order = { confirme: 0, en_attente: 1, decline: 2 }
        return (order[a.rsvp_status] ?? 1) - (order[b.rsvp_status] ?? 1)
      }
      if (sortBy === 'relation') return (a.relation ?? '').localeCompare(b.relation ?? '')
      return a.first_name.localeCompare(b.first_name)
    })

  const displayed = showAll || search ? filtered : filtered.slice(0, PREVIEW_COUNT)
  const hiddenCount = filtered.length - PREVIEW_COUNT

  return (
    <div>
      <PublipostagePanel guests={guests} weddingId={resolvedWeddingId} slug={slug} />

      {/* Barre recherche + tri */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#4a5240] transition bg-white text-stone-700"
            style={{ fontWeight: 300 }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-500 outline-none focus:border-[#4a5240] bg-white cursor-pointer"
          style={{ fontWeight: 300 }}>
          <option value="nom">A → Z</option>
          <option value="rsvp">Par RSVP</option>
          <option value="relation">Par lien</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-stone-400 italic py-8 text-sm" style={{ fontWeight: 300 }}>Aucun invité trouvé</p>
      )}

      <div className="space-y-1.5">
        {displayed.map(guest => {
          const link = guest.invite_token ? `${baseUrl}/i/${guest.invite_token}` : null
          const table = tables.find(t => t.id === guest.table_id)
          const rsvp = RSVP[guest.rsvp_status]
          const isExpanded = expandedId === guest.id
          const isEditing = editingId === guest.id
          const fullName = `${guest.first_name}${guest.last_name ? ` ${guest.last_name}` : ''}`

          return (
            <div key={guest.id} className="rounded-xl border border-stone-100 bg-white shadow-sm">

              {/* ── Ligne principale ── */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-stone-50/50 transition rounded-xl"
                onClick={() => setExpandedId(isExpanded ? null : guest.id)}>

                <Avatar name={guest.first_name} gender={guest.gender} />

                {/* Nom */}
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 truncate" style={{ fontWeight: 400, fontSize: '0.88rem' }}>
                    {fullName}
                    {guest.nickname && <span className="text-stone-400 ml-1.5 text-xs" style={{ fontWeight: 300 }}>({guest.nickname})</span>}
                  </p>
                  {guest.relation && (
                    <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{guest.relation}{table ? ` · 🪑 ${table.name}` : ''}</p>
                  )}
                  {!guest.relation && table && (
                    <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>🪑 {table.name}</p>
                  )}
                </div>

                {/* RSVP — stoppe la propagation pour qu'on puisse changer sans ouvrir */}
                <form action={setRsvp} onClick={e => e.stopPropagation()} className="shrink-0">
                  <input type="hidden" name="id" value={guest.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <select key={guest.rsvp_status} name="rsvp_status" defaultValue={guest.rsvp_status}
                    onChange={e => { const form = e.target.closest('form') as HTMLFormElement; form.requestSubmit() }}
                    className={`text-xs px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none appearance-none ${rsvp.bg} ${rsvp.text}`}
                    style={{ fontWeight: 300 }}>
                    <option value="en_attente">En attente</option>
                    <option value="confirme">Confirmé</option>
                    <option value="decline">Décliné</option>
                  </select>
                </form>

                {/* Partager — stoppe la propagation */}
                <div onClick={e => e.stopPropagation()} className="shrink-0">
                  {link ? (
                    <CopyLinkButton url={link} guestName={fullName} gender={guest.gender}
                      slug={slug} wedding={wedding} guestId={guest.id} paid={paid} weddingId={resolvedWeddingId} />
                  ) : (
                    <span className="text-xs text-stone-300 italic" style={{ fontWeight: 300 }}>Pas de lien</span>
                  )}
                </div>

                {/* Date envoi */}
                {guest.invite_sent_at && (
                  <span className="text-[10px] text-emerald-500 shrink-0 hidden sm:block" style={{ fontWeight: 300 }}>
                    ✓ {formatSentDate(guest.invite_sent_at)}
                  </span>
                )}

                {/* Chevron */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                     className={`w-3.5 h-3.5 text-stone-300 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* ── Panneau détails (expandable) ── */}
              {isExpanded && !isEditing && (
                <div className="px-4 pb-4 pt-1 border-t border-stone-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                    {guest.email && (
                      <a href={`mailto:${guest.email}`}
                         className="flex items-center gap-2 text-xs text-stone-500 hover:text-[#4a5240] transition"
                         style={{ fontWeight: 300 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 text-stone-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        {guest.email}
                      </a>
                    )}
                    {guest.telephone && (
                      <a href={`tel:${guest.telephone}`}
                         className="flex items-center gap-2 text-xs text-stone-500 hover:text-[#4a5240] transition"
                         style={{ fontWeight: 300 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0 text-stone-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {guest.telephone}
                      </a>
                    )}
                    {!guest.email && !guest.telephone && (
                      <p className="text-xs text-stone-300 italic" style={{ fontWeight: 300 }}>Aucune coordonnée renseignée</p>
                    )}
                  </div>

                  {/* Moments d'invitation */}
                  {guest.invited_parts && guest.invited_parts.length < 3 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {guest.invited_parts.map(p => (
                        <span key={p} className="text-xs bg-[#f5f0e8] text-[#4a5240] px-2.5 py-0.5 rounded-full" style={{ fontWeight: 300 }}>
                          {PARTS_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  )}

                  {guest.guest_message && (
                    <div className="mb-3 bg-amber-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-amber-700 italic" style={{ fontWeight: 300 }}>
                        💬 "{guest.guest_message}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => setEditingId(guest.id)}
                      className="text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer flex items-center gap-1"
                      style={{ fontWeight: 300 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      Modifier
                    </button>
                    <span className="text-stone-200">·</span>
                    <form action={deleteGuest} className="inline">
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button type="submit"
                        className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── Formulaire édition ── */}
              {isEditing && (
                <form
                  action={async (fd) => {
                    startTransition(async () => { await updateGuest(fd); setEditingId(null) })
                  }}
                  className="px-4 pb-4 pt-2 border-t border-stone-50 grid grid-cols-2 gap-2">
                  <input type="hidden" name="id" value={guest.id} />
                  <input type="hidden" name="slug" value={slug} />
                  {[
                    { name: 'first_name', placeholder: 'Prénom *', value: guest.first_name, required: true, type: 'text' },
                    { name: 'last_name', placeholder: 'Nom', value: guest.last_name ?? '', required: false, type: 'text' },
                    { name: 'nickname', placeholder: 'Surnom', value: guest.nickname ?? '', required: false, type: 'text' },
                    { name: 'email', placeholder: 'Email', value: guest.email ?? '', required: false, type: 'email' },
                    { name: 'telephone', placeholder: 'Téléphone', value: guest.telephone ?? '', required: false, type: 'tel' },
                  ].map(f => (
                    <input key={f.name} type={f.type} name={f.name} defaultValue={f.value}
                      placeholder={f.placeholder} required={f.required}
                      className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-700"
                      style={{ fontWeight: 300 }} />
                  ))}
                  <select name="relation" defaultValue={guest.relation ?? ''}
                    className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-500"
                    style={{ fontWeight: 300 }}>
                    <option value="">Lien de parenté</option>
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select name="gender" defaultValue={guest.gender ?? ''}
                    className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-500"
                    style={{ fontWeight: 300 }}>
                    <option value="">Genre…</option>
                    <option value="F">👩 Féminin (Chère…)</option>
                    <option value="M">👨 Masculin (Cher…)</option>
                  </select>
                  {/* Moments */}
                  <div className="col-span-2 border border-stone-200 rounded-xl px-3 py-2.5 bg-white">
                    <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Invité à…</p>
                    <div className="flex flex-wrap gap-3">
                      {ALL_PARTS.map(p => (
                        <label key={p} className="flex items-center gap-1.5 text-sm text-stone-600 cursor-pointer" style={{ fontWeight: 300 }}>
                          <input type="checkbox" name="invited_parts" value={p}
                            defaultChecked={(guest.invited_parts ?? ALL_PARTS).includes(p)}
                            className="rounded" />
                          {PARTS_LABELS[p]}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 flex gap-2 pt-1">
                    <button type="submit" disabled={isPending}
                      className="flex-1 bg-[#4a5240] text-white rounded-xl py-2 text-sm hover:bg-[#2d3228] transition disabled:opacity-50 cursor-pointer"
                      style={{ fontWeight: 300 }}>
                      {isPending ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}
                      className="flex-1 border border-stone-200 text-stone-500 rounded-xl py-2 text-sm hover:border-stone-300 transition cursor-pointer"
                      style={{ fontWeight: 300 }}>Annuler</button>
                  </div>
                </form>
              )}
            </div>
          )
        })}
      </div>

      {/* Bouton voir plus / réduire */}
      {!search && hiddenCount > 0 && (
        <button onClick={() => setShowAll(s => !s)}
          className="mt-3 w-full py-2.5 border border-stone-200 rounded-xl text-xs text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer bg-white flex items-center justify-center gap-1.5"
          style={{ fontWeight: 300 }}>
          {showAll ? (
            <>Réduire <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg></>
          ) : (
            <>Voir les {hiddenCount} autres invités <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></>
          )}
        </button>
      )}
    </div>
  )
}
