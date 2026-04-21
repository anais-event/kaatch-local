import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

const IDEES_SURPRISES = [
  {
    emoji: '🎬',
    titre: 'Vidéo collective',
    desc: 'Chaque invité enregistre un message vidéo de 10 secondes. Les témoins les assemblent en un court-métrage surprise.',
    tag: 'Témoins à contacter',
  },
  {
    emoji: '💃',
    titre: 'Chorégraphie surprise',
    desc: 'Organiser une danse surprise lors de la première danse. Même 8 personnes bien coordonnées, c\'est mémorable !',
    tag: 'Coordination requise',
  },
  {
    emoji: '📸',
    titre: 'Album photo "avant le grand jour"',
    desc: 'Rassembler des photos d\'enfance et de jeunesse des mariés pour créer un album surprise à offrir.',
    tag: 'Demander aux familles',
  },
  {
    emoji: '🎤',
    titre: 'Chant choral',
    desc: 'Revisiter une chanson connue avec des paroles personnalisées sur l\'histoire des mariés. Effet garanti.',
    tag: 'Répétition à prévoir',
  },
  {
    emoji: '✉️',
    titre: 'Lettres pour l\'avenir',
    desc: 'Chaque invité écrit une lettre "à ouvrir dans 10 ans". Rassemblées dans une boîte à temps, c\'est un cadeau unique.',
    tag: 'Facile à organiser',
  },
  {
    emoji: '🧩',
    titre: 'Puzzle photo géant',
    desc: 'Commander un puzzle avec une photo des mariés. Chaque convive colorie et signe le dos d\'une pièce.',
    tag: 'Commander à l\'avance',
  },
  {
    emoji: '🎁',
    titre: 'Cadeau collectif',
    desc: 'Organiser une cagnotte entre invités pour un cadeau commun — voyage, expérience, objet rare…',
    tag: 'Facile à organiser',
  },
  {
    emoji: '🌟',
    titre: 'Livre de souvenirs illustré',
    desc: 'Un livre où chaque table dessine ou écrit une anecdote, une blague ou un message. À relier après la soirée.',
    tag: 'Matériel à prévoir',
  },
]

export default async function SurprisesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: '', lastName: '' }
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ') || 'Invité'

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('name').eq('slug', slug).single()

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-28">

        {/* Header secret */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-full mb-4"
               style={{ fontWeight: 300 }}>
            🔒 Zone privée — les mariés n'ont pas accès à cette page
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-1">Surprises pour le jour J</h1>
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400">
            Des idées pour rendre ce mariage encore plus inoubliable.
            Coordonnez-vous entre invités — {wedding?.name ?? 'les mariés'} n'y ont pas accès.
          </p>
        </div>

        {/* Messagerie secrète */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💬</span>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem', fontStyle: 'italic' }}
                className="text-[#4a5240]">Se coordonner avec les autres invités</h2>
          </div>
          <p style={{ fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.7 }} className="text-stone-400 mb-4">
            Utilisez la messagerie pour vous organiser entre invités. Le groupe <strong>@Surprises</strong> est fait pour ça — les mariés n'y ont pas accès.
          </p>
          <a href={`/invite/${slug}/groupes`}
             className="inline-block bg-[#4a5240] text-white px-5 py-2.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
             style={{ fontWeight: 300 }}>
            Aller dans la messagerie →
          </a>
        </div>

        {/* Idées */}
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.3rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-4">Idées pour vous inspirer</h2>
        <div className="space-y-3">
          {IDEES_SURPRISES.map(idee => (
            <div key={idee.titre} className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5 shrink-0">{idee.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', fontStyle: 'italic' }}
                        className="text-[#2d3228]">{idee.titre}</h3>
                    <span className="text-xs bg-[#4a5240]/8 text-[#4a5240] px-2.5 py-1 rounded-full shrink-0"
                          style={{ fontWeight: 300 }}>
                      {idee.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.75, fontWeight: 300 }} className="text-stone-500">
                    {idee.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rappel */}
        <div className="mt-10 text-center">
          <p style={{ fontSize: '0.8rem', fontWeight: 300 }} className="text-stone-300">
            🔒 Cette page n'est visible que par les invités
          </p>
        </div>

      </div>
    </div>
  )
}
