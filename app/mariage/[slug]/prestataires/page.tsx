import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import PrestatairesClient from './PrestatairesClient'

export default async function PrestatairesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: vendors } = await supabase
    .from('wedding_vendors')
    .select('id, name, category, email, phone, permissions, invite_token, is_suspended, created_at')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

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
      vendors={(vendors ?? []).map(v => ({
        id: v.id,
        name: v.name,
        category: v.category,
        email: v.email,
        phone: v.phone,
        permissions: v.permissions ?? {},
        inviteToken: v.invite_token,
        isSuspended: v.is_suspended,
      }))}
      addAction={addVendor}
      updateAction={updateVendor}
      deleteAction={deleteVendor}
    />
  )
}
