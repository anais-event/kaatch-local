import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function PublicPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('slug, name, cover_image_url, date')
    .eq('share_code', code.toUpperCase())
    .single()

  if (!wedding) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-2">Code introuvable</h1>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
             className="text-stone-400">Vérifiez le code avec les mariés.</p>
        </div>
      </div>
    )
  }

  // Rediriger vers la page mariage publique (on la créera ensuite)
  redirect(`/wedding/${wedding.slug}`)
}
