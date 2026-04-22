import { createSupabaseServerClient } from '@/lib/supabase-server'
import FairePartEnvelope from './FairePartEnvelope'

export default async function FairePartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, couple_message, cover_image_url')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <FairePartEnvelope
      weddingName={wedding.name}
      dateStr={dateStr}
      location={wedding.location}
      coupleMessage={wedding.couple_message}
      coverImageUrl={wedding.cover_image_url}
      slug={slug}
    />
  )
}
