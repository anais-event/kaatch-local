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
      <div className="bg-white shadow-sm py-12 text-center">
        <h1 className="text-4xl font-bold text-rose-700">{wedding.name}</h1>
        <p className="mt-2 text-gray-500 text-lg">Thème : {wedding.theme}</p>
      </div>

      <div className="max-w-2xl mx-auto px-8 pt-4 flex gap-4">
        <a href={`/wedding/${slug}/edit`} className="bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-rose-700 transition">
          Modifier les infos
        </a>
        <a href={`/wedding/${slug}/guests`} className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition">
          Gérer les invités
        </a>
      </div>

      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-rose-600 mb-2">Date</h2>
          <p className="text-gray-700 text-lg">
            {wedding.date ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date à confirmer'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-rose-600 mb-2">Lieu</h2>
          <p className="text-gray-700 text-lg">{wedding.location || 'Lieu à confirmer'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-rose-600 mb-2">Programme</h2>
          <p className="text-gray-500 italic">Programme à venir...</p>
        </div>
      </div>
    </div>
  )
}