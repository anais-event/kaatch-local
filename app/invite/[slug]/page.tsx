import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect, revalidatePath } from 'next/navigation'
import Countdown from './Countdown'

async function logout(formData: FormData) {
  'use server'
  const { cookies } = await import('next/headers')
  const { redirect } = await import('next/navigation')
  const cookieStore = await cookies()
  const slug = formData.get('slug') as string
  cookieStore.delete(`guest_${slug}`)
  redirect('/rejoindre')
}

async function respondRsvp(formData: FormData) {
  'use server'
  const { revalidatePath } = await import('next/cache')
  const slug = formData.get('slug') as string
  const guestId = formData.get('guest_id') as string
  const status = formData.get('status') as string
  if (!guestId || !['confirme', 'decline'].includes(status)) return

  const supabase = await createSupabaseServerClient()
  await supabase.from('guests').update({ rsvp_status: status }).eq('id', guestId)
  revalidatePath(`/invite/${slug}`)
}

async function saveMessage(formData: FormData) {
  'use server'
  const { revalidatePath } = await import('next/cache')
  const slug = formData.get('slug') as string
  const guestId = formData.get('guest_id') as string
  const message = (formData.get('message') as string)?.trim()
  if (!guestId) return

  const supabase = await createSupabaseServerClient()
  await supabase.from('guests').update({ guest_message: message || null }).eq('id', guestId)
  revalidatePath(`/invite/${slug}`)
}

export default async function GuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)

  const isPreview = !guestCookie

  if (isPreview) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const { data: wedding } = await supabase.from('weddings').select('share_code').eq('slug', slug).single()
      if (wedding?.share_code) redirect(`/p/${wedding.share_code}`)
      else redirect('/rejoindre')
    }
  }

  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: 'Prévisualisation', id: null }

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, cover_image_url, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [{ data: rules }, { data: guestData }] = await Promise.all([
    supabase.from('wedding_rules').select('text').eq('wedding_id', wedding.id).order('created_at'),
    guest.id
      ? supabase.from('guests').select('rsvp_status, first_name, guest_message').eq('id', guest.id).single()
      : Promise.resolve({ data: null }),
  ])

  const rsvpStatus = guestData?.rsvp_status ?? null
  const existingMessage = guestData?.guest_message ?? null

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[45vh] min-h-[260px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#4a5240]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.4em] uppercase text-stone-300 mb-2" style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1 }}>
            {wedding.name}
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-300 mt-2">
            Bienvenue, {guest.firstName} 👋
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

        {/* ── RSVP ── */}
        {!isPreview && guest.id && (
          <div className={`rounded-xl border p-5 ${
            rsvpStatus === 'confirme' ? 'bg-emerald-50 border-emerald-200' :
            rsvpStatus === 'decline'  ? 'bg-red-50 border-red-200' :
            'bg-white border-stone-200'
          }`}>
            {rsvpStatus === 'confirme' ? (
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                   className="text-emerald-700 mb-1">✓ Vous avez confirmé votre présence</p>
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-emerald-600 mb-3">
                  Les mariés ont hâte de vous voir !
                </p>
                <form action={respondRsvp}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="guest_id" value={guest.id} />
                  <input type="hidden" name="status" value="decline" />
                  <button type="submit"
                    className="text-xs text-emerald-600 hover:text-red-400 transition underline cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    Annuler ma présence
                  </button>
                </form>
              </div>
            ) : rsvpStatus === 'decline' ? (
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                   className="text-red-500 mb-1">Vous avez décliné l'invitation</p>
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-red-400 mb-3">
                  Vous nous manquerez…
                </p>
                <form action={respondRsvp}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="guest_id" value={guest.id} />
                  <input type="hidden" name="status" value="confirme" />
                  <button type="submit"
                    className="text-xs text-red-400 hover:text-emerald-600 transition underline cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    Finalement, je serai présent(e)
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.25rem' }}
                   className="text-[#2d3228] mb-1">Serez-vous des nôtres ?</p>
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mb-4">
                  Confirmez votre présence pour que les mariés puissent s'organiser.
                </p>
                <div className="flex gap-3">
                  <form action={respondRsvp} className="flex-1">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="guest_id" value={guest.id} />
                    <input type="hidden" name="status" value="confirme" />
                    <button type="submit"
                      className="w-full bg-[#4a5240] text-white py-2.5 rounded-xl hover:bg-[#2d3228] transition text-sm cursor-pointer"
                      style={{ fontWeight: 300, letterSpacing: '0.04em' }}>
                      ✓ Je serai présent(e)
                    </button>
                  </form>
                  <form action={respondRsvp} className="flex-1">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="guest_id" value={guest.id} />
                    <input type="hidden" name="status" value="decline" />
                    <button type="submit"
                      className="w-full border border-stone-300 text-stone-500 py-2.5 rounded-xl hover:border-red-300 hover:text-red-400 transition text-sm cursor-pointer"
                      style={{ fontWeight: 300 }}>
                      Je ne pourrai pas venir
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Infos */}
        {dateFormatted && (
          <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-stone-100">
            <div>
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.18em' }} className="text-stone-400 uppercase mb-1">Date</p>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem' }} className="text-stone-700 capitalize">{dateFormatted}</p>
            </div>
          </div>
        )}
        {wedding.location && (
          <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-stone-100">
            <div className="flex-1">
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.18em' }} className="text-stone-400 uppercase mb-1">Lieu</p>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem' }} className="text-stone-700">{wedding.location}</p>
            </div>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(wedding.location)}`}
               target="_blank" rel="noopener noreferrer"
               className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d3228] transition whitespace-nowrap"
               style={{ fontWeight: 300 }}>
              GPS →
            </a>
          </div>
        )}

        {/* Raccourcis */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { label: 'Programme', href: `/invite/${slug}/programme` },
            { label: 'Photos', href: `/invite/${slug}/photos` },
            { label: 'Messagerie', href: `/invite/${slug}/groupes` },
            { label: 'Hébergements', href: `/invite/${slug}/hebergements` },
          ].map(item => (
            <a key={item.label} href={item.href}
               className="p-4 rounded-xl bg-white border border-stone-100 text-center hover:border-[#4a5240]/30 hover:shadow-sm transition"
               style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}>
              {item.label}
            </a>
          ))}
        </div>

        {/* Nos petites attentions */}
        {rules && rules.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-100 p-5">
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem', fontStyle: 'italic' }}
                className="text-[#2d3228] mb-3">Nos petites attentions</h3>
            <ul className="space-y-2">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-stone-600" style={{ fontWeight: 300 }}>
                  <span className="text-[#4a5240] mt-0.5">—</span>
                  {rule.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compte à rebours — tout en bas */}
        {wedding.date && <Countdown weddingDate={wedding.date} />}

      </div>

      {!isPreview && (
        <div className="max-w-2xl mx-auto px-6 pb-12 text-center">
          <form action={logout}>
            <input type="hidden" name="slug" value={slug} />
            <button type="submit" className="text-xs text-stone-400 hover:text-red-400 transition cursor-pointer" style={{ fontWeight: 300 }}>
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
