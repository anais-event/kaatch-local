import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import InvitationsList from './InvitationsList'

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
    .from('weddings').select('id, name, date, location').eq('slug', slug).single()
  if (!wedding) redirect(`/wedding/${slug}`)

  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, rsvp_status, invite_token')
    .eq('wedding_id', wedding.id)
    .order('last_name').order('first_name')

  const h = await headers()
  const host = h.get('host') ?? 'kaatch.fr'
  const baseUrl = `https://${host}`
  const withoutToken = (guests ?? []).filter(g => !g.invite_token)

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
        <InvitationsList
          guests={guests ?? []}
          baseUrl={baseUrl}
          slug={slug}
          wedding={{ name: wedding.name, date: wedding.date ?? null, location: wedding.location ?? null }}
        />
      </div>
    </div>
  )
}
