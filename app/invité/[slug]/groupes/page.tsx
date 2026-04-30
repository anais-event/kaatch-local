import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const SUGGESTED_GROUPS = [
  { name: '👶 Babysitting', desc: 'Organiser la garde des enfants' },
  { name: '🎁 Cadeaux aux mariés', desc: 'Coordonner les cadeaux' },
  { name: '🎤 Surprises & Flashmob', desc: 'Discours, jeux, chorégraphies…' },
  { name: '🚗 Covoiturage', desc: 'Organiser les trajets' },
  { name: '💃 Afterparty', desc: 'La suite de la fête' },
]

async function createGroup(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const author = formData.get('author') as string

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  const { data: existing } = await supabase
    .from('message_groups')
    .select('id')
    .eq('wedding_id', wedding.id)
    .eq('name', name)
    .single()

  if (!existing) {
    await supabase.from('message_groups').insert({
      wedding_id: wedding.id,
      name,
      created_by: author,
    })
  }

  revalidatePath(`/invité/${slug}/groupes`)
}

async function sendMessage(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const group_id = formData.get('group_id') as string
  const content = formData.get('content') as string
  const author = formData.get('author') as string

  await supabase.from('messages').insert({ group_id, content, author_name: author })
  revalidatePath(`/invité/${slug}/groupes`)
}

export default async function GuestGroupesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  if (!guestCookie) redirect(`/invité/${slug}`)

  const guest = JSON.parse(guestCookie.value)
  const guestName = `${guest.firstName} ${guest.lastName}`

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: groups } = await supabase
    .from('message_groups')
    .select('id, name, created_by, messages(id, content, author_name, created_at)')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="mb-6">
          <a href={`/invité/${slug}`} className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            ← Retour
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.5rem' }}
            className="text-[#2d3228] mb-8">Groupes</h1>

        {/* Groupes existants */}
        <div className="space-y-4 mb-10">
          {(groups ?? []).map(group => {
            const msgs = (group.messages as { id: string; content: string; author_name: string; created_at: string }[]) ?? []
            const last = msgs[msgs.length - 1]
            return (
              <div key={group.id} className="bg-white/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}
                      className="text-[#2d3228]">{group.name}</h3>
                  <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                    {msgs.length} message{msgs.length > 1 ? 's' : ''}
                  </span>
                </div>
                {last && (
                  <p className="text-sm text-stone-500 mb-4" style={{ fontWeight: 300 }}>
                    <span className="text-[#4a5240]">{last.author_name}</span> : {last.content}
                  </p>
                )}
                <form action={sendMessage} className="flex gap-2">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="group_id" value={group.id} />
                  <input type="hidden" name="author" value={guestName} />
                  <input type="text" name="content" placeholder="Écrire un message…" required
                    className="flex-1 border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
                    style={{ fontWeight: 300 }} />
                  <button type="submit"
                    className="bg-[#4a5240] text-white px-4 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm"
                    style={{ fontWeight: 300 }}>
                    →
                  </button>
                </form>
              </div>
            )
          })}
          {(!groups || groups.length === 0) && (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
               className="text-stone-400 text-center py-6">
              Aucun groupe pour le moment…
            </p>
          )}
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#4a5240] mb-4">Créer un groupe</h2>
          <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mb-4">
            Suggestions :
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_GROUPS.map(sg => (
              <form key={sg.name} action={createGroup}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="name" value={sg.name} />
                <input type="hidden" name="author" value={guestName} />
                <button type="submit"
                  className="px-4 py-2 rounded-full border border-stone-200 bg-white hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm text-stone-600"
                  style={{ fontWeight: 300 }}>
                  {sg.name}
                </button>
              </form>
            ))}
          </div>

          <form action={createGroup} className="flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="author" value={guestName} />
            <input type="text" name="name" placeholder="Nom du groupe personnalisé…"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
              style={{ fontWeight: 300 }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-5 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm"
              style={{ fontWeight: 300 }}>
              Créer
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
