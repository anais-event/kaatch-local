import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('slug, name, date, cover_image_url, theme, photos(id)')
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
          <p className="text-xs tracking-[0.4em] uppercase text-[#4a5240] mb-2"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Mes événements
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '3rem', fontStyle: 'italic' }}
              className="text-[#2d3228]">
            Mes mariages
          </h1>
        </div>

        <div className="grid gap-6">
          {weddings.map((wedding) => {
            const dateFormatted = wedding.date
              ? new Date(wedding.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Date à confirmer'

            return (
              <a key={wedding.slug} href={`/wedding/${wedding.slug}`}
                 className="group block rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-[#4a5240]">
                  {wedding.cover_image_url && (
                    <img src={wedding.cover_image_url} alt={wedding.name}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-8">
                    <div className="text-white">
                      <p className="text-xs tracking-widest uppercase opacity-70 mb-1"
                         style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                        {dateFormatted}
                      </p>
                      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.8rem' }}>
                        {wedding.name}
                      </h2>
                      {(wedding.photos?.length ?? 0) > 0 && (
                        <p className="text-xs opacity-60 mt-1"
                           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                          📸 {wedding.photos.length} photo{wedding.photos.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <a href="/dashboard/new-wedding"
             className="inline-block border border-[#4a5240] text-[#4a5240] px-8 py-3 rounded-full hover:bg-[#4a5240] hover:text-white transition"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
            + Créer un nouveau mariage
          </a>
        </div>

      </div>
    </div>
  )
}
