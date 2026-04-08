import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function WeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!wedding) {
    return <div className="p-8">Mariage introuvable</div>
  }

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Hero / photo de couverture */}
      <div className="relative w-full h-72 bg-rose-200 overflow-hidden">
        {wedding.cover_image_url ? (
          <img
            src={wedding.cover_image_url}
            alt="Photo de couverture"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-300 text-6xl">
            💍
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl font-bold drop-shadow">{wedding.name}</h1>
          <p className="mt-2 text-lg opacity-90">{wedding.theme}</p>
        </div>
      </div>

      {/* Boutons actions */}
      <div className="max-w-2xl mx-auto px-8 pt-6 flex gap-4 flex-wrap">
        <a href={`/wedding/${slug}/edit`} className="bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-rose-700 transition">
          ✏️ Modifier les infos
        </a>
        <a href={`/wedding/${slug}/guests`} className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition">
          👥 Gérer les invités
        </a>
      </div>

      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-rose-600 mb-2">📅 Date</h2>
          <p className="text-gray-700 text-lg">
            {wedding.date
              ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : 'Date à confirmer'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-rose-600 mb-2">📍 Lieu</h2>
          <p className="text-gray-700 text-lg">{wedding.location || 'Lieu à confirmer'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-rose-600 mb-2">📋 Programme</h2>
          <p className="text-gray-500 italic">Programme à venir...</p>
        </div>
      </div>
    </div>
  )
}
