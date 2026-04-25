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
    .select('id, first_name, last_name, email, telephone, rsvp_status, invite_token')
    .eq('wedding_id', wedding.id)
    .order('first_name')

  const h = await headers()
  const host = h.get('host') ?? 'kaatch.fr'
  const baseUrl = `https://${host}`

  const withoutToken = (guests ?? []).filter(g => !g.invite_token)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <a href={`/wedding/${slug}`}
             style={{ fontWeight: 300, fontSize: '0.8rem' }}
             className="text-[#4a5240] hover:underline">
            ← Retour
          </a>
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.02em' }}
              className="text-[#2d3228] mt-2">
            INVITATIONS
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400 mt-1">
            Partagez un lien personnalisé à chaque invité — il verra son prénom sur le faire-part.
          </p>
        </div>

        {/* Banner: liens manquants */}
        {withoutToken.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 gap-3 flex-wrap">
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-amber-700">
              {withoutToken.length} invité{withoutToken.length > 1 ? 's' : ''} sans lien d'invitation
            </p>
            <form action={generateTokens}>
              <input type="hidden" name="slug" value={slug} />
              <button type="submit"
                className="bg-[#4a5240] text-white px-4 py-1.5 rounded-xl text-xs hover:bg-[#2d3228] transition cursor-pointer whitespace-nowrap"
                style={{ fontWeight: 400, letterSpacing: '0.04em' }}>
                GÉNÉRER LES LIENS ({withoutToken.length})
              </button>
            </form>
          </div>
        )}
        {withoutToken.length === 0 && (guests ?? []).length > 0 && (
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-emerald-600 mb-4">
            ✓ Tous les liens sont prêts
          </p>
        )}

        <InvitationsList
          guests={guests ?? []}
          baseUrl={baseUrl}
          slug={slug}
          wedding={{ name: wedding.name, date: wedding.date, location: wedding.location }}
        />

      </div>
    </div>
  )
}
