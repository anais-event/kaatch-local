import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import VendorDocumentsClient from './VendorDocumentsClient'

export default async function VendorDocumentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  async function uploadDocument(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const file = formData.get('file') as File
    const vendorId = formData.get('vendor_id') as string
    const weddingId = formData.get('wedding_id') as string
    const uploadedBy = formData.get('uploaded_by') as string
    const slugVal = formData.get('slug') as string

    if (!file || file.size === 0) return

    const ext = file.name.split('.').pop() || 'pdf'
    const path = `${weddingId}/${vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('vendor-documents')
      .upload(path, Buffer.from(bytes), { contentType: file.type })

    if (uploadError) return

    const { data: urlData } = supabase.storage.from('vendor-documents').getPublicUrl(path)

    await supabase.from('vendor_documents').insert({
      wedding_id: weddingId,
      vendor_id: vendorId,
      name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: uploadedBy,
    })

    revalidatePath(`/vendor/${slugVal}/documents`)
  }

  async function deleteDocument(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const docId = formData.get('doc_id') as string
    const slugVal = formData.get('slug') as string
    await supabase.from('vendor_documents').delete().eq('id', docId)
    revalidatePath(`/vendor/${slugVal}/documents`)
  }

  const { data: docs } = await supabase
    .from('vendor_documents')
    .select('id, name, file_url, file_type, file_size, uploaded_by, created_at')
    .eq('vendor_id', vendor.id)
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  return (
    <VendorDocumentsClient
      slug={slug}
      vendor={vendor}
      weddingId={wedding.id}
      documents={docs ?? []}
      uploadAction={uploadDocument}
      deleteAction={deleteDocument}
    />
  )
}
