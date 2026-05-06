import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const MOMENTS = [
  { key: 'ceremonie',  label: 'Cérémonie',   emoji: '💒', desc: 'Entrée, échange des vœux, sortie' },
  { key: 'vin_honneur', label: 'Vin d\'honneur', emoji: '🥂', desc: 'Ambiance cocktail' },
  { key: 'diner',      label: 'Dîner',        emoji: '🍽️', desc: 'Fond sonore pendant le repas' },
  { key: 'soiree',     label: 'Soirée',       emoji: '🎉', desc: 'Piste de danse, fête' },
]

function getPlatformLabel(url: string) {
  if (url.includes('spotify')) return 'Écouter sur Spotify'
  if (url.includes('deezer'))  return 'Écouter sur Deezer'
  if (url.includes('youtube') || url.includes('youtu.be')) return 'Regarder sur YouTube'
  return 'Ouvrir'
}

function getPlatformIcon(url: string) {
  if (url.includes('spotify')) return '🎧'
  if (url.includes('deezer'))  return '🎵'
  if (url.includes('youtube') || url.includes('youtu.be')) return '▶️'
  return '🔗'
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('spotify.com')) {
      return `https://open.spotify.com/embed${u.pathname}?utm_source=generator&theme=0`
    }
    if (u.hostname.includes('deezer.com')) {
      const match = u.pathname.match(/\/(playlist|album|track)\/(\d+)/)
      if (match) return `https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}`
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').pop()
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch {}
  return null
}

export default async function MusiqueGuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: '', id: null }
  const guestName = guest.firstName || 'Invité'

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [{ data: songs }, { data: playlistLinks }] = await Promise.all([
    supabase
      .from('playlist_songs')
      .select('id, title, artist, moment, notes, suggested_by')
      .eq('wedding_id', wedding.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('playlist_links')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('position'),
  ])

  const approvedSongs = (songs ?? []).filter(s => !s.suggested_by)
  const mySuggestions = (songs ?? []).filter(s => s.suggested_by === guestName)

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
      suggested_by: guestName,
    })
    revalidatePath(`/invite/${slug}/musique`)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] pt-20 pb-32 px-4" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-2">
          <h1 className="text-[#2d3228] mb-1" style={{ fontWeight: 600, fontSize: '1.5rem' }}>
            La playlist de la soirée
          </h1>
          <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
            Suggérez vos morceaux préférés aux mariés
          </p>
        </div>

        {/* Couple's playlists */}
        {(playlistLinks ?? []).length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 uppercase tracking-widest text-center" style={{ fontWeight: 300 }}>
              La sélection des mariés
            </p>
            {(playlistLinks ?? []).map(pl => {
              const embed = getEmbedUrl(pl.url)
              return (
                <div key={pl.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                  <a href={pl.url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50 transition">
                    <span className="text-2xl">{getPlatformIcon(pl.url)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2d3228] truncate" style={{ fontWeight: 400 }}>{pl.name}</p>
                      <p className="text-xs text-[#4a5240] truncate" style={{ fontWeight: 300 }}>
                        {getPlatformLabel(pl.url)} →
                      </p>
                    </div>
                  </a>
                  {embed && (
                    <div className="px-4 pb-4">
                      <iframe src={embed} width="100%" height="152" frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy" className="rounded-xl" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Suggestion form */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎵</span>
            <h2 className="text-[#2d3228]" style={{ fontWeight: 500, fontSize: '0.95rem' }}>
              Suggérer un morceau
            </h2>
          </div>
          <form action={suggestSong} className="space-y-3">
            <input
              name="title"
              required
              placeholder="Titre de la chanson *"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4a5240] transition"
              style={{ fontWeight: 300 }}
            />
            <input
              name="artist"
              placeholder="Artiste (optionnel)"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4a5240] transition"
              style={{ fontWeight: 300 }}
            />
            <select
              name="moment"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-600 focus:outline-none focus:border-[#4a5240] bg-white transition"
              style={{ fontWeight: 300 }}
            >
              <option value="">Pour quel moment ? (optionnel)</option>
              {MOMENTS.map(m => (
                <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>
              ))}
            </select>
            <textarea
              name="notes"
              placeholder="Un petit mot pour les mariés ? (optionnel)"
              rows={2}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4a5240] resize-none transition"
              style={{ fontWeight: 300 }}
            />
            <button
              type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontWeight: 400 }}
            >
              Envoyer ma suggestion ✦
            </button>
          </form>
        </div>

        {/* My suggestions */}
        {mySuggestions.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest text-center mb-3" style={{ fontWeight: 300 }}>
              Mes suggestions
            </p>
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
              {mySuggestions.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-stone-300">♪</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 truncate" style={{ fontWeight: 400 }}>{s.title}</p>
                    {s.artist && <p className="text-xs text-stone-400 truncate" style={{ fontWeight: 300 }}>{s.artist}</p>}
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full shrink-0" style={{ fontWeight: 300 }}>
                    En attente
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved playlist by moment */}
        {approvedSongs.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs text-stone-400 uppercase tracking-widest text-center" style={{ fontWeight: 300 }}>
              Playlist en cours
            </p>
            {MOMENTS.map(m => {
              const ms = approvedSongs.filter(s => s.moment === m.key)
              if (!ms.length) return null
              return (
                <div key={m.key}>
                  <p className="text-xs text-stone-500 mb-2 flex items-center gap-1.5" style={{ fontWeight: 400 }}>
                    <span>{m.emoji}</span> {m.label}
                  </p>
                  <div className="bg-white rounded-xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
                    {ms.map((s, idx) => (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-xs text-stone-300 w-4 text-right shrink-0" style={{ fontWeight: 300 }}>{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-700 truncate" style={{ fontWeight: 400 }}>{s.title}</p>
                          {s.artist && <p className="text-xs text-stone-400 truncate" style={{ fontWeight: 300 }}>{s.artist}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
