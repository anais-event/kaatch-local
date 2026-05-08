import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type SearchResult = {
  id: string
  type: string
  label: string
  sub?: string
  href: string
  icon: string
}

const MAX = 5

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const q = searchParams.get('q')?.trim()

  if (!slug || !q || q.length < 2) return NextResponse.json([])

  const supabase = await createSupabaseServerClient()

  // Verify user owns this wedding
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data: wedding } = await supabase
    .from('weddings').select('id').eq('slug', slug).eq('user_id', user.id).single()
  if (!wedding) return NextResponse.json([], { status: 403 })

  const wid = wedding.id
  const like = `%${q}%`

  const [
    guests, songs, inspirations, steps, budgetItems, budgetQuotes,
    contacts, accommodations, vendors, guestbook,
  ] = await Promise.all([
    supabase.from('guests').select('id,first_name,last_name,email,rsvp_status')
      .eq('wedding_id', wid).or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`).limit(MAX),
    supabase.from('playlist_songs').select('id,title,artist,moment')
      .eq('wedding_id', wid).or(`title.ilike.${like},artist.ilike.${like}`).limit(MAX),
    supabase.from('inspiration_items').select('id,title,category')
      .eq('wedding_id', wid).ilike('title', like).limit(MAX),
    supabase.from('program_steps').select('id,title,time')
      .eq('wedding_id', wid).ilike('title', like).limit(MAX),
    supabase.from('budget_items').select('id,label')
      .eq('wedding_id', wid).ilike('label', like).limit(MAX),
    supabase.from('budget_quotes').select('id,vendor_name,notes')
      .eq('wedding_id', wid).ilike('vendor_name', like).limit(MAX),
    supabase.from('wedding_contacts').select('id,name,role')
      .eq('wedding_id', wid).or(`name.ilike.${like},role.ilike.${like}`).limit(MAX),
    supabase.from('accommodations').select('id,name,address')
      .eq('wedding_id', wid).ilike('name', like).limit(MAX),
    supabase.from('vendors').select('id,name,category')
      .eq('wedding_id', wid).or(`name.ilike.${like},category.ilike.${like}`).limit(MAX),
    supabase.from('guestbook_entries').select('id,author_name,content')
      .eq('wedding_id', wid).or(`author_name.ilike.${like},content.ilike.${like}`).limit(MAX),
  ])

  const MOMENT_LABELS: Record<string, string> = { ceremonie: 'Cérémonie', cocktail: 'Cocktail', diner: 'Dîner', soiree: 'Soirée' }
  const CAT_LABELS: Record<string, string> = { tenue: 'Tenues', theme: 'Thème', deco: 'Déco', menu: 'Menu', boissons: 'Boissons' }

  const results: SearchResult[] = [
    ...(guests.data ?? []).map(g => ({
      id: `guest-${g.id}`, type: 'Invités', icon: '👤',
      label: [g.first_name, g.last_name].filter(Boolean).join(' '),
      sub: g.email ?? (g.rsvp_status === 'confirmed' ? 'Confirmé' : g.rsvp_status === 'declined' ? 'Décliné' : 'En attente'),
      href: `/mariage/${slug}/guests`,
    })),
    ...(songs.data ?? []).map(s => ({
      id: `song-${s.id}`, type: 'Musique', icon: '🎵',
      label: s.title,
      sub: [s.artist, s.moment ? MOMENT_LABELS[s.moment] : null].filter(Boolean).join(' · '),
      href: `/mariage/${slug}/musique`,
    })),
    ...(inspirations.data ?? []).map(i => ({
      id: `inspi-${i.id}`, type: 'Inspirations', icon: '✨',
      label: i.title,
      sub: i.category ? CAT_LABELS[i.category] ?? i.category : undefined,
      href: `/mariage/${slug}/inspirations`,
    })),
    ...(steps.data ?? []).map(s => ({
      id: `step-${s.id}`, type: 'Programme', icon: '📋',
      label: s.title,
      sub: s.time ?? undefined,
      href: `/mariage/${slug}/programme`,
    })),
    ...(budgetItems.data ?? []).map(b => ({
      id: `bi-${b.id}`, type: 'Budget', icon: '💰',
      label: b.label,
      href: `/mariage/${slug}/budget`,
    })),
    ...(budgetQuotes.data ?? []).map(b => ({
      id: `bq-${b.id}`, type: 'Devis', icon: '📄',
      label: b.vendor_name,
      sub: b.notes ?? undefined,
      href: `/mariage/${slug}/budget`,
    })),
    ...(contacts.data ?? []).map(c => ({
      id: `contact-${c.id}`, type: 'Contacts', icon: '📞',
      label: c.name,
      sub: c.role ?? undefined,
      href: `/mariage/${slug}/contacts`,
    })),
    ...(accommodations.data ?? []).map(a => ({
      id: `accom-${a.id}`, type: 'Hébergements', icon: '🏡',
      label: a.name,
      sub: a.address ?? undefined,
      href: `/mariage/${slug}/hebergements`,
    })),
    ...(vendors.data ?? []).map(v => ({
      id: `vendor-${v.id}`, type: 'Prestataires', icon: '🤝',
      label: v.name,
      sub: v.category ?? undefined,
      href: `/mariage/${slug}/prestataires`,
    })),
    ...(guestbook.data ?? []).map(g => ({
      id: `gb-${g.id}`, type: "Livre d'Or", icon: '📖',
      label: g.author_name,
      sub: (g.content as string)?.slice(0, 60),
      href: `/mariage/${slug}/livre-dor`,
    })),
  ]

  return NextResponse.json(results)
}
