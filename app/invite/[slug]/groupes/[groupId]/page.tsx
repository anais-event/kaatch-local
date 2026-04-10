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
  await supabase.from('messages').insert({
    group_id,
    content,
    author_name: author,
    wedding_id: formData.get('wedding_id') as string,
  })
  revalidatePath(`/invite/${slug}/groupes/${group_id}`)
}

function formatDateSeparator(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
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

  // Grouper par date
  type Msg = { id: string; content: string; author_name: string; created_at: string }
  const grouped: { date: string; msgs: Msg[] }[] = []
  for (const msg of (messages ?? [])) {
    const d = formatDateSeparator(new Date(msg.created_at))
    const last = grouped[grouped.length - 1]
    if (!last || last.date !== d) grouped.push({ date: d, msgs: [msg] })
    else last.msgs.push(msg)
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f0e8]">

      {/* Header groupe */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-stone-200 bg-white shrink-0">
        {/* Retour mobile seulement */}
        <a href={`/invite/${slug}/groupes`}
           className="sm:hidden text-[#4a5240] text-xl leading-none">←</a>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
          group.name === '@ToutLeMonde' ? 'bg-[#4a5240] text-white' : 'bg-[#4a5240]/10 text-[#4a5240]'
        }`}
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}>
          {group.name === '@ToutLeMonde' ? '✦' : group.name.replace('@', '').charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', fontStyle: 'italic' }}
            className="text-[#2d3228]">
          {group.name}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {grouped.length === 0 && (
          <p className="text-center text-stone-400 pt-12"
             style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem' }}>
            Soyez le premier à écrire…
          </p>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            {/* Séparateur date */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-[10px] text-stone-400 whitespace-nowrap" style={{ fontWeight: 300 }}>
                {date}
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Messages du jour */}
            <div className="space-y-2">
              {msgs.map((msg, i) => {
                const isMe = msg.author_name === guestName
                const isKaatch = msg.author_name === 'Kaatch'
                const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const showName = !isMe && !isKaatch && (i === 0 || msgs[i - 1].author_name !== msg.author_name)

                if (isKaatch) return (
                  <div key={msg.id} className="flex justify-center my-1">
                    <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full" style={{ fontWeight: 300 }}>
                      {msg.content}
                    </span>
                  </div>
                )

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <span className="text-[10px] text-stone-400 mb-0.5 mx-1" style={{ fontWeight: 300 }}>
                        {msg.author_name}
                      </span>
                    )}
                    <div className={`max-w-[72%] px-4 py-2.5 text-sm leading-snug ${
                      isMe
                        ? 'bg-[#4a5240] text-white rounded-2xl rounded-br-sm'
                        : 'bg-white text-stone-700 rounded-2xl rounded-bl-sm shadow-sm border border-stone-100'
                    }`} style={{ fontWeight: 300 }}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-stone-300 mt-0.5 mx-1">{time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form action={sendMessage}
            className="shrink-0 border-t border-stone-200 bg-white/95 backdrop-blur px-4 py-3 flex gap-2">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="group_id" value={groupId} />
        <input type="hidden" name="author" value={guestName} />
        <input type="hidden" name="wedding_id" value={wedding.id} />
        <input type="text" name="content" placeholder="Écrire un message…" autoComplete="off"
          className="flex-1 border border-stone-200 rounded-full px-5 py-2.5 bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
          style={{ fontWeight: 300 }} />
        <button type="submit"
          className="bg-[#4a5240] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#2d3228] transition shrink-0 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
