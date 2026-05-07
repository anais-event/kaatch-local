import { createSupabaseServerClient } from '@/lib/supabase-server'

const JEUX = [
  {
    categorie: '🥂 Vin d\'honneur',
    idees: [
      {
        titre: 'Photobooth libre-service',
        desc: 'Un espace avec des accessoires rigolos et un appareil polaroid ou un QR code vers l\'album photo. Les invités s\'amusent sans animation.',
        duree: 'Toute la durée',
        difficulte: 'Facile',
      },
      {
        titre: 'Bingo des invités',
        desc: 'Chaque invité reçoit une grille avec des cases à cocher ("quelqu\'un porte du rouge", "un enfant court partout"…). Le premier qui complète sa grille crie Bingo !',
        duree: '30–60 min',
        difficulte: 'Facile',
      },
      {
        titre: 'Livre d\'or dessiné',
        desc: 'Plutôt qu\'un livre d\'or classique, demandez aux invités de se dessiner ou de dessiner les mariés. Le résultat est toujours hilarant.',
        duree: 'Libre',
        difficulte: 'Facile',
      },
      {
        titre: 'Quiz "Qui connaît le mieux les mariés ?"',
        desc: 'Questions sur les mariés projetées sur écran. Buzzer ou ardoises pour répondre. Les témoins peuvent animer.',
        duree: '20–30 min',
        difficulte: 'Moyen',
      },
    ],
  },
  {
    categorie: '🍽️ Pendant le repas',
    idees: [
      {
        titre: 'Enveloppes mystères sur les tables',
        desc: 'Des enveloppes avec des défis ou des questions à débattre par table. Permet de briser la glace entre invités qui ne se connaissent pas.',
        duree: 'Toute la durée',
        difficulte: 'Facile',
      },
      {
        titre: 'Les petits papiers',
        desc: 'Chaque invité écrit un souvenir ou un vœu pour les mariés. Les papiers sont lus à voix haute ou glissés dans une boîte souvenir.',
        duree: '15 min',
        difficulte: 'Facile',
      },
      {
        titre: 'Battle de témoins',
        desc: 'Les témoins s\'affrontent sur des anecdotes sur les mariés. Les invités votent pour le/la témoin le/la plus convaincant(e).',
        duree: '20–30 min',
        difficulte: 'Moyen',
      },
      {
        titre: '"C\'était il y a combien d\'années ?"',
        desc: 'Photos de jeunesse des mariés projetées. Les invités devinent l\'âge des mariés sur chaque photo.',
        duree: '15–20 min',
        difficulte: 'Facile',
      },
    ],
  },
  {
    categorie: '💃 Soirée / piste de danse',
    idees: [
      {
        titre: 'Battle de danse',
        desc: 'Les invités s\'affrontent en duels sur la piste. Le DJ annonce les combattants, les autres votent avec leurs applaudissements.',
        duree: '20–30 min',
        difficulte: 'Facile',
      },
      {
        titre: 'Blind test musical',
        desc: 'Extraits musicaux à reconnaître. Peut être thématique (chansons de leur vie, années 90…) ou généraliste. Buzzers ou ardoises.',
        duree: '20–40 min',
        difficulte: 'Moyen',
      },
      {
        titre: 'Karaoké sauvage',
        desc: 'Quelques chansons imposées, d\'autres libres. Les témoins ou le DJ animent. Toujours un succès après minuit.',
        duree: 'Libre',
        difficulte: 'Facile',
      },
      {
        titre: 'Jeu de la bouteille géant',
        desc: 'Version adulte avec des défis adaptés à l\'ambiance. À préparer à l\'avance avec des cartes défi personnalisées.',
        duree: '30 min',
        difficulte: 'Facile',
      },
    ],
  },
  {
    categorie: '🎬 Spécial témoins',
    idees: [
      {
        titre: 'Vidéo surprise',
        desc: 'Les témoins coordonnent des messages vidéo de proches qui ne peuvent pas être là (famille éloignée, amis à l\'étranger…).',
        duree: '5–15 min',
        difficulte: 'Moyen',
      },
      {
        titre: 'Chorégraphie surprise',
        desc: 'Les témoins apprennent une chorégraphie sur une chanson symbolique et la dansent lors de la première danse.',
        duree: '3–5 min',
        difficulte: 'Difficile',
      },
      {
        titre: 'Roast des mariés',
        desc: 'Discours humoristiques et bienveillants sur les mariés, style stand-up. Très populaire chez les anglophones, de plus en plus en France.',
        duree: '15–30 min',
        difficulte: 'Moyen',
      },
    ],
  },
]

const DIFFICULTE_COLOR: Record<string, string> = {
  'Facile': 'bg-green-50 text-green-700',
  'Moyen': 'bg-amber-50 text-amber-700',
  'Difficile': 'bg-red-50 text-red-700',
}

export default async function JeuxPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-24">

        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
             style={{ fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Jeux & animations</p>
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
              className="text-[#2d3228] leading-none">Idées de jeux & animations</h1>
        </div>
        <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400 mb-10">
          Des idées testées et approuvées, par moment de la journée. Partagez vos coups de cœur avec vos témoins !
        </p>

        <div className="space-y-12">
          {JEUX.map(cat => (
            <div key={cat.categorie}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
                  className="text-[#4a5240] mb-4">{cat.categorie}</h2>
              <div className="grid gap-4">
                {cat.idees.map(jeu => (
                  <div key={jeu.titre} className="bg-white rounded-2xl border border-stone-100 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem' }}
                          className="text-[#2d3228]">
                        {jeu.titre}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${DIFFICULTE_COLOR[jeu.difficulte]}`}
                              style={{ fontWeight: 300 }}>
                          {jeu.difficulte}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.75, fontWeight: 300 }} className="text-stone-500 mb-3">
                      {jeu.desc}
                    </p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 300 }} className="text-stone-300">
                      ⏱ {jeu.duree}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#4a5240]/8 rounded-2xl p-6 border border-[#4a5240]/20">
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
             className="text-[#4a5240] mb-2">💡 Bon à savoir</p>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.75, fontWeight: 300 }} className="text-stone-600">
            Les invités peuvent aussi proposer des surprises depuis leur espace — une fonctionnalité discrète pour coordonner entre eux sans que vous le sachiez d'avance !
          </p>
        </div>

      </div>
    </div>
  )
}
