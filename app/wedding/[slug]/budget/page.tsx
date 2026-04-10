import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import BudgetBoard from './BudgetBoard'

const DEFAULT_CATEGORIES = [
  { name: 'Lieu & réception', icon: '🏛️', color: '#8b7355' },
  { name: 'Traiteur', icon: '🍽️', color: '#4a5240' },
  { name: 'Photo & vidéo', icon: '📸', color: '#5c6bc0' },
  { name: 'Fleurs & déco', icon: '🌸', color: '#c06b8b' },
  { name: 'Musique & DJ', icon: '🎵', color: '#e07b39' },
  { name: 'Robe & costume', icon: '👗', color: '#9c6bb5' },
  { name: 'Transport', icon: '🚗', color: '#3a8fa0' },
  { name: 'Faire-part', icon: '✉️', color: '#b5763a' },
  { name: 'Lune de miel', icon: '✈️', color: '#3a6ea0' },
  { name: 'Divers', icon: '📦', color: '#888888' },
]

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF']

async function setBudgetTotal(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const total = parseFloat(formData.get('total') as string) || 0
  const currency = formData.get('currency') as string
  await supabase.from('weddings').update({ budget_total: total, budget_currency: currency }).eq('slug', slug)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function addCategory(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('budget_categories').insert({
    wedding_id: wedding.id,
    name: formData.get('name') as string,
    icon: formData.get('icon') as string || '💰',
    color: formData.get('color') as string || '#4a5240',
    budget_allocated: parseFloat(formData.get('allocated') as string) || 0,
  })
  revalidatePath(`/wedding/${slug}/budget`)
}

async function deleteCategory(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_categories').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function addItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  const estimated = parseFloat(formData.get('estimated') as string) || 0
  const paid = parseFloat(formData.get('paid') as string) || 0
  await supabase.from('budget_items').insert({
    wedding_id: wedding.id,
    category_id: formData.get('category_id') as string,
    label: formData.get('label') as string,
    vendor_name: (formData.get('vendor') as string) || null,
    estimated_amount: estimated,
    actual_amount: parseFloat(formData.get('actual') as string) || estimated,
    paid_amount: paid,
    currency: formData.get('currency') as string || 'EUR',
    status: formData.get('status') as string || 'devis',
    due_date: (formData.get('due_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })
  revalidatePath(`/wedding/${slug}/budget`)
}

async function updateItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  const estimated = parseFloat(formData.get('estimated') as string) || 0
  const paid = parseFloat(formData.get('paid') as string) || 0
  await supabase.from('budget_items').update({
    label: formData.get('label') as string,
    vendor_name: (formData.get('vendor') as string) || null,
    estimated_amount: estimated,
    actual_amount: parseFloat(formData.get('actual') as string) || estimated,
    paid_amount: paid,
    currency: formData.get('currency') as string,
    status: formData.get('status') as string,
    due_date: (formData.get('due_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function deleteItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_items').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function initDefaultCategories(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('budget_categories').insert(
    DEFAULT_CATEGORIES.map((c, i) => ({ ...c, wedding_id: wedding.id, position: i }))
  )
  revalidatePath(`/wedding/${slug}/budget`)
}

export default async function BudgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings').select('id, name, budget_total, budget_currency').eq('slug', slug).single()
  if (!wedding) redirect(`/wedding/${slug}`)

  const { data: categories } = await supabase
    .from('budget_categories').select('*').eq('wedding_id', wedding.id).order('position').order('created_at')

  const { data: items } = await supabase
    .from('budget_items').select('*').eq('wedding_id', wedding.id).order('created_at')

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Budget</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] leading-none">{wedding.name}</h1>
        </div>

        <BudgetBoard
          slug={slug}
          weddingId={wedding.id}
          budgetTotal={wedding.budget_total ?? 0}
          budgetCurrency={wedding.budget_currency ?? 'EUR'}
          categories={categories ?? []}
          items={items ?? []}
          currencies={CURRENCIES}
          setBudgetTotal={setBudgetTotal}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
          addItem={addItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
          initDefaultCategories={initDefaultCategories}
        />

      </div>
    </div>
  )
}
