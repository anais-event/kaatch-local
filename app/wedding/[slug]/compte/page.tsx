import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import PasswordForm from './PasswordForm'
import InvitePartnerForm from './InvitePartnerForm'
import DangerZone from './DangerZone'

export default async function ComptePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, co_owner_email, is_suspended')
    .eq('slug', slug)
    .single()

  if (!wedding) redirect('/dashboard')

  async function invitePartner(formData: FormData) {
    'use server'
    const email = (formData.get('co_owner_email') as string).trim().toLowerCase()
    const supabase = await createSupabaseServerClient()
    await supabase.from('weddings').update({ co_owner_email: email }).eq('slug', slug)
    revalidatePath(`/mariage/${slug}/compte`)
  }

  async function removePartner() {
    'use server'
    const supabase = await createSupabaseServerClient()
    await supabase.from('weddings').update({ co_owner_email: null }).eq('slug', slug)
    revalidatePath(`/mariage/${slug}/compte`)
  }

  async function toggleSuspend() {
    'use server'
    const supabase = await createSupabaseServerClient()
    const { data: w } = await supabase.from('weddings').select('is_suspended').eq('slug', slug).single()
    await supabase.from('weddings').update({ is_suspended: !w?.is_suspended }).eq('slug', slug)
    revalidatePath(`/mariage/${slug}/compte`)
  }

  async function deleteWedding() {
    'use server'
    const supabase = await createSupabaseServerClient()
    const { data: w } = await supabase.from('weddings').select('id').eq('slug', slug).single()
    if (!w) return
    const wid = w.id
    await supabase.from('photo_likes').delete().in('photo_id',
      (await supabase.from('photos').select('id').eq('wedding_id', wid)).data?.map(p => p.id) ?? [])
    await supabase.from('photo_comments').delete().in('photo_id',
      (await supabase.from('photos').select('id').eq('wedding_id', wid)).data?.map(p => p.id) ?? [])
    await supabase.from('photos').delete().eq('wedding_id', wid)
    await supabase.from('messages').delete().eq('wedding_id', wid)
    await supabase.from('guests').delete().eq('wedding_id', wid)
    await supabase.from('program_steps').delete().eq('wedding_id', wid)
    await supabase.from('playlist_songs').delete().eq('wedding_id', wid)
    await supabase.from('guestbook_entries').delete().eq('wedding_id', wid)
    await supabase.from('table_guests').delete().in('table_id',
      (await supabase.from('tables').select('id').eq('wedding_id', wid)).data?.map(t => t.id) ?? [])
    await supabase.from('tables').delete().eq('wedding_id', wid)
    await supabase.from('weddings').delete().eq('id', wid)
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-6 md:p-10">
      <div className="max-w-lg mx-auto">

        <div className="mb-8">
          <a href={`/mariage/${slug}`}
             className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour
          </a>
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.6rem' }}
              className="text-[#2d3228] mt-4">
            Mon compte
          </h1>
        </div>

        {/* Identifiants */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
          <h2 style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.95rem' }}
              className="text-[#2d3228] mb-1">
            Identifiants
          </h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem' }}
             className="text-stone-400 mb-4">
            Adresse email et mot de passe de votre compte Kaatch
          </p>

          <div className="bg-[#f5f0e8] rounded-xl px-4 py-3 mb-4">
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.1em' }}
               className="text-stone-400 uppercase mb-0.5">Email</p>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 400, fontSize: '0.9rem' }}
               className="text-stone-700">{user.email}</p>
          </div>

          <div>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.1em' }}
               className="text-stone-400 uppercase mb-0.5">Mot de passe</p>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
               className="text-stone-400">••••••••</p>
          </div>

          <PasswordForm />
        </section>

        {/* Partenaire */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
          <h2 style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.95rem' }}
              className="text-[#2d3228] mb-1">
            Mon partenaire
          </h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem' }}
             className="text-stone-400">
            Donnez accès à l&apos;espace mariés à votre partenaire
          </p>
          <InvitePartnerForm
            currentCoOwnerEmail={wedding.co_owner_email ?? null}
            inviteAction={invitePartner}
            removeAction={removePartner}
          />
        </section>

        {/* Zone sensible */}
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.95rem' }}
              className="text-[#2d3228] mb-1">
            Zone sensible
          </h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem' }}
             className="text-stone-400">
            Actions irréversibles ou ayant un impact sur vos invités
          </p>
          <DangerZone
            weddingName={wedding.name ?? slug}
            isSuspended={wedding.is_suspended ?? false}
            suspendAction={toggleSuspend}
            deleteAction={deleteWedding}
          />
        </section>

      </div>
    </div>
  )
}
