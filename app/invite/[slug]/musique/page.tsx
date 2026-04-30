import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const MOMENTS = [
  { key: 'ceremonie', label: '💒 Cérémonie', desc: 'Entrée, échange des vœux, sortie' },
  { key: 'vin_honneur', label: '🥂 Vin d\'honneur', desc: 'Ambiance cocktail, bulles et bonne humeur' },
  { key: 'diner', label: '🍽️ Dîner', desc: 'Fond sonore pendant le repas' },
  { key: 'soiree', label: '🎉 Soirée', desc: 'Piste de danse, énergie, fête' },
]

export default async function MusiqueGuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: '', id: null }

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: songs } = await supabase
    .from('playlist_songs')
    .select('id, title, artist, moment, notes, suggested_by')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  async function suggestSong(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const { data: w } = await supabase.from('weddings').select('id').eq('slug', slug).single()
    if (!w) return
    const title = (formData.get('title') as string)?.trim()
    if (!title) return
    await supabase.from('playlist_songs').insert({
      wedding_id: w.id,
      title,
      artist: (formData.get('artist') as string)?.trim() || null,
      moment: (formData.get('moment') as string) || null,
      notes: (formData.get('notes') as string)?.trim() || null,
      suggested_by: guest.firstName || 'Invité',
    })
    revalidatePath(`/invite/${slug}/musique`)
  }

  const songsByMoment = MOMENTS.map(m => ({
    ...m,
    songs: (songs ?? []).filter(s => s.moment === m.key),
  }))
  const noMoment = (songs ?? []).filter(s => !s.moment)

  return (
    <div className="min-h-screen bg-[#f5f0e8] pt-20 pb-32 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🎵</p>
          <h1 className="text-3xl text-[#2d3228] mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            Suggestions musicales
          </h1>
          <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
            Proposez une chanson pour la journée
          </p>
        </div>

        {/* Formulaire suggestion */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8">
          <p className="text-sm text-stone-600 mb-4" style={{ fontWeight: 400 }}>
            ✦ Suggérer une chanson
          </p>
          <form action={suggestSong} className="space-y-3">
            <input
              name="title"
              required
              placeholder="Titre de la chanson *"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4a5240]"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            />
            <input
              name="artist"
              placeholder="Artiste (optionnel)"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4a5240]"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            />
            <select
              name="moment"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-600 focus:outline-none focus:border-[#4a5240] bg-white"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            >
              <option value="">Pour quel moment ? (optionnel)</option>
              {MOMENTS.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
            <textarea
              name="notes"
              placeholder="Un petit mot ? (optionnel)"
              rows={2}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4a5240] resize-none"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            />
            <button
              type="submit"
              className="w-full bg-[#4a5240] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition"
              style={{ fontWeight: 400 }}
            >
              Suggérer cette chanson
            </button>
          </form>
        </div>

        {/* Playlist par moment */}
        {(songs ?? []).length > 0 && (
          <div className="space-y-6">
            <p className="text-xs text-stone-400 tracking-widest uppercase text-center" style={{ fontWeight: 300 }}>
              Suggestions des invités
            </p>

            {songsByMoment.filter(m => m.songs.length > 0).map(m => (
              <div key={m.key}>
                <p className="text-sm text-[#4a5240] mb-2" style={{ fontWeight: 400 }}>{m.label}</p>
                <div className="space-y-2">
                  {m.songs.map(s => (
                    <div key={s.id} className="bg-white rounded-xl px-4 py-3 border border-stone-100 flex items-center gap-3">
                      <span className="text-xl">🎵</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-700 truncate" style={{ fontWeight: 400 }}>{s.title}</p>
                        {s.artist && <p className="text-xs text-stone-400 truncate" style={{ fontWeight: 300 }}>{s.artist}</p>}
                        {s.notes && <p className="text-xs text-stone-300 italic mt-0.5" style={{ fontWeight: 300 }}>"{s.notes}"</p>}
                      </div>
                      {s.suggested_by && (
                        <span className="text-xs text-stone-300 shrink-0" style={{ fontWeight: 300 }}>
                          par {s.suggested_by}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {noMoment.length > 0 && (
              <div>
                <p className="text-sm text-stone-400 mb-2" style={{ fontWeight: 400 }}>🎶 Autres suggestions</p>
                <div className="space-y-2">
                  {noMoment.map(s => (
                    <div key={s.id} className="bg-white rounded-xl px-4 py-3 border border-stone-100 flex items-center gap-3">
                      <span className="text-xl">🎵</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-700 truncate" style={{ fontWeight: 400 }}>{s.title}</p>
                        {s.artist && <p className="text-xs text-stone-400 truncate" style={{ fontWeight: 300 }}>{s.artist}</p>}
                      </div>
                      {s.suggested_by && (
                        <span className="text-xs text-stone-300 shrink-0" style={{ fontWeight: 300 }}>
                          par {s.suggested_by}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
