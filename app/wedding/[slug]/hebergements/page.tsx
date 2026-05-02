import { createSupabaseServerClient } from '@/lib/supabase-server'
import PageIntro from '../PageIntro'
import { revalidatePath } from 'next/cache'

const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hôtel' },
  { value: 'gite', label: 'Gîte / Chambre d\'hôtes' },
  { value: 'airbnb', label: 'Airbnb / Location' },
  { value: 'camping', label: 'Camping' },
  { value: 'autre', label: 'Autre' },
]

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
    type: (formData.get('type') as string) || null,
  })

  revalidatePath(`/mariage/${slug}/hebergements`)
}

async function deleteAccommodation(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('accommodations').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${formData.get('slug') as string}/hebergements`)
}

const TYPE_ICONS: Record<string, string> = {
  hotel: '🏨',
  gite: '🏡',
  airbnb: '🏠',
  camping: '⛺',
  autre: '📍',
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
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.5rem' }}
            className="text-[#2d3228] mb-4">
          Hébergements
        </h1>
        <PageIntro
          what="Partagez vos coups de cœur — hôtels, gîtes, airbnb… — pour que vos invités puissent se loger facilement à proximité."
          how="Ajoutez chaque hébergement avec son lien de réservation et votre note personnelle."
          guests="Vos invités verront vos recommandations avec les liens directs pour réserver."
        />

        {/* Formulaire d'ajout */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-sm mb-8">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#4a5240] mb-4">
            Ajouter un coup de cœur
          </h2>
          <form action={addAccommodation} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="name" placeholder="Nom *" required
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <select name="type"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-500"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
                <option value="">Type…</option>
                {ACCOMMODATION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <input type="text" name="address" placeholder="Adresse ou ville"
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <div className="grid grid-cols-2 gap-3">
              <input type="url" name="url" placeholder="Lien (booking, airbnb…)"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <input type="text" name="price_range" placeholder="Prix indicatif (ex: 80-120€)"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            </div>
            <textarea name="note" placeholder="Votre note (ex: Super pour les familles, à 5 min à pied…)" rows={2}
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 resize-none"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              + Ajouter
            </button>
          </form>
        </div>

        {/* Liste des hébergements */}
        {accommodations && accommodations.length > 0 ? (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
                className="text-[#4a5240] mb-4">
              ⭐ Vos coups de cœur ({accommodations.length})
            </h2>
            <div className="space-y-3">
              {accommodations.map(acc => (
                <div key={acc.id} className="bg-white/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {acc.type && (
                          <span className="text-base">{TYPE_ICONS[acc.type] ?? '📍'}</span>
                        )}
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}
                           className="text-stone-800">{acc.name}</p>
                        {acc.type && (
                          <span className="text-[10px] bg-[#f5f0e8] text-[#4a5240] px-2 py-0.5 rounded-full"
                                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                            {ACCOMMODATION_TYPES.find(t => t.value === acc.type)?.label ?? acc.type}
                          </span>
                        )}
                      </div>
                      {acc.address && (
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                           className="text-stone-400 mt-1">📍 {acc.address}</p>
                      )}
                      {acc.price_range && (
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                           className="text-stone-400">💶 {acc.price_range}</p>
                      )}
                      {acc.note && (
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                           className="text-stone-500 mt-2">"{acc.note}"</p>
                      )}
                      {acc.url && (
                        <a href={acc.url} target="_blank" rel="noopener noreferrer"
                           className="inline-block mt-2 text-xs text-[#4a5240] hover:underline"
                           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                          Voir le lien →
                        </a>
                      )}
                    </div>
                    <form action={deleteAccommodation}>
                      <input type="hidden" name="id" value={acc.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button type="submit" className="text-stone-300 hover:text-red-400 transition ml-3 text-lg">✕</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}
               className="text-stone-400">
              Aucun hébergement ajouté pour l'instant
            </p>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
               className="text-stone-300 mt-2">
              Utilisez le formulaire ci-dessus pour partager vos coups de cœur avec vos invités.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
