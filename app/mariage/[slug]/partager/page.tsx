import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function PartagerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
             style={{ fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Boîte à outils</p>
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
              className="text-[#2d3228] leading-none">{wedding.name}</h1>
        </div>

        {/* ─── Section : PDF & impressions ─── */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228] mb-1">
            📄 Impressions & PDF
          </p>
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mb-4">
            Tous vos documents prêts à imprimer ou télécharger.
          </p>
          <div className="space-y-2.5">

            <a href={`/mariage/${slug}/guests?tab=synthese`}
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">👥</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Liste invités & synthèse traiteur</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">PDF avec RSVP, régimes, statistiques</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Ouvrir →
              </span>
            </a>

            <a href={`/mariage/${slug}/programme/recap`} target="_blank"
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">📋</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Programme de la journée</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">À imprimer pour les prestataires & témoins</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Imprimer →
              </span>
            </a>

            <a href={`/mariage/${slug}/tables/recap`} target="_blank"
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">🪑</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Plan de table</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Récap des tables à transmettre au traiteur</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Imprimer →
              </span>
            </a>

            <a href={`/mariage/${slug}/inspirations`}
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">✨</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Inspirations & moodboard</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Menu, déco, tenues — aperçu & export</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Ouvrir →
              </span>
            </a>

            <a href={`/mariage/${slug}/invitations`}
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">💌</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Faire-parts individuels</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Télécharger en PNG par invité</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Ouvrir →
              </span>
            </a>

            <div className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8]/50 rounded-xl opacity-50">
              <span className="text-lg">🍽️</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Menu de table</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Bientôt disponible</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 shrink-0">
                Bientôt →
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
