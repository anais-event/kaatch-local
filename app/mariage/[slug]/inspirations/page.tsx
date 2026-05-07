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

async function toggleVisibility(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const weddingId = formData.get('wedding_id') as string
  const current = formData.get('current') === 'true'
  await supabase.from('weddings').update({ inspirations_visible: !current }).eq('id', weddingId)
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
    .from('weddings').select('id, name, inspirations_visible').eq('slug', slug).single()
  if (!wedding) redirect(`/mariage/${slug}`)

  const { data: items } = await supabase
    .from('inspiration_items')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
               style={{ fontWeight: 300 }}>
              ← Retour aux préparatifs
            </a>
            <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
               className="text-stone-400 uppercase mb-1">Inspirations</p>
            <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
                className="text-[#2d3228] leading-none">{wedding.name}</h1>
          </div>
          <form action={toggleVisibility} className="shrink-0 mt-6">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="wedding_id" value={wedding.id} />
            <input type="hidden" name="current" value={String(wedding.inspirations_visible)} />
            <button type="submit"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition cursor-pointer ${
                wedding.inspirations_visible
                  ? 'bg-[#4a5240] text-white border-[#4a5240] hover:bg-[#2d3228]'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-[#4a5240] hover:text-[#4a5240]'
              }`}
              style={{ fontWeight: 300 }}>
              <span>{wedding.inspirations_visible ? '👁' : '👁\u{FE0F}\u{200D}🗨\u{FE0F}'}</span>
              <span>{wedding.inspirations_visible ? 'Visible par les invités' : 'Masqué aux invités'}</span>
            </button>
          </form>
        </div>

        <InspirationsClient
          slug={slug}
          weddingId={wedding.id}
          items={items ?? []}
          inspirationsVisible={wedding.inspirations_visible}
          addItem={addItem}
          deleteItem={deleteItem}
          updateItem={updateItem}
        />
      </div>
    </div>
  )
}
