import { redirect } from 'next/navigation'
import { getVendorSession } from '@/lib/guest-session'
import { createServiceClient } from '@/lib/supabase-service'
import { revalidatePath } from 'next/cache'
import VendorDocumentsClient from './VendorDocumentsClient'

const BUCKET = 'vendor-documents'

/**
 * Autorisation serveur : vérifie la session prestataire signée + que ce prestataire
 * est bien rattaché au mariage du slug (et non suspendu). Renvoie les identifiants
 * de confiance (résolus côté serveur, jamais depuis le client) ou null.
 */
async function resolveVendorContext(slug: string): Promise<{ weddingId: string; vendorId: string; vendorName: string } | null> {
  const session = await getVendorSession(slug)
  if (!session?.id) return null

  const service = createServiceClient()
  const { data: wedding } = await service
    .from('weddings')
    .select('id')
    .eq('slug', slug)
    .single()
  if (!wedding) return null

  // Le prestataire de la session doit appartenir à CE mariage et ne pas être suspendu.
  const { data: vendorRow } = await service
    .from('wedding_vendors')
    .select('id, is_suspended, name')
    .eq('id', session.id)
    .eq('wedding_id', wedding.id)
    .single()
  if (!vendorRow || vendorRow.is_suspended) return null

  return { weddingId: wedding.id, vendorId: session.id, vendorName: vendorRow.name ?? '' }
}

export default async function VendorDocumentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ctx = await resolveVendorContext(slug)
  if (!ctx) redirect('/')

  const service = createServiceClient()

  const { data: wedding } = await service
    .from('weddings')
    .select('id, name')
    .eq('id', ctx.weddingId)
    .single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  async function uploadDocument(formData: FormData): Promise<{ error?: string }> {
    'use server'
    // Ré-autorisation côté serveur : ne jamais se fier aux ids du formulaire.
    const authz = await resolveVendorContext(slug)
    if (!authz) return { error: 'Non autorisé' }

    const file = formData.get('file') as File
    const uploadedBy = (formData.get('uploaded_by') as string) || ''
    if (!file || file.size === 0) return { error: 'Fichier vide' }

    const ext = file.name.split('.').pop() || 'pdf'
    const path = `${authz.weddingId}/${authz.vendorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()

    const service = createServiceClient()
    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(path, Buffer.from(bytes), { contentType: file.type })
    if (uploadError) return { error: uploadError.message }

    const { error: insertError } = await service.from('vendor_documents').insert({
      wedding_id: authz.weddingId,
      vendor_id: authz.vendorId,
      name: file.name,
      file_url: path, // référence permanente au chemin Storage (jamais une URL signée)
      file_type: file.type,
      file_size: file.size,
      uploaded_by: uploadedBy,
    })
    if (insertError) return { error: insertError.message }

    revalidatePath(`/vendor/${slug}/documents`)
    return {}
  }

  async function deleteDocument(formData: FormData) {
    'use server'
    const authz = await resolveVendorContext(slug)
    if (!authz) return
    const docId = formData.get('doc_id') as string
    if (!docId) return

    const service = createServiceClient()
    // Le document doit appartenir au prestataire + mariage autorisés.
    const { data: doc } = await service
      .from('vendor_documents')
      .select('id, file_url')
      .eq('id', docId)
      .eq('wedding_id', authz.weddingId)
      .eq('vendor_id', authz.vendorId)
      .single()
    if (!doc) return

    // Supprimer l'objet Storage (si chemin) puis la ligne.
    if (doc.file_url && !doc.file_url.startsWith('http')) {
      await service.storage.from(BUCKET).remove([doc.file_url])
    }
    await service.from('vendor_documents').delete().eq('id', doc.id)
    revalidatePath(`/vendor/${slug}/documents`)
  }

  const { data: rawDocs } = await service
    .from('vendor_documents')
    .select('id, name, file_url, file_type, file_size, uploaded_by, created_at')
    .eq('vendor_id', ctx.vendorId)
    .eq('wedding_id', ctx.weddingId)
    .order('created_at', { ascending: false })

  const docs = await Promise.all(
    (rawDocs ?? []).map(async (doc) => {
      // Référence permanente = chemin Storage. URL signée générée à l'accès (1h).
      if (doc.file_url.startsWith('http')) {
        return { ...doc, signed_url: doc.file_url } // compat anciennes données éventuelles
      }
      const { data } = await service.storage.from(BUCKET).createSignedUrl(doc.file_url, 60 * 60)
      return { ...doc, signed_url: data?.signedUrl ?? '' }
    })
  )

  return (
    <VendorDocumentsClient
      slug={slug}
      vendor={{ id: ctx.vendorId, name: ctx.vendorName }}
      weddingId={ctx.weddingId}
      documents={docs}
      uploadAction={uploadDocument}
      deleteAction={deleteDocument}
    />
  )
}
