import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import GuestbookViewer from './GuestbookViewer'
import UpgradePrompt from '@/components/UpgradePrompt'
import { normalizePlan, canAccess } from '@/lib/plan'

export default async function LivreDorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, plan')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8 text-stone-500">{t('notFound')}.</div>

  const plan = normalizePlan(wedding.plan)
  if (!canAccess(plan, 'livre-dor')) {
    return <UpgradePrompt feature="livre-dor" currentPlan={plan} slug={slug} />
  }

  // RLS SELECT policy is USING (true) — no service role needed
  const { data: entries } = await supabase
    .from('guestbook_entries')
    .select('id, author_name, message, photo_url, created_at')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8] pt-8 pb-16">
      <div className="max-w-2xl mx-auto px-4 mb-10">
        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
             style={{ fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Livre d&apos;Or</p>
          <h1
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
            className="text-[#2d3228] leading-none"
          >
            {wedding.name}
          </h1>
        </div>
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
      />
    </div>
  )
}
