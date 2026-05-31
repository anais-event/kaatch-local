import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { revalidatePath } from 'next/cache'
import PrestatairesClient from './PrestatairesClient'

export default async function PrestatairesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const { data: vendors } = await supabase
    .from('wedding_vendors')
    .select('id, name, category, email, phone, permissions, invite_token, vendor_code, is_suspended, created_at')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  // Devis retenus depuis le budget, pas encore importés comme vendor
  const existingNames = (vendors ?? []).map(v => v.name.toLowerCase())

  // D'abord les items du mariage
  const { data: budgetItems } = await supabase
    .from('budget_items')
    .select('id, budget_categories(name)')
    .eq('wedding_id', wedding.id)

  const itemIds = (budgetItems ?? []).map(i => i.id)
  const categoryByItemId: Record<string, string> = {}
  for (const item of budgetItems ?? []) {
    categoryByItemId[item.id] = (item.budget_categories as any)?.name ?? 'Autre'
  }

  const { data: retainedQuotes } = itemIds.length > 0
    ? await supabase
        .from('budget_quotes')
        .select('vendor_name, item_id, amount')
        .eq('status', 'retenu')
        .in('item_id', itemIds)
        .not('vendor_name', 'is', null)
    : { data: [] }

  const budgetSuggestions = (retainedQuotes ?? [])
    .filter(q => q.vendor_name && !existingNames.includes(q.vendor_name!.toLowerCase()))
    .map(q => ({
      name: q.vendor_name!,
      category: categoryByItemId[q.item_id] ?? 'Autre',
    }))
    .filter((s, i, arr) => arr.findIndex(x => x.name.toLowerCase() === s.name.toLowerCase()) === i)

  // Montant retenu par vendor name (pour pré-remplir le contrat)
  const amountByVendorName: Record<string, number> = {}
  for (const q of retainedQuotes ?? []) {
    if (q.vendor_name && q.amount) {
      amountByVendorName[q.vendor_name.toLowerCase()] = (amountByVendorName[q.vendor_name.toLowerCase()] ?? 0) + Number(q.amount)
    }
  }

  async function addVendor(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const email = (formData.get('email') as string) || null
    const phone = (formData.get('phone') as string) || null
    const slugVal = formData.get('slug') as string
    const weddingId = formData.get('wedding_id') as string

    const { getDefaultPermissions } = await import('@/lib/vendor-permissions')
    const permissions = getDefaultPermissions(category)

    await supabase.from('wedding_vendors').insert({
      wedding_id: weddingId,
      name,
      category,
      email,
      phone,
      permissions,
    })
    revalidatePath(`/mariage/${slugVal}/prestataires`)
  }

  async function updateVendor(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const id = formData.get('id') as string
    const slugVal = formData.get('slug') as string
    const field = formData.get('field') as string
    const value = formData.get('value') as string

    if (field === 'permissions') {
      await supabase.from('wedding_vendors').update({ permissions: JSON.parse(value) }).eq('id', id)
    } else if (field === 'is_suspended') {
      await supabase.from('wedding_vendors').update({ is_suspended: value === 'true' }).eq('id', id)
    } else if (field === 'name') {
      await supabase.from('wedding_vendors').update({ name: value }).eq('id', id)
    } else if (field === 'category') {
      await supabase.from('wedding_vendors').update({ category: value }).eq('id', id)
    } else if (field === 'email') {
      await supabase.from('wedding_vendors').update({ email: value || null }).eq('id', id)
    } else if (field === 'phone') {
      await supabase.from('wedding_vendors').update({ phone: value || null }).eq('id', id)
    }
    revalidatePath(`/mariage/${slugVal}/prestataires`)
  }

  async function deleteVendor(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const id = formData.get('id') as string
    const slugVal = formData.get('slug') as string
    await supabase.from('wedding_vendors').delete().eq('id', id)
    revalidatePath(`/mariage/${slugVal}/prestataires`)
  }

  return (
    <PrestatairesClient
      slug={slug}
      weddingId={wedding.id}
      wedding={{ name: wedding.name ?? '', date: wedding.date ?? null, location: wedding.location ?? null }}
      vendors={(vendors ?? []).map(v => ({
        id: v.id,
        name: v.name,
        category: v.category,
        email: v.email,
        phone: v.phone,
        permissions: v.permissions ?? {},
        inviteToken: v.invite_token,
        vendorCode: v.vendor_code ?? '',
        isSuspended: v.is_suspended,
        budgetAmount: amountByVendorName[v.name.toLowerCase()] ?? 0,
      }))}
      budgetSuggestions={budgetSuggestions}
      addAction={addVendor}
      updateAction={updateVendor}
      deleteAction={deleteVendor}
    />
  )
}
