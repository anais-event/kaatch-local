import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import GuestbookViewer from './GuestbookViewer'

export default async function LivreDorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable.</div>

  // RLS SELECT policy is USING (true) — no service role needed
  const { data: entries } = await supabase
    .from('guestbook_entries')
    .select('id, author_name, message, photo_url, created_at, is_approved')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  async function toggleApproval(entryId: string, currentValue: boolean) {
    'use server'
    const supabase = await createSupabaseServerClient()
    await supabase
      .from('guestbook_entries')
      .update({ is_approved: !currentValue })
      .eq('id', entryId)
    revalidatePath(`/mariage/${slug}/livre-dor`)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 mb-10 text-center">
        <h1
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem' }}
          className="text-[#2d3228] mb-2"
        >
          Livre d&apos;Or
        </h1>
        <p
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
          className="text-stone-400"
        >
          Les mots de vos proches, pour toujours
        </p>
      </div>

      <GuestbookViewer
        entries={entries ?? []}
        slug={slug}
        toggleApproval={toggleApproval}
      />
    </div>
  )
}
