import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import MessagerieForm from './MessagerieForm'

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

async function deleteGroup(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  await supabase.from('message_groups').delete().eq('id', id)
  revalidatePath(`/wedding/${slug}/messagerie`)
}

async function joinGroup(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  const name = formData.get('member_name') as string
  if (!name?.trim()) return
  const { data: group } = await supabase.from('message_groups').select('members').eq('id', id).single()
  const members: string[] = group?.members ?? []
  if (!members.includes(name)) {
    await supabase.from('message_groups').update({ members: [...members, name] }).eq('id', id)
  }
  revalidatePath(`/wedding/${slug}/messagerie`)
}

async function leaveGroup(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  const name = formData.get('member_name') as string
  const { data: group } = await supabase.from('message_groups').select('members').eq('id', id).single()
  const members: string[] = (group?.members ?? []).filter((m: string) => m !== name)
  await supabase.from('message_groups').update({ members }).eq('id', id)
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

  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name')
    .eq('wedding_id', wedding.id)
    .order('first_name')

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
        <div className="flex gap-2 flex-wrap mb-4">
          {groups?.map(g => (
            <a key={g.id} href={`/wedding/${slug}/messagerie?groupe=${g.id}`}
               className={`px-4 py-1.5 rounded-lg text-sm transition ${g.id === activeGroup?.id ? 'bg-[#4a5240] text-white' : 'bg-white border border-stone-100 text-stone-500 hover:border-stone-200'}`}
               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              {g.name}
              {g.members?.length > 0 && (
                <span className="ml-1.5 opacity-60 text-xs">({g.members.length})</span>
              )}
            </a>
          ))}
        </div>

        {/* Panneau du groupe actif */}
        {activeGroup && activeGroup.name !== '@tout le monde' && (
          <div className="bg-white rounded-xl border border-stone-100 px-4 py-3 mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-stone-500 mb-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                Membres : {activeGroup.members?.length > 0 ? activeGroup.members.join(', ') : 'Aucun pour le moment'}
              </p>
              <form action={joinGroup} className="flex gap-2">
                <input type="hidden" name="id" value={activeGroup.id} />
                <input type="hidden" name="slug" value={slug} />
                <input type="text" name="member_name" placeholder="Rejoindre ce groupe…"
                  className="border border-stone-200 rounded-lg px-3 py-1 text-sm bg-white outline-none focus:border-[#4a5240]"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                <button type="submit"
                  className="px-3 py-1 rounded-lg bg-[#4a5240] text-white text-sm hover:bg-[#2d3228] transition"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  + Rejoindre
                </button>
              </form>
            </div>
            <form action={deleteGroup}>
              <input type="hidden" name="id" value={activeGroup.id} />
              <input type="hidden" name="slug" value={slug} />
              <button type="submit"
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-400 border border-red-200 hover:bg-red-100 transition text-sm"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                Supprimer ce groupe
              </button>
            </form>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 bg-white rounded-xl border border-stone-100 p-5 mb-4 space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto shadow-sm">
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
        <MessagerieForm
          groupId={activeGroup?.id ?? ''}
          slug={slug}
          guests={guests ?? []}
          sendMessage={sendMessage}
        />

        {/* Créer un groupe (mariés) */}
        <div className="mt-6 bg-white rounded-xl border border-stone-100 p-4">
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
