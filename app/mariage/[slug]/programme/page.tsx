import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import ProgrammeClient from './ProgrammeClient'

const ICONS = ['💒', '🥂', '🍽️', '🎵', '🎂', '📸', '🚌', '🌸', '✨', '🎉']

async function addStep(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  const { data: last } = await supabase
    .from('program_steps')
    .select('position')
    .eq('wedding_id', wedding.id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  await supabase.from('program_steps').insert({
    wedding_id: wedding.id,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    address: (formData.get('address') as string) || null,
    time: (formData.get('time') as string) || null,
    icon: (formData.get('icon') as string) || '✨',
    position: last ? last.position + 1 : 0,
    visible_to_guests: true,
    vendor_ids: [],
  })

  revalidatePath(`/mariage/${slug}/programme`)
}

async function deleteStep(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('program_steps').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${formData.get('slug') as string}/programme`)
}

async function updateStep(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const visibleRaw = formData.get('visible_to_guests') as string

  await supabase.from('program_steps').update({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    address: (formData.get('address') as string) || null,
    time: (formData.get('time') as string) || null,
    icon: (formData.get('icon') as string) || '✨',
    visible_to_guests: visibleRaw === 'false' ? false : true,
    responsible: (formData.get('responsible') as string) || null,
  }).eq('id', formData.get('id') as string)

  revalidatePath(`/mariage/${slug}/programme`)
}

async function toggleStepVendor(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const stepId = formData.get('step_id') as string
  const vendorId = formData.get('vendor_id') as string
  const slug = formData.get('slug') as string

  const { data: step } = await supabase
    .from('program_steps')
    .select('vendor_ids')
    .eq('id', stepId)
    .single()

  const current: string[] = step?.vendor_ids ?? []
  const next = current.includes(vendorId)
    ? current.filter((id: string) => id !== vendorId)
    : [...current, vendorId]

  await supabase.from('program_steps').update({ vendor_ids: next }).eq('id', stepId)
  revalidatePath(`/mariage/${slug}/programme`)
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [{ data: steps }, { data: vendors }] = await Promise.all([
    supabase
      .from('program_steps')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('position', { ascending: true }),
    supabase
      .from('wedding_vendors')
      .select('id, name, category')
      .eq('wedding_id', wedding.id)
      .order('created_at', { ascending: true }),
  ])

  return (
    <ProgrammeClient
      slug={slug}
      steps={steps || []}
      icons={ICONS}
      vendors={vendors || []}
      addStep={addStep}
      deleteStep={deleteStep}
      updateStep={updateStep}
      toggleStepVendor={toggleStepVendor}
    />
  )
}
