import { createSupabaseServerClient } from '@/lib/supabase-server'
import WeddingMessagerieShell from './WeddingMessagerieShell'

export default async function WeddingMessagerieLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <>{children}</>

  // Assurer @ToutLeMonde
  const { data: existing } = await supabase
    .from('message_groups').select('id').eq('wedding_id', wedding.id).eq('name', '@ToutLeMonde').single()
  if (!existing) {
    await supabase.from('message_groups').insert({ wedding_id: wedding.id, name: '@ToutLeMonde', created_by: 'system' })
  }

  const { data: groups } = await supabase
    .from('message_groups').select('id, name, created_by')
    .eq('wedding_id', wedding.id).order('created_at', { ascending: true })

  const groupsWithMeta = await Promise.all(
    (groups ?? []).map(async g => {
      const { data: msgs } = await supabase
        .from('messages').select('content, author_name, created_at')
        .eq('group_id', g.id).order('created_at', { ascending: false }).limit(1)
      return { ...g, lastMsg: msgs?.[0] ?? null }
    })
  )

  const sorted = [
    ...groupsWithMeta.filter(g => g.name === '@ToutLeMonde'),
    ...groupsWithMeta.filter(g => g.name !== '@ToutLeMonde'),
  ]

  return (
    <WeddingMessagerieShell
      slug={slug}
      groups={sorted}
      authorName={`Les mariés`}
      weddingId={wedding.id}
    >
      {children}
    </WeddingMessagerieShell>
  )
}
