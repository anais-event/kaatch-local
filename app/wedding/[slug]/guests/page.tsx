import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function addGuest(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const wedding_id = formData.get('wedding_id') as string
  const first_name = formData.get('first_name') as string
  const nickname = formData.get('nickname') as string
  const email = formData.get('email') as string
  const telephone = formData.get('telephone') as string
  const slug = formData.get('slug') as string

  await supabase
    .from('guests')
    .insert({ wedding_id, first_name, nickname, email: email || null, telephone: telephone || null })

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

  await supabase
    .from('guests')
    .update({ rsvp_confirmed: !current })
    .eq('id', id)

  revalidatePath(`/wedding/${slug}/guests`)
}

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
            <button
              type="submit"
              className="col-span-2 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              + Ajouter l'invité
            </button>
          </form>
        </div>

        {/* Liste des invités */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Invités ({total})</h2>

          {total === 0 ? (
            <p className="text-gray-500 italic text-center py-8">Aucun invité pour le moment 🕊️</p>
          ) : (
            <div className="space-y-3">
              {guests?.map((guest) => (
                <div
                  key={guest.id}
                  className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-gray-800">
                      {guest.first_name}
                      {guest.nickname && <span className="text-gray-400 font-normal text-sm ml-1">({guest.nickname})</span>}
                    </p>
                    {guest.email && <p className="text-sm text-gray-400">✉️ {guest.email}</p>}
                    {guest.telephone && <p className="text-sm text-gray-400">📞 {guest.telephone}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Bouton RSVP */}
                    <form action={toggleRsvp}>
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="rsvp_confirmed" value={String(guest.rsvp_confirmed)} />
                      <button
                        type="submit"
                        className={`text-sm px-3 py-1 rounded-full transition-colors ${
                          guest.rsvp_confirmed
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {guest.rsvp_confirmed ? '✅ Confirmé' : '⏳ En attente'}
                      </button>
                    </form>

                    {/* Bouton supprimer */}
                    <form action={deleteGuest}>
                      <input type="hidden" name="id" value={guest.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
