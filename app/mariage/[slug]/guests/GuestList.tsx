'use client'

import { useState, useTransition } from 'react'
import CopyLinkButton from './CopyLinkButton'

const PARTS_LABELS: Record<string, string> = {
  ceremonie: 'Cérémonie',
  vin_honneur: 'Vin d\'honneur',
  reception: 'Réception',
}
const ALL_PARTS = ['ceremonie', 'vin_honneur', 'reception']
const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

type RsvpStatus = 'en_attente' | 'confirme' | 'decline'

type Guest = {
  id: string
  wedding_id: string
  first_name: string
  last_name: string | null
  nickname: string | null
  email: string | null
  telephone: string | null
  relation: string | null
  rsvp_status: RsvpStatus
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

const RSVP_CONFIG: Record<RsvpStatus, { label: string; next: RsvpStatus; bg: string; text: string; dot: string }> = {
  en_attente: { label: 'En attente', next: 'confirme',   bg: 'bg-stone-100',   text: 'text-stone-500',   dot: 'bg-stone-300' },
  confirme:   { label: 'Confirmé',   next: 'decline',    bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-400' },
  decline:    { label: 'Décliné',    next: 'en_attente', bg: 'bg-red-50',      text: 'text-red-400',     dot: 'bg-red-300' },
}

type FilterTab = 'tous' | RsvpStatus
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'tous',       label: 'Tous' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'confirme',   label: 'Confirmés' },
  { key: 'decline',    label: 'Déclinés' },
]

function Avatar({ name, gender }: { name: string; gender: 'M' | 'F' | null }) {
  const initials = name.slice(0, 1).toUpperCase()
  const color = gender === 'F'
    ? 'bg-rose-100 text-rose-400'
    : gender === 'M'
      ? 'bg-sky-100 text-sky-500'
      : 'bg-stone-100 text-stone-400'
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}
         style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '0.95rem' }}>
      {initials}
    </div>
  )
}

export default function GuestList({ guests: initialGuests, tables, slug, baseUrl, wedding, setRsvp, deleteGuest, updateGuest, paid = true, weddingId }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('tous')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const resolvedWeddingId = weddingId ?? guests[0]?.wedding_id ?? ''

  // Cycling RSVP — optimistic, no page reload
  function cycleRsvp(guestId: string, current: RsvpStatus) {
    const next = RSVP_CONFIG[current].next
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, rsvp_status: next } : g))
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', guestId)
      fd.set('slug', slug)
      fd.set('rsvp_status', next)
      await setRsvp(fd)
    })
  }

  const filtered = guests
    .filter(g => {
      if (filter !== 'tous' && g.rsvp_status !== filter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        g.first_name.toLowerCase().includes(q) ||
        (g.last_name ?? '').toLowerCase().includes(q) ||
        (g.relation ?? '').toLowerCase().includes(q) ||
        (g.email ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => a.first_name.localeCompare(b.first_name))

  const counts: Record<FilterTab, number> = {
    tous:       guests.length,
    en_attente: guests.filter(g => g.rsvp_status === 'en_attente').length,
    confirme:   guests.filter(g => g.rsvp_status === 'confirme').length,
    decline:    guests.filter(g => g.rsvp_status === 'decline').length,
  }

  return (
    <div>
      {/* Filtres + recherche */}
      <div className="space-y-3 mb-4">
        {/* Tabs filtre */}
        <div className="flex gap-1 bg-white border border-stone-100 rounded-xl p-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition cursor-pointer"
              style={{
                fontWeight: 300,
                fontSize: '0.72rem',
                background: filter === tab.key ? '#f5f0e8' : 'transparent',
                color: filter === tab.key ? '#2d3228' : '#a8a29e',
              }}>
              {tab.label}
              {counts[tab.key] > 0 && (
                <span style={{
                  fontSize: '0.65rem',
                  background: filter === tab.key ? '#4a5240' : '#e7e5e4',
                  color: filter === tab.key ? 'white' : '#a8a29e',
                  borderRadius: '999px',
                  padding: '0 5px',
                  lineHeight: '1.5',
                }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Rechercher un invité…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-stone-100 rounded-xl text-sm outline-none focus:border-[#4a5240]/40 transition bg-white text-stone-700"
            style={{ fontWeight: 300 }} />
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-center text-stone-400 py-10 text-sm" style={{ fontWeight: 300 }}>
          {search ? 'Aucun résultat' : 'Aucun invité dans cette catégorie'}
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(guest => {
            const rsvp = RSVP_CONFIG[guest.rsvp_status]
            const link = guest.invite_token ? `${baseUrl}/i/${guest.invite_token}` : null
            const table = tables.find(t => t.id === guest.table_id)
            const isExpanded = expandedId === guest.id
            const isEditing = editingId === guest.id
            const fullName = `${guest.first_name}${guest.last_name ? ` ${guest.last_name}` : ''}`
            const isInvitedAll = !guest.invited_parts || guest.invited_parts.length === 3

            return (
              <div key={guest.id} className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">

                {/* ── Ligne principale ── */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50/40 transition"
                  onClick={() => { setExpandedId(isExpanded ? null : guest.id); setEditingId(null) }}>

                  <Avatar name={guest.first_name} gender={guest.gender} />

                  {/* Nom + meta */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-800 truncate leading-snug">
                      {fullName}
                      {guest.nickname && (
                        <span className="text-stone-400 ml-1.5" style={{ fontSize: '0.78rem' }}>« {guest.nickname} »</span>
                      )}
                    </p>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 truncate">
                      {[guest.relation, table ? `🪑 ${table.name}` : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>

                  {/* RSVP pill — cycling, stop propagation */}
                  <button
                    onClick={e => { e.stopPropagation(); cycleRsvp(guest.id, guest.rsvp_status) }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer shrink-0 ${rsvp.bg} ${rsvp.text}`}
                    title="Cliquer pour changer le statut"
                    style={{ fontWeight: 300, fontSize: '0.7rem' }}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rsvp.dot}`} />
                    {rsvp.label}
                  </button>

                  {/* Share icon — compact, stop propagation */}
                  {link && (
                    <div onClick={e => e.stopPropagation()} className="shrink-0">
                      <CopyLinkButton url={link} guestName={fullName} gender={guest.gender}
                        slug={slug} wedding={wedding} guestId={guest.id} paid={paid} weddingId={resolvedWeddingId} />
                    </div>
                  )}

                  {/* Chevron */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                       className={`w-3.5 h-3.5 text-stone-300 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* ── Panneau expand ── */}
                {isExpanded && !isEditing && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-50/80">

                    {/* Contact */}
                    {(guest.email || guest.telephone) && (
                      <div className="flex flex-wrap gap-3 mb-3">
                        {guest.email && (
                          <a href={`mailto:${guest.email}`}
                             className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#4a5240] transition"
                             style={{ fontWeight: 300 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-stone-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            {guest.email}
                          </a>
                        )}
                        {guest.telephone && (
                          <a href={`tel:${guest.telephone}`}
                             className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#4a5240] transition"
                             style={{ fontWeight: 300 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-stone-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            {guest.telephone}
                          </a>
                        )}
                        {guest.invite_sent_at && (
                          <span className="flex items-center gap-1 text-xs text-emerald-500" style={{ fontWeight: 300 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Invitation envoyée
                          </span>
                        )}
                      </div>
                    )}

                    {/* Moments — seulement si pas tous invités */}
                    {!isInvitedAll && guest.invited_parts && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {guest.invited_parts.map(p => (
                          <span key={p}
                            className="text-xs bg-[#f5f0e8] text-[#4a5240] px-2.5 py-0.5 rounded-full"
                            style={{ fontWeight: 300 }}>
                            {PARTS_LABELS[p] ?? p}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message invité */}
                    {guest.guest_message && (
                      <div className="mb-3 bg-amber-50/60 rounded-xl px-3 py-2">
                        <p className="text-xs text-amber-700 italic" style={{ fontWeight: 300 }}>
                          "{guest.guest_message}"
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-0.5">
                      <button onClick={() => setEditingId(guest.id)}
                        className="text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer flex items-center gap-1.5"
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
                    className="px-4 pb-4 pt-3 border-t border-stone-50 space-y-2">
                    <input type="hidden" name="id" value={guest.id} />
                    <input type="hidden" name="slug" value={slug} />

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'first_name', placeholder: 'Prénom *', value: guest.first_name, required: true, type: 'text' },
                        { name: 'last_name',  placeholder: 'Nom',      value: guest.last_name ?? '',  required: false, type: 'text' },
                        { name: 'nickname',   placeholder: 'Surnom',   value: guest.nickname ?? '',   required: false, type: 'text' },
                        { name: 'email',      placeholder: 'Email',    value: guest.email ?? '',      required: false, type: 'email' },
                        { name: 'telephone',  placeholder: 'Téléphone',value: guest.telephone ?? '',  required: false, type: 'tel' },
                      ].map(f => (
                        <input key={f.name} type={f.type} name={f.name} defaultValue={f.value}
                          placeholder={f.placeholder} required={f.required}
                          className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240]/50 bg-white text-stone-700"
                          style={{ fontWeight: 300 }} />
                      ))}
                      <select name="relation" defaultValue={guest.relation ?? ''}
                        className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240]/50 bg-white text-stone-500"
                        style={{ fontWeight: 300 }}>
                        <option value="">Lien de parenté</option>
                        {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select name="gender" defaultValue={guest.gender ?? ''}
                        className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240]/50 bg-white text-stone-500"
                        style={{ fontWeight: 300 }}>
                        <option value="">Genre…</option>
                        <option value="F">Féminin</option>
                        <option value="M">Masculin</option>
                      </select>
                    </div>

                    {/* Moments */}
                    <div className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white">
                      <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Invité à…</p>
                      <div className="flex flex-wrap gap-3">
                        {ALL_PARTS.map(p => (
                          <label key={p} className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer" style={{ fontWeight: 300 }}>
                            <input type="checkbox" name="invited_parts" value={p}
                              defaultChecked={(guest.invited_parts ?? ALL_PARTS).includes(p)}
                              className="rounded accent-[#4a5240]" />
                            {PARTS_LABELS[p]}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={isPending}
                        className="flex-1 bg-[#4a5240] text-white rounded-xl py-2 text-sm hover:bg-[#2d3228] transition disabled:opacity-50 cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        {isPending ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}
                        className="px-4 border border-stone-200 text-stone-400 rounded-xl py-2 text-sm hover:border-stone-300 transition cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
