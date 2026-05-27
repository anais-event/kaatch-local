import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'anais@kaatch.fr'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function createCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const code = (formData.get('code') as string).trim().toUpperCase()
  const maxUsesRaw = formData.get('max_uses') as string
  const maxUses = maxUsesRaw === '' || maxUsesRaw === '0' ? 9999 : (parseInt(maxUsesRaw) || 1)
  const expiresAtRaw = formData.get('expires_at') as string
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null
  await adminClient().from('promo_codes').insert({ code, max_uses: maxUses, plan: 'mariage', expires_at: expiresAt })
  revalidatePath('/admin')
}

async function deleteCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const id = formData.get('id') as string
  await adminClient().from('promo_codes').delete().eq('id', id)
  revalidatePath('/admin')
}

async function toggleCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'
  await adminClient().from('promo_codes').update({ active: !active }).eq('id', id)
  revalidatePath('/admin')
}

async function setPlan(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const weddingId = formData.get('wedding_id') as string
  const plan = formData.get('plan') as string | null
  await adminClient().from('weddings').update({ plan: plan || null }).eq('id', weddingId)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email !== ADMIN_EMAIL) redirect('/auth')

  const admin = adminClient()

  const { data: weddings } = await admin
    .from('weddings')
    .select('id, slug, name, date, location, plan, couple_id, co_owner_email, share_code, created_at')
    .order('created_at', { ascending: false })

  const weddingIds = (weddings ?? []).map(w => w.id)

  const [
    { data: guestsRaw },
    { data: photosRaw },
    { data: messagesRaw },
    { data: guestbookRaw },
    { data: songsRaw },
  ] = await Promise.all([
    weddingIds.length > 0
      ? admin.from('guests').select('wedding_id, rsvp_status').in('wedding_id', weddingIds)
      : Promise.resolve({ data: [] as { wedding_id: string; rsvp_status: string }[] }),
    weddingIds.length > 0
      ? admin.from('photos').select('wedding_id').in('wedding_id', weddingIds)
      : Promise.resolve({ data: [] as { wedding_id: string }[] }),
    weddingIds.length > 0
      ? admin.from('messages').select('wedding_id').in('wedding_id', weddingIds)
      : Promise.resolve({ data: [] as { wedding_id: string }[] }),
    weddingIds.length > 0
      ? admin.from('guestbook_entries').select('wedding_id').in('wedding_id', weddingIds)
      : Promise.resolve({ data: [] as { wedding_id: string }[] }),
    weddingIds.length > 0
      ? admin.from('playlist_songs').select('wedding_id').in('wedding_id', weddingIds)
      : Promise.resolve({ data: [] as { wedding_id: string }[] }),
  ])

  const countByWedding: Record<string, number> = {}
  const rsvpByWedding: Record<string, { oui: number; non: number; attente: number }> = {}
  for (const g of guestsRaw ?? []) {
    countByWedding[g.wedding_id] = (countByWedding[g.wedding_id] ?? 0) + 1
    if (!rsvpByWedding[g.wedding_id]) rsvpByWedding[g.wedding_id] = { oui: 0, non: 0, attente: 0 }
    if (g.rsvp_status === 'confirmed') rsvpByWedding[g.wedding_id].oui++
    else if (g.rsvp_status === 'declined') rsvpByWedding[g.wedding_id].non++
    else rsvpByWedding[g.wedding_id].attente++
  }

  const photosByWedding: Record<string, number> = {}
  for (const p of photosRaw ?? []) photosByWedding[p.wedding_id] = (photosByWedding[p.wedding_id] ?? 0) + 1

  const messagesByWedding: Record<string, number> = {}
  for (const m of messagesRaw ?? []) messagesByWedding[m.wedding_id] = (messagesByWedding[m.wedding_id] ?? 0) + 1

  const guestbookByWedding: Record<string, number> = {}
  for (const e of guestbookRaw ?? []) guestbookByWedding[e.wedding_id] = (guestbookByWedding[e.wedding_id] ?? 0) + 1

  const songsByWedding: Record<string, number> = {}
  for (const s of songsRaw ?? []) songsByWedding[s.wedding_id] = (songsByWedding[s.wedding_id] ?? 0) + 1

  // Fetch creator emails
  const coupleIds = [...new Set((weddings ?? []).map(w => w.couple_id).filter(Boolean))]
  let userEmails: Record<string, string> = {}
  if (coupleIds.length > 0) {
    try {
      const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
      for (const u of usersData?.users ?? []) {
        if (coupleIds.includes(u.id)) userEmails[u.id] = u.email ?? ''
      }
    } catch {}
  }

  const { data: promoCodes } = await adminClient()
    .from('promo_codes')
    .select('id, code, plan, max_uses, uses_count, active, created_at, expires_at')
    .order('created_at', { ascending: false })

  const total = weddings?.length ?? 0
  const paid = weddings?.filter(w => w.plan === 'mariage' || w.plan === 'pro' || w.plan === 'essential' || w.plan === 'premium').length ?? 0
  const free = total - paid
  const totalGuests = Object.values(countByWedding).reduce((a, b) => a + b, 0)
  const totalPhotos = Object.values(photosByWedding).reduce((a, b) => a + b, 0)

  const LATO = 'var(--font-lato)'
  const DISPLAY = 'var(--font-display)'

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>

      {/* Header */}
      <div className="bg-[#2d3228] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontWeight: 500 }}>
            Kaatch Admin
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.6rem' }}
              className="text-white">
            Dashboard administrateur
          </h1>
        </div>
        <a href="/dashboard"
           className="text-white/50 text-xs hover:text-white transition"
           style={{ fontWeight: 300 }}>
          ← Mon espace
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Mariages', value: total, color: 'text-[#2d3228]' },
            { label: 'Gratuit', value: free, color: 'text-stone-500' },
            { label: 'Payant', value: paid, color: 'text-[#4a5240]' },
            { label: 'Invités', value: totalGuests, color: 'text-stone-600' },
            { label: 'Photos', value: totalPhotos, color: 'text-stone-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-5 text-center shadow-sm">
              <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '2.4rem', lineHeight: 1 }}
                 className={s.color}>{s.value}</p>
              <p className="text-stone-400 text-xs mt-1 uppercase tracking-wide" style={{ fontWeight: 400 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50 flex items-center justify-between">
            <p style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.08em' }}
               className="text-stone-500 uppercase">
              Tous les mariages
            </p>
          </div>

          {(weddings ?? []).length === 0 ? (
            <p className="px-6 py-10 text-center text-stone-400 text-sm">Aucun mariage pour l'instant.</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {(weddings ?? []).map(w => {
                const isPaidPlan = w.plan === 'mariage' || w.plan === 'pro' || w.plan === 'essential' || w.plan === 'premium'
                const dateStr = w.date
                  ? new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'
                const createdStr = w.created_at
                  ? new Date(w.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'
                const guests = countByWedding[w.id] ?? 0
                const rsvp = rsvpByWedding[w.id] ?? { oui: 0, non: 0, attente: 0 }
                const photos = photosByWedding[w.id] ?? 0
                const msgs = messagesByWedding[w.id] ?? 0
                const gbook = guestbookByWedding[w.id] ?? 0
                const songs = songsByWedding[w.id] ?? 0
                const email = userEmails[w.couple_id] ?? '—'

                return (
                  <div key={w.id} className="px-6 py-4 hover:bg-stone-50/50 transition">

                    {/* Ligne 1 : nom + badges + actions */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={`/admin/weddings/${w.id}`}
                             className="hover:underline" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d3228' }}>
                            {w.name || '—'}
                          </a>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isPaidPlan
                              ? 'bg-[#4a5240]/10 text-[#4a5240]'
                              : 'bg-stone-100 text-stone-400'
                          }`} style={{ fontWeight: 500 }}>
                            {w.plan ?? 'gratuit'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-stone-400" title="Date du mariage">{dateStr}</span>
                          <span className="text-xs text-stone-400">·</span>
                          <a href={`/mariage/${w.slug}`}
                             className="text-xs text-[#4a5240] hover:underline"
                             target="_blank" rel="noopener noreferrer">
                            /{w.slug}
                          </a>
                          <span className="text-xs text-stone-400">·</span>
                          <span className="text-xs text-stone-400" title="Email créateur">{email}</span>
                          <span className="text-xs text-stone-400">·</span>
                          <span className="text-xs text-stone-300" title="Date de création">créé {createdStr}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a href={`/admin/weddings/${w.id}`}
                           className="text-xs border border-stone-200 text-stone-500 px-3 py-1.5 rounded-lg hover:border-[#4a5240] hover:text-[#4a5240] transition"
                           style={{ fontWeight: 400 }}>
                          Voir détail
                        </a>
                        {isPaidPlan ? (
                          <form action={setPlan}>
                            <input type="hidden" name="wedding_id" value={w.id} />
                            <input type="hidden" name="plan" value="" />
                            <button type="submit"
                              className="text-xs border border-stone-200 text-stone-400 px-3 py-1.5 rounded-lg hover:border-red-200 hover:text-red-400 transition cursor-pointer"
                              style={{ fontWeight: 400 }}>
                              Repasser en gratuit
                            </button>
                          </form>
                        ) : (
                          <form action={setPlan}>
                            <input type="hidden" name="wedding_id" value={w.id} />
                            <input type="hidden" name="plan" value="mariage" />
                            <button type="submit"
                              className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d3228] transition cursor-pointer"
                              style={{ fontWeight: 400 }}>
                              ✓ Activer plan Mariage
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                    {/* Ligne 2 : stats compactes */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-stone-500" style={{ fontWeight: 400 }}>
                        👥 {guests} invité{guests > 1 ? 's' : ''}
                        {guests > 0 && (
                          <span className="text-stone-400 ml-1" style={{ fontWeight: 300 }}>
                            ({rsvp.oui} ✓ {rsvp.non} ✗ {rsvp.attente} ?)
                          </span>
                        )}
                      </span>
                      {photos > 0 && <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>📷 {photos}</span>}
                      {msgs > 0 && <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>💬 {msgs}</span>}
                      {gbook > 0 && <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>📖 {gbook}</span>}
                      {songs > 0 && <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>🎵 {songs}</span>}
                      {w.location && <span className="text-xs text-stone-300" style={{ fontWeight: 300 }}>📍 {w.location}</span>}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Codes avantage */}
        <div className="mt-10">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#2d3228] mb-5">Codes avantage</h2>

          {/* Créer un code */}
          <form action={createCode} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm mb-5 flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontWeight: 400 }}>
                Code
              </label>
              <input type="text" name="code" placeholder="KAATCH-BETA" required
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition uppercase"
                style={{ fontWeight: 300, letterSpacing: '0.05em' }} />
            </div>
            <div className="w-28">
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontWeight: 400 }}>
                Nb utilisations
              </label>
              <input type="number" name="max_uses" min="0" placeholder="∞"
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
            </div>
            <div className="w-44">
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontWeight: 400 }}>
                Date limite
              </label>
              <input type="date" name="expires_at"
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
            </div>
            <button type="submit"
              className="bg-[#4a5240] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontWeight: 400 }}>
              + Créer
            </button>
          </form>

          {/* Liste des codes */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {(promoCodes ?? []).length === 0 ? (
              <p className="px-6 py-8 text-center text-stone-400 text-sm">Aucun code créé pour l'instant.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {(promoCodes ?? []).map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center gap-4 flex-wrap">
                    <p style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.08em' }}
                       className={`flex-1 ${c.active ? 'text-[#2d3228]' : 'text-stone-300 line-through'}`}>
                      {c.code}
                    </p>
                    <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                      {c.uses_count} / {c.max_uses >= 9999 ? '∞' : c.max_uses} utilisations
                    </span>
                    {c.expires_at && (
                      <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                        jusqu&apos;au {new Date(c.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}
                          style={{ fontWeight: 500 }}>
                      {c.active ? 'Actif' : 'Désactivé'}
                    </span>
                    <a href={`/admin/promo/${c.id}`}
                      className="text-xs border border-stone-200 text-stone-400 px-3 py-1 rounded-lg hover:border-[#4a5240] hover:text-[#4a5240] transition"
                      style={{ fontWeight: 300 }}>
                      Modifier
                    </a>
                    <form action={toggleCode}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="active" value={String(c.active)} />
                      <button type="submit"
                        className="text-xs border border-stone-200 text-stone-400 px-3 py-1 rounded-lg hover:border-stone-300 hover:text-stone-600 transition cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        {c.active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </form>
                    <form action={deleteCode}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit"
                        className="text-xs border border-red-100 text-red-300 px-3 py-1 rounded-lg hover:border-red-300 hover:text-red-500 transition cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        Supprimer
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
