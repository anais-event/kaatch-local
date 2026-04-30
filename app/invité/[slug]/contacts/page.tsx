import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function sendMessage(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const contact_id = formData.get('contact_id') as string
  const sender = formData.get('sender') as string
  const content = formData.get('content') as string

  // Trouver ou créer un groupe dédié à ce contact
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  const { data: contact } = await supabase.from('wedding_contacts').select('name').eq('id', contact_id).single()
  if (!contact) return

  const groupName = `📩 Message à ${contact.name}`
  let { data: group } = await supabase
    .from('message_groups')
    .select('id')
    .eq('wedding_id', wedding.id)
    .eq('name', groupName)
    .single()

  if (!group) {
    const { data: newGroup } = await supabase.from('message_groups').insert({
      wedding_id: wedding.id,
      name: groupName,
      created_by: sender,
    }).select('id').single()
    group = newGroup
  }

  if (group) {
    await supabase.from('messages').insert({
      group_id: group.id,
      content: `[De ${sender}] ${content}`,
      author_name: sender,
    })
  }

  revalidatePath(`/invité/${slug}/contacts`)
}

export default async function GuestContactsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  if (!guestCookie) redirect(`/invité/${slug}`)

  const guest = JSON.parse(guestCookie.value)
  const guestName = `${guest.firstName} ${guest.lastName}`

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: contacts } = await supabase
    .from('wedding_contacts')
    .select('*')
    .eq('wedding_id', wedding.id)
    .eq('visible_to_guests', true)
    .order('role')

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="mb-6">
          <a href={`/invité/${slug}`} className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            ← Retour
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.5rem' }}
            className="text-[#2d3228] mb-8">Contacts</h1>

        {(!contacts || contacts.length === 0) ? (
          <div className="p-8 rounded-2xl bg-white/80 text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
               className="text-stone-400">Aucun contact disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-white/80 rounded-2xl p-5 shadow-sm">
                <div className="mb-3">
                  <p style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
                     className="text-stone-400 uppercase mb-1">{contact.role}</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem' }}
                      className="text-[#2d3228]">{contact.name}</h3>
                  {contact.note && (
                    <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-500 mt-1">
                      {contact.note}
                    </p>
                  )}
                </div>
                <form action={sendMessage} className="flex gap-2">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="contact_id" value={contact.id} />
                  <input type="hidden" name="sender" value={guestName} />
                  <input type="text" name="content" placeholder={`Écrire à ${contact.name}…`}
                    className="flex-1 border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
                    style={{ fontWeight: 300 }} />
                  <button type="submit"
                    className="bg-[#4a5240] text-white px-4 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm"
                    style={{ fontWeight: 300 }}>
                    Envoyer
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
