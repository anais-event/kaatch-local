'use client'

import { useState, useTransition } from 'react'
import CopyLinkButton from './CopyLinkButton'

const PARTS_LABELS: Record<string, string> = {
  ceremonie: 'Cérémonie',
  vin_honneur: "Vin d'honneur",
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
  guest_type: string | null
  table_id: string | null
  guest_message: string | null
  invite_token: string | null
  invite_sent_at: string | null
  invited_parts: string[] | null
  dietary_notes: string | null
}

type Table = { id: string; name: string }

type WeddingPreview = {
  name: string
  date: string | null
  location: string | null
  coverImageUrl: string | null
  coupleMessage: string | null
  fairePartTheme?: string | null
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
  toggleGuestPart: (fd: FormData) => Promise<void>
  paid?: boolean
  weddingId?: string
}

const RSVP_DOT: Record<RsvpStatus, string> = {
  confirme:   'bg-emerald-400',
  en_attente: 'bg-stone-300',
  decline:    'bg-red-300',
}
const RSVP_NEXT: Record<RsvpStatus, RsvpStatus> = {
  en_attente: 'confirme',
  confirme:   'decline',
  decline:    'en_attente',
}
const RSVP_TITLE: Record<RsvpStatus, string> = {
  confirme:   'Confirmé — cliquer pour passer à Décliné',
  en_attente: 'En attente — cliquer pour Confirmer',
  decline:    'Décliné — cliquer pour remettre En attente',
}

type RsvpFilter = 'tous' | 'confirme' | 'en_attente' | 'decline'

const FILTER_TABS: { key: RsvpFilter; label: string; dot?: string }[] = [
  { key: 'tous',       label: 'Tous' },
  { key: 'confirme',   label: 'Confirmés',  dot: 'bg-emerald-400' },
  { key: 'en_attente', label: 'En attente', dot: 'bg-stone-300' },
  { key: 'decline',    label: 'Déclinés',   dot: 'bg-red-300' },
]

function CheckCircle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer
        ${checked ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-200 hover:border-[#4a5240]/50 bg-white'}`}
    >
      {checked && (
        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
          <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

export default function GuestList({
  guests: initialGuests, tables, slug, baseUrl, wedding,
  setRsvp, deleteGuest, updateGuest, toggleGuestPart, paid = true, weddingId,
}: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>('tous')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const resolvedWeddingId = weddingId ?? guests[0]?.wedding_id ?? ''

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(g => g.id)))
    }
  }

  function cycleRsvp(guestId: string, current: RsvpStatus) {
    const next = RSVP_NEXT[current]
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, rsvp_status: next } : g))
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', guestId)
      fd.set('slug', slug)
      fd.set('rsvp_status', next)
      await setRsvp(fd)
    })
  }

  function handleTogglePart(guestId: string, part: string, currentParts: string[]) {
    const next = currentParts.includes(part)
      ? currentParts.filter(p => p !== part)
      : [...currentParts, part]
    const resolved = next.length > 0 ? next : ALL_PARTS
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, invited_parts: resolved } : g))
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', guestId)
      fd.set('slug', slug)
      fd.set('part', part)
      fd.set('current', currentParts.join(','))
      await toggleGuestPart(fd)
    })
  }

  const filtered = guests
    .filter(g => {
      if (rsvpFilter !== 'tous' && g.rsvp_status !== rsvpFilter) return false
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

  const counts: Record<RsvpFilter, number> = {
    tous:       guests.length,
    confirme:   guests.filter(g => g.rsvp_status === 'confirme').length,
    en_attente: guests.filter(g => g.rsvp_status === 'en_attente').length,
    decline:    guests.filter(g => g.rsvp_status === 'decline').length,
  }

  const allSelected = filtered.length > 0 && selected.size === filtered.length
  const selectedGuests = guests.filter(g => selected.has(g.id))

  async function exportSelection() {
    const XLSX = await import('xlsx')
    const RSVP_LABELS: Record<string, string> = { confirme: 'Confirmé', en_attente: 'En attente', decline: 'Décliné' }
    const rows = selectedGuests.map(g => {
      const table = tables.find(t => t.id === g.table_id)
      return {
        Prénom: g.first_name,
        Nom: g.last_name ?? '',
        Table: table?.name ?? '',
        Type: g.guest_type === 'enfant' ? 'Enfant' : g.guest_type === 'animal' ? 'Animal' : 'Adulte',
        RSVP: RSVP_LABELS[g.rsvp_status] ?? '',
        'Régime / Allergie': g.dietary_notes ?? '',
        Relation: g.relation ?? '',
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [14, 14, 16, 8, 12, 28, 14].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sélection')
    XLSX.writeFile(wb, `selection-invites.xlsx`)
  }

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-1 mb-4 bg-stone-100/60 p-1 rounded-xl w-fit">
        {FILTER_TABS.map(f => (
          <button key={f.key} onClick={() => setRsvpFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
              rsvpFilter === f.key ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'
            }`}
            style={{ fontWeight: rsvpFilter === f.key ? 500 : 300 }}>
            {f.dot && <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />}
            {f.label}
            <span className={`text-[10px] ${rsvpFilter === f.key ? 'text-stone-400' : 'text-stone-300'}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
             className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input type="text" placeholder="Rechercher un invité…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border border-stone-100 rounded-xl text-sm outline-none focus:border-[#4a5240]/40 transition bg-white text-stone-700"
          style={{ fontWeight: 300 }} />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-center text-stone-400 py-10 text-sm" style={{ fontWeight: 300 }}>
          {search ? 'Aucun résultat' : 'Aucun invité dans cette catégorie'}
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">

          {/* En-tête sélection tout */}
          {filtered.length > 1 && (
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-stone-50 bg-stone-50/40">
              <CheckCircle checked={allSelected} onChange={toggleSelectAll} />
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                {allSelected ? 'Tout désélectionner' : `Tout sélectionner (${filtered.length})`}
              </span>
            </div>
          )}

          <div className="divide-y divide-stone-50">
            {filtered.map(guest => {
              const link = guest.invite_token ? `${baseUrl}/i/${guest.invite_token}` : null
              const table = tables.find(t => t.id === guest.table_id)
              const isExpanded = expandedId === guest.id
              const isEditing = editingId === guest.id
              const fullName = `${guest.first_name}${guest.last_name ? ` ${guest.last_name}` : ''}`
              const isSelected = selected.has(guest.id)

              return (
                <div key={guest.id} className={isSelected ? 'bg-[#4a5240]/[0.03]' : ''}>

                  {/* ── Ligne principale ── */}
                  <div className="flex items-center gap-3 px-4 py-3">

                    {/* Checkbox */}
                    <div onClick={e => e.stopPropagation()}>
                      <CheckCircle checked={isSelected} onChange={() => toggleSelect(guest.id)} />
                    </div>

                    {/* Dot RSVP */}
                    <button
                      onClick={() => cycleRsvp(guest.id, guest.rsvp_status)}
                      title={RSVP_TITLE[guest.rsvp_status]}
                      className={`w-2.5 h-2.5 rounded-full shrink-0 cursor-pointer transition-transform hover:scale-125 ${RSVP_DOT[guest.rsvp_status]}`}
                    />

                    {/* Nom + meta — cliquable pour expand */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => { setExpandedId(isExpanded ? null : guest.id); setEditingId(null) }}
                    >
                      <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-800 truncate leading-snug">
                        {fullName}
                        {guest.guest_type === 'enfant' && (
                          <span className="text-stone-300 ml-1.5 text-[10px]" style={{ fontWeight: 300 }}>enfant</span>
                        )}
                        {guest.guest_type === 'animal' && (
                          <span className="text-stone-300 ml-1.5 text-[10px]" style={{ fontWeight: 300 }}>animal</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {guest.relation && (
                          <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">{guest.relation}</span>
                        )}
                        {table && (
                          <span style={{ fontWeight: 300, fontSize: '0.68rem' }}
                                className="text-stone-400 bg-stone-100 px-1.5 py-px rounded-md">
                            {table.name}
                          </span>
                        )}
                        {guest.dietary_notes && (
                          <span title={guest.dietary_notes}
                                className="text-orange-400 text-[10px] leading-none"
                                style={{ fontWeight: 300 }}>
                            ⚠ <span className="text-orange-300">{guest.dietary_notes}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Share */}
                    {link && (
                      <div onClick={e => e.stopPropagation()} className="shrink-0">
                        <CopyLinkButton url={link} guestName={fullName} gender={guest.gender}
                          slug={slug} wedding={wedding} guestId={guest.id} paid={paid} weddingId={resolvedWeddingId}
                          theme={wedding.fairePartTheme} />
                      </div>
                    )}

                    {/* Chevron */}
                    <button
                      onClick={() => { setExpandedId(isExpanded ? null : guest.id); setEditingId(null) }}
                      className="shrink-0 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                           className={`w-4 h-4 text-stone-200 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>

                  {/* ── Panneau expand ── */}
                  {isExpanded && !isEditing && (
                    <div className="px-5 pb-5 pt-3 border-t border-stone-50 bg-stone-50/30">

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

                      {/* Moments */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {ALL_PARTS.map(p => {
                          const parts = guest.invited_parts ?? ALL_PARTS
                          const active = parts.includes(p)
                          return (
                            <button key={p}
                              onClick={() => handleTogglePart(guest.id, p, parts)}
                              title={active ? `Retirer ${PARTS_LABELS[p]}` : `Ajouter ${PARTS_LABELS[p]}`}
                              className={`text-xs px-2.5 py-0.5 rounded-full transition cursor-pointer border ${
                                active
                                  ? 'bg-[#4a5240]/10 text-[#4a5240] border-[#4a5240]/20 hover:bg-red-50 hover:text-red-400 hover:border-red-200'
                                  : 'bg-white text-stone-300 border-stone-200 hover:bg-[#4a5240]/10 hover:text-[#4a5240] hover:border-[#4a5240]/20'
                              }`}
                              style={{ fontWeight: 300 }}>
                              {active ? '' : '+ '}{PARTS_LABELS[p] ?? p}
                            </button>
                          )
                        })}
                      </div>

                      {/* Régime */}
                      {guest.dietary_notes && (
                        <div className="mb-3 bg-orange-50/60 border border-orange-100 rounded-xl px-3 py-2 flex items-start gap-2">
                          <span className="text-orange-400 text-sm leading-none mt-0.5">⚠</span>
                          <p className="text-xs text-orange-700" style={{ fontWeight: 300 }}>{guest.dietary_notes}</p>
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

                      <input name="dietary_notes" type="text"
                        defaultValue={guest.dietary_notes ?? ''}
                        placeholder="Régime alimentaire, allergie, attention particulière… (optionnel)"
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240]/50 bg-white text-stone-700"
                        style={{ fontWeight: 300 }} />

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
        </div>
      )}

      {/* ── Barre d'actions flottante (sélection) ── */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#2d3228] text-white px-5 py-3 rounded-2xl shadow-xl"
             style={{ fontFamily: 'var(--font-lato)' }}>
          <span style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
            {selected.size} invité{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
          </span>
          <span className="w-px h-4 bg-stone-600" />
          <button
            onClick={exportSelection}
            className="flex items-center gap-1.5 text-sm text-white hover:text-stone-300 transition cursor-pointer"
            style={{ fontWeight: 300 }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v1.25A1.25 1.25 0 004.25 19h11.5A1.25 1.25 0 0017 17.75V16.5M10 3.5v9m0 0l-3-3m3 3l3-3" />
            </svg>
            Exporter
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-1 text-stone-500 hover:text-stone-300 transition cursor-pointer"
            title="Annuler la sélection">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
