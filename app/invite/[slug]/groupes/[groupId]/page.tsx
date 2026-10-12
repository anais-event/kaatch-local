import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getGuestSession } from '@/lib/guest-session'
import { redirect } from 'next/navigation'
import GroupChat from './GroupChat'

export default async function GroupConversationPage({
  params,
}: {
  params: Promise<{ slug: string; groupId: string }>
}) {
  const { slug, groupId } = await params
  const guest = (await getGuestSession(slug)) ?? { firstName: '', lastName: '', id: null }
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ')

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: group } = await supabase
    .from('message_groups').select('id, name').eq('id', groupId).single()
  if (!group) redirect(`/invite/${slug}/groupes`)

  const { data: messages } = await supabase
    .from('messages').select('id, content, author_name, created_at')
    .eq('group_id', groupId).order('created_at', { ascending: true })

  return (
    <GroupChat
      slug={slug}
      groupId={groupId}
      groupName={group.name}
      weddingId={wedding.id}
      guestName={guestName}
      initialMessages={messages ?? []}
    />
  )
}
