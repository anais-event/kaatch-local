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
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Standard header */}
        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
             style={{ fontWeight: 300 }}>
            ← Retour aux préparatifs
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Boîte à outils</p>
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
              className="text-[#2d3228] leading-none">{wedding.name}</h1>
        </div>

        {/* ─── Section : PDF & impressions ─── */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-4">
          <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228] mb-1">
            📄 Impressions & PDF
          </p>
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mb-4">
            Tous vos documents prêts à imprimer ou télécharger.
          </p>
          <div className="space-y-2.5">

            <a href={`/mariage/${slug}/guests?tab=synthese`}
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">👥</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Liste invités & synthèse traiteur</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">PDF avec RSVP, régimes, statistiques</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Ouvrir →
              </span>
            </a>

            <a href={`/mariage/${slug}/programme/recap`} target="_blank"
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">📋</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Programme de la journée</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">À imprimer pour les prestataires & témoins</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Imprimer →
              </span>
            </a>

            <a href={`/mariage/${slug}/tables/recap`} target="_blank"
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">🪑</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Plan de table</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Récap des tables à transmettre au traiteur</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Imprimer →
              </span>
            </a>

            <a href={`/mariage/${slug}/inspirations`}
               className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] rounded-xl hover:bg-[#ede8df] transition group cursor-pointer">
              <span className="text-lg">✨</span>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">Inspirations & moodboard</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Menu, déco, tenues — aperçu & export</p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">
                Ouvrir →
              </span>
            </a>
          </div>
        </div>

        {/* ─── Section : accès invités ─── */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-stone-100">
          <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228] mb-1">
            🔑 Accès invités
          </p>
          <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mb-4">
            Vos invités accèdent aux photos, au programme et à la messagerie sans créer de compte.
          </p>
          <form action={saveShareCode} className="flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input type="text" name="share_code"
              defaultValue={wedding.share_code ?? ''}
              placeholder="Ex: EMMA-LUC-2025"
              required
              maxLength={30}
              className="flex-1 border border-stone-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
              style={{ fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase' }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-4 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm cursor-pointer"
              style={{ fontWeight: 300 }}>
              Enregistrer
            </button>
          </form>
          <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mt-1.5">
            Code simple à retenir — vos invités le saisissent sur kaatch.fr
          </p>
        </div>

        {shareUrl ? (
          <>
            {/* Lien */}
            <div className="bg-white rounded-2xl p-5 mb-4 border border-stone-100">
              <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228] mb-3">
                🔗 Lien de partage
              </p>
              <div className="bg-[#f5f0e8] rounded-xl px-3 py-2.5 mb-3 flex items-center justify-between gap-2">
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-[#4a5240] break-all">
                  {shareUrl}
                </p>
              </div>
              <CopyButton url={shareUrl} weddingName={wedding.name} />
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-5 border border-stone-100 text-center">
              <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228] mb-1">
                📱 QR Code
              </p>
              <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mb-5">
                À imprimer et déposer sur les tables le jour J
              </p>
              <QRCodeDisplay url={shareUrl} weddingName={wedding.name} weddingDate={wedding.date} />
            </div>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
            <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-amber-700">
              Enregistrez d'abord un code de partage pour générer votre lien et QR code.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
