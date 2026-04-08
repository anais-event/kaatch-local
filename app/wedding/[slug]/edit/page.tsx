import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

async function updateWedding(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string

  console.log('🔧 UPDATE slug:', slug)
  console.log('🔧 date:', date)
  console.log('🔧 location:', location)

  const { data, error } = await supabase
    .from('weddings')
    .update({ date, location })
    .eq('slug', slug)
    .select()

  console.log('✅ data:', data)
  console.log('❌ error:', error)

  redirect(`/wedding/${slug}`)
}

export default async function EditWedding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!wedding) {
    return <div className="p-8">Mariage introuvable 😢</div>
  }

  return (
    <div className="min-h-screen bg-rose-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-rose-700 mb-6">✏️ Modifier les infos</h1>

        <form action={updateWedding} className="space-y-6">
          <input type="hidden" name="slug" value={slug} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Date</label>
            <input
              type="date"
              name="date"
              defaultValue={wedding.date || ''}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📍 Lieu</label>
            <input
              type="text"
              name="location"
              defaultValue={wedding.location || ''}
              placeholder="Ex: Château de Versailles"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-rose-600 text-white py-3 rounded-full font-medium hover:bg-rose-700 transition"
            >
              Enregistrer
            </button>
            <a
              href={`/wedding/${slug}`}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-medium text-center hover:bg-gray-300 transition"
            >
              Annuler
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
