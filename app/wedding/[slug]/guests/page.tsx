import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import PageIntro from '../PageIntro'
import GuestList from './GuestList'
import ImportGuests from './ImportGuests'
import CopyLinkButton from '../invitations/CopyLinkButton'

async function addGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string

  await supabase.from('guests').insert({
    wedding_id: formData.get('wedding_id') as string,
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
    guest_type: (formData.get('guest_type') as string) || 'adulte',
  })

  revalidatePath(`/wedding/${slug}/guests`)
}

async function deleteGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string

  await supabase.from('guests').delete().eq('id', id)
  revalidatePath(`/wedding/${slug}/guests`)
}

async function setRsvp(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const rsvp_status = formData.get('rsvp_status') as string

  await supabase.from('guests').update({ rsvp_status }).eq('id', id)
  revalidatePath(`/wedding/${slug}/guests`)
}

async function updateGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string

  await supabase.from('guests').update({
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
  }).eq('id', id)

  revalidatePath(`/wedding/${slug}/guests`)
}

async function generateTokens(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  const { data: guests } = await supabase
    .from('guests').select('id').eq('wedding_id', wedding.id).is('invite_token', null)
  for (const g of (guests ?? [])) {
    await supabase.from('guests').update({ invite_token: crypto.randomUUID() }).eq('id', g.id)
  }
  revalidatePath(`/wedding/${slug}/guests`)
}

const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

export default async function GuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab } = await searchParams
  const activeTab = tab === 'invitations' ? 'invitations' : 'invites'

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) {
    return <div className="p-8">Mariage introuvable 😢</div>
  }

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const total = guests?.length ?? 0
  const confirmed = guests?.filter(g => g.rsvp_status === 'confirme').length ?? 0
  const declined = guests?.filter(g => g.rsvp_status === 'decline').length ?? 0
  const pending = guests?.filter(g => g.rsvp_status === 'en_attente').length ?? 0

  // Invitations tab data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kaatch.app'
  const guestsSorted = [...(guests ?? [])].sort((a, b) => {
    const la = (a.last_name ?? '').localeCompare(b.last_name ?? '')
    return la !== 0 ? la : (a.first_name ?? '').localeCompare(b.first_name ?? '')
  })
  const withoutToken = guestsSorted.filter(g => !g.invite_token)

  const rsvpColor = (s: string) =>
    s === 'confirme' ? 'bg-emerald-50 text-emerald-600' :
    s === 'decline' ? 'bg-red-50 text-red-400' :
    'bg-stone-100 text-stone-400'
  const rsvpLabel = (s: string) =>
    s === 'confirme' ? 'Confirmé' : s === 'decline' ? 'Décliné' : 'En attente'

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`}
             className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-4">
          Invités{total > 0 && <span style={{ fontSize: '1.4rem', fontWeight: 300 }} className="text-stone-400 ml-3">({total})</span>}
        </h1>

        <PageIntro
          what="Gérez toute votre liste d'invités : ajoutez-les un à un ou importez depuis Excel, envoyez-leur un lien d'invitation personnalisé et suivez leurs réponses RSVP en temps réel."
          how="Ajoutez un invité via le formulaire, ou importez un fichier Excel. Chaque invité reçoit un lien unique pour accéder à l'espace invité et confirmer sa présence."
          guests="Les invités voient le programme, les photos, les hébergements et peuvent confirmer leur venue via leur lien d'invitation."
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <a href={`/wedding/${slug}/guests`}
             className={`px-4 py-2 text-sm rounded-lg transition ${activeTab === 'invites' ? 'bg-[#4a5240] text-white' : 'text-stone-400 hover:text-[#4a5240]'}`}
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Invités
          </a>
          <a href={`/wedding/${slug}/guests?tab=invitations`}
             className={`px-4 py-2 text-sm rounded-lg transition ${activeTab === 'invitations' ? 'bg-[#4a5240] text-white' : 'text-stone-400 hover:text-[#4a5240]'}`}
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Invitations
          </a>
        </div>

        {activeTab === 'invites' ? (
          <>
            {/* Compteurs RSVP */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-stone-100 p-4 text-center">
                <p className="text-2xl font-bold text-[#4a5240]" style={{ fontFamily: 'var(--font-cormorant)' }}>{confirmed}</p>
                <p className="text-xs text-stone-400 uppercase tracking-wide mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>Confirmé{confirmed > 1 ? 's' : ''}</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-100 p-4 text-center">
                <p className="text-2xl font-bold text-stone-400" style={{ fontFamily: 'var(--font-cormorant)' }}>{pending}</p>
                <p className="text-xs text-stone-400 uppercase tracking-wide mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>En attente</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-100 p-4 text-center">
                <p className="text-2xl font-bold text-red-400" style={{ fontFamily: 'var(--font-cormorant)' }}>{declined}</p>
                <p className="text-xs text-stone-400 uppercase tracking-wide mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>Décliné{declined > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Import Excel */}
            <ImportGuests weddingId={wedding.id} slug={slug} />

            {/* Formulaire d'ajout */}
            <div className="bg-white rounded-xl border border-stone-100 p-6 mb-8">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
                  className="text-[#4a5240] mb-4">Ajouter un invité</h2>
              <form action={addGuest} className="grid grid-cols-2 gap-3">
                <input type="hidden" name="wedding_id" value={wedding.id} />
                <input type="hidden" name="slug" value={slug} />
                {[
                  { name: 'first_name', placeholder: 'Prénom *', required: true, type: 'text' },
                  { name: 'last_name', placeholder: 'Nom *', required: true, type: 'text' },
                  { name: 'nickname', placeholder: 'Surnom (optionnel)', required: false, type: 'text' },
                  { name: 'email', placeholder: 'Email', required: false, type: 'email' },
                  { name: 'telephone', placeholder: 'Téléphone', required: false, type: 'tel' },
                ].map(f => (
                  <input key={f.name} type={f.type} name={f.name} placeholder={f.placeholder} required={f.required}
                    className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                    style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
                ))}
                <select name="relation"
                  className="border border-stone-200 rounded-xl px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
                  <option value="">Lien de parenté</option>
                  {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select name="guest_type"
                  className="border border-stone-200 rounded-xl px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
                  <option value="adulte">Adulte</option>
                  <option value="enfant">Enfant</option>
                  <option value="animal">Animal</option>
                </select>
                <button type="submit"
                  className="bg-[#4a5240] text-white px-6 py-2 rounded-xl hover:bg-[#2d3228] transition"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                  + Ajouter
                </button>
              </form>
            </div>

            {/* Message enfants/animaux */}
            <div className="bg-[#4a5240]/10 border border-[#4a5240]/20 rounded-lg px-5 py-4 mb-6">
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                 className="text-[#4a5240]">
                N'oublie pas d'ajouter les enfants et animaux à ta liste pour pouvoir les retrouver facilement sur les photos !
              </p>
            </div>

            {/* Liste des invités */}
            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
                  className="text-[#4a5240] mb-4">Invités ({total})</h2>
              <GuestList
                guests={guests ?? []}
                slug={slug}
                setRsvp={setRsvp}
                deleteGuest={deleteGuest}
                updateGuest={updateGuest}
              />
            </div>
          </>
        ) : (
          /* ── Onglet Invitations ── */
          <div style={{ fontFamily: 'var(--font-lato)' }}>
            {/* Explication */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 mb-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228]">
                  Invitations personnalisées
                </p>
                <a href={`/wedding/${slug}/guests`}
                   style={{ fontWeight: 300, fontSize: '0.78rem' }}
                   className="text-[#4a5240] hover:underline shrink-0">
                  ← Liste des invités
                </a>
              </div>
              <p style={{ fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.7 }} className="text-stone-400 mb-4">
                Chaque invité reçoit un lien unique qui affiche son prénom sur le faire-part.
                Partagez ces liens par SMS, email ou WhatsApp — l'invité voit directement
                <em> "Chère Sophie,"</em> en arrivant sur la page.
              </p>
              {withoutToken.length > 0 && (
                <form action={generateTokens}>
                  <input type="hidden" name="slug" value={slug} />
                  <button type="submit"
                    className="bg-[#4a5240] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    Générer les liens manquants ({withoutToken.length})
                  </button>
                </form>
              )}
              {withoutToken.length === 0 && guests && guests.length > 0 && (
                <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-emerald-600">
                  ✓ Tous les invités ont un lien personnalisé
                </p>
              )}
            </div>

            {/* Liste */}
            {total === 0 ? (
              <div className="text-center py-14 bg-white rounded-2xl border border-stone-100">
                <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem' }}
                   className="text-stone-400 mb-2">Aucun invité</p>
                <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
                  Ajoutez des invités d'abord depuis l'onglet{' '}
                  <a href={`/wedding/${slug}/guests`} className="text-[#4a5240] hover:underline">Invités</a>
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-stone-50 flex items-center justify-between">
                  <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.15em' }}
                     className="text-stone-400 uppercase">
                    {total} invité{total > 1 ? 's' : ''}
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.12em' }}
                     className="text-stone-400 uppercase hidden sm:block">
                    Lien personnalisé
                  </p>
                </div>
                <div className="divide-y divide-stone-50">
                  {guestsSorted.map(guest => {
                    const link = guest.invite_token ? `${baseUrl}/i/${guest.invite_token}` : null
                    return (
                      <div key={guest.id} className="flex items-center gap-4 px-5 py-3.5">
                        {/* Nom */}
                        <div className="flex-1 min-w-0">
                          <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700">
                            {guest.first_name} {guest.last_name}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${rsvpColor(guest.rsvp_status)}`}
                                style={{ fontWeight: 400 }}>
                            {rsvpLabel(guest.rsvp_status)}
                          </span>
                        </div>

                        {/* Lien */}
                        {link ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                               className="text-stone-400 truncate hidden sm:block max-w-[220px]">
                              /i/{guest.invite_token}
                            </p>
                            <CopyLinkButton url={link} />
                            <a href={link} target="_blank" rel="noopener noreferrer"
                               className="text-xs text-stone-300 hover:text-[#4a5240] transition"
                               title="Aperçu">
                              ↗
                            </a>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 italic">
                            Pas de lien
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
