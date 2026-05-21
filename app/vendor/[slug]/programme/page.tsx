import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/vendor-permissions'
import type { VendorPermissions } from '@/lib/vendor-permissions'
import VendorProgrammeClient from './VendorProgrammeClient'

export default async function VendorProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const permissions: VendorPermissions = vendor.permissions ?? {}

  if (!hasPermission(permissions, 'programme')) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#2d3228] mb-3">{"Accès non autorisé"}</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-stone-500">
            {"Les mariés ne vous ont pas donné accès au programme."}
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const vendorId: string | null = vendor.id ?? null

  const [{ data: steps }, { data: notes }] = await Promise.all([
    supabase
      .from('program_steps')
      .select('id, title, description, address, time, icon, position')
      .eq('wedding_id', wedding.id)
      .order('position', { ascending: true }),
    vendorId
      ? supabase
          .from('vendor_step_notes')
          .select('step_id, content')
          .eq('vendor_id', vendorId)
      : { data: [] },
  ])

  const notesByStepId: Record<string, string> = {}
  for (const n of notes ?? []) {
    notesByStepId[n.step_id] = n.content
  }

  async function saveNote(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const vendorId = formData.get('vendor_id') as string
    const stepId = formData.get('step_id') as string
    const content = formData.get('content') as string
    const slugVal = formData.get('slug') as string

    if (!vendorId) return

    await supabase
      .from('vendor_step_notes')
      .upsert({ vendor_id: vendorId, step_id: stepId, content, updated_at: new Date().toISOString() },
               { onConflict: 'vendor_id,step_id' })

    revalidatePath(`/vendor/${slugVal}/programme`)
  }

  const weddingDate = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <VendorProgrammeClient
      slug={slug}
      vendorId={vendorId ?? ''}
      weddingName={wedding.name}
      weddingDate={weddingDate}
      steps={(steps ?? []).map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        address: s.address,
        time: s.time,
        icon: s.icon,
        note: notesByStepId[s.id] ?? '',
      }))}
      saveNote={saveNote}
    />
  )
}
