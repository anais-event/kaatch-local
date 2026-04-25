import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function InviteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = serviceClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('id, first_name, last_name, wedding_id, weddings(slug)')
    .eq('invite_token', token)
    .single()

  if (!guest || !guest.weddings) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-4xl mb-4">💌</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-2">Lien introuvable</h1>
          <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400">
            Ce lien n'est plus valide. Demandez le lien aux mariés.
          </p>
        </div>
      </div>
    )
  }

  const slug = (guest.weddings as unknown as { slug: string }).slug
  const cookieStore = await cookies()

  cookieStore.set(`guest_${slug}`, JSON.stringify({
    firstName: guest.first_name,
    lastName: guest.last_name,
    id: guest.id,
  }), { maxAge: 60 * 60 * 24 * 90, path: '/' })

  await supabase.from('guests')
    .update({ invited_at: new Date().toISOString() })
    .eq('id', guest.id)
    .is('invited_at', null)

  redirect(`/invite/${slug}/faire-part`)
}
