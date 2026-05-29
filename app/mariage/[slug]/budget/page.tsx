import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import BudgetBoard from './BudgetBoard'
import BudgetGlobalView from './BudgetGlobalView'
import UpgradePrompt from '@/components/UpgradePrompt'
import { normalizePlan, canAccess } from '@/lib/plan'

export const DEFAULT_CATEGORIES = [
  { name: 'Lieu de réception', icon: '🏛️', color: '#8b7355' },
  { name: 'Traiteur & repas', icon: '🍽️', color: '#4a5240' },
  { name: 'Boissons & alcool', icon: '🍾', color: '#7c8572' },
  { name: 'Wedding cake & desserts', icon: '🎂', color: '#c9a877' },
  { name: 'Photo & vidéo', icon: '📸', color: '#5c6bc0' },
  { name: 'Animation & musique', icon: '🎵', color: '#e07b39' },
  { name: 'Décoration & fleurs', icon: '💐', color: '#c06b8b' },
  { name: 'Tenue de la mariée', icon: '👗', color: '#9c6bb5' },
  { name: 'Tenue du marié', icon: '🤵', color: '#6b7461' },
  { name: 'Alliances', icon: '💍', color: '#a89f99' },
  { name: 'Beauté & bien-être', icon: '💄', color: '#b5763a' },
  { name: 'Faire-part & papeterie', icon: '✉️', color: '#9c8e77' },
  { name: 'Cadeaux invités', icon: '🎁', color: '#5a6350' },
  { name: 'Transport', icon: '🚗', color: '#3a8fa0' },
  { name: 'Hébergement', icon: '🏨', color: '#607055' },
  { name: 'Enfants & baby-sitting', icon: '👶', color: '#8a7c6b' },
  { name: 'Administratif & assurance', icon: '📜', color: '#b5a48e' },
  { name: 'Lune de miel', icon: '🌴', color: '#3a6ea0' },
  { name: 'Imprévus', icon: '🎲', color: '#3d4536' },
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
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
}

async function deleteCategory(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_categories').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
}

async function deleteItem(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_items').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
}

async function updateItemStatus(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_items').update({
    status: formData.get('status') as string,
  }).eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
}

async function deleteQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_quotes').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/budget`)
}

async function retainQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const quoteId = formData.get('id') as string
  const itemId = formData.get('item_id') as string
  await supabase.from('budget_quotes').update({ status: 'en_attente' }).eq('item_id', itemId)
  await supabase.from('budget_quotes').update({ status: 'retenu' }).eq('id', quoteId)
  const { data: quote } = await supabase.from('budget_quotes').select('paid_amount, amount').eq('id', quoteId).single()
  const newStatus = quote?.paid_amount >= quote?.amount ? 'solde' : quote?.paid_amount > 0 ? 'acompte' : 'devis'
  await supabase.from('budget_items').update({ status: newStatus }).eq('id', itemId)
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
}

async function updateCategoryAllocated(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_categories').update({
    budget_allocated: parseFloat(formData.get('allocated') as string) || 0,
  }).eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/budget`)
}

async function refuseQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('budget_quotes').update({ status: 'refuse' }).eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${slug}/budget`)
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
  revalidatePath(`/mariage/${slug}/budget`)
}

const SIM_PALETTE = ['#8b7355', '#4a5240', '#5c6bc0', '#c06b8b', '#e07b39', '#9c6bb5', '#3a8fa0', '#b5763a', '#3a6ea0', '#7c8572', '#a89f99', '#c9a877', '#6b7461', '#9c8e77', '#5a6350', '#8a7c6b', '#b5a48e', '#3d4536', '#607055']

async function importFromSimulation(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const payloadRaw = formData.get('payload') as string
  let payload: { items?: Array<{ nom: string; emoji: string; amount: number; horsTotal?: boolean }>; total?: number; honeymoon?: number } = {}
  try { payload = JSON.parse(payloadRaw) } catch { return }
  if (!payload.items?.length) return

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  const mainItems = payload.items.filter(i => !i.horsTotal)
  const honeymoonItems = payload.items.filter(i => i.horsTotal)

  const categories = mainItems.map((it, i) => ({
    wedding_id: wedding.id,
    name: it.nom,
    icon: it.emoji || '💰',
    color: SIM_PALETTE[i % SIM_PALETTE.length],
    budget_allocated: it.amount,
    position: i,
  }))

  const { data: inserted } = await supabase
    .from('budget_categories')
    .insert(categories)
    .select('id, name, position')
    .order('position')

  if (inserted?.length) {
    const itemsToInsert = inserted.map(cat => {
      const src = mainItems.find(m => m.nom === cat.name)
      return {
        wedding_id: wedding.id,
        category_id: cat.id,
        label: src?.nom ?? cat.name,
        estimated_amount: src?.amount ?? 0,
        status: 'devis',
      }
    })
    await supabase.from('budget_items').insert(itemsToInsert)
  }

  const totalAllocated = mainItems.reduce((s, i) => s + (i.amount || 0), 0) + honeymoonItems.reduce((s, i) => s + (i.amount || 0), 0)
  await supabase.from('weddings').update({ budget_total: totalAllocated }).eq('id', wedding.id)

  revalidatePath(`/mariage/${slug}/budget`)
}

async function reorderCategories(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const orderedIds = JSON.parse(formData.get('orderedIds') as string) as string[]
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from('budget_categories').update({ position: i }).eq('id', id)
    )
  )
  revalidatePath(`/mariage/${slug}/budget`)
}

const BUDGET_TABS = [
  { key: 'devis',    label: 'Devis & prestataires' },
  { key: 'synthese', label: 'Synthèse' },
]
type BudgetTab = 'devis' | 'synthese'

export default async function BudgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab: tabParam = 'devis' } = await searchParams
  const tab: BudgetTab = tabParam === 'synthese' ? 'synthese' : 'devis'
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings').select('id, name, budget_total, budget_currency, plan').eq('slug', slug).single()
  if (!wedding) redirect(`/mariage/${slug}`)

  const plan = normalizePlan(wedding.plan)
  if (!canAccess(plan, 'budget')) {
    return <UpgradePrompt feature="budget" currentPlan={plan} slug={slug} />
  }

  const [
    { data: categories },
    { data: items },
    { data: quotes },
    { data: files },
    { data: contacts },
  ] = await Promise.all([
    supabase.from('budget_categories').select('*').eq('wedding_id', wedding.id).order('position').order('created_at'),
    supabase.from('budget_items').select('*').eq('wedding_id', wedding.id).order('created_at'),
    supabase.from('budget_quotes').select('*').eq('wedding_id', wedding.id).order('created_at'),
    supabase.from('budget_files').select('*').eq('wedding_id', wedding.id).order('created_at'),
    supabase.from('wedding_contacts').select('id, name, role, telephone, email').eq('wedding_id', wedding.id).order('name'),
  ])

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header compact: tabs left + calculator button right */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center border-b-2 border-stone-200 gap-1">
            {BUDGET_TABS.map(t => (
              <a key={t.key} href={`?tab=${t.key}`}
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
          <a
            href={`/budget-mariage?return=/mariage/${slug}/budget`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-[#4a5240] hover:border-[#4a5240] hover:bg-[#4a5240]/5 transition-all"
            style={{ fontWeight: 400 }}
          >
            <span>🧮</span>
            Calculette budget
          </a>
        </div>

        {tab === 'devis' && (
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
            contacts={contacts ?? []}
            actions={{ setBudgetTotal, addCategory, deleteCategory, addItem, updateItem, deleteItem, updateItemStatus, addQuote, updateQuote, deleteQuote, retainQuote, refuseQuote, initDefaultCategories, saveBudgetFileMeta, deleteBudgetFile, updateCategoryAllocated, importFromSimulation, reorderCategories }}
          />
        )}

        {tab === 'synthese' && (
          <BudgetGlobalView
            slug={slug}
            budgetTotal={wedding.budget_total ?? 0}
            budgetCurrency={wedding.budget_currency ?? 'EUR'}
            categories={categories ?? []}
            items={items ?? []}
            quotes={quotes ?? []}
            updateCategoryAllocated={updateCategoryAllocated}
          />
        )}
      </div>
    </div>
  )
}
