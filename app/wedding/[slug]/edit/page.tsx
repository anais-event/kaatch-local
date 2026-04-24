import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

async function updateWedding(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string
  const name = formData.get('name') as string

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

  const couple_message = formData.get('couple_message') as string
  const cover_position_y = parseInt(formData.get('cover_position_y') as string) || 50

  await supabase
    .from('weddings')
    .update({
      date,
      location,
      name,
      couple_message: couple_message || null,
      cover_position_y,
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
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8">
      <div className="w-full max-w-lg">

        <div className="mb-6">
          <a href={`/wedding/${slug}`}
             className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour
          </a>
        </div>

        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '2rem' }}
              className="text-[#2d3228]">
            Modifier les infos
          </h1>
        </div>

        <div className="bg-white/80 rounded-3xl shadow-sm p-8">
          <form action={updateWedding} className="space-y-6">
            <input type="hidden" name="slug" value={slug} />

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Le mariage de
              </label>
              <input
                type="text"
                name="name"
                defaultValue={wedding.name || ''}
                placeholder="Ex : Sophie & Thomas"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Photo de couverture
              </label>
              {wedding.cover_image_url && (
                <img src={wedding.cover_image_url} alt="Couverture actuelle"
                     className="w-full h-40 object-cover rounded-xl mb-3"
                     style={{ objectPosition: `center ${wedding.cover_position_y ?? 50}%` }} />
              )}
              <input
                type="file"
                name="cover_image"
                accept="image/*"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-500 bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-[#f5f0e8] file:text-[#4a5240] hover:file:bg-stone-200 transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
              />
              {wedding.cover_image_url && (
                <div className="mt-3">
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.1em' }}
                     className="text-stone-400 uppercase mb-1">
                    Position verticale de la photo
                  </p>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300">Haut</span>
                    <input
                      type="range"
                      name="cover_position_y"
                      min={0}
                      max={100}
                      defaultValue={wedding.cover_position_y ?? 50}
                      className="flex-1 accent-[#4a5240]"
                    />
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300">Bas</span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 mt-1">
                    Glissez pour recadrer l'image — sauvegardez pour voir le résultat
                  </p>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={wedding.date || ''}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Lieu
              </label>
              <input
                type="text"
                name="location"
                defaultValue={wedding.location || ''}
                placeholder="Ex : Château de Versailles"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Mot des mariés <span className="normal-case text-stone-300">(affiché sur le faire-part)</span>
              </label>
              <textarea
                name="couple_message"
                defaultValue={wedding.couple_message || ''}
                rows={5}
                placeholder="Ex : Nous sommes fous de joie de vous inviter à partager ce jour si important pour nous..."
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white resize-none"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.7 }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.85rem' }}
              >
                Enregistrer
              </button>
              <a
                href={`/wedding/${slug}`}
                className="flex-1 bg-stone-100 text-stone-500 py-3 rounded-full text-center hover:bg-stone-200 transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
              >
                Annuler
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
