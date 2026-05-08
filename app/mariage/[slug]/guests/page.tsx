import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import GuestList from './GuestList'
import GuestListSection from './GuestListSection'
import ImportGuests from './ImportGuests'
import AddGuestForm from './AddGuestForm'
import ExportGuestsButton from './ExportGuestsButton'
import GuestPdfExport from './GuestPdfExport'
import InvitationsTab from './InvitationsTab'
import PublipostagePanel from './PublipostagePanel'
import SyntheseParMoment from './SyntheseParMoment'
import { isPaid, FREE_GUEST_LIMIT } from '@/lib/plan'

async function addGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const weddingId = formData.get('wedding_id') as string
  const parts = formData.getAll('invited_parts') as string[]

  const { data: w } = await supabase.from('weddings').select('plan').eq('id', weddingId).single()
  if (!isPaid(w?.plan)) {
    const { count } = await supabase.from('guests').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)
    if ((count ?? 0) >= FREE_GUEST_LIMIT) return
  }

  await supabase.from('guests').insert({
    wedding_id: weddingId,
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
    guest_type: (formData.get('guest_type') as string) || 'adulte',
    invited_parts: parts.length > 0 ? parts : ['ceremonie', 'vin_honneur', 'reception'],
    dietary_notes: (formData.get('dietary_notes') as string) || null,
  })
  revalidatePath(`/mariage/${slug}/guests`)
}

async function deleteGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  await supabase.from('guests').delete().eq('id', id)
  revalidatePath(`/mariage/${slug}/guests`)
}

async function setRsvp(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const rsvp_status = formData.get('rsvp_status') as string
  await supabase.from('guests').update({ rsvp_status }).eq('id', id)
  revalidatePath(`/mariage/${slug}/guests`)
}

async function updateGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const parts = formData.getAll('invited_parts') as string[]
  await supabase.from('guests').update({
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
    gender: (formData.get('gender') as string) || null,
    invited_parts: parts.length > 0 ? parts : ['ceremonie', 'vin_honneur', 'reception'],
    dietary_notes: (formData.get('dietary_notes') as string) || null,
  }).eq('id', id)
  revalidatePath(`/mariage/${slug}/guests`)
}

async function toggleGuestPart(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const part = formData.get('part') as string
  const current = (formData.get('current') as string).split(',').filter(Boolean)
  const next = current.includes(part)
    ? current.filter(p => p !== part)
    : [...current, part]
  await supabase.from('guests').update({
    invited_parts: next.length > 0 ? next : ['ceremonie', 'vin_honneur', 'reception'],
  }).eq('id', id)
  revalidatePath(`/mariage/${slug}/guests`)
}

async function updateFairePartTheme(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const theme = formData.get('theme') as string
  await supabase.from('weddings').update({ faire_part_theme: theme }).eq('slug', slug)
  revalidatePath(`/mariage/${slug}/guests`)
}

async function generateTokens(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  const { data: guests } = await supabase
    .from('guests').select('id').eq('wedding_id', wedding.id).is('invite_token', null)
  for (const g of (guests ?? [])) {
    await supabase.from('guests').update({ invite_token: crypto.randomUUID() }).eq('id', g.id)
  }
  revalidatePath(`/mariage/${slug}/guests`)
}

type Tab = 'liste' | 'synthese'
const TABS: { key: Tab; label: string }[] = [
  { key: 'liste',    label: 'Invités & RSVP' },
  { key: 'synthese', label: 'Synthèse' },
]

const PARTS_LABELS: Record<string, string> = {
  ceremonie:    'Cérémonie',
  vin_honneur:  'Vin d\'honneur',
  reception:    'Réception',
}

export default async function GuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab: tabParam = 'liste' } = await searchParams
  const tab: Tab = (['liste', 'synthese'] as const).includes(tabParam as Tab)
    ? (tabParam as Tab)
    : 'liste'

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, cover_image_url, couple_message, plan, faire_part_theme')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [{ data: guests }, { data: tables }] = await Promise.all([
    supabase.from('guests').select('*').eq('wedding_id', wedding.id).order('first_name', { ascending: true }),
    supabase.from('seating_tables').select('id, name').eq('wedding_id', wedding.id),
  ])

  const guestList = guests ?? []
  const total = guestList.length
  const confirmed = guestList.filter(g => g.rsvp_status === 'confirme').length
  const declined  = guestList.filter(g => g.rsvp_status === 'decline').length
  const pending   = guestList.filter(g => g.rsvp_status === 'en_attente').length
  const withoutToken = guestList.filter(g => !g.invite_token)

  const h = await headers()
  const host = h.get('host') ?? 'kaatch.fr'
  const baseUrl = `https://${host}`

  const weddingPreview = {
    name: wedding.name,
    date: wedding.date,
    location: wedding.location,
    coverImageUrl: wedding.cover_image_url,
    coupleMessage: wedding.couple_message,
    fairePartTheme: wedding.faire_part_theme ?? 'classique',
  }

  const paid = isPaid(wedding.plan)

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 md:p-8" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Standard header */}
        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block" style={{ fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
                 className="text-stone-400 uppercase mb-1">Invités</p>
              <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
                  className="text-[#2d3228] leading-none">{wedding.name}</h1>
              <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mt-1">
                {total} invité{total > 1 ? 's' : ''}
              </p>
            </div>
            {tab === 'liste' && total > 0 && (
              <ExportGuestsButton guests={guestList} weddingName={wedding.name} />
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b-2 border-stone-200 mb-7 gap-1">
          {TABS.map(t => (
            <a key={t.key}
               href={`?tab=${t.key}`}
               className={`px-6 py-3 text-sm rounded-t-lg border-b-2 -mb-0.5 transition-all ${
                 tab === t.key
                   ? 'bg-white border-[#4a5240] text-[#2d3228] shadow-sm'
                   : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-white/60'
               }`}
               style={{ fontWeight: tab === t.key ? 600 : 300, fontSize: '0.92rem' }}>
              {t.label}
            </a>
          ))}
        </div>

        {/* ── TAB INVITÉS & RSVP ── */}
        {tab === 'liste' && (
          <>
            {/* Banner : invités sans lien faire-part */}
            {withoutToken.length > 0 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex-wrap gap-2 mb-4">
                <p className="text-xs text-amber-700" style={{ fontWeight: 300 }}>
                  💌 {withoutToken.length} invité{withoutToken.length > 1 ? 's' : ''} sans lien personnel — générez-les pour envoyer les faire-parts.
                </p>
                <form action={generateTokens}>
                  <input type="hidden" name="slug" value={slug} />
                  <button type="submit"
                    className="bg-[#4a5240] text-white px-4 py-1.5 rounded-xl text-xs hover:bg-[#2d3228] transition cursor-pointer whitespace-nowrap"
                    style={{ fontWeight: 300 }}>
                    Générer les liens ({withoutToken.length})
                  </button>
                </form>
              </div>
            )}

            <AddGuestForm
              weddingId={wedding.id}
              slug={slug}
              addGuest={addGuest}
              guestCount={total}
              paid={paid}
            />

            <GuestList
              guests={guestList}
              tables={tables ?? []}
              slug={slug}
              baseUrl={baseUrl}
              wedding={weddingPreview}
              setRsvp={setRsvp}
              deleteGuest={deleteGuest}
              updateGuest={updateGuest}
              toggleGuestPart={toggleGuestPart}
              paid={paid}
              weddingId={wedding.id}
            />

            <div className="mt-6 text-center">
              <ImportGuests weddingId={wedding.id} slug={slug} />
            </div>
          </>
        )}

        {/* ── TAB SYNTHÈSE ── */}
        {tab === 'synthese' && (
          <div className="space-y-5">

            {/* Thème faire-part */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase mb-4">Thème du faire-part</p>
              <div className="flex gap-4">
                {([
                  { key: 'classique',  label: 'Classique',  night: '#0b1209', bg: '#4a5639', accent: '#c9a96e' },
                  { key: 'champetre',  label: 'Champêtre',  night: '#ebeee4', bg: '#c5d4b0', accent: '#5a7040' },
                  { key: 'romantique', label: 'Romantique', night: '#1a0a14', bg: '#6b3a4a', accent: '#d4a0b0' },
                ] as const).map(th => {
                  const active = (wedding.faire_part_theme ?? 'classique') === th.key
                  return (
                    <form key={th.key} action={updateFairePartTheme}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="theme" value={th.key} />
                      <button type="submit" className="flex flex-col items-center gap-2 cursor-pointer" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                        <div style={{
                          width: 56, height: 76, borderRadius: 4, background: th.night,
                          border: `2px solid ${active ? '#4a5240' : 'transparent'}`,
                          overflow: 'hidden', position: 'relative',
                          boxShadow: active ? '0 0 0 1px #4a5240' : '0 1px 4px rgba(0,0,0,0.12)',
                        }}>
                          <div style={{
                            position: 'absolute', top: '15%', bottom: '15%', left: '12%', right: '12%',
                            background: th.bg, borderRadius: 2,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                          }}>
                            <div style={{ width: 20, height: 0.8, background: th.accent, opacity: 0.8 }} />
                            <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1px solid ${th.accent}`, opacity: 0.7 }} />
                            <div style={{ width: 14, height: 0.8, background: th.accent, opacity: 0.5 }} />
                          </div>
                        </div>
                        <p style={{ fontWeight: active ? 500 : 300, fontSize: '0.7rem' }} className={active ? 'text-[#4a5240]' : 'text-stone-500'}>{th.label}</p>
                      </button>
                    </form>
                  )
                })}
              </div>
            </div>

            {/* Envoi groupé */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase mb-3">Envoi groupé</p>
              <PublipostagePanel guests={guestList} weddingId={wedding.id} slug={slug} />
            </div>

            {/* RSVP */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase mb-4">
                RSVP
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Confirmés',  value: confirmed, total, color: '#4ade80' },
                  { label: 'En attente', value: pending,   total, color: '#d6d3d1' },
                  { label: 'Déclinés',   value: declined,  total, color: '#fca5a5' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-600">{s.label}</span>
                      <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 tabular-nums">
                        {s.value} / {s.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                           style={{ width: `${s.total > 0 ? (s.value / s.total) * 100 : 0}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Type invités */}
            {total > 0 && (() => {
              const adultes = guestList.filter(g => (g as { guest_type?: string }).guest_type !== 'enfant' && (g as { guest_type?: string }).guest_type !== 'animal').length
              const enfants = guestList.filter(g => (g as { guest_type?: string }).guest_type === 'enfant').length
              const animaux = guestList.filter(g => (g as { guest_type?: string }).guest_type === 'animal').length
              return (
                <div className="bg-white rounded-2xl border border-stone-100 p-5">
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                     className="text-stone-400 uppercase mb-4">
                    Composition
                  </p>
                  <div className="flex gap-6">
                    {[
                      { label: 'Adultes', value: adultes },
                      { label: 'Enfants', value: enfants },
                      ...(animaux > 0 ? [{ label: 'Animaux', value: animaux }] : []),
                    ].map(s => (
                      <div key={s.label}>
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
                           className="text-[#2d3228]">
                          {s.value}
                        </p>
                        <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Parts invitées — cliquable pour voir la liste */}
            {total > 0 && (
              <SyntheseParMoment guests={guestList} total={total} partsLabels={PARTS_LABELS} />
            )}

            {/* Régimes & attentions particulières */}
            {total > 0 && (() => {
              const withDietary = guestList.filter(g => (g as { dietary_notes?: string | null }).dietary_notes)
              return (
                <div className="bg-white rounded-2xl border border-stone-100 p-5">
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                     className="text-stone-400 uppercase mb-4">
                    Régimes & attentions particulières
                  </p>
                  {withDietary.length === 0 ? (
                    <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-300">
                      Aucune attention particulière renseignée.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {withDietary.map(g => {
                        const name = [g.first_name, g.last_name].filter(Boolean).join(' ')
                        return (
                          <div key={g.id} className="flex items-start gap-3 bg-orange-50/50 border border-orange-100 rounded-xl px-3 py-2.5">
                            <span className="text-orange-400 text-xs leading-none mt-0.5 shrink-0">⚠</span>
                            <div>
                              <p style={{ fontWeight: 500, fontSize: '0.82rem' }} className="text-stone-700">{name}</p>
                              <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-orange-700">
                                {(g as { dietary_notes?: string | null }).dietary_notes}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Export */}
            {total > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                   className="text-stone-400 uppercase mb-4">
                  Export
                </p>
                <div className="space-y-3">
                  <GuestPdfExport
                    guests={guestList}
                    weddingName={wedding.name}
                    weddingDate={wedding.date ?? null}
                  />
                  <div className="pt-1 border-t border-stone-50">
                    <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-2">Excel / CSV</p>
                    <ExportGuestsButton guests={guestList} weddingName={wedding.name} />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
