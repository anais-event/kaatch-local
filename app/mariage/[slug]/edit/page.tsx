import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import SlugField from './SlugField'
import CoverPositionPicker from './CoverPositionPicker'
import QRCodeDisplay from '../partager/QRCodeDisplay'
import CopyButton from '../partager/CopyButton'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function saveShareCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const share_code = (formData.get('share_code') as string).toUpperCase().trim()
  await supabase.from('weddings').update({ share_code }).eq('slug', slug)
  revalidatePath(`/mariage/${slug}/edit`)
}

async function updateWedding(formData: FormData) {
  'use server'

  const supabase = await createSupabaseServerClient()
  const currentSlug = formData.get('slug') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string
  const name = formData.get('name') as string
  const couple_message = formData.get('couple_message') as string
  const cover_position_y = parseInt(formData.get('cover_position_y') as string) || 50

  const rawNewSlug = (formData.get('new_slug') as string ?? '').trim()
  const newSlug = rawNewSlug ? toSlug(rawNewSlug) : currentSlug

  const file = formData.get('cover_image') as File
  let cover_image_url: string | undefined

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const path = `${currentSlug}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('wedding-covers')
      .upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('wedding-covers').getPublicUrl(path)
      cover_image_url = urlData.publicUrl
    }
  }

  if (newSlug !== currentSlug) {
    const { data: existing } = await supabase
      .from('weddings').select('id').eq('slug', newSlug).single()
    if (existing) {
      redirect(`/mariage/${currentSlug}/edit?error=slug-taken`)
    }
  }

  await supabase
    .from('weddings')
    .update({
      date, location, name,
      couple_message: couple_message || null,
      cover_position_y,
      slug: newSlug,
      ...(cover_image_url ? { cover_image_url } : {}),
    })
    .eq('slug', currentSlug)

  revalidatePath(`/mariage/${newSlug}`)
  revalidatePath(`/mariage/${newSlug}/edit`)
  redirect(`/mariage/${newSlug}`)
}

export default async function EditWedding({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string }> }) {
  const { slug } = await params
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!wedding) {
    return <div className="p-8">Mariage introuvable 😢</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8">
      <div className="w-full max-w-lg">

        <div className="mb-6">
          <a href={`/mariage/${slug}`}
             className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour
          </a>
        </div>

        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '2rem' }}
              className="text-[#2d3228]">
            Modifier les infos
          </h1>
        </div>

        {error === 'slug-taken' && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-red-600">
              Cette URL est déjà prise. Choisissez-en une autre.
            </p>
          </div>
        )}

        <div className="bg-white/80 rounded-3xl shadow-sm p-8 mb-6">
          <form action={updateWedding} className="space-y-6">
            <input type="hidden" name="slug" value={slug} />

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Le mariage de
              </label>
              <input
                type="text"
                name="name"
                defaultValue={wedding.name || ''}
                placeholder="Ex : Sophie & Thomas"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>

            <SlugField currentSlug={slug} />

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Photo de couverture
              </label>
              <CoverPositionPicker
                imageUrl={wedding.cover_image_url}
                defaultPosition={wedding.cover_position_y ?? 50}
              />
              {!wedding.cover_image_url && (
                <input type="hidden" name="cover_position_y" value="50" />
              )}
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={wedding.date || ''}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Lieu
              </label>
              <input
                type="text"
                name="location"
                defaultValue={wedding.location || ''}
                placeholder="Ex : Château de Versailles"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Mot des mariés <span className="normal-case text-stone-300">(affiché sur le faire-part)</span>
              </label>
              <textarea
                name="couple_message"
                defaultValue={wedding.couple_message || ''}
                rows={5}
                placeholder="Ex : Nous sommes fous de joie de vous inviter à partager ce jour si important pour nous..."
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white resize-none"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.7 }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.85rem' }}
              >
                Enregistrer
              </button>
              <a
                href={`/mariage/${slug}`}
                className="flex-1 bg-stone-100 text-stone-500 py-3 rounded-full text-center hover:bg-stone-200 transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
              >
                Annuler
              </a>
            </div>
          </form>
        </div>

        {/* ─── Accès invités ─── */}
        {(() => {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://kaatch.fr'
          const shareUrl = wedding.share_code ? `${baseUrl}/p/${wedding.share_code}` : null
          return (
            <div style={{ fontFamily: 'var(--font-lato)' }}>
              <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
                 className="text-stone-400 uppercase mb-3">Accès invités</p>

              {/* Code de partage */}
              <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-4">
                <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228] mb-1">
                  🔑 Code de partage
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mb-4">
                  Vos invités accèdent au site en saisissant ce code sur kaatch.fr.
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
                    Enregistrez un code de partage pour générer votre lien et QR code.
                  </p>
                </div>
              )}
            </div>
          )
        })()}

      </div>
    </div>
  )
}
