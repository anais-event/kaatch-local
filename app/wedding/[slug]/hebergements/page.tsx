import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import dynamic from 'next/dynamic'

const HotelSuggestions = dynamic(() => import('./HotelSuggestions'), { ssr: false })

async function addAccommodation(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  await supabase.from('accommodations').insert({
    wedding_id: wedding.id,
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || null,
    url: (formData.get('url') as string) || null,
    price_range: (formData.get('price_range') as string) || null,
    note: (formData.get('note') as string) || null,
  })

  revalidatePath(`/wedding/${slug}/hebergements`)
}

async function deleteAccommodation(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('accommodations').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${formData.get('slug') as string}/hebergements`)
}

export default async function HebergementsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: accommodations } = await supabase
    .from('accommodations')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-8">
          Hébergements
        </h1>

        {/* Hébergements épinglés manuellement */}
        {accommodations && accommodations.length > 0 && (
          <div className="mb-8">
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
                className="text-[#4a5240] mb-4">
              ⭐ Nos recommandations
            </h2>
            <div className="space-y-3">
              {accommodations.map(acc => (
                <div key={acc.id} className="bg-white/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                         className="text-stone-800">{acc.name}</p>
                      {acc.address && (
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                           className="text-stone-400 mt-1">📍 {acc.address}</p>
                      )}
                      {acc.price_range && (
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                           className="text-stone-400">💶 {acc.price_range}</p>
                      )}
                      {acc.note && (
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', fontStyle: 'italic' }}
                           className="text-stone-500 mt-2">{acc.note}</p>
                      )}
                      {acc.url && (
                        <a href={acc.url} target="_blank" rel="noopener noreferrer"
                           className="inline-block mt-2 text-xs text-[#4a5240] hover:underline"
                           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                          Réserver →
                        </a>
                      )}
                    </div>
                    <form action={deleteAccommodation}>
                      <input type="hidden" name="id" value={acc.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button type="submit" className="text-stone-300 hover:text-red-400 transition ml-3">✕</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions automatiques */}
        {wedding.location && (
          <div className="mb-8">
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
                className="text-[#4a5240] mb-1">
              🏨 À proximité
            </h2>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem' }}
               className="text-stone-400 mb-4">
              Hôtels trouvés automatiquement autour de "{wedding.location}"
            </p>
            <HotelSuggestions location={wedding.location} />
          </div>
        )}

        {/* Formulaire ajout manuel */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">
            Ajouter un hébergement
          </h2>
          <form action={addAccommodation} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="name" placeholder="Nom *" required
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <input type="text" name="price_range" placeholder="Prix (ex: 80-120€/nuit)"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            </div>
            <input type="text" name="address" placeholder="Adresse"
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <input type="url" name="url" placeholder="Lien de réservation (ex: https://...)"
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <textarea name="note" placeholder="Note (ex: Demandez la chambre côté jardin !)" rows={2}
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 resize-none"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              + Ajouter
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
