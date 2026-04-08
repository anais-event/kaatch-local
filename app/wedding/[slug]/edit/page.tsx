import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

async function updateWedding(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string

  const file = formData.get('cover_image') as File

  let cover_image_url: string | undefined

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const path = `${slug}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('wedding-covers')
      .upload(path, file, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('wedding-covers')
        .getPublicUrl(path)
      cover_image_url = urlData.publicUrl
    }
  }

  await supabase
    .from('weddings')
    .update({
      date,
      location,
      ...(cover_image_url ? { cover_image_url } : {}),
    })
    .eq('slug', slug)

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

        <form action={updateWedding} encType="multipart/form-data" className="space-y-6">
          <input type="hidden" name="slug" value={slug} />

          {/* Photo de couverture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Photo de couverture</label>
            {wedding.cover_image_url && (
              <img
                src={wedding.cover_image_url}
                alt="Couverture actuelle"
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            <input
              type="file"
              name="cover_image"
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200"
            />
          </div>

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
