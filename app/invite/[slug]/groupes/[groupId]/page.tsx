import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function sendMessage(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const group_id = formData.get('group_id') as string
  const content = formData.get('content') as string
  const author = formData.get('author') as string
  if (!content.trim()) return
  await supabase.from('messages').insert({ group_id, content, author_name: author, wedding_id: formData.get('wedding_id') as string })
  revalidatePath(`/invite/${slug}/groupes/${group_id}`)
}

export default async function GroupConversationPage({
  params,
}: {
  params: Promise<{ slug: string; groupId: string }>
}) {
  const { slug, groupId } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  if (!guestCookie) redirect(`/invite/${slug}`)

  const guest = JSON.parse(guestCookie.value)
  const guestName = `${guest.firstName} ${guest.lastName || ''}`.trim()

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: group } = await supabase
    .from('message_groups')
    .select('id, name')
    .eq('id', groupId)
    .single()
  if (!group) redirect(`/invite/${slug}/groupes`)

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, author_name, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Header fixe */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <a href={`/invite/${slug}/groupes`}
            className="text-[#4a5240] hover:text-[#2d3228] transition"
            style={{ fontSize: '1.2rem' }}>←</a>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem', fontStyle: 'italic' }}
              className="text-[#2d3228]">
            {group.name}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 pt-16 pb-24 max-w-2xl mx-auto w-full px-4 space-y-3 py-4">
        {(!messages || messages.length === 0) && (
          <p className="text-center text-stone-400 pt-12"
             style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem' }}>
            Soyez le premier à écrire dans ce groupe…
          </p>
        )}
        {(messages ?? []).map(msg => {
          const isMe = msg.author_name === guestName
          const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-[10px] text-stone-400 mb-1 ml-1" style={{ fontWeight: 300 }}>
                  {msg.author_name}
                </span>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
                isMe
                  ? 'bg-[#4a5240] text-white rounded-br-sm'
                  : 'bg-white text-stone-700 rounded-bl-sm shadow-sm'
              }`} style={{ fontWeight: 300 }}>
                {msg.content}
              </div>
              <span className="text-[10px] text-stone-300 mt-1 mx-1">{time}</span>
            </div>
          )
        })}
      </div>

      {/* Input fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f5f0e8]/95 backdrop-blur border-t border-stone-200 px-4 py-3">
        <form action={sendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="author" value={guestName} />
          <input type="hidden" name="wedding_id" value={wedding.id} />
          <input
            type="text"
            name="content"
            placeholder="Écrire un message…"
            autoComplete="off"
            className="flex-1 border border-stone-200 rounded-full px-5 py-2.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
            style={{ fontWeight: 300 }}
          />
          <button type="submit"
            className="bg-[#4a5240] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#2d3228] transition shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
