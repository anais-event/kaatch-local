'use client'

import { useState, useTransition } from 'react'
import CopyLinkButton from '../invitations/CopyLinkButton'

type Guest = {
  id: string
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

const RSVP_LABEL: Record<string, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  decline: 'Décliné',
}
const RSVP_COLOR: Record<string, string> = {
  en_attente: 'bg-stone-100 text-stone-400',
  confirme: 'bg-emerald-50 text-emerald-600',
  decline: 'bg-red-50 text-red-400',
}

type Props = {
  guests: Guest[]
  tables: Table[]
  slug: string
  baseUrl: string
  wedding: WeddingPreview
  setRsvp: (formData: FormData) => Promise<void>
  deleteGuest: (formData: FormData) => Promise<void>
  updateGuest: (formData: FormData) => Promise<void>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const PREVIEW_COUNT = 5

export default function GuestList({ guests, tables, slug, baseUrl, wedding, setRsvp, deleteGuest, updateGuest }: Props) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'nom' | 'rsvp' | 'relation'>('nom')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = guests
    .filter(g => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        g.first_name.toLowerCase().includes(q) ||
        (g.last_name ?? '').toLowerCase().includes(q) ||
        (g.nickname ?? '').toLowerCase().includes(q) ||
        (g.relation ?? '').toLowerCase().includes(q) ||
        (g.email ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'rsvp') return a.rsvp_status.localeCompare(b.rsvp_status)
      if (sortBy === 'relation') return (a.relation ?? '').localeCompare(b.relation ?? '')
      return a.first_name.localeCompare(b.first_name)
    })

  const displayed = expanded || search ? filtered : filtered.slice(0, PREVIEW_COUNT)
  const hasMore = !search && filtered.length > PREVIEW_COUNT

  return (
    <div>
      {/* Barre recherche + tri */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition bg-white"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-500 outline-none focus:border-[#4a5240] bg-white"
          style={{ fontWeight: 300 }}
        >
          <option value="nom">Par prénom</option>
          <option value="rsvp">Par RSVP</option>
          <option value="relation">Par lien</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-400 italic text-center py-8 text-sm" style={{ fontWeight: 300 }}>Aucun résultat</p>
      ) : (
        <>
          {/* En-tête colonnes */}
          <div className="grid items-center gap-2 px-3 pb-2 text-[10px] uppercase tracking-widest text-stone-300 hidden sm:grid"
               style={{ gridTemplateColumns: '1fr 100px 110px 80px', fontWeight: 300 }}>
            <span>Invité</span>
            <span>RSVP</span>
            <span>Invitation</span>
            <span>Envoyée</span>
          </div>

          <div className="space-y-1">
            {displayed.map((guest) => {
              const link = guest.invite_token ? `${baseUrl}/i/${guest.invite_token}` : null
              const table = tables.find(t => t.id === guest.table_id)
              const isEditing = editingId === guest.id

              return (
                <div key={guest.id} className="rounded-xl border border-stone-100 bg-white overflow-hidden">
                  {isEditing ? (
                    /* ── Mode édition ── */
                    <form
                      action={async (formData) => {
                        startTransition(async () => {
                          await updateGuest(formData)
                          setEditingId(null)
                        })
                      }}
                      className="p-4 bg-[#f5f0e8]/50 grid grid-cols-2 gap-3"
                    >
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <input name="first_name" defaultValue={guest.first_name} placeholder="Prénom *" required
                        className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white"
                        style={{ fontWeight: 300 }} />
                      <input name="last_name" defaultValue={guest.last_name ?? ''} placeholder="Nom"
                        className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white"
                        style={{ fontWeight: 300 }} />
                      <input name="nickname" defaultValue={guest.nickname ?? ''} placeholder="Surnom"
                        className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white"
                        style={{ fontWeight: 300 }} />
                      <input name="email" type="email" defaultValue={guest.email ?? ''} placeholder="Email"
                        className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white"
                        style={{ fontWeight: 300 }} />
                      <input name="telephone" type="tel" defaultValue={guest.telephone ?? ''} placeholder="Téléphone"
                        className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white"
                        style={{ fontWeight: 300 }} />
                      <select name="relation" defaultValue={guest.relation ?? ''}
                        className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-500"
                        style={{ fontWeight: 300 }}>
                        <option value="">Lien de parenté</option>
                        {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select name="gender" defaultValue={guest.gender ?? ''}
                        className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-[#4a5240] bg-white text-stone-500"
                        style={{ fontWeight: 300 }}>
                        <option value="">Genre…</option>
                        <option value="F">👩 Féminin (Chère)</option>
                        <option value="M">👨 Masculin (Cher)</option>
                      </select>
                      <div className="flex gap-2 col-span-2">
                        <button type="submit" disabled={isPending}
                          className="flex-1 bg-[#4a5240] text-white rounded-xl py-2 text-sm hover:bg-[#2d3228] transition disabled:opacity-50 cursor-pointer"
                          style={{ fontWeight: 300 }}>Enregistrer</button>
                        <button type="button" onClick={() => setEditingId(null)}
                          className="flex-1 border border-stone-200 text-stone-500 rounded-xl py-2 text-sm hover:border-stone-300 transition cursor-pointer"
                          style={{ fontWeight: 300 }}>Annuler</button>
                      </div>
                    </form>
                  ) : (
                    /* ── Mode affichage ── */
                    <div className="grid items-center gap-2 px-3 py-2.5"
                         style={{ gridTemplateColumns: '1fr auto auto auto' }}>

                      {/* Nom + meta */}
                      <div className="min-w-0">
                        <p className="text-stone-700 truncate" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                          {guest.first_name} {guest.last_name ?? ''}
                          {guest.gender === 'F' && <span className="text-stone-300 ml-1 text-xs">👩</span>}
                          {guest.gender === 'M' && <span className="text-stone-300 ml-1 text-xs">👨</span>}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {guest.relation && (
                            <span className="text-[10px] text-stone-400" style={{ fontWeight: 300 }}>{guest.relation}</span>
                          )}
                          {table && (
                            <span className="text-[10px] bg-[#4a5240]/10 text-[#4a5240] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 300 }}>
                              🪑 {table.name}
                            </span>
                          )}
                          {guest.guest_message && (
                            <span className="text-[10px] text-amber-500 italic" style={{ fontWeight: 300 }}>💬 message</span>
                          )}
                        </div>
                      </div>

                      {/* RSVP */}
                      <form action={setRsvp} className="shrink-0">
                        <input type="hidden" name="id" value={guest.id} />
                        <input type="hidden" name="slug" value={slug} />
                        <select
                          name="rsvp_status"
                          defaultValue={guest.rsvp_status}
                          onChange={e => {
                            const form = e.target.closest('form') as HTMLFormElement
                            form.requestSubmit()
                          }}
                          className={`text-[11px] px-2 py-1 rounded-full border-0 cursor-pointer outline-none ${RSVP_COLOR[guest.rsvp_status]}`}
                          style={{ fontWeight: 300 }}>
                          <option value="en_attente">En attente</option>
                          <option value="confirme">Confirmé</option>
                          <option value="decline">Décliné</option>
                        </select>
                      </form>

                      {/* Partager */}
                      <div className="shrink-0">
                        {link ? (
                          <CopyLinkButton
                            url={link}
                            guestName={`${guest.first_name} ${guest.last_name ?? ''}`}
                            gender={guest.gender}
                            slug={slug}
                            wedding={wedding}
                            guestId={guest.id}
                          />
                        ) : (
                          <span className="text-[10px] text-stone-300 italic" style={{ fontWeight: 300 }}>Pas de lien</span>
                        )}
                      </div>

                      {/* Date envoi + actions */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        <div className="text-right">
                          {guest.invite_sent_at ? (
                            <p className="text-[10px] text-emerald-500" style={{ fontWeight: 300 }}>
                              ✓ {formatDate(guest.invite_sent_at)}
                            </p>
                          ) : (
                            <p className="text-[10px] text-stone-300" style={{ fontWeight: 300 }}>—</p>
                          )}
                        </div>
                        <button onClick={() => setEditingId(guest.id)}
                          className="text-stone-300 hover:text-[#4a5240] transition text-xs cursor-pointer p-1" title="Modifier">
                          ✏
                        </button>
                        <form action={deleteGuest} className="inline">
                          <input type="hidden" name="id" value={guest.id} />
                          <input type="hidden" name="slug" value={slug} />
                          <button type="submit"
                            className="text-stone-300 hover:text-red-400 transition text-sm cursor-pointer p-1 leading-none" title="Supprimer">
                            ✕
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bouton développer / réduire */}
          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-stone-200 rounded-xl text-xs text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer bg-white"
              style={{ fontWeight: 300 }}>
              {expanded ? (
                <>Réduire <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg></>
              ) : (
                <>Voir tous les {filtered.length} invités <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}
