import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MessagerieShell from './MessagerieShell'

export default async function GroupesLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  if (!guestCookie) redirect(`/invite/${slug}`)

  const guest = JSON.parse(guestCookie.value)
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ')

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <>{children}</>

  // Assurer @ToutLeMonde
  const { data: generalGroup } = await supabase
    .from('message_groups').select('id').eq('wedding_id', wedding.id).eq('name', '@ToutLeMonde').single()
  if (!generalGroup) {
    await supabase.from('message_groups').insert({ wedding_id: wedding.id, name: '@ToutLeMonde', created_by: 'system' })
  }

  const { data: groups } = await supabase
    .from('message_groups')
    .select('id, name, created_by')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  // Dernier message par groupe
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
    <MessagerieShell slug={slug} groups={sorted} guestName={guestName} weddingId={wedding.id}>
      {children}
    </MessagerieShell>
  )
}
