import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import InspirationsClient from './InspirationsClient'

async function addItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const weddingId = formData.get('wedding_id') as string
  await supabase.from('inspiration_items').insert({
    wedding_id: weddingId,
    category: formData.get('category') as string,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    url: (formData.get('url') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    budget_note: (formData.get('budget_note') as string) || null,
  })
  revalidatePath(`/mariage/${slug}/inspirations`)
}

async function toggleCatVisibility(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const weddingId = formData.get('wedding_id') as string
  const cat = formData.get('cat') as string
  const isVisible = formData.get('visible') === 'true'

  const { data: w } = await supabase
    .from('weddings').select('inspirations_visible_cats').eq('id', weddingId).single()
  const current: string[] = w?.inspirations_visible_cats ?? []
  const next = isVisible
    ? current.filter((c: string) => c !== cat)
    : [...current.filter((c: string) => c !== cat), cat]

  await supabase.from('weddings').update({ inspirations_visible_cats: next }).eq('id', weddingId)
  revalidatePath(`/mariage/${slug}/inspirations`)
}

async function deleteItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('inspiration_items').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/inspirations`)
}

async function updateItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('inspiration_items').update({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    url: (formData.get('url') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    budget_note: (formData.get('budget_note') as string) || null,
  }).eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/inspirations`)
}

export default async function InspirationsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings').select('id, name, inspirations_visible_cats').eq('slug', slug).single()
  if (!wedding) redirect(`/mariage/${slug}`)

  const { data: items } = await supabase
    .from('inspiration_items')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
             style={{ fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Inspirations</p>
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
              className="text-[#2d3228] leading-none">{wedding.name}</h1>
        </div>

        <InspirationsClient
          slug={slug}
          weddingId={wedding.id}
          items={items ?? []}
          visibleCats={wedding.inspirations_visible_cats ?? []}
          toggleCatVisibility={toggleCatVisibility}
          addItem={addItem}
          deleteItem={deleteItem}
          updateItem={updateItem}
        />
      </div>
    </div>
  )
}
