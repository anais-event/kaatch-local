import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const SUGGESTED_GROUPS = [
  '@EntreTemoinsMariee',
  '@EntreTemoinsMarie',
  '@Covoiturage',
  '@Cadeaux',
  '@Afterparty',
  '@Babysitting',
  '@Surprises',
]

async function ensureToutLeMonde(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, weddingId: string) {
  const { data: existing } = await supabase
    .from('message_groups')
    .select('id')
    .eq('wedding_id', weddingId)
    .eq('name', '@ToutLeMonde')
    .single()

  if (!existing) {
    await supabase.from('message_groups').insert({
      wedding_id: weddingId,
      name: '@ToutLeMonde',
      created_by: 'system',
    })
  }
}

async function createGroup(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const author = formData.get('author') as string
  if (!name.trim()) return

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  // Vérifier si le groupe existe déjà
  const { data: existing } = await supabase
    .from('message_groups')
    .select('id')
    .eq('wedding_id', wedding.id)
    .eq('name', name)
    .single()

  if (existing) {
    redirect(`/invite/${slug}/groupes/${existing.id}`)
  }

  // Créer le groupe
  const { data: newGroup } = await supabase.from('message_groups').insert({
    wedding_id: wedding.id,
    name,
    created_by: author || 'invité',
  }).select('id').single()

  // Notif dans @ToutLeMonde
  const { data: general } = await supabase
    .from('message_groups')
    .select('id')
    .eq('wedding_id', wedding.id)
    .eq('name', '@ToutLeMonde')
    .single()

  if (general) {
    await supabase.from('messages').insert({
      group_id: general.id,
      wedding_id: wedding.id,
      content: `📢 ${author || 'Quelqu\'un'} vient de créer le groupe ${name}. Rejoignez-le !`,
      author_name: 'Kaatch',
    })
  }

  if (newGroup) {
    redirect(`/invite/${slug}/groupes/${newGroup.id}`)
  }
  revalidatePath(`/invite/${slug}/groupes`)
}

export default async function GuestGroupesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)

  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: "", lastName: "", id: null }
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ')

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // S'assurer que @ToutLeMonde existe
  await ensureToutLeMonde(supabase, wedding.id)

  const { data: groups } = await supabase
    .from('message_groups')
    .select('id, name, created_by')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  // Dernier message par groupe
  const groupsWithLastMsg = await Promise.all(
    (groups ?? []).map(async (group) => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('content, author_name, created_at')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false })
        .limit(1)
      return { ...group, lastMsg: msgs?.[0] ?? null }
    })
  )

  // @ToutLeMonde en premier
  const sorted = [
    ...groupsWithLastMsg.filter(g => g.name === '@ToutLeMonde'),
    ...groupsWithLastMsg.filter(g => g.name !== '@ToutLeMonde'),
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-24">

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-1">Messagerie</h1>
        <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mb-6">
          Les groupes sont ouverts à tous les invités.
        </p>

        {/* Liste des groupes */}
        <div className="space-y-2 mb-10">
          {sorted.map(group => {
            const isGeneral = group.name === '@ToutLeMonde'
            return (
              <a key={group.id} href={`/invite/${slug}/groupes/${group.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-stone-100 px-4 py-3.5 hover:border-[#4a5240]/30 hover:shadow-sm transition-all cursor-pointer">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  isGeneral ? 'bg-[#4a5240] text-white' : 'bg-[#4a5240]/10 text-[#4a5240]'
                }`}
                  style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem' }}>
                  {isGeneral ? '✦' : group.name.replace('@', '').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 style={{ fontWeight: isGeneral ? 500 : 400, fontSize: '0.9rem' }}
                        className={`truncate ${isGeneral ? 'text-[#4a5240]' : 'text-stone-700'}`}>
                      {group.name}
                    </h3>
                    {group.lastMsg && (
                      <span className="text-[10px] text-stone-300 shrink-0" style={{ fontWeight: 300 }}>
                        {new Date(group.lastMsg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {group.lastMsg ? (
                    <p className="text-xs text-stone-400 truncate mt-0.5" style={{ fontWeight: 300 }}>
                      <span className="text-stone-500">{group.lastMsg.author_name}</span> · {group.lastMsg.content}
                    </p>
                  ) : (
                    <p className="text-xs text-stone-300 mt-0.5 italic" style={{ fontWeight: 300 }}>
                      Aucun message encore…
                    </p>
                  )}
                </div>
                <span className="text-stone-300 text-sm shrink-0">›</span>
              </a>
            )
          })}
        </div>

        {/* Créer un groupe */}
        <div className="bg-white rounded-xl border border-stone-100 p-5">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.2rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-1">Créer un groupe</h2>
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mb-4">
            Donnez-lui un titre — tous les invités et les mariés seront notifiés dans <strong>@ToutLeMonde</strong>.
            Pour les surprises, choisissez un nom discret&nbsp;: <span className="text-stone-500">@Projet-Secret</span>, <span className="text-stone-500">@EntreNous</span>…
          </p>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_GROUPS.map(sg => (
              <form key={sg} action={createGroup}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="name" value={sg} />
                <input type="hidden" name="author" value={guestName} />
                <button type="submit"
                  className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-[#4a5240] hover:text-[#4a5240] transition text-xs text-stone-500 cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  {sg}
                </button>
              </form>
            ))}
          </div>

          <form action={createGroup} className="flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="author" value={guestName} />
            <input type="text" name="name" placeholder="@MonGroupe…"
              className="flex-1 border border-stone-200 rounded-lg px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
              style={{ fontWeight: 300 }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-4 py-2 rounded-lg hover:bg-[#2d3228] transition text-sm cursor-pointer"
              style={{ fontWeight: 300 }}>
              Créer
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
