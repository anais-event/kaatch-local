import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'anais@kaatch.fr'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function deleteWedding(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const weddingId = formData.get('wedding_id') as string
  const admin = adminClient()

  // Fetch junction IDs first, then delete child rows
  const [{ data: tableIds }, { data: photoIds }] = await Promise.all([
    admin.from('tables').select('id').eq('wedding_id', weddingId),
    admin.from('photos').select('id').eq('wedding_id', weddingId),
  ])

  const tIds = (tableIds ?? []).map(t => t.id)
  const pIds = (photoIds ?? []).map(p => p.id)

  if (tIds.length > 0) await admin.from('table_guests').delete().in('table_id', tIds)
  if (pIds.length > 0) {
    await Promise.all([
      admin.from('photo_likes').delete().in('photo_id', pIds),
      admin.from('photo_comments').delete().in('photo_id', pIds),
    ])
  }

  await Promise.all([
    admin.from('guests').delete().eq('wedding_id', weddingId),
    admin.from('photos').delete().eq('wedding_id', weddingId),
    admin.from('messages').delete().eq('wedding_id', weddingId),
    admin.from('guestbook_entries').delete().eq('wedding_id', weddingId),
    admin.from('playlist_songs').delete().eq('wedding_id', weddingId),
    admin.from('program_steps').delete().eq('wedding_id', weddingId),
    admin.from('tables').delete().eq('wedding_id', weddingId),
  ])
  await admin.from('weddings').delete().eq('id', weddingId)

  redirect('/admin')
}

export default async function AdminWeddingDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) redirect('/auth')

  const admin = adminClient()

  const { data: wedding } = await admin
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single()

  if (!wedding) redirect('/admin')

  const [
    { data: guests },
    { data: photos },
    { data: messages },
    { data: guestbook },
    { data: songs },
    { data: steps },
    { data: tables },
  ] = await Promise.all([
    admin.from('guests').select('id, first_name, last_name, email, phone, relation, guest_type, rsvp_status, invite_sent_at, invite_token, created_at').eq('wedding_id', id).order('created_at', { ascending: false }),
    admin.from('photos').select('id, url, uploaded_by_name, moment_tag, created_at').eq('wedding_id', id).order('created_at', { ascending: false }).limit(50),
    admin.from('messages').select('id, group_id, author_name, content, created_at').eq('wedding_id', id).order('created_at', { ascending: false }).limit(30),
    admin.from('guestbook_entries').select('id, author_name, content, created_at').eq('wedding_id', id).order('created_at', { ascending: false }),
    admin.from('playlist_songs').select('id, title, artist, moment, suggested_by, created_at').eq('wedding_id', id).order('created_at', { ascending: false }),
    admin.from('program_steps').select('id, title, description, time, location, position').eq('wedding_id', id).order('position', { ascending: true }),
    admin.from('tables').select('id, name, capacity').eq('wedding_id', id).order('name', { ascending: true }),
  ])

  let creatorEmail = '—'
  if (wedding.couple_id) {
    try {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const found = usersData?.users?.find(u => u.id === wedding.couple_id)
      if (found) creatorEmail = found.email ?? '—'
    } catch {}
  }

  const guestList = guests ?? []
  const rsvpOui = guestList.filter(g => g.rsvp_status === 'confirmed').length
  const rsvpNon = guestList.filter(g => g.rsvp_status === 'declined').length
  const rsvpAttente = guestList.length - rsvpOui - rsvpNon
  const inviteSent = guestList.filter(g => g.invite_sent_at).length

  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const createdStr = wedding.created_at
    ? new Date(wedding.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  const LATO = 'var(--font-lato)'
  const DISPLAY = 'var(--font-display)'

  function cleanName(name: string | null | undefined): string {
    if (!name) return ''
    return name.split(' ').filter(p => p && p !== 'null').join(' ')
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>

      {/* Header */}
      <div className="bg-[#2d3228] px-6 py-5 flex items-center justify-between">
        <div>
          <a href="/admin" className="text-white/50 text-xs hover:text-white transition" style={{ fontWeight: 300 }}>
            ← Retour admin
          </a>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.6rem' }}
              className="text-white mt-1">
            {wedding.name || '—'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs font-mono">{wedding.slug}</span>
          <form action={deleteWedding}
                onSubmit={(e) => { if (!window.confirm(`Supprimer définitivement "${wedding.name}" et toutes ses données ?`)) e.preventDefault() }}>
            <input type="hidden" name="wedding_id" value={wedding.id} />
            <button type="submit"
              className="text-xs border border-red-400/40 text-red-300 px-3 py-1.5 rounded-lg hover:border-red-400 hover:text-red-200 transition cursor-pointer"
              style={{ fontWeight: 400 }}>
              🗑 Supprimer le mariage
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Infos générales */}
        <Section title="Informations générales">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Info label="Date" value={dateStr} />
            <Info label="Lieu" value={wedding.location || '—'} />
            <Info label="Plan" value={wedding.plan ?? 'gratuit'} />
            <Info label="Créateur" value={creatorEmail} />
            <Info label="Co-owner" value={wedding.co_owner_email || '—'} />
            <Info label="Créé le" value={createdStr} />
            <Info label="Code partage" value={wedding.share_code || '—'} />
            <Info label="Slug" value={`/${wedding.slug}`} />
          </div>
          {wedding.couple_message && (
            <div className="mt-4 p-4 bg-stone-50 rounded-xl">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontWeight: 400 }}>Message du couple</p>
              <p className="text-sm text-stone-600 italic" style={{ fontFamily: DISPLAY }}>{wedding.couple_message}</p>
            </div>
          )}
        </Section>

        {/* Stats résumé */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: 'Invités', value: guestList.length },
            { label: 'RSVP ✓', value: rsvpOui },
            { label: 'RSVP ✗', value: rsvpNon },
            { label: 'Photos', value: (photos ?? []).length },
            { label: 'Messages', value: (messages ?? []).length },
            { label: 'Livre d\'or', value: (guestbook ?? []).length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-stone-100 p-3 text-center shadow-sm">
              <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.5rem', lineHeight: 1 }}
                 className="text-[#2d3228]">{s.value}</p>
              <p className="text-stone-400 text-[10px] mt-1 uppercase tracking-wide" style={{ fontWeight: 400 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Liste invités */}
        <Section title={`Invités (${guestList.length})`}>
          {guestList.length === 0 ? (
            <p className="text-stone-400 text-sm">Aucun invité.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    <th className="py-2 px-2" style={{ fontWeight: 500 }}>Nom</th>
                    <th className="py-2 px-2" style={{ fontWeight: 500 }}>Email</th>
                    <th className="py-2 px-2" style={{ fontWeight: 500 }}>Tél</th>
                    <th className="py-2 px-2" style={{ fontWeight: 500 }}>Type</th>
                    <th className="py-2 px-2" style={{ fontWeight: 500 }}>RSVP</th>
                    <th className="py-2 px-2" style={{ fontWeight: 500 }}>Invitation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {guestList.map(g => (
                    <tr key={g.id} className="hover:bg-stone-50/50">
                      <td className="py-2 px-2 text-stone-700" style={{ fontWeight: 400 }}>
                        {cleanName(`${g.first_name ?? ''} ${g.last_name ?? ''}`)}
                      </td>
                      <td className="py-2 px-2 text-stone-400">{g.email || '—'}</td>
                      <td className="py-2 px-2 text-stone-400">{g.phone || '—'}</td>
                      <td className="py-2 px-2 text-stone-400">{g.guest_type || '—'}</td>
                      <td className="py-2 px-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          g.rsvp_status === 'confirmed' ? 'bg-emerald-50 text-emerald-600'
                          : g.rsvp_status === 'declined' ? 'bg-red-50 text-red-400'
                          : 'bg-stone-100 text-stone-400'
                        }`} style={{ fontWeight: 500 }}>
                          {g.rsvp_status === 'confirmed' ? 'Oui' : g.rsvp_status === 'declined' ? 'Non' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-stone-400 text-xs">
                        {g.invite_sent_at
                          ? new Date(g.invite_sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {guestList.length > 0 && (
            <p className="text-xs text-stone-300 mt-3" style={{ fontWeight: 300 }}>
              {inviteSent} invitation{inviteSent > 1 ? 's' : ''} envoyée{inviteSent > 1 ? 's' : ''} · RSVP : {rsvpOui} oui, {rsvpNon} non, {rsvpAttente} en attente
            </p>
          )}
        </Section>

        {/* Programme */}
        {(steps ?? []).length > 0 && (
          <Section title={`Programme (${(steps ?? []).length} étapes)`}>
            <div className="space-y-2">
              {(steps ?? []).map(s => (
                <div key={s.id} className="flex gap-3 items-start">
                  <span className="text-xs text-[#4a5240] shrink-0 mt-0.5" style={{ fontWeight: 500, minWidth: '3rem' }}>
                    {s.time || '—'}
                  </span>
                  <div>
                    <p className="text-sm text-stone-700" style={{ fontWeight: 400 }}>{s.title}</p>
                    {s.description && <p className="text-xs text-stone-400">{s.description}</p>}
                    {s.location && <p className="text-xs text-stone-300">📍 {s.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Tables */}
        {(tables ?? []).length > 0 && (
          <Section title={`Plan de table (${(tables ?? []).length} tables)`}>
            <div className="flex flex-wrap gap-2">
              {(tables ?? []).map(t => (
                <span key={t.id} className="text-xs bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-lg text-stone-600">
                  {t.name} <span className="text-stone-300">({t.capacity} places)</span>
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Photos récentes */}
        {(photos ?? []).length > 0 && (
          <Section title={`Photos (${(photos ?? []).length} dernières)`}>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {(photos ?? []).slice(0, 24).map(p => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-stone-100 relative group">
                  <img src={p.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-1.5">
                    <p className="text-white text-[9px] truncate">{p.uploaded_by_name || '—'}</p>
                    {p.moment_tag && <p className="text-white/60 text-[8px]">{p.moment_tag}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Livre d'or */}
        {(guestbook ?? []).length > 0 && (
          <Section title={`Livre d'or (${(guestbook ?? []).length})`}>
            <div className="space-y-3">
              {(guestbook ?? []).slice(0, 20).map(e => (
                <div key={e.id} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#4a5240]/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-[#4a5240]" style={{ fontWeight: 600 }}>
                      {(e.author_name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500" style={{ fontWeight: 400 }}>
                      {e.author_name || '—'}
                      <span className="text-stone-300 ml-2" style={{ fontWeight: 300 }}>
                        {new Date(e.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </p>
                    <p className="text-sm text-stone-600 mt-0.5">{e.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Playlist */}
        {(songs ?? []).length > 0 && (
          <Section title={`Playlist (${(songs ?? []).length})`}>
            <div className="space-y-1">
              {(songs ?? []).slice(0, 20).map(s => (
                <div key={s.id} className="flex items-center gap-3 py-1">
                  <span className="text-xs text-stone-700" style={{ fontWeight: 400 }}>{s.title}</span>
                  <span className="text-xs text-stone-400">— {s.artist}</span>
                  {s.moment && <span className="text-[10px] bg-stone-50 text-stone-400 px-2 py-0.5 rounded-full">{s.moment}</span>}
                  {s.suggested_by && <span className="text-[10px] text-stone-300">par {s.suggested_by}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Messages récents */}
        {(messages ?? []).length > 0 && (
          <Section title={`Messages récents (${(messages ?? []).length})`}>
            <div className="space-y-2">
              {(messages ?? []).slice(0, 15).map(m => (
                <div key={m.id} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <span className="text-[9px] text-stone-400" style={{ fontWeight: 600 }}>
                      {(m.author_name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400" style={{ fontWeight: 400 }}>
                      {m.author_name || '—'}
                      <span className="text-stone-300 ml-2" style={{ fontWeight: 300 }}>
                        {new Date(m.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </p>
                    <p className="text-sm text-stone-600 mt-0.5">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-50">
        <p style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.08em' }}
           className="text-stone-500 uppercase">
          {title}
        </p>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-stone-400 uppercase tracking-wide" style={{ fontWeight: 400 }}>{label}</p>
      <p className="text-sm text-stone-700 mt-0.5" style={{ fontWeight: 400 }}>{value}</p>
    </div>
  )
}
