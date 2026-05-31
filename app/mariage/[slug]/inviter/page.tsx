import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { Clock, Users, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function InviterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('*').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const [
    { count: totalGuests },
    { count: confirmedCount },
    { count: pendingCount },
    { data: recentRsvps },
  ] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme'),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'en attente'),
    supabase.from('guests').select('first_name, last_name, rsvp_status, invited_at').eq('wedding_id', wedding.id).order('invited_at', { ascending: false }).limit(5),
  ])

  const noReplyCount = (totalGuests ?? 0) - (confirmedCount ?? 0) - (pendingCount ?? 0)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.5rem' }} className="text-[#4a5240] mb-6">
          Inviter
        </h1>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: totalGuests ?? 0, label: 'Invités', href: 'guests' },
            { value: confirmedCount ?? 0, label: 'Confirmés', href: 'guests' },
            { value: pendingCount ?? 0, label: 'En attente', href: 'guests' },
            { value: noReplyCount, label: 'Pas répondu', href: 'guests' },
          ].map(s => (
            <Link key={s.label} href={`/mariage/${slug}/${s.href}`}
              className="bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-md transition group">
              <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-[#4a5240] mb-1">{s.value}</p>
              <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{s.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: À faire + Derniers mouvements */}
          <div className="lg:col-span-2 space-y-6">

            {/* À faire maintenant */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">À faire maintenant</h2>
                <Zap className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-3">
                {[
                  { label: `Relancer ${noReplyCount} invités sans réponse`, done: false },
                  { label: 'Vérifier les allergies et régimes', done: false },
                  { label: 'Finaliser le plan de table', done: false },
                  { label: 'Confirmer le nombre final avec traiteur', done: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300'}`}>
                      {task.done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <p style={{ fontWeight: 400, fontSize: '0.95rem' }} className={task.done ? 'text-stone-400 line-through' : 'text-stone-700'}>{task.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Derniers mouvements */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">Derniers mouvements</h2>
                <Clock className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-2.5">
                {recentRsvps && recentRsvps.length > 0 ? (
                  recentRsvps.map((guest, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                      <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">
                        {guest.first_name} {guest.last_name}
                      </p>
                      <span style={{ fontWeight: 400, fontSize: '0.8rem' }} className={`px-2.5 py-1 rounded-full ${
                        guest.rsvp_status === 'confirme' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {guest.rsvp_status === 'confirme' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-400">Aucun mouvement récent</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: Accès rapides */}
          <div className="space-y-6">

            {/* Accès rapides */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800 mb-4">Accès rapides</h2>
              <div className="space-y-2.5">
                {[
                  { label: 'Invités', sub: 'Gestion complète', href: 'guests' },
                  { label: 'Invitations', sub: 'Faire-parts & envois', href: 'invitations' },
                  { label: 'Réponses RSVP', sub: 'Statuts & relances', href: 'guests' },
                  { label: 'Plan de table', sub: 'Assignation tables', href: 'tables' },
                  { label: 'Menus & allergies', sub: 'Régimes spéciaux', href: 'guests' },
                  { label: 'Groupes', sub: 'Messagerie invités', href: 'messagerie' },
                ].map(link => (
                  <Link key={link.href} href={`/mariage/${slug}/${link.href}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{link.label}</p>
                      <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{link.sub}</p>
                    </div>
                    <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
