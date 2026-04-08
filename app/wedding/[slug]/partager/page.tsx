import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'

const QRCodeDisplay = dynamic(() => import('./QRCodeDisplay'), { ssr: false })
const CopyButton = dynamic(() => import('./CopyButton'), { ssr: false })

async function saveShareCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const share_code = (formData.get('share_code') as string).toUpperCase().trim()

  await supabase.from('weddings').update({ share_code }).eq('slug', slug)
  revalidatePath(`/wedding/${slug}/partager`)
}

export default async function PartagerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, share_code')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const shareUrl = wedding.share_code
    ? `${protocol}://${host}/p/${wedding.share_code}`
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-lg mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-2">
          Partager avec vos invités
        </h1>
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
           className="text-stone-400 mb-8">
          Vos invités pourront accéder aux photos, au programme et à la messagerie sans créer de compte.
        </p>

        {/* Formulaire code */}
        <div className="bg-white/80 rounded-3xl p-6 mb-8 shadow-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">
            Votre code de partage
          </h2>
          <form action={saveShareCode} className="flex gap-3">
            <input type="hidden" name="slug" value={slug} />
            <input type="text" name="share_code"
              defaultValue={wedding.share_code ?? ''}
              placeholder="Ex: SOPHIE-JULIEN-2028"
              required
              maxLength={30}
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase' }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-5 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Enregistrer
            </button>
          </form>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem' }}
             className="text-stone-400 mt-2">
            Choisissez un code simple à retenir.
          </p>
        </div>

        {shareUrl && (
          <>
            {/* Lien */}
            <div className="bg-white/80 rounded-3xl p-6 mb-6 shadow-sm">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
                  className="text-[#4a5240] mb-3">
                🔗 Lien à partager
              </h2>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                 className="text-stone-400 mb-3">Envoyez ce lien par SMS, email, WhatsApp…</p>
              <div className="bg-[#f5f0e8] rounded-xl px-4 py-3 mb-3">
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                   className="text-[#4a5240] break-all">{shareUrl}</p>
              </div>
              <CopyButton url={shareUrl} />
            </div>

            {/* QR Code */}
            <div className="bg-white/80 rounded-3xl p-6 shadow-sm text-center">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
                  className="text-[#4a5240] mb-2">
                📱 QR Code
              </h2>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                 className="text-stone-400 mb-6">À imprimer sur les tables le jour J</p>
              <QRCodeDisplay url={shareUrl} />
            </div>
          </>
        )}

      </div>
    </div>
  )
}
