import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import BudgetBoard from './BudgetBoard'

export const DEFAULT_CATEGORIES = [
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

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF']

async function setBudgetTotal(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('weddings').update({
    budget_total: parseFloat(formData.get('total') as string) || 0,
    budget_currency: formData.get('currency') as string,
  }).eq('slug', slug)
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
  await supabase.from('budget_items').insert({
    wedding_id: wedding.id,
    category_id: formData.get('category_id') as string,
    label: formData.get('label') as string,
    estimated_amount: parseFloat(formData.get('estimated') as string) || 0,
    description: (formData.get('description') as string) || null,
    status: 'devis',
  })
  revalidatePath(`/wedding/${slug}/budget`)
}

async function deleteItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_items').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function updateItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_items').update({
    label: formData.get('label') as string,
    estimated_amount: Number(formData.get('estimated') ?? 0),
    description: (formData.get('description') as string) || null,
  }).eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function updateItemStatus(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_items').update({
    status: formData.get('status') as string,
  }).eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function addQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('budget_quotes').insert({
    item_id: formData.get('item_id') as string,
    wedding_id: wedding.id,
    vendor_name: (formData.get('vendor_name') as string) || null,
    amount: parseFloat(formData.get('amount') as string) || 0,
    paid_amount: parseFloat(formData.get('paid_amount') as string) || 0,
    currency: (formData.get('currency') as string) || 'EUR',
    status: 'en_attente',
    notes: (formData.get('notes') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  })
  revalidatePath(`/wedding/${slug}/budget`)
}

async function updateQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_quotes').update({
    vendor_name: (formData.get('vendor_name') as string) || null,
    amount: parseFloat(formData.get('amount') as string) || 0,
    paid_amount: parseFloat(formData.get('paid_amount') as string) || 0,
    currency: (formData.get('currency') as string) || 'EUR',
    notes: (formData.get('notes') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  }).eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function deleteQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_quotes').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function retainQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const quoteId = formData.get('id') as string
  const itemId = formData.get('item_id') as string
  // Remettre tous les devis du poste en "en_attente"
  await supabase.from('budget_quotes').update({ status: 'en_attente' }).eq('item_id', itemId)
  // Marquer celui-ci comme retenu
  await supabase.from('budget_quotes').update({ status: 'retenu' }).eq('id', quoteId)
  // Mettre à jour le statut du poste
  const { data: quote } = await supabase.from('budget_quotes').select('paid_amount, amount').eq('id', quoteId).single()
  const newStatus = quote?.paid_amount >= quote?.amount ? 'solde' : quote?.paid_amount > 0 ? 'acompte' : 'devis'
  await supabase.from('budget_items').update({ status: newStatus }).eq('id', itemId)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function saveBudgetFileMeta(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('budget_files').insert({
    wedding_id: wedding.id,
    quote_id: (formData.get('quote_id') as string) || null,
    item_id: (formData.get('item_id') as string) || null,
    file_name: formData.get('file_name') as string,
    file_url: formData.get('file_url') as string,
    file_type: (formData.get('file_type') as string) || null,
  })
  revalidatePath(`/wedding/${slug}/budget`)
}

async function deleteBudgetFile(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const fileId = formData.get('id') as string
  const filePath = formData.get('file_path') as string
  if (filePath) {
    await supabase.storage.from('budget-files').remove([filePath])
  }
  await supabase.from('budget_files').delete().eq('id', fileId)
  revalidatePath(`/wedding/${slug}/budget`)
}

async function refuseQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_quotes').update({ status: 'refuse' }).eq('id', formData.get('id') as string)
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

  const { data: quotes } = await supabase
    .from('budget_quotes').select('*').eq('wedding_id', wedding.id).order('created_at')

  const { data: files } = await supabase
    .from('budget_files').select('*').eq('wedding_id', wedding.id).order('created_at')

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
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
          quotes={quotes ?? []}
          files={files ?? []}
          currencies={CURRENCIES}
          actions={{ setBudgetTotal, addCategory, deleteCategory, addItem, updateItem, deleteItem, updateItemStatus, addQuote, updateQuote, deleteQuote, retainQuote, refuseQuote, initDefaultCategories, saveBudgetFileMeta, deleteBudgetFile }}
        />
      </div>
    </div>
  )
}
