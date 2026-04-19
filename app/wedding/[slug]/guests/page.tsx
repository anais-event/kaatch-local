import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import GuestList from './GuestList'
import ImportGuests from './ImportGuests'
import AddGuestForm from './AddGuestForm'
import ExportGuestsButton from './ExportGuestsButton'

async function addGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('guests').insert({
    wedding_id: formData.get('wedding_id') as string,
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
    guest_type: (formData.get('guest_type') as string) || 'adulte',
  })
  revalidatePath(`/wedding/${slug}/guests`)
}

async function deleteGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  await supabase.from('guests').delete().eq('id', id)
  revalidatePath(`/wedding/${slug}/guests`)
}

async function setRsvp(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  const rsvp_status = formData.get('rsvp_status') as string
  await supabase.from('guests').update({ rsvp_status }).eq('id', id)
  revalidatePath(`/wedding/${slug}/guests`)
}

async function updateGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  await supabase.from('guests').update({
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    nickname: (formData.get('nickname') as string) || null,
    email: (formData.get('email') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    relation: (formData.get('relation') as string) || null,
    gender: (formData.get('gender') as string) || null,
  }).eq('id', id)
  revalidatePath(`/wedding/${slug}/guests`)
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
  revalidatePath(`/wedding/${slug}/guests`)
}

const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

export default async function GuestsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, cover_image_url, couple_message')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable 😢</div>

  const [{ data: guests }, { data: tables }] = await Promise.all([
    supabase.from('guests').select('*').eq('wedding_id', wedding.id).order('first_name', { ascending: true }),
    supabase.from('seating_tables').select('id, name').eq('wedding_id', wedding.id),
  ])

  const total = guests?.length ?? 0
  const confirmed = guests?.filter(g => g.rsvp_status === 'confirme').length ?? 0
  const declined = guests?.filter(g => g.rsvp_status === 'decline').length ?? 0
  const pending = guests?.filter(g => g.rsvp_status === 'en_attente').length ?? 0
  const withoutToken = (guests ?? []).filter(g => !g.invite_token)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kaatch-app.vercel.app'

  const weddingPreview = {
    name: wedding.name,
    date: wedding.date,
    location: wedding.location,
    coverImageUrl: wedding.cover_image_url,
    coupleMessage: wedding.couple_message,
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-4">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2rem', fontStyle: 'italic' }}
              className="text-[#2d3228]">
            Invités {total > 0 && <span style={{ fontSize: '1.2rem' }} className="text-stone-400">({total})</span>}
          </h1>
          {total > 0 && <ExportGuestsButton guests={guests ?? []} weddingName={wedding.name} />}
        </div>

        {/* ── RSVP Stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: `Confirmé${confirmed > 1 ? 's' : ''}`, value: confirmed, color: 'text-[#4a5240]' },
            { label: 'En attente', value: pending, color: 'text-stone-400' },
            { label: `Décliné${declined > 1 ? 's' : ''}`, value: declined, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-stone-100 p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: 'var(--font-cormorant)' }}>{s.value}</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5"
                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Générer les liens ── */}
        {withoutToken.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex-wrap gap-2">
            <p className="text-xs text-amber-700" style={{ fontWeight: 300 }}>
              {withoutToken.length} invité{withoutToken.length > 1 ? 's' : ''} sans lien d'invitation
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
        {withoutToken.length === 0 && total > 0 && (
          <p className="text-xs text-emerald-600 mb-4" style={{ fontWeight: 300 }}>✓ Tous les liens d'invitation sont prêts</p>
        )}

        {/* ── Import Excel ── */}
        <ImportGuests weddingId={wedding.id} slug={slug} />

        {/* ── Formulaire d'ajout (collapsible) ── */}
        <AddGuestForm weddingId={wedding.id} slug={slug} addGuest={addGuest} />

        {/* ── Tableau unifié invités ── */}
        <div className="bg-white rounded-xl border border-stone-100 p-4 md:p-6">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.2rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">
            Liste ({total})
          </h2>
          <GuestList
            guests={guests ?? []}
            tables={tables ?? []}
            slug={slug}
            baseUrl={baseUrl}
            wedding={weddingPreview}
            setRsvp={setRsvp}
            deleteGuest={deleteGuest}
            updateGuest={updateGuest}
          />
        </div>

      </div>
    </div>
  )
}
