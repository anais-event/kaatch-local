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
    ceremonie: 'Cérémonie',
    vin_honneur: "Vin d'honneur",
    reception: 'Réception',
  }
  const isPartialInvite = invitedParts.length < 3

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const hasCover = !!wedding.cover_image_url

  return (
    <div style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100svh',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background */}
        {hasCover ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${wedding.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: `center ${wedding.cover_position_y ?? 50}%`,
            animation: 'heroZoom 18s ease-out forwards',
          }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(165deg, #4a5240 0%, #2d3228 60%, #191d16 100%)',
          }} />
        )}

        {/* Overlay layers */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hasCover
            ? 'linear-gradient(to bottom, rgba(20,24,18,0.45) 0%, rgba(20,24,18,0.25) 40%, rgba(20,24,18,0.72) 100%)'
            : 'radial-gradient(ellipse 90% 70% at 50% 20%, rgba(201,169,110,0.07) 0%, transparent 65%)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: '80px 32px 120px',
          width: '100%', maxWidth: 480,
          margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>

          {/* Eyebrow */}
          <p style={{
            fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.4em',
            color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
            marginBottom: 28,
            animation: 'fadeUp 1s ease both',
            animationDelay: '0.1s',
          }}>
            Vous êtes invité{guest.firstName ? '(e)' : ''}
          </p>

          {/* Guest name */}
          <h1 style={{
            fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(3.5rem, 14vw, 6rem)', lineHeight: 0.95,
            color: '#fff', margin: '0 0 32px',
            animation: 'fadeUp 1s ease both',
            animationDelay: '0.25s',
          }}>
            {guest.firstName}
          </h1>

          {/* Ornament */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 32, width: '100%', maxWidth: 200,
            animation: 'fadeUp 1s ease both',
            animationDelay: '0.4s',
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.5))' }} />
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
              <rect x="4" y="0" width="5.66" height="5.66" transform="rotate(45 4 0)" fill="rgba(201,169,110,0.6)" />
            </svg>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(201,169,110,0.5), transparent)' }} />
          </div>

          {/* Wedding name */}
          <h2 style={{
            fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(1.7rem, 6.5vw, 2.6rem)', lineHeight: 1.15,
            color: 'rgba(255,255,255,0.92)', marginBottom: 16,
            animation: 'fadeUp 1s ease both',
            animationDelay: '0.5s',
          }}>
            {wedding.name}
          </h2>

          {/* Date */}
          {dateFormatted && (
            <p style={{
              fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'capitalize',
              animation: 'fadeUp 1s ease both',
              animationDelay: '0.6s',
            }}>
              {dateFormatted}
            </p>
          )}

          {/* Location */}
          {wedding.location && (
            <p style={{
              fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.32)', marginBottom: 0,
              animation: 'fadeUp 1s ease both',
              animationDelay: '0.65s',
            }}>
              {wedding.location}
            </p>
          )}

          {/* Countdown */}
          {wedding.date && (
            <div style={{
              marginTop: 52, width: '100%', maxWidth: 300,
              animation: 'fadeUp 1s ease both',
              animationDelay: '0.8s',
            }}>
              <Countdown weddingDate={wedding.date} dark />
            </div>
          )}
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'fadeIn 1.5s ease both 1.2s',
        }}>
          <div style={{
            width: 1, height: 32,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.25))',
            animation: 'scrollLine 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{
        background: '#f5f0e8',
        borderRadius: '28px 28px 0 0',
        marginTop: -28,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '36px 20px 40px' }}>

          {/* RSVP */}
          {!isPreview && guest.id && (
            <div style={{
              background: '#fff',
              borderRadius: 20,
              border: rsvpStatus === 'confirme'
                ? '1px solid #a7c4a0'
                : rsvpStatus === 'decline'
                ? '1px solid #e8b4b8'
                : '1px solid #e7e2d8',
              padding: '28px 24px',
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle corner ornament */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 60, height: 60,
                background: rsvpStatus === 'confirme'
                  ? 'linear-gradient(225deg, rgba(167,196,160,0.15) 0%, transparent 60%)'
                  : rsvpStatus === 'decline'
                  ? 'linear-gradient(225deg, rgba(232,180,184,0.15) 0%, transparent 60%)'
                  : 'linear-gradient(225deg, rgba(201,169,110,0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />

              {rsvpStatus === 'confirme' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#4a7c59', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem', color: '#2d4a34', margin: 0 }}>
                      Présence confirmée
                    </p>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6a9473', marginBottom: 16, marginLeft: 38 }}>
                    Les mariés ont hâte de vous retrouver.
                  </p>
                  <form action={respondRsvp}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="guest_id" value={guest.id} />
                    <input type="hidden" name="status" value="decline" />
                    <button type="submit" style={{ marginLeft: 38, fontSize: '0.72rem', color: '#b0b0a8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Annuler ma présence
                    </button>
                  </form>
                </>
              ) : rsvpStatus === 'decline' ? (
                <>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem', color: '#8b4a4e', marginBottom: 6 }}>
                    Invitation déclinée
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#b87c80', marginBottom: 16 }}>
                    Vous nous manquerez…
                  </p>
                  <form action={respondRsvp}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="guest_id" value={guest.id} />
                    <input type="hidden" name="status" value="confirme" />
                    <button type="submit" style={{ fontSize: '0.72rem', color: '#b0b0a8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Finalement, je serai présent(e)
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p style={{
                    fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
                    fontSize: '1.4rem', color: '#2d3228', marginBottom: 8, lineHeight: 1.2,
                  }}>
                    Serez-vous des nôtres ?
                  </p>

                  {isPartialInvite && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {invitedParts.map(p => (
                        <span key={p} style={{
                          fontSize: '0.68rem', letterSpacing: '0.08em',
                          background: '#f5f0e8', color: '#4a5240',
                          padding: '4px 12px', borderRadius: 100,
                          textTransform: 'uppercase',
                        }}>
                          {PARTS_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: '0.76rem', color: '#a09d95', marginBottom: 20 }}>
                    Merci de confirmer votre présence pour que les mariés puissent s&apos;organiser.
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <form action={respondRsvp} style={{ flex: 1 }}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="guest_id" value={guest.id} />
                      <input type="hidden" name="status" value="confirme" />
                      <button type="submit" style={{
                        width: '100%', background: '#4a5240', color: '#fff',
                        padding: '12px 16px', borderRadius: 12, border: 'none',
                        fontSize: '0.8rem', letterSpacing: '0.06em', cursor: 'pointer',
                        fontFamily: 'var(--font-lato)', fontWeight: 300,
                        transition: 'background 0.2s',
                      }}>
                        Je serai présent(e)
                      </button>
                    </form>
                    <form action={respondRsvp} style={{ flex: 1 }}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="guest_id" value={guest.id} />
                      <input type="hidden" name="status" value="decline" />
                      <button type="submit" style={{
                        width: '100%', background: 'transparent',
                        border: '1px solid #d4cfc6', color: '#8a8880',
                        padding: '12px 16px', borderRadius: 12,
                        fontSize: '0.8rem', cursor: 'pointer',
                        fontFamily: 'var(--font-lato)', fontWeight: 300,
                        transition: 'border-color 0.2s, color 0.2s',
                      }}>
                        Je ne pourrai pas
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Message aux mariés */}
          {!isPreview && guest.id && (
            <div style={{ marginBottom: 16 }}>
              <MessageModal
                slug={slug}
                guestId={guest.id}
                existingMessage={existingMessage}
                weddingName={wedding.name}
                saveMessage={saveMessage}
              />
            </div>
          )}

          {/* GPS */}
          {wedding.location && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(wedding.location)}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: '0.74rem', letterSpacing: '0.08em',
                  color: '#4a5240', border: '1px solid rgba(74,82,64,0.25)',
                  background: '#fff', padding: '10px 20px', borderRadius: 100,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-lato)', fontWeight: 300,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.72 3.5 6.5 3.5 6.5s3.5-3.78 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" fill="#4a5240"/>
                </svg>
                Voir sur Google Maps
              </a>
            </div>
          )}

          {/* Nos petites attentions */}
          {rules && rules.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: 20,
              border: '1px solid #e7e2d8', padding: '24px',
              marginBottom: 16,
            }}>
              <p style={{
                fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300,
                fontSize: '1.2rem', color: '#2d3228', marginBottom: 16,
              }}>
                Quelques petites attentions
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rules.map((rule, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    fontSize: '0.8rem', color: '#6b6863', lineHeight: 1.5,
                  }}>
                    <span style={{ color: '#c9a96e', flexShrink: 0, marginTop: 2, fontSize: '0.6rem' }}>◆</span>
                    {rule.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Déconnexion */}
          {!isPreview && (
            <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 32 }}>
              <form action={logout}>
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" style={{
                  fontSize: '0.68rem', color: '#c0bdb8', letterSpacing: '0.06em',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-lato)', fontWeight: 300,
                }}>
                  Se déconnecter
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroZoom {
          from { transform: scale(1.06); }
          to   { transform: scale(1); }
        }
        @keyframes scrollLine {
          0%, 100% { opacity: 0.2; transform: scaleY(0.6); transform-origin: top; }
          50%       { opacity: 0.6; transform: scaleY(1); transform-origin: top; }
        }
      `}</style>
    </div>
  )
}
