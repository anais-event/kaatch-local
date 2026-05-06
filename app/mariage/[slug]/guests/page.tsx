import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import GuestList from './GuestList'
import GuestListSection from './GuestListSection'
import ImportGuests from './ImportGuests'
import AddGuestForm from './AddGuestForm'
import ExportGuestsButton from './ExportGuestsButton'
import InvitationsTab from './InvitationsTab'
import PublipostagePanel from './PublipostagePanel'
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
  }).eq('id', id)
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

type Tab = 'liste' | 'invitations' | 'synthese'
const TABS: { key: Tab; label: string }[] = [
  { key: 'liste',        label: 'Liste' },
  { key: 'invitations',  label: 'Faire-part' },
  { key: 'synthese',     label: 'Synthèse' },
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
  const tab: Tab = (['liste', 'invitations', 'synthese'] as const).includes(tabParam as Tab)
    ? (tabParam as Tab)
    : 'liste'

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, cover_image_url, couple_message, plan')
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
  }

  const paid = isPaid(wedding.plan)

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 md:p-8" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto">

        <div className="mb-4">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            ← Retour au dashboard
          </a>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.02em', lineHeight: 1 }}
                className="text-[#2d3228]">
              Invités
            </h1>
            {total > 0 && (
              <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mt-0.5">
                {confirmed} confirmé{confirmed > 1 ? 's' : ''} · {pending} en attente · {declined} décliné{declined > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {tab === 'liste' && total > 0 && (
            <ExportGuestsButton guests={guestList} weddingName={wedding.name} />
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-stone-100 mb-7">
          {TABS.map(t => (
            <a key={t.key}
               href={`?tab=${t.key}`}
               className={`px-4 py-2.5 text-sm transition-all border-b-2 -mb-px ${
                 tab === t.key
                   ? 'border-[#4a5240] text-[#2d3228]'
                   : 'border-transparent text-stone-400 hover:text-stone-500'
               }`}
               style={{ fontWeight: tab === t.key ? 500 : 300, fontSize: '0.82rem' }}>
              {t.label}
            </a>
          ))}
        </div>

        {/* ── TAB LISTE ── */}
        {tab === 'liste' && (
          <>
            <ImportGuests weddingId={wedding.id} slug={slug} />

            <AddGuestForm
              weddingId={wedding.id}
              slug={slug}
              addGuest={addGuest}
              guestCount={total}
              paid={paid}
            />

            <GuestListSection total={total}>
              <GuestList
                guests={guestList}
                tables={tables ?? []}
                slug={slug}
                baseUrl={baseUrl}
                wedding={weddingPreview}
                setRsvp={setRsvp}
                deleteGuest={deleteGuest}
                updateGuest={updateGuest}
                paid={paid}
                weddingId={wedding.id}
              />
            </GuestListSection>
          </>
        )}

        {/* ── TAB INVITATIONS ── */}
        {tab === 'invitations' && (
          <div className="space-y-6">
            {withoutToken.length > 0 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex-wrap gap-2">
                <p className="text-xs text-amber-700" style={{ fontWeight: 300 }}>
                  {withoutToken.length} invité{withoutToken.length > 1 ? 's' : ''} sans lien personnel — générez-les pour pouvoir envoyer les faire-parts.
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

            <InvitationsTab
              guests={guestList}
              slug={slug}
              baseUrl={baseUrl}
              wedding={weddingPreview}
              weddingId={wedding.id}
              paid={paid}
            />

            <div>
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase mb-3">
                Envoi groupé
              </p>
              <PublipostagePanel guests={guestList} weddingId={wedding.id} slug={slug} />
            </div>
          </div>
        )}

        {/* ── TAB SYNTHÈSE ── */}
        {tab === 'synthese' && (
          <div className="space-y-5">

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
              const adultes = guestList.filter(g => (g as { guest_type?: string }).guest_type !== 'enfant').length
              const enfants = guestList.filter(g => (g as { guest_type?: string }).guest_type === 'enfant').length
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
                    ].map(s => (
                      <div key={s.label}>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
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

            {/* Parts invitées */}
            {total > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                   className="text-stone-400 uppercase mb-4">
                  Par moment
                </p>
                <div className="space-y-2">
                  {(['ceremonie', 'vin_honneur', 'reception'] as const).map(part => {
                    const count = guestList.filter(g => {
                      const parts = (g as { invited_parts?: string[] }).invited_parts
                      return !parts || parts.includes(part)
                    }).length
                    return (
                      <div key={part} className="flex items-center gap-3">
                        <span style={{ fontWeight: 300, fontSize: '0.78rem', width: '8rem', flexShrink: 0 }}
                              className="text-stone-500">
                          {PARTS_LABELS[part]}
                        </span>
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#4a5240] rounded-full"
                               style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                        </div>
                        <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 tabular-nums w-6 text-right">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Export */}
            {total > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                   className="text-stone-400 uppercase mb-3">
                  Export
                </p>
                <ExportGuestsButton guests={guestList} weddingName={wedding.name} />
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
