import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Countdown from './Countdown'
import MessageModal from './MessageModal'

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
    <div style={{ fontFamily: 'var(--font-lato)' }}>

      {/* ── WELCOME HERO ── */}
      <div style={{
        minHeight: '100svh',
        background: 'linear-gradient(160deg, #4a5240 0%, #2d3228 55%, #191d16 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 28px 100px',
        position: 'relative',
      }}>
        {/* Subtle texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(201,169,110,0.06) 0%, transparent 70%)',
        }} />

        {/* BIENVENUE label */}
        <p style={{
          fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.35em',
          color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
          marginBottom: 20, position: 'relative',
        }}>
          Bienvenue
        </p>

        {/* Prénom */}
        <h1 style={{
          fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(3.2rem, 13vw, 5.5rem)', lineHeight: 1,
          color: '#fff', margin: '0 0 6px', position: 'relative',
        }}>
          {guest.firstName}
        </h1>
        <span style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', lineHeight: 1, display: 'block', marginBottom: 36 }}>🌿</span>

        {/* Gold line */}
        <div style={{
          width: 48, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.6), transparent)',
          marginBottom: 36,
        }} />

        {/* Nom mariage */}
        <h2 style={{
          fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', lineHeight: 1.2,
          color: 'rgba(255,255,255,0.9)', marginBottom: 20, position: 'relative',
        }}>
          {wedding.name}
        </h2>

        {/* Date */}
        {dateFormatted && (
          <p style={{
            fontWeight: 300, fontSize: '0.8rem', letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.5)', marginBottom: 8, position: 'relative',
          }}>
            {dateFormatted}
          </p>
        )}

        {/* Lieu */}
        {wedding.location && (
          <p style={{
            fontWeight: 300, fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.35)', marginBottom: 0, position: 'relative',
          }}>
            {wedding.location}
          </p>
        )}

        {/* Countdown */}
        {wedding.date && (
          <div style={{ marginTop: 52, position: 'relative', width: '100%', maxWidth: 320 }}>
            <Countdown weddingDate={wedding.date} dark />
          </div>
        )}

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.2)', fontSize: '1.1rem', animation: 'bounce 2s infinite',
        }}>↓</div>
      </div>

      {/* ── CONTENT SECTION ── */}
      <div style={{
        background: '#f5f0e8',
        borderRadius: '24px 24px 0 0',
        marginTop: -24,
        position: 'relative', zIndex: 1,
      }}>
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-4">

          {/* RSVP */}
          {!isPreview && guest.id && (
            <div className={`rounded-2xl border p-5 ${
              rsvpStatus === 'confirme' ? 'bg-emerald-50 border-emerald-200' :
              rsvpStatus === 'decline'  ? 'bg-red-50 border-red-200' :
              'bg-white border-stone-200'
            }`}>
              {rsvpStatus === 'confirme' ? (
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }} className="text-emerald-700 mb-1">
                    ✓ Présence confirmée
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-emerald-600 mb-3">
                    Les mariés ont hâte de vous voir !
                  </p>
                  <form action={respondRsvp}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="guest_id" value={guest.id} />
                    <input type="hidden" name="status" value="decline" />
                    <button type="submit" className="text-xs text-emerald-600 hover:text-red-400 transition underline cursor-pointer" style={{ fontWeight: 300 }}>
                      Annuler ma présence
                    </button>
                  </form>
                </div>
              ) : rsvpStatus === 'decline' ? (
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }} className="text-red-500 mb-1">
                    Invitation déclinée
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-red-400 mb-3">
                    Vous nous manquerez…
                  </p>
                  <form action={respondRsvp}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="guest_id" value={guest.id} />
                    <input type="hidden" name="status" value="confirme" />
                    <button type="submit" className="text-xs text-red-400 hover:text-emerald-600 transition underline cursor-pointer" style={{ fontWeight: 300 }}>
                      Finalement, je serai présent(e)
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }} className="text-[#2d3228] mb-1">
                    Serez-vous des nôtres ?
                  </p>
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
                    Confirmez votre présence pour que les mariés puissent s&apos;organiser.
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
            <MessageModal
              slug={slug}
              guestId={guest.id}
              existingMessage={existingMessage}
              weddingName={wedding.name}
              saveMessage={saveMessage}
            />
          )}

          {/* GPS */}
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

          {/* Nos petites attentions */}
          {rules && rules.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }} className="text-[#2d3228] mb-3">
                Nos petites attentions
              </h3>
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

          {/* Déconnexion */}
          {!isPreview && (
            <div className="text-center pt-2 pb-8">
              <form action={logout}>
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="text-xs text-stone-400 hover:text-red-400 transition cursor-pointer" style={{ fontWeight: 300 }}>
                  Se déconnecter
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  )
}
