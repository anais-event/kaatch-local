import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CommandeClient from './CommandeClient'
import DownloadButton from './DownloadButton'

export default async function FinaliserPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  const { data: studio } = await supabase
    .from('studio_progress')
    .select('module_collection, module_destinataires, module_univers, module_reception, progress_collection, progress_destinataires, progress_univers, progress_reception')
    .eq('wedding_id', wedding.id)
    .single()

  const coll = studio?.module_collection as Record<string, { checked: boolean; qty: number; printQty?: number; download?: boolean }> | null

  const LABELS: Record<string, { label: string; icon: string; format: string; qtyLabel: string }> = {
    save_the_date: { label: 'Save the date',    icon: '📅', format: 'A5 · double volet',  qtyLabel: 'ex.' },
    faire_part:    { label: 'Faire-part',        icon: '💌', format: 'A5 · recto verso',   qtyLabel: 'ex.' },
    menu:          { label: 'Menu',              icon: '🍽️', format: 'A5 · recto',         qtyLabel: 'ex.' },
    marque_place:  { label: 'Marque-place',      icon: '🏷️', format: '9×6 cm · chevalet',  qtyLabel: 'ex.' },
    programme:     { label: 'Programme',         icon: '📋', format: 'A5 · 4 pages',       qtyLabel: 'ex.' },
    plan_table:    { label: 'Plan de table',     icon: '🗺️', format: 'A2 · portrait',      qtyLabel: 'affiche' },
    numeros_table: { label: 'Numéros de table',  icon: '🔢', format: 'A5 · chevalet',      qtyLabel: 'tables' },
  }

  const selectedItems = coll
    ? Object.entries(coll)
        .filter(([, v]) => v.checked)
        .map(([key, v]) => ({ key, ...LABELS[key], qty: v.printQty ?? v.qty, download: v.download ?? false }))
        .filter(i => i.label)
    : []

  const totalQty = selectedItems.reduce((acc, i) => acc + (i.download ? 0 : i.qty), 0)
  const downloadItems = selectedItems.filter(i => i.download)
  const printItems    = selectedItems.filter(i => !i.download)

  const modules = [
    { label: 'Collection',    progress: studio?.progress_collection    ?? 0, href: `collection` },
    { label: 'Destinataires', progress: studio?.progress_destinataires ?? 0, href: `destinataires` },
    { label: 'Univers',       progress: studio?.progress_univers       ?? 0, href: `univers` },
    { label: 'Réception',     progress: studio?.progress_reception     ?? 0, href: `reception` },
  ]
  const allDone = modules.every(m => m.progress === 100)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 space-y-6">

        {/* En-tête */}
        <div>
          <a href={`/mariage/${slug}/studio`}
            className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors mb-5"
            style={{ fontWeight: 300, fontSize: '0.75rem' }}>
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Studio créatif
          </a>
          <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-1">Finaliser</p>
          <h1 style={{ fontWeight: 600, fontSize: '1.3rem' }} className="text-[#2d3228] mb-1">Votre collection est prête</h1>
          <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500">
            Vérifiez votre sélection avant de passer commande.
          </p>
        </div>

        {/* Statut modules */}
        {!allDone && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p style={{ fontWeight: 500, fontSize: '0.82rem' }} className="text-amber-700 mb-3">
              Certaines étapes sont incomplètes
            </p>
            <div className="flex flex-col gap-2">
              {modules.filter(m => m.progress < 100).map(m => (
                <a key={m.href} href={`/mariage/${slug}/studio/${m.href}`}
                  className="flex items-center justify-between hover:text-amber-800 transition-colors">
                  <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-amber-600">{m.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '0.7rem' }} className="text-amber-500 underline">Compléter →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Récap commande */}
        {selectedItems.length > 0 && (
          <div>
            <p style={{ fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.12em' }} className="text-stone-400 uppercase mb-3">
              Récapitulatif
            </p>

            {printItems.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden mb-3">
                <div className="px-4 py-2.5 border-b border-stone-50 flex items-center gap-2">
                  <span style={{ fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.1em' }} className="text-stone-400 uppercase">À imprimer</span>
                </div>
                {printItems.map((item, idx) => (
                  <div key={item.key}
                    className={`flex items-center gap-3 px-4 py-3 ${idx < printItems.length - 1 ? 'border-b border-stone-50' : ''}`}>
                    <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }} className="text-[#2d3228]">{item.label}</span>
                      <p style={{ fontWeight: 300, fontSize: '0.65rem', color: '#a8a29e' }} className="mt-0.5">{item.format}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#4a5240]">{item.qty}</span>
                      <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400 ml-1">{item.qtyLabel}</span>
                    </div>
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 flex-shrink-0 w-12 text-right">— €</span>
                  </div>
                ))}
                <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50 flex justify-between">
                  <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{totalQty} créations</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#2d3228]">Total à définir</span>
                </div>
              </div>
            )}

            {downloadItems.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-stone-50">
                  <span style={{ fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.1em' }} className="text-stone-400 uppercase">À télécharger (PDF)</span>
                </div>
                {downloadItems.map((item, idx) => (
                  <div key={item.key}
                    className={`flex items-center gap-3 px-4 py-3 ${idx < downloadItems.length - 1 ? 'border-b border-stone-50' : ''}`}>
                    <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }} className="text-[#2d3228]">{item.label}</span>
                      <p style={{ fontWeight: 300, fontSize: '0.65rem', color: '#a8a29e' }} className="mt-0.5">{item.format}</p>
                    </div>
                    <DownloadButton
                      weddingId={wedding.id}
                      productKey={item.key}
                      label={item.label}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedItems.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-8 text-center">
            <p style={{ fontSize: '2rem' }} className="mb-3">📋</p>
            <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228] mb-2">Aucune création sélectionnée</p>
            <a href={`/mariage/${slug}/studio/collection`}
              style={{ fontWeight: 400, fontSize: '0.8rem' }}
              className="text-[#4a5240] underline hover:text-[#2d3228]">
              Configurer ma collection →
            </a>
          </div>
        )}

        {/* CTA commander */}
        {printItems.length > 0 && (
          <CommandeClient
            weddingId={wedding.id}
            weddingSlug={slug}
            totalQty={totalQty}
            printCount={printItems.length}
          />
        )}

        {/* Lien historique */}
        <div className="text-center">
          <a href={`/mariage/${slug}/studio/commandes`}
            style={{ fontWeight: 300, fontSize: '0.75rem' }}
            className="text-stone-400 hover:text-stone-600 transition-colors underline">
            Voir mes commandes précédentes →
          </a>
        </div>

      </div>
    </div>
  )
}
