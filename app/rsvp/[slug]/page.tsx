import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import RSVPForm from './RSVPForm'

export default async function RSVPPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('id, first_name, last_name, rsvp_status, dietary_restrictions, wedding_id')
    .eq('invite_token', slug)
    .single()

  if (!guest) notFound()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('name, date, location, slug')
    .eq('id', guest.wedding_id)
    .single()

  const dateStr = wedding?.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* En-tête */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-4">💌</p>
          <h1
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.2rem' }}
            className="text-[#2d3228] mb-1"
          >
            {wedding?.name ?? 'Notre mariage'}
          </h1>
          {dateStr && (
            <p className="text-stone-400 text-sm capitalize mt-1" style={{ fontWeight: 300 }}>{dateStr}</p>
          )}
          {wedding?.location && (
            <p className="text-stone-400 text-sm mt-0.5" style={{ fontWeight: 300 }}>{wedding.location}</p>
          )}
        </div>

        {/* Carte RSVP */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
          <p className="text-stone-400 text-xs tracking-widest uppercase mb-2" style={{ fontWeight: 300 }}>
            Invitation personnelle
          </p>
          <h2
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.5rem' }}
            className="text-[#2d3228] mb-6"
          >
            {guest.first_name}{guest.last_name ? ` ${guest.last_name}` : ''},<br />
            <span className="font-light">serez-vous des nôtres ?</span>
          </h2>

          <RSVPForm guest={{ ...guest, wedding_slug: wedding?.slug ?? '' }} />
        </div>

        <p className="text-center text-xs text-stone-300 mt-6" style={{ fontWeight: 300 }}>
          Propulsé par Kaatch
        </p>
      </div>
    </main>
  )
}
