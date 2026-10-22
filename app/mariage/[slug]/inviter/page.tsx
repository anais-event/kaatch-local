import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { Clock, CheckCircle2, Zap, Utensils } from 'lucide-react'
import Link from 'next/link'

function cleanName(name: string | null | undefined): string {
  if (!name) return ''
  return name.split(' ').filter(p => p && p !== 'null').join(' ')
}

type GuestRow = {
  first_name: string
  last_name: string | null
  rsvp_status: string
  rsvp_at: string | null
  invite_sent_at: string | null
  invite_token: string | null
  email: string | null
  telephone: string | null
  plus_one_count: number | null
  dietary_restrictions: string | null
  dietary_notes: string | null
}

export default async function InviterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const { data: guestsData } = await supabase
    .from('guests')
    .select('first_name, last_name, rsvp_status, rsvp_at, invite_sent_at, invite_token, email, telephone, plus_one_count, dietary_restrictions, dietary_notes')
    .eq('wedding_id', wedding.id)

  const guests: GuestRow[] = guestsData ?? []

  const total = guests.length
  const confirmed = guests.filter(g => g.rsvp_status === 'confirme')
  const pending = guests.filter(g => g.rsvp_status === 'en_attente')
  const declined = guests.filter(g => g.rsvp_status === 'decline')

  // Nombre réel de convives = invités confirmés + leurs accompagnants
  const headcount = confirmed.reduce((n, g) => n + 1 + (g.plus_one_count ?? 0), 0)
  const extraGuests = confirmed.reduce((n, g) => n + (g.plus_one_count ?? 0), 0)

  // Régimes / allergies à transmettre au traiteur (uniquement invités confirmés)
  const dietary = confirmed
    .map(g => ({
      name: [cleanName(g.first_name), cleanName(g.last_name)].filter(Boolean).join(' ') || 'Invité',
      info: [g.dietary_restrictions, g.dietary_notes].filter(Boolean).join(' — '),
    }))
    .filter(g => g.info)

  // Invités à relancer : sans réponse ET invitation déjà envoyée
  const toChase = pending.filter(g => g.invite_sent_at)
  // Invitations pas encore envoyées (token prêt mais jamais envoyée)
  const notSent = guests.filter(g => g.invite_token && !g.invite_sent_at && g.rsvp_status === 'en_attente')

  // Derniers mouvements RSVP (ceux qui ont répondu), les plus récents
  const recentRsvps = [...guests]
    .filter(g => g.rsvp_at)
    .sort((a, b) => new Date(b.rsvp_at!).getTime() - new Date(a.rsvp_at!).getTime())
    .slice(0, 6)

  const tasks: { label: string; href: string; done: boolean }[] = []
  if (notSent.length > 0) tasks.push({ label: `Envoyer ${notSent.length} faire-part${notSent.length > 1 ? 's' : ''} pas encore envoyé${notSent.length > 1 ? 's' : ''}`, href: 'invitations', done: false })
  if (toChase.length > 0) tasks.push({ label: `Relancer ${toChase.length} invité${toChase.length > 1 ? 's' : ''} sans réponse`, href: 'guests', done: false })
  if (dietary.length > 0) tasks.push({ label: `Transmettre ${dietary.length} régime${dietary.length > 1 ? 's' : ''}/allergie${dietary.length > 1 ? 's' : ''} au traiteur`, href: 'guests', done: false })
  tasks.push({ label: 'Finaliser le plan de table', href: 'tables', done: false })
  tasks.push({ label: `Confirmer ${headcount} couverts avec le traiteur`, href: 'tables', done: false })

  const stats = [
    { value: total, label: 'Invités', href: 'guests' },
    { value: confirmed.length, label: 'Confirmés', href: 'guests' },
    { value: pending.length, label: 'En attente', href: 'guests' },
    { value: declined.length, label: 'Déclinés', href: 'guests' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.5rem' }} className="text-[#4a5240] mb-6">
          Inviter
        </h1>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {stats.map(s => (
            <Link key={s.label} href={`/mariage/${slug}/${s.href}`}
              className="bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-md transition group">
              <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-[#4a5240] mb-1">{s.value}</p>
              <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Convives réels (avec accompagnants) */}
        <div className="bg-[#4a5240] rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-white mb-1">{headcount}</p>
            <p style={{ fontWeight: 400, fontSize: '0.8rem' }} className="text-white/70">
              Convives attendus {extraGuests > 0 && `(dont ${extraGuests} accompagnant${extraGuests > 1 ? 's' : ''})`}
            </p>
          </div>
          <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/50 text-right max-w-[45%]">
            Confirmés + accompagnants annoncés dans leurs réponses
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* À faire maintenant */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">À faire maintenant</h2>
                <Zap className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-3">
                {tasks.map((task, i) => (
                  <Link key={i} href={`/mariage/${slug}/${task.href}`} className="flex items-start gap-3 group">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300 group-hover:border-[#4a5240]'} transition`}>
                      {task.done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <p style={{ fontWeight: 400, fontSize: '0.95rem' }} className={task.done ? 'text-stone-400 line-through' : 'text-stone-700 group-hover:text-[#4a5240] transition'}>{task.label}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Régimes & allergies */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">Régimes & allergies</h2>
                <Utensils className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              {dietary.length > 0 ? (
                <div className="space-y-2.5">
                  {dietary.map((d, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-50">
                      <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700 shrink-0">{d.name}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-500 text-right">{d.info}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400">
                  Aucun régime particulier signalé pour l’instant.
                </p>
              )}
            </div>

            {/* Derniers mouvements */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">Derniers mouvements</h2>
                <Clock className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-2.5">
                {recentRsvps.length > 0 ? (
                  recentRsvps.map((guest, i) => {
                    const name = [cleanName(guest.first_name), cleanName(guest.last_name)].filter(Boolean).join(' ') || 'Invité'
                    const confirmedRow = guest.rsvp_status === 'confirme'
                    const extra = guest.plus_one_count ?? 0
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                        <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">
                          {name}
                          {confirmedRow && extra > 0 && (
                            <span className="text-stone-400"> +{extra}</span>
                          )}
                        </p>
                        <span style={{ fontWeight: 400, fontSize: '0.8rem' }} className={`px-2.5 py-1 rounded-full ${
                          confirmedRow ? 'bg-green-100 text-green-700' : guest.rsvp_status === 'decline' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {confirmedRow ? 'Confirmé' : guest.rsvp_status === 'decline' ? 'Décliné' : 'En attente'}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-400">Aucune réponse pour l’instant</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: Accès rapides */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800 mb-4">Accès rapides</h2>
              <div className="space-y-2.5">
                {[
                  { label: 'Invités', sub: 'Gestion complète', href: 'guests' },
                  { label: 'Invitations', sub: 'Faire-parts & envois', href: 'invitations' },
                  { label: 'Relancer', sub: `${toChase.length} sans réponse`, href: 'guests' },
                  { label: 'Plan de table', sub: 'Assignation tables', href: 'tables' },
                  { label: 'Menus & allergies', sub: `${dietary.length} signalé${dietary.length > 1 ? 's' : ''}`, href: 'guests' },
                  { label: 'Groupes', sub: 'Messagerie invités', href: 'messagerie' },
                ].map(link => (
                  <Link key={link.label} href={`/mariage/${slug}/${link.href}`}
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
