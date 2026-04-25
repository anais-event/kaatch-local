import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
    .select('id, name, date, cover_image_url, cover_position_y, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [{ data: rules }, { data: guestData }] = await Promise.all([
    supabase.from('wedding_rules').select('text').eq('wedding_id', wedding.id).order('created_at'),
    guest.id
      ? supabase.from('guests').select('rsvp_status, first_name, guest_message, invited_parts').eq('id', guest.id).single()
      : Promise.resolve({ data: null }),
  ])

  const rsvpStatus = guestData?.rsvp_status ?? null
  const existingMessage = guestData?.guest_message ?? null
  const invitedParts: string[] = guestData?.invited_parts ?? ['ceremonie', 'vin_honneur', 'reception']
  const PARTS_LABELS: Record<string, string> = {
    ceremonie: '💒 Cérémonie',
    vin_honneur: '🥂 Vin d\'honneur',
    reception: '🎉 Réception',
  }
  const isPartialInvite = invitedParts.length < 3

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[45vh] min-h-[260px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover"
                 style={{ objectPosition: `center ${wedding.cover_position_y ?? 50}%` }} />
          : <div className="w-full h-full bg-[#4a5240]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.4em] uppercase text-stone-300 mb-2" style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1 }}>
            {wedding.name}
          </h1>
          {wedding.location && (
            <p className="text-stone-300 mt-1.5 flex items-center justify-center gap-1.5" style={{ fontWeight: 300, fontSize: '0.82rem' }}>
              <span>📍</span>{wedding.location}
            </p>
          )}
          <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300/80 mt-2">
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
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.1rem' }}
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
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.1rem' }}
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
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.1rem' }}
                   className="text-[#2d3228] mb-1">Serez-vous des nôtres ?</p>
                {isPartialInvite && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {invitedParts.map(p => (
                      <span key={p} className="text-xs bg-[#f5f0e8] text-[#4a5240] px-2.5 py-1 rounded-full" style={{ fontWeight: 300 }}>
                        {PARTS_LABELS[p] ?? p}
                      </span>
                    ))}
                  </div>
                )}
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

        {/* Message aux mariés */}
        {!isPreview && guest.id && (
          <div className="bg-white rounded-xl border border-stone-100 p-5">
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1rem' }}
               className="text-[#2d3228] mb-1">
              {existingMessage ? 'Votre message' : 'Laisser un message aux mariés'}
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mb-3">
              {existingMessage
                ? 'Vous pouvez modifier votre message à tout moment.'
                : `Un petit mot pour ${wedding.name} ? Une question, un souhait…`}
            </p>
            <form action={saveMessage} className="space-y-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="guest_id" value={guest.id} />
              <textarea
                name="message"
                defaultValue={existingMessage ?? ''}
                rows={3}
                placeholder="Votre message…"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 resize-none bg-[#f5f0e8]"
                style={{ fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.6 }}
              />
              <button type="submit"
                className="bg-[#4a5240] text-white px-5 py-2.5 rounded-xl hover:bg-[#2d3228] transition text-sm cursor-pointer"
                style={{ fontWeight: 300, letterSpacing: '0.04em' }}>
                {existingMessage ? 'Mettre à jour' : 'Envoyer le message'}
              </button>
              {existingMessage && (
                <button type="submit" name="message" value=""
                  className="ml-3 text-xs text-stone-400 hover:text-red-400 transition cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  Supprimer le message
                </button>
              )}
            </form>
          </div>
        )}

        {/* GPS rapide */}
        {wedding.location && (
          <div className="flex justify-center">
            <a href={`https://maps.google.com/?q=${encodeURIComponent(wedding.location)}`}
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 text-xs text-[#4a5240] border border-[#4a5240]/30 bg-white px-4 py-2 rounded-full hover:bg-[#4a5240] hover:text-white transition"
               style={{ fontWeight: 300 }}>
              📍 Voir sur Google Maps
            </a>
          </div>
        )}

        {/* Raccourcis */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { label: 'Faire-part', href: `/invite/${slug}/faire-part`, emoji: '💌' },
            { label: 'Messagerie', href: `/invite/${slug}/groupes`, emoji: '💬' },
            { label: 'Hébergements', href: `/invite/${slug}/hebergements`, emoji: '🏡' },
            { label: 'Programme', href: `/invite/${slug}/programme`, emoji: '📋' },
            { label: 'Surprises', href: `/invite/${slug}/surprises`, emoji: '🎉' },
            { label: 'Livre d\'Or', href: `/invite/${slug}/livre-dor`, emoji: '📖' },
            { label: 'Photos', href: `/invite/${slug}/photos`, emoji: '📸' },
            { label: 'Mon compte', href: `/invite/${slug}/compte`, emoji: '👤' },
          ].map(item => (
            <a key={item.label} href={item.href}
               className="p-4 rounded-xl bg-white border border-stone-100 text-center hover:border-[#4a5240]/30 hover:shadow-sm transition">
              <p className="text-xl mb-1">{item.emoji}</p>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '0.9rem' }}
                 className="text-[#2d3228]">{item.label}</p>
            </a>
          ))}
        </div>

        {/* Nos petites attentions */}
        {rules && rules.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-100 p-5">
            <h3 style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1rem' }}
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
