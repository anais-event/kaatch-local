import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import QRCodeDisplay from './QRCodeDisplay'
import CopyButton from './CopyButton'

async function saveShareCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const share_code = (formData.get('share_code') as string).toUpperCase().trim()

  await supabase.from('weddings').update({ share_code }).eq('slug', slug)
  revalidatePath(`/mariage/${slug}/partager`)
}

export default async function PartagerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, share_code, date')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://kaatch.fr'
  const shareUrl = wedding.share_code
    ? `${baseUrl}/p/${wedding.share_code}`
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 md:p-8">
      <div className="max-w-lg mx-auto">

        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
            className="text-[#2d3228] mb-1">
          Partager avec tes invités
        </h1>
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
           className="text-stone-400 mb-6">
          Tes invités accèdent aux photos, au programme et à la messagerie — sans créer de compte.
        </p>

        {/* Code de partage */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-stone-100">
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
             className="text-[#4a5240] mb-3">
            Code de partage
          </p>
          <form action={saveShareCode} className="flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="text" name="share_code"
              defaultValue={wedding.share_code ?? ''}
              placeholder="Ex: EMMA-LUC-2025"
              required
              maxLength={30}
              className="flex-1 border border-stone-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase' }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-4 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm cursor-pointer"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Enregistrer
            </button>
          </form>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.72rem' }}
             className="text-stone-400 mt-1.5">
            Choisis un code simple à retenir — tes invités le saisiront pour accéder à l'espace.
          </p>
        </div>

        {shareUrl ? (
          <>
            {/* Lien + partage */}
            <div className="bg-white rounded-2xl p-5 mb-4 border border-stone-100">
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
                 className="text-[#4a5240] mb-3">
                Lien à partager avec les invités
              </p>

              {/* URL display */}
              <div className="bg-[#f5f0e8] rounded-xl px-3 py-2.5 mb-3 flex items-center justify-between gap-2">
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                   className="text-[#4a5240] break-all">
                  {shareUrl}
                </p>
              </div>

              <CopyButton url={shareUrl} weddingName={wedding.name} />
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-5 border border-stone-100 text-center">
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
                 className="text-[#4a5240] mb-1">
                QR Code
              </p>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem' }}
                 className="text-stone-400 mb-5">
                À imprimer et déposer sur les tables le jour J
              </p>
              <QRCodeDisplay url={shareUrl} weddingName={wedding.name} weddingDate={wedding.date} />
            </div>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
               className="text-amber-700">
              Enregistre d'abord un code de partage pour générer ton lien.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
