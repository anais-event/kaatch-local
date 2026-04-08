import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import GuestList from './GuestList'

async function addGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string

  await supabase.from('guests').insert({
    wedding_id: formData.get('wedding_id') as string,
    first_name: formData.get('first_name') as string,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
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
    <div className="min-h-screen bg-rose-50 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-rose-600 hover:underline">← Retour au mariage</a>
        </div>

        <h1 className="text-3xl font-bold text-rose-700 mb-4">👥 Liste des invités</h1>

        {/* Compteurs RSVP */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{confirmed}</p>
            <p className="text-sm text-gray-500">✅ Confirmé{confirmed > 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{declined}</p>
            <p className="text-sm text-gray-500">❌ Décliné{declined > 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{pending}</p>
            <p className="text-sm text-gray-500">⏳ En attente</p>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter un invité</h2>
          <form action={addGuest} className="grid grid-cols-2 gap-3">
            <input type="hidden" name="wedding_id" value={wedding.id} />
            <input type="hidden" name="slug" value={slug} />
            <input
              type="text"
              name="first_name"
              placeholder="Prénom *"
              required
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <input
              type="text"
              name="nickname"
              placeholder="Surnom (si homonyme)"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <input
              type="tel"
              name="telephone"
              placeholder="Téléphone"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <select
              name="relation"
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="">Lien de parenté</option>
              {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              type="submit"
              className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              + Ajouter l'invité
            </button>
          </form>
        </div>

        {/* Liste des invités */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Invités ({total})</h2>
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
