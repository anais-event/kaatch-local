import { createSupabaseServerClient } from '@/lib/supabase-server'

async function addGuest(formData: FormData) {
  'use server'
  
  const supabase = await createSupabaseServerClient()
  const wedding_id = formData.get('wedding_id') as string
  const first_name = formData.get('first_name') as string
  const nickname = formData.get('nickname') as string

  await supabase
    .from('guests')
    .insert({ wedding_id, first_name, nickname })

  // Pas de redirect, la page se recharge automatiquement
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

  return (
    <div className="min-h-screen bg-rose-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-rose-600 hover:underline">← Retour au mariage</a>
        </div>

        <h1 className="text-3xl font-bold text-rose-700 mb-8">👥 Liste des invités</h1>

        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter un invité</h2>
          <form action={addGuest} className="flex gap-4">
            <input type="hidden" name="wedding_id" value={wedding.id} />
            <input
              type="text"
              name="first_name"
              placeholder="Prénom"
              required
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <input
              type="text"
              name="nickname"
              placeholder="Surnom (si homonyme)"
              required
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              type="submit"
              className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
            >
              Ajouter
            </button>
          </form>
        </div>

        {/* Liste des invités */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Invités ({guests?.length || 0})
          </h2>
          
          {!guests || guests.length === 0 ? (
            <p className="text-gray-500 italic">Aucun invité pour le moment</p>
          ) : (
            <div className="space-y-3">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{guest.first_name}</p>
                    <p className="text-sm text-gray-500">Surnom : {guest.nickname}</p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {guest.rsvp_confirmed ? '✅ Confirmé' : '⏳ En attente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}