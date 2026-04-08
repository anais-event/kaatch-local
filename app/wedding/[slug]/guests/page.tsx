import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import GuestList from './GuestList'

async function addGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const wedding_id = formData.get('wedding_id') as string
  const first_name = formData.get('first_name') as string
  const nickname = formData.get('nickname') as string
  const email = formData.get('email') as string
  const telephone = formData.get('telephone') as string
  const relation = formData.get('relation') as string
  const slug = formData.get('slug') as string

  await supabase.from('guests').insert({
    wedding_id,
    first_name,
    nickname: nickname || null,
    email: email || null,
    telephone: telephone || null,
    relation: relation || null,
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

async function toggleRsvp(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const current = formData.get('rsvp_confirmed') === 'true'

  await supabase.from('guests').update({ rsvp_confirmed: !current }).eq('id', id)
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

  const confirmed = guests?.filter(g => g.rsvp_confirmed).length ?? 0
  const total = guests?.length ?? 0

  return (
    <div className="min-h-screen bg-rose-50 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-rose-600 hover:underline">← Retour au mariage</a>
        </div>

        <h1 className="text-3xl font-bold text-rose-700 mb-2">👥 Liste des invités</h1>
        <p className="text-gray-500 mb-8">
          {confirmed} confirmé{confirmed > 1 ? 's' : ''} sur {total} invité{total > 1 ? 's' : ''}
        </p>

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
            toggleRsvp={toggleRsvp}
            deleteGuest={deleteGuest}
            updateGuest={updateGuest}
          />
        </div>

      </div>
    </div>
  )
}
