import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function sendMessage(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('messages').insert({
    group_id: formData.get('group_id') as string,
    author_name: formData.get('author_name') as string,
    content: formData.get('content') as string,
  })
  revalidatePath(`/wedding/${slug}/messagerie`)
}

async function createGroup(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('message_groups').insert({
    wedding_id: wedding.id,
    name: formData.get('name') as string,
  })
  revalidatePath(`/wedding/${slug}/messagerie`)
}

export default async function MessageriePage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ groupe?: string }>
}) {
  const { slug } = await params
  const { groupe } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // Récupérer ou créer le groupe @tout le monde
  let { data: groups } = await supabase
    .from('message_groups')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at')

  // Créer @tout le monde si pas encore de groupes
  if (!groups || groups.length === 0) {
    await supabase.from('message_groups').insert({ wedding_id: wedding.id, name: '@tout le monde' })
    const { data: newGroups } = await supabase
      .from('message_groups')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('created_at')
    groups = newGroups
  }

  const activeGroupId = groupe ?? groups?.[0]?.id
  const activeGroup = groups?.find(g => g.id === activeGroupId) ?? groups?.[0]

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('group_id', activeGroupId)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col p-6">

        <div className="mb-4">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-4">
          Messagerie
        </h1>

        {/* Onglets groupes */}
        <div className="flex gap-2 flex-wrap mb-6">
          {groups?.map(g => (
            <a key={g.id} href={`/wedding/${slug}/messagerie?groupe=${g.id}`}
               className={`px-4 py-1.5 rounded-full text-sm transition ${g.id === activeGroup?.id ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              {g.name}
            </a>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white/80 rounded-3xl p-5 mb-4 space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto shadow-sm">
          {!messages || messages.length === 0 ? (
            <p className="text-center text-stone-400 italic mt-8"
               style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem' }}>
              Aucun message pour le moment…
            </p>
          ) : messages.map(msg => (
            <div key={msg.id} className="flex flex-col">
              <p className="text-xs text-[#4a5240] mb-0.5"
                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
                {msg.author_name}
              </p>
              <div className="bg-[#f5f0e8] rounded-2xl rounded-tl-none px-4 py-2 max-w-[85%]">
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.95rem' }}
                   className="text-stone-700">{msg.content}</p>
              </div>
              <p className="text-xs text-stone-300 mt-0.5"
                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>

        {/* Envoyer un message */}
        <form action={sendMessage} className="flex gap-2">
          <input type="hidden" name="group_id" value={activeGroup?.id ?? ''} />
          <input type="hidden" name="slug" value={slug} />
          <input type="text" name="author_name" placeholder="Votre prénom" required
            className="w-28 border border-stone-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
          <input type="text" name="content" placeholder="Votre message…" required
            className="flex-1 border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
          <button type="submit"
            className="bg-[#4a5240] text-white px-5 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            →
          </button>
        </form>

        {/* Créer un groupe (mariés) */}
        <div className="mt-6 bg-white/60 rounded-2xl p-4">
          <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1rem', fontStyle: 'italic' }}
             className="text-[#4a5240] mb-3">Créer un groupe</p>
          <form action={createGroup} className="flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="text" name="name" placeholder="Ex: @témoins, @babysitter…" required
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
            <button type="submit"
              className="border border-[#4a5240] text-[#4a5240] px-4 py-2 rounded-xl hover:bg-[#4a5240] hover:text-white transition text-sm"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Créer
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
