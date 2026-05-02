import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import PrestatairesClient from './PrestatairesClient'

// Mapping catégorie prestataire → catégorie budget (même nom)
async function syncBudget(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, weddingId: string, vendorId: string, vendorName: string, category: string, montant_total: number | null, acompte: number | null) {
  // Supprimer l'ancienne ligne budget liée si pas de montant
  if (!montant_total) {
    await supabase.from('budget_items').delete().eq('vendor_id', vendorId)
    return
  }
  const montant = montant_total
  // Trouver ou créer la catégorie budget correspondante
  const { data: existing } = await supabase
    .from('budget_categories')
    .select('id')
    .eq('wedding_id', weddingId)
    .eq('name', category)
    .single()

  let categoryId = existing?.id
  if (!categoryId) {
    const { data: created } = await supabase.from('budget_categories').insert({
      wedding_id: weddingId,
      name: category,
      icon: '📦',
      color: '#4a5240',
      budget_allocated: 0,
    }).select('id').single()
    categoryId = created?.id
  }
  if (!categoryId) return

  // Upsert ligne budget liée au vendor
  const { data: existingItem } = await supabase
    .from('budget_items')
    .select('id')
    .eq('vendor_id', vendorId)
    .single()

  const paidAmount = acompte ?? 0
  const itemStatus = paidAmount > 0 && paidAmount >= montant ? 'solde' : paidAmount > 0 ? 'acompte' : 'devis'

  if (existingItem) {
    await supabase.from('budget_items').update({
      label: vendorName,
      estimated_amount: montant,
      paid_amount: paidAmount,
      category_id: categoryId,
      status: itemStatus,
    }).eq('id', existingItem.id)
  } else {
    await supabase.from('budget_items').insert({
      wedding_id: weddingId,
      category_id: categoryId,
      vendor_id: vendorId,
      label: vendorName,
      estimated_amount: montant,
      paid_amount: paidAmount,
      status: itemStatus,
    })
  }
}

async function addPrestataire(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const weddingId = formData.get('wedding_id') as string
  const montant_total = formData.get('montant_total') ? Number(formData.get('montant_total')) : null
  const acompte = formData.get('acompte') ? Number(formData.get('acompte')) : null
  const name = formData.get('name') as string
  const category = formData.get('category') as string

  const { data: vendor } = await supabase.from('vendors').insert({
    wedding_id: weddingId,
    name,
    category,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    website: (formData.get('website') as string) || null,
    notes: (formData.get('notes') as string) || null,
    status: (formData.get('status') as string) || 'en_contact',
    montant_total,
    acompte,
  }).select('id').single()

  if (vendor) {
    await syncBudget(supabase, weddingId, vendor.id, name, category, montant_total, acompte)
  }

  revalidatePath(`/mariage/${slug}/prestataires`)
  revalidatePath(`/mariage/${slug}/budget`)
}

async function updatePrestataire(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  const montant_total = formData.get('montant_total') ? Number(formData.get('montant_total')) : null
  const acompte = formData.get('acompte') ? Number(formData.get('acompte')) : null
  const name = formData.get('name') as string
  const category = formData.get('category') as string

  const { data: vendorOld } = await supabase.from('vendors').select('wedding_id').eq('id', id).single()

  await supabase.from('vendors').update({
    name,
    category,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    website: (formData.get('website') as string) || null,
    notes: (formData.get('notes') as string) || null,
    status: formData.get('status') as string,
    montant_total,
    acompte,
  }).eq('id', id)

  if (vendorOld) {
    await syncBudget(supabase, vendorOld.wedding_id, id, name, category, montant_total, acompte)
  }

  revalidatePath(`/mariage/${slug}/prestataires`)
  revalidatePath(`/mariage/${slug}/budget`)
}

async function deletePrestataire(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  // La suppression du vendor supprime le budget_item lié (via ON DELETE SET NULL + on supprime manuellement)
  await supabase.from('budget_items').delete().eq('vendor_id', id)
  await supabase.from('vendors').delete().eq('id', id)
  revalidatePath(`/mariage/${slug}/prestataires`)
  revalidatePath(`/mariage/${slug}/budget`)
}

export default async function PrestatairesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <PrestatairesClient
      slug={slug}
      weddingId={wedding.id}
      vendors={vendors ?? []}
      addPrestataire={addPrestataire}
      updatePrestataire={updatePrestataire}
      deletePrestataire={deletePrestataire}
    />
  )
}
