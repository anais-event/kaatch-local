import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import CopyLinkButton from './CopyLinkButton'

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
  revalidatePath(`/wedding/${slug}/invitations`)
}

export default async function InvitationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) redirect(`/wedding/${slug}`)

  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, rsvp_status, invite_token')
    .eq('wedding_id', wedding.id)
    .order('last_name').order('first_name')

  const h = await headers()
  const host = h.get('host') ?? 'kaatch.fr'
  const baseUrl = `https://${host}`
  const withToken = (guests ?? []).filter(g => g.invite_token)
  const withoutToken = (guests ?? []).filter(g => !g.invite_token)

  const rsvpColor = (s: string) =>
    s === 'confirme' ? 'bg-emerald-50 text-emerald-600' :
    s === 'decline' ? 'bg-red-50 text-red-400' :
    'bg-stone-100 text-stone-400'
  const rsvpLabel = (s: string) =>
    s === 'confirme' ? 'Confirmé' : s === 'decline' ? 'Décliné' : 'En attente'

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Invitations</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] leading-none">{wedding.name}</h1>
        </div>

        {/* Explication */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 mb-6">
          <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228] mb-2">
            Invitations personnalisées
          </p>
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
        {(guests ?? []).length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-stone-100">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem' }}
               className="text-stone-400 mb-2">Aucun invité</p>
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
              Ajoutez des invités d'abord depuis la page{' '}
              <a href={`/wedding/${slug}/guests`} className="text-[#4a5240] hover:underline">Invités</a>
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-50 flex items-center justify-between">
              <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase">
                {(guests ?? []).length} invité{(guests ?? []).length > 1 ? 's' : ''}
              </p>
              <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.12em' }}
                 className="text-stone-400 uppercase hidden sm:block">
                Lien personnalisé
              </p>
            </div>
            <div className="divide-y divide-stone-50">
              {(guests ?? []).map(guest => {
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
                        <CopyLinkButton url={link} guestName={`${guest.first_name} ${guest.last_name ?? ''}`} slug={slug} />
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
    </div>
  )
}
