import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { revalidatePath } from 'next/cache'
import ContactPdfUpload from './ContactPdfUpload'

async function addContact(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  await supabase.from('wedding_contacts').insert({
    wedding_id: wedding.id,
    name: formData.get('name') as string,
    role: formData.get('role') as string,
    note: (formData.get('note') as string) || null,
    telephone: (formData.get('telephone') as string) || null,
    email: (formData.get('email') as string) || null,
    instagram: (formData.get('instagram') as string) || null,
    visible_to_guests: formData.get('visible_to_guests') === 'on',
  })
  revalidatePath(`/mariage/${slug}/contacts`)
}

async function deleteContact(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('wedding_contacts').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${formData.get('slug') as string}/contacts`)
}

async function toggleVisibility(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const current = formData.get('current') === 'true'
  await supabase.from('wedding_contacts').update({ visible_to_guests: !current }).eq('id', id)
  revalidatePath(`/mariage/${formData.get('slug') as string}/contacts`)
}

async function updateContactQuote(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  await supabase.from('wedding_contacts').update({
    quote_amount: parseFloat(formData.get('quote_amount') as string) || 0,
    deposit_amount: parseFloat(formData.get('deposit_amount') as string) || 0,
  }).eq('id', id)
  revalidatePath(`/mariage/${slug}/contacts`)
}

async function saveContactPdf(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const contactId = formData.get('contact_id') as string
  const slug = formData.get('slug') as string
  await supabase.from('wedding_contacts').update({
    quote_pdf_url: formData.get('file_url') as string,
    quote_pdf_name: formData.get('file_name') as string,
  }).eq('id', contactId)
  revalidatePath(`/mariage/${slug}/contacts`)
}

const ROLES = ['Fleuriste', 'DJ', 'Traiteur', 'Photographe', 'Vidéaste', 'Témoin mariée', 'Témoin marié', 'Officiant', 'Coiffeur/se', 'Maquilleur/se', 'Transporteur', 'Babysitter', 'Lieu de réception', 'Autre (préciser)']

function fmtEur(amount: number) {
  try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount) }
  catch { return `${amount} €` }
}

export default async function ContactsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const { data: contacts } = await supabase
    .from('wedding_contacts')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('role')

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.5rem' }}
            className="text-[#2d3228] mb-2">Prestataires</h1>
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
           className="text-stone-400 mb-8">
          Gérez vos contacts. Activez la visibilité pour que vos invités puissent les voir.
        </p>

        {/* Formulaire ajout */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-stone-100">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#4a5240] mb-4">Ajouter un prestataire</h2>
          <form action={addContact} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="name" placeholder="Nom *" required
                className="border border-stone-200 rounded-lg px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <select name="role"
                className="border border-stone-200 rounded-lg px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input type="tel" name="telephone" placeholder="Téléphone"
                className="border border-stone-200 rounded-lg px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <input type="email" name="email" placeholder="Email"
                className="border border-stone-200 rounded-lg px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <input type="text" name="instagram" placeholder="@instagram"
                className="border border-stone-200 rounded-lg px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            </div>
            <input type="text" name="note" placeholder="Note (ex: disponible le jour J pour les urgences)"
              className="w-full border border-stone-200 rounded-lg px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="visible_to_guests" defaultChecked
                className="w-4 h-4 accent-[#4a5240]" />
              <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                    className="text-stone-600">
                Visible aux invités
              </span>
            </label>
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-2.5 rounded-lg hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              + Ajouter
            </button>
          </form>
        </div>

        {/* Liste contacts */}
        {contacts && contacts.length > 0 && (
          <div className="space-y-3">
            {contacts.map(contact => {
              const quoteAmt = contact.quote_amount ?? 0
              const depositAmt = contact.deposit_amount ?? 0
              const remaining = quoteAmt - depositAmt

              return (
                <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                  {/* Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
                           className="text-stone-400 uppercase mb-1">{contact.role}</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}
                           className="text-[#2d3228]">{contact.name}</p>
                        {contact.note && (
                          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.82rem' }}
                             className="text-stone-500 mt-1 italic">{contact.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <form action={toggleVisibility}>
                          <input type="hidden" name="id" value={contact.id} />
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="current" value={String(contact.visible_to_guests)} />
                          <button type="submit" title={contact.visible_to_guests ? 'Cacher aux invités' : 'Montrer aux invités'}
                            className={`text-xs px-3 py-1 rounded-lg transition cursor-pointer ${contact.visible_to_guests ? 'bg-[#4a5240]/10 text-[#4a5240]' : 'bg-stone-100 text-stone-400'}`}
                            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                            {contact.visible_to_guests ? 'Visible' : 'Caché'}
                          </button>
                        </form>
                        <form action={deleteContact}>
                          <input type="hidden" name="id" value={contact.id} />
                          <input type="hidden" name="slug" value={slug} />
                          <button type="submit" className="text-stone-300 hover:text-red-400 transition text-lg cursor-pointer">×</button>
                        </form>
                      </div>
                    </div>

                    {/* Coordonnées */}
                    {(contact.telephone || contact.email || contact.instagram) && (
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-stone-100">
                        {contact.telephone && (
                          <a href={`tel:${contact.telephone}`}
                             className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#4a5240] transition"
                             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                            <span>📞</span> {contact.telephone}
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`}
                             className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#4a5240] transition"
                             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                            <span>✉️</span> {contact.email}
                          </a>
                        )}
                        {contact.instagram && (
                          <a href={`https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                             className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#4a5240] transition"
                             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                            <span>📷</span> {contact.instagram}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section devis & paiements */}
                  <div className="border-t border-stone-100 bg-stone-50/40 px-5 py-4">
                    <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.14em' }}
                       className="text-stone-400 uppercase mb-3">Devis & paiements</p>

                    {/* Résumé financier */}
                    {quoteAmt > 0 && (
                      <div className="flex gap-5 mb-3">
                        <div>
                          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.1em' }}
                             className="text-stone-400 uppercase mb-0.5">Montant devis</p>
                          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.05rem' }}
                             className="text-stone-700">{fmtEur(quoteAmt)}</p>
                        </div>
                        {depositAmt > 0 && (
                          <>
                            <div>
                              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.1em' }}
                                 className="text-stone-400 uppercase mb-0.5">Acompte versé</p>
                              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.05rem' }}
                                 className="text-emerald-600">{fmtEur(depositAmt)}</p>
                            </div>
                            {remaining > 0 && (
                              <div>
                                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.1em' }}
                                   className="text-stone-400 uppercase mb-0.5">Reste à payer</p>
                                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.05rem' }}
                                   className="text-amber-500">{fmtEur(remaining)}</p>
                              </div>
                            )}
                            {remaining <= 0 && (
                              <div className="flex items-end pb-1">
                                <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.82rem' }}
                                      className="text-emerald-500">Soldé ✓</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* PDF */}
                    <div className="mb-3">
                      <ContactPdfUpload
                        contactId={contact.id}
                        slug={slug}
                        weddingId={wedding.id}
                        currentPdfUrl={contact.quote_pdf_url}
                        currentPdfName={contact.quote_pdf_name}
                        onSave={saveContactPdf}
                      />
                    </div>

                    {/* Formulaire montants */}
                    <form action={updateContactQuote} className="flex gap-2 flex-wrap items-end">
                      <input type="hidden" name="id" value={contact.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <div>
                        <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.1em' }}
                               className="block text-stone-400 uppercase mb-1">Montant devis</label>
                        <input name="quote_amount" type="number" placeholder="0" min={0} defaultValue={quoteAmt || ''}
                          className="w-32 border border-stone-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
                          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.1em' }}
                               className="block text-stone-400 uppercase mb-1">Acompte versé</label>
                        <input name="deposit_amount" type="number" placeholder="0" min={0} defaultValue={depositAmt || ''}
                          className="w-32 border border-stone-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
                          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                      </div>
                      <button type="submit"
                        className="bg-[#4a5240] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#2d3228] transition cursor-pointer"
                        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                        Sauvegarder
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {contacts?.length === 0 && (
          <div className="text-center py-12">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
               className="text-stone-400">Aucun prestataire pour l'instant…</p>
          </div>
        )}
      </div>
    </div>
  )
}
