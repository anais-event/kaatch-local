import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function addContact(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  await supabase.from('wedding_contacts').insert({
    wedding_id: wedding.id,
    name: formData.get('name') as string,
    role: formData.get('role') as string,
    note: (formData.get('note') as string) || null,
    visible_to_guests: formData.get('visible_to_guests') === 'on',
  })
  revalidatePath(`/wedding/${slug}/contacts`)
}

async function deleteContact(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('wedding_contacts').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${formData.get('slug') as string}/contacts`)
}

async function toggleVisibility(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const current = formData.get('current') === 'true'
  await supabase.from('wedding_contacts').update({ visible_to_guests: !current }).eq('id', id)
  revalidatePath(`/wedding/${formData.get('slug') as string}/contacts`)
}

const ROLES = ['Fleuriste', 'DJ', 'Traiteur', 'Photographe', 'Vidéaste', 'Témoin mariée', 'Témoin marié', 'Officiant', 'Coiffeur/se', 'Maquilleur/se', 'Transporteur', 'Babysitter', 'Lieu de réception', 'Autre (préciser)']

export default async function ContactsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: contacts } = await supabase
    .from('wedding_contacts')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('role')

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-2">Contacts</h1>
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
           className="text-stone-400 mb-8">
          Les contacts visibles aux invités pourront leur envoyer un message via la plateforme — sans révéler leur numéro.
        </p>

        {/* Formulaire ajout */}
        <div className="bg-white/80 rounded-3xl p-6 mb-8 shadow-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">Ajouter un contact</h2>
          <form action={addContact} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="name" placeholder="Nom *" required
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <select name="role"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <input type="text" name="note" placeholder="Note (ex: disponible le jour J pour les urgences)"
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="visible_to_guests" defaultChecked
                className="w-4 h-4 accent-[#4a5240]" />
              <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                    className="text-stone-600">
                Visible aux invités (ils pourront lui envoyer un message)
              </span>
            </label>
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-2.5 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              + Ajouter
            </button>
          </form>
        </div>

        {/* Liste contacts */}
        {contacts && contacts.length > 0 && (
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-white/80 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
                     className="text-stone-400 uppercase mb-1">{contact.role}</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                     className="text-[#2d3228]">{contact.name}</p>
                  {contact.note && (
                    <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.82rem' }}
                       className="text-stone-500 mt-1">{contact.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <form action={toggleVisibility}>
                    <input type="hidden" name="id" value={contact.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="current" value={String(contact.visible_to_guests)} />
                    <button type="submit"
                      className={`text-xs px-3 py-1 rounded-full transition ${contact.visible_to_guests ? 'bg-[#4a5240]/10 text-[#4a5240]' : 'bg-stone-100 text-stone-400'}`}
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                      {contact.visible_to_guests ? '👁️ Visible' : '🙈 Caché'}
                    </button>
                  </form>
                  <form action={deleteContact}>
                    <input type="hidden" name="id" value={contact.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button type="submit" className="text-stone-300 hover:text-red-400 transition text-lg">×</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
