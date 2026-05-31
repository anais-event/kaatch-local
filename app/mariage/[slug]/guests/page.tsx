import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
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
import StudioBanner from '../StudioBanner'

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
    guest_type: (formData.get('guest_type') as string) || 'adulte',
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

async function updateGuestNotes(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const notes = (formData.get('notes') as string) || null
  await supabase.from('guests').update({ notes }).eq('id', id)
  revalidatePath(`/mariage/${slug}/guests`)
}

async function setGuestFamily(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const family_name = (formData.get('family_name') as string) || null
  const ids = (formData.get('ids') as string).split(',').filter(Boolean)
  for (const id of ids) {
    await supabase.from('guests').update({ family_name }).eq('id', id)
  }
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
// TABS and PARTS_LABELS are now defined inside the component with translations

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

  const t = await getTranslations('wedding.guests')

  const TABS: { key: Tab; label: string }[] = [
    { key: 'liste',    label: t('tabList') },
    { key: 'synthese', label: t('tabSummary') },
  ]

  const PARTS_LABELS: Record<string, string> = {
    ceremonie:    t('partCeremony'),
    vin_honneur:  t('partCocktail'),
    reception:    t('partReception'),
  }

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, cover_image_url, couple_message, plan, faire_part_theme')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">{t('notFound')}</div>

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

        {/* Header épuré */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <a href={`/mariage/${slug}`}
               className="flex items-center justify-center w-8 h-8 rounded-full text-stone-400 hover:bg-stone-200/60 transition"
               title={t('back')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </a>
            <div>
              <h1 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-[#2d3228] leading-none">
                {t('title')}
              </h1>
              <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mt-0.5">
                {total} {t('guestCount', { count: total })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'liste' && total > 0 && (
              <ExportGuestsButton guests={guestList} weddingName={wedding.name} />
            )}
            {tab === 'liste' && (
              <AddGuestForm
                weddingId={wedding.id}
                slug={slug}
                addGuest={addGuest}
                guestCount={total}
                paid={paid}
              />
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-stone-200/40 p-1 rounded-xl w-fit mb-6">
          {TABS.map(t => (
            <a key={t.key}
               href={`?tab=${t.key}`}
               className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                 tab === t.key
                   ? 'bg-white text-[#2d3228] shadow-sm'
                   : 'text-stone-400 hover:text-stone-600'
               }`}
               style={{ fontWeight: tab === t.key ? 500 : 300 }}>
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
                  💌 {t('noTokenBanner', { count: withoutToken.length })}
                </p>
                <form action={generateTokens}>
                  <input type="hidden" name="slug" value={slug} />
                  <button type="submit"
                    className="bg-[#4a5240] text-white px-4 py-1.5 rounded-xl text-xs hover:bg-[#2d3228] transition cursor-pointer whitespace-nowrap"
                    style={{ fontWeight: 300 }}>
                    {t('generateLinks', { count: withoutToken.length })}
                  </button>
                </form>
              </div>
            )}

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
              updateGuestNotes={updateGuestNotes}
              setGuestFamily={setGuestFamily}
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
          <div className="space-y-4">

            {/* Studio créatif CTA */}
            <StudioBanner slug={slug} context="guests" />

            {/* RSVP + composition — côte à côte */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                   className="text-stone-400 uppercase mb-4">RSVP</p>
                <div className="space-y-3">
                  {[
                    { label: t('confirmed'),  value: confirmed, color: '#4ade80' },
                    { label: t('pending'),    value: pending,   color: '#d6d3d1' },
                    { label: t('declined'),   value: declined,  color: '#fca5a5' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between mb-1">
                        <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-600">{s.label}</span>
                        <span style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500 tabular-nums">{s.value}</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                             style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {total > 0 && (() => {
                const adultes = guestList.filter(g => { const t = (g as { guest_type?: string }).guest_type; return !t || t === 'adulte' }).length
                const ados = guestList.filter(g => (g as { guest_type?: string }).guest_type === 'ado').length
                const enfants = guestList.filter(g => (g as { guest_type?: string }).guest_type === 'enfant').length
                const animaux = guestList.filter(g => (g as { guest_type?: string }).guest_type === 'animal').length
                return (
                  <div className="bg-white rounded-2xl border border-stone-100 p-5">
                    <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                       className="text-stone-400 uppercase mb-4">{t('composition')}</p>
                    <div className="space-y-3">
                      {[
                        { label: t('adults'), value: adultes },
                        ...(ados > 0 ? [{ label: t('teens'), value: ados }] : []),
                        { label: t('children'), value: enfants },
                        ...(animaux > 0 ? [{ label: t('animals'), value: animaux }] : []),
                      ].map(s => (
                        <div key={s.label} className="flex items-baseline justify-between">
                          <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-600">{s.label}</span>
                          <span style={{ fontWeight: 600, fontSize: '1.3rem', lineHeight: 1 }} className="text-[#2d3228]">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Par moment */}
            {total > 0 && (
              <SyntheseParMoment guests={guestList} partsLabels={PARTS_LABELS} />
            )}

            {/* Envoi groupé */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase mb-3">{t('bulkSend')}</p>
              <PublipostagePanel guests={guestList} weddingId={wedding.id} slug={slug} />
            </div>

            {/* Régimes & allergies */}
            {total > 0 && (() => {
              const withDietary = guestList.filter(g => (g as { dietary_notes?: string | null }).dietary_notes)
              if (withDietary.length === 0) return null
              return (
                <div className="bg-white rounded-2xl border border-stone-100 p-5">
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                     className="text-stone-400 uppercase mb-4">{t('dietary')}</p>
                  <div className="space-y-2">
                    {withDietary.map(g => {
                      const name = [g.first_name, g.last_name].filter(Boolean).join(' ')
                      const table = (tables ?? []).find(t => t.id === (g as { table_id?: string | null }).table_id)
                      return (
                        <div key={g.id} className="flex items-start gap-3 bg-orange-50/50 border border-orange-100 rounded-xl px-3 py-2.5">
                          <span className="text-orange-400 text-xs leading-none mt-0.5 shrink-0">⚠</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p style={{ fontWeight: 500, fontSize: '0.82rem' }} className="text-stone-700">{name}</p>
                              {table && (
                                <span style={{ fontWeight: 300, fontSize: '0.68rem' }}
                                      className="text-stone-400 bg-stone-100 px-1.5 py-px rounded-md shrink-0">
                                  {table.name}
                                </span>
                              )}
                            </div>
                            <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-orange-700">
                              {(g as { dietary_notes?: string | null }).dietary_notes}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Export */}
            {total > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                   className="text-stone-400 uppercase mb-4">{t('export')}</p>
                <div className="space-y-3">
                  <GuestPdfExport guests={guestList} weddingName={wedding.name} weddingDate={wedding.date ?? null} />
                  <div className="pt-2 border-t border-stone-50">
                    <ExportGuestsButton guests={guestList} weddingName={wedding.name} tables={tables ?? []} />
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
