import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import GuestList from './GuestList'
import ImportGuests from './ImportGuests'

async function addGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string

  await supabase.from('guests').insert({
    wedding_id: formData.get('wedding_id') as string,
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
    guest_type: (formData.get('guest_type') as string) || 'adulte',
  })

  revalidatePath(`/wedding/${slug}/guests`)
}

async function deleteGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string

  await supabase.from('guests').delete().eq('id', id)
  revalidatePath(`/wedding/${slug}/guests`)
}

async function setRsvp(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const rsvp_status = formData.get('rsvp_status') as string

  await supabase.from('guests').update({ rsvp_status }).eq('id', id)
  revalidatePath(`/wedding/${slug}/guests`)
}

async function updateGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string

  await supabase.from('guests').update({
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
  }).eq('id', id)

  revalidatePath(`/wedding/${slug}/guests`)
}

const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

export default async function GuestsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) {
    return <div className="p-8">Mariage introuvable 😢</div>
  }

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const total = guests?.length ?? 0
  const confirmed = guests?.filter(g => g.rsvp_status === 'confirme').length ?? 0
  const declined = guests?.filter(g => g.rsvp_status === 'decline').length ?? 0
  const pending = guests?.filter(g => g.rsvp_status === 'en_attente').length ?? 0

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`}
             className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-6">
          Liste des invités
        </h1>

        {/* Compteurs RSVP */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#4a5240]" style={{ fontFamily: 'var(--font-cormorant)' }}>{confirmed}</p>
            <p className="text-xs text-stone-400 uppercase tracking-wide mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>✅ Confirmé{confirmed > 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-stone-400" style={{ fontFamily: 'var(--font-cormorant)' }}>{pending}</p>
            <p className="text-xs text-stone-400 uppercase tracking-wide mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>⏳ En attente</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400" style={{ fontFamily: 'var(--font-cormorant)' }}>{declined}</p>
            <p className="text-xs text-stone-400 uppercase tracking-wide mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>❌ Décliné{declined > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Import Excel */}
        <ImportGuests weddingId={wedding.id} slug={slug} />

        {/* Formulaire d'ajout */}
        <div className="bg-white/80 rounded-3xl p-6 mb-8">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">Ajouter un invité</h2>
          <form action={addGuest} className="grid grid-cols-2 gap-3">
            <input type="hidden" name="wedding_id" value={wedding.id} />
            <input type="hidden" name="slug" value={slug} />
            {[
              { name: 'first_name', placeholder: 'Prénom *', required: true, type: 'text' },
              { name: 'last_name', placeholder: 'Nom *', required: true, type: 'text' },
              { name: 'nickname', placeholder: 'Surnom (optionnel)', required: false, type: 'text' },
              { name: 'email', placeholder: 'Email', required: false, type: 'email' },
              { name: 'telephone', placeholder: 'Téléphone', required: false, type: 'tel' },
            ].map(f => (
              <input key={f.name} type={f.type} name={f.name} placeholder={f.placeholder} required={f.required}
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            ))}
            <select name="relation"
              className="border border-stone-200 rounded-xl px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
              <option value="">Lien de parenté</option>
              {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select name="guest_type"
              className="border border-stone-200 rounded-xl px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
              <option value="adulte">🧑 Adulte</option>
              <option value="enfant">👶 Enfant</option>
              <option value="animal">🐾 Animal</option>
            </select>
            <button type="submit"
              className="bg-[#4a5240] text-white px-6 py-2 rounded-xl hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              + Ajouter
            </button>
          </form>
        </div>

        {/* Message enfants/animaux */}
        <div className="bg-[#4a5240]/10 border border-[#4a5240]/20 rounded-2xl px-5 py-4 mb-6 flex gap-3 items-start">
          <span className="text-xl">😉</span>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-[#4a5240]">
            N'oublie pas d'ajouter les enfants et animaux à ta liste pour pouvoir les retrouver facilement sur les photos !
          </p>
        </div>

        {/* Liste des invités */}
        <div className="bg-white/80 rounded-3xl p-6">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">Invités ({total})</h2>
          <GuestList
            guests={guests ?? []}
            slug={slug}
            setRsvp={setRsvp}
            deleteGuest={deleteGuest}
            updateGuest={updateGuest}
          />
        </div>

      </div>
    </div>
  )
}
