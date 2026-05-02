import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { isPaid, checkoutUrl } from '@/lib/plan'

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('id, slug, name, date, cover_image_url, theme, plan, photos(id)')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false })

  // Si aucun mariage, on redirige vers la création
  if (!weddings || weddings.length === 0) {
    redirect('/dashboard/new-wedding')
  }

  // Afficher la liste
  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] uppercase text-[#2C3B2E] mb-2"
             style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>
            Bienvenue
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2.2rem', letterSpacing: '-0.02em' }}
              className="text-[#2C3B2E]">
            {weddings.length === 1 ? 'Votre mariage' : 'Vos mariages'}
          </h1>
        </div>

        <div className="grid gap-6">
          {weddings.map((wedding) => {
            const dateFormatted = wedding.date
              ? new Date(wedding.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Date à confirmer'

            return (
              <div key={wedding.slug} className="rounded-2xl overflow-hidden border border-stone-100"
                   style={{ boxShadow: '0 2px 12px rgba(44,59,46,0.07)' }}>

                {/* Cover + infos */}
                <a href={`/mariage/${wedding.slug}`}
                   className="group block relative h-48 bg-[#2C3B2E]">
                  {wedding.cover_image_url && (
                    <img src={wedding.cover_image_url} alt={wedding.name}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div className="text-white">
                      <p className="text-xs tracking-widest uppercase opacity-70 mb-1"
                         style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                        {dateFormatted}
                      </p>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' }}>
                        {wedding.name}
                      </h2>
                      {(wedding.photos?.length ?? 0) > 0 && (
                        <p className="text-xs opacity-60 mt-1"
                           style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                          {wedding.photos.length} photo{wedding.photos.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </a>

                {/* Bandeau formule */}
                {isPaid(wedding.plan) ? (
                  <div className="bg-[#2d3228] px-5 py-2.5 flex items-center gap-2">
                    <span className="text-[10px] bg-[#4a5240] text-white px-2 py-0.5 rounded-full tracking-wide"
                          style={{ fontWeight: 500 }}>
                      FORMULE MARIAGE
                    </span>
                    <p className="text-xs text-white/50" style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                      Toutes les fonctionnalités activées
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border-t border-stone-100 px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full tracking-wide"
                            style={{ fontWeight: 500 }}>
                        FORMULE GRATUITE
                      </span>
                      <p className="text-xs text-stone-400 hidden sm:block" style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                        20 invités · faire-part limité
                      </p>
                    </div>
                    <a href={checkoutUrl(wedding.id, wedding.slug)}
                       className="shrink-0 bg-[#4a5240] text-white text-xs px-4 py-1.5 rounded-xl hover:bg-[#2d3228] transition"
                       style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>
                      Passer à la formule Mariage →
                    </a>
                  </div>
                )}

              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <a href="/dashboard/new-wedding"
             className="inline-block border border-[#2C3B2E] text-[#2C3B2E] px-8 py-3 rounded-full hover:bg-[#2C3B2E] hover:text-white transition text-sm"
             style={{ fontFamily: 'var(--font-body)', fontWeight: 400, letterSpacing: '0.05em' }}>
            + Organiser un autre événement
          </a>
        </div>

        {user.email === 'anais@kaatch.fr' && (
          <div className="text-center mt-6">
            <a href="/admin"
               className="text-xs text-stone-300 hover:text-[#4a5240] transition"
               style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
              ⚙ Admin
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
