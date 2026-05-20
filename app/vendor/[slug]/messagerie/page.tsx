import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

function formatDateSeparator(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default async function VendorMessageriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // Find or create private group for this vendor
  const groupName = `@Presta-${vendor.name}`

  const { data: existingGroups } = await supabase
    .from('message_groups')
    .select('id, name')
    .eq('wedding_id', wedding.id)
    .eq('name', groupName)
    .limit(1)

  let group = existingGroups?.[0] ?? null

  if (!group) {
    const { data: newGroups, error: insertErr } = await supabase
      .from('message_groups')
      .insert({ wedding_id: wedding.id, name: groupName, created_by: null })
      .select('id, name')
    if (insertErr) return <div className="p-8">Erreur messagerie: {insertErr.message}</div>
    group = newGroups?.[0] ?? null
  }

  if (!group) return <div className="p-8">Erreur messagerie</div>

  async function sendMessage(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const content = formData.get('content') as string
    const groupId = formData.get('group_id') as string
    const author = formData.get('author') as string
    const slugVal = formData.get('slug') as string
    if (!content.trim()) return
    const { error } = await supabase.from('messages').insert({
      group_id: groupId,
      content,
      author_name: author,
    })
    if (error) console.error('Vendor message insert error:', error)
    revalidatePath(`/vendor/${slugVal}/messagerie`)
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, author_name, created_at')
    .eq('group_id', group.id)
    .order('created_at', { ascending: true })

  type Msg = { id: string; content: string; author_name: string; created_at: string }
  const grouped: { date: string; msgs: Msg[] }[] = []
  for (const msg of (messages ?? [])) {
    const d = formatDateSeparator(new Date(msg.created_at))
    const last = grouped[grouped.length - 1]
    if (!last || last.date !== d) grouped.push({ date: d, msgs: [msg] })
    else last.msgs.push(msg)
  }

  const authorName = vendor.name

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href={`/vendor/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
           style={{ fontWeight: 300 }}>
          ← Retour au tableau de bord
        </a>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
            className="text-[#2d3228] mb-1">Messagerie</h1>
        <p className="text-stone-400 mb-6" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
          Discussion avec les mariés
        </p>

        {/* Chat container */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 h-12 border-b border-stone-100 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#4a5240]/10 text-[#4a5240] flex items-center justify-center shrink-0"
                 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              💒
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#2d3228] truncate" style={{ fontWeight: 400 }}>{wedding.name}</p>
              <p className="text-[10px] text-stone-400" style={{ fontWeight: 300 }}>Canal privé avec les mariés</p>
            </div>
            <span className="text-[11px] text-stone-300" style={{ fontWeight: 300 }}>
              {(messages ?? []).length} message{(messages ?? []).length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {grouped.length === 0 && (
              <div className="flex-1 flex items-center justify-center pt-12">
                <div className="text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
                     className="text-stone-300 mb-1">Aucun message</p>
                  <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-300">
                    Envoyez un message aux mariés
                  </p>
                </div>
              </div>
            )}

            {grouped.map(({ date, msgs }) => (
              <div key={date}>
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-stone-100" />
                  <span className="text-[10px] text-stone-400 whitespace-nowrap" style={{ fontWeight: 300 }}>{date}</span>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>
                <div className="space-y-2">
                  {msgs.map((msg, i) => {
                    const isMe = msg.author_name === authorName
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
                            : 'bg-[#f5f0e8] text-stone-700 rounded-2xl rounded-bl-sm'
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
                className="shrink-0 border-t border-stone-100 bg-white px-4 py-3 flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="group_id" value={group.id} />
            <input type="hidden" name="author" value={authorName} />
            <input type="text" name="content" placeholder="Écrire un message..." autoComplete="off"
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
      </div>
    </div>
  )
}
