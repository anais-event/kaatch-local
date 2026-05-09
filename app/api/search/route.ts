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

const MAX = 8

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const q = searchParams.get('q')?.trim()

  if (!slug || !q || q.length < 2) return NextResponse.json([])

  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data: wedding } = await supabase
    .from('weddings').select('id').eq('slug', slug).eq('user_id', user.id).single()
  if (!wedding) return NextResponse.json([], { status: 403 })

  const wid = wedding.id
  const like = `%${q}%`

  const settled = await Promise.allSettled([
    // guests — nom, prénom, email, téléphone, surnom, relation
    supabase.from('guests').select('id,first_name,last_name,email,phone,nickname,rsvp_status')
      .eq('wedding_id', wid)
      .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like},nickname.ilike.${like}`)
      .limit(MAX),

    // musique — titre, artiste, notes
    supabase.from('playlist_songs').select('id,title,artist,moment,notes')
      .eq('wedding_id', wid)
      .or(`title.ilike.${like},artist.ilike.${like},notes.ilike.${like}`)
      .limit(MAX),

    // inspirations — titre
    supabase.from('inspiration_items').select('id,title,category')
      .eq('wedding_id', wid).ilike('title', like).limit(MAX),

    // programme — titre, description, lieu
    supabase.from('program_steps').select('id,title,description,time,location')
      .eq('wedding_id', wid)
      .or(`title.ilike.${like},description.ilike.${like},location.ilike.${like}`)
      .limit(MAX),

    // budget items — label, notes
    supabase.from('budget_items').select('id,label,notes')
      .eq('wedding_id', wid)
      .or(`label.ilike.${like},notes.ilike.${like}`)
      .limit(MAX),

    // devis — prestataire, notes
    supabase.from('budget_quotes').select('id,vendor_name,notes')
      .eq('wedding_id', wid)
      .or(`vendor_name.ilike.${like},notes.ilike.${like}`)
      .limit(MAX),

    // contacts — nom, rôle, email, téléphone
    supabase.from('wedding_contacts').select('id,name,role,email,phone')
      .eq('wedding_id', wid)
      .or(`name.ilike.${like},role.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
      .limit(MAX),

    // hébergements — nom, adresse, notes
    supabase.from('accommodations').select('id,name,address,notes')
      .eq('wedding_id', wid)
      .or(`name.ilike.${like},address.ilike.${like},notes.ilike.${like}`)
      .limit(MAX),

    // prestataires — nom, catégorie
    supabase.from('vendors').select('id,name,category')
      .eq('wedding_id', wid)
      .or(`name.ilike.${like},category.ilike.${like}`)
      .limit(MAX),

    // livre d'or — auteur, contenu
    supabase.from('guestbook_entries').select('id,author_name,content')
      .eq('wedding_id', wid)
      .or(`author_name.ilike.${like},content.ilike.${like}`)
      .limit(MAX),

    // checklist jour J — titre, assigné
    supabase.from('day_tasks').select('id,title,assigned_to,moment')
      .eq('wedding_id', wid)
      .or(`title.ilike.${like},assigned_to.ilike.${like}`)
      .limit(MAX),

    // rétro-planning custom — titre, assigné
    supabase.from('retro_custom_tasks').select('id,title,assigned_to')
      .eq('wedding_id', wid)
      .or(`title.ilike.${like},assigned_to.ilike.${like}`)
      .limit(MAX),

    // photos — uploadé par, tag moment
    supabase.from('photos').select('id,uploaded_by_name,moment_tag')
      .eq('wedding_id', wid)
      .or(`uploaded_by_name.ilike.${like},moment_tag.ilike.${like}`)
      .limit(MAX),

    // commentaires photos — auteur, contenu
    supabase.from('photo_comments').select('id,author_name,content,photo_id')
      .ilike('author_name', like)
      .limit(MAX),

    // budget catégories — nom
    supabase.from('budget_categories').select('id,name')
      .eq('wedding_id', wid).ilike('name', like).limit(MAX),
  ])

  const [
    guests, songs, inspirations, steps, budgetItems, budgetQuotes,
    contacts, accommodations, vendors, guestbook,
    dayTasks, retroTasks, photos, photoComments, budgetCats,
  ] = settled.map(r => r.status === 'fulfilled' ? r.value : { data: [] })

  const MOMENT_LABELS: Record<string, string> = {
    ceremonie: 'Cérémonie', cocktail: 'Cocktail', vin_honneur: "Vin d'honneur",
    diner: 'Dîner', soiree: 'Soirée', matin: 'Matin', apres_midi: 'Après-midi',
  }
  const CAT_LABELS: Record<string, string> = {
    tenue: 'Tenues', theme: 'Thème', deco: 'Déco', menu: 'Menu', boissons: 'Boissons',
  }
  const RSVP_LABELS: Record<string, string> = {
    confirme: 'Confirmé', en_attente: 'En attente', decline: 'Décliné',
  }

  const results: SearchResult[] = [
    ...(guests.data ?? []).map((g: any) => ({
      id: `guest-${g.id}`, type: 'Invités', icon: '👤',
      label: [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' '),
      sub: g.email ?? g.phone ?? RSVP_LABELS[g.rsvp_status] ?? g.rsvp_status,
      href: `/mariage/${slug}/guests`,
    })),
    ...(songs.data ?? []).map((s: any) => ({
      id: `song-${s.id}`, type: 'Musique', icon: '🎵',
      label: s.title,
      sub: [s.artist, s.moment ? MOMENT_LABELS[s.moment] : null].filter(Boolean).join(' · '),
      href: `/mariage/${slug}/musique`,
    })),
    ...(inspirations.data ?? []).map((i: any) => ({
      id: `inspi-${i.id}`, type: 'Inspirations', icon: '✨',
      label: i.title,
      sub: i.category ? CAT_LABELS[i.category] ?? i.category : undefined,
      href: `/mariage/${slug}/inspirations`,
    })),
    ...(steps.data ?? []).map((s: any) => ({
      id: `step-${s.id}`, type: 'Programme', icon: '📋',
      label: s.title,
      sub: [s.time, s.location].filter(Boolean).join(' · ') || undefined,
      href: `/mariage/${slug}/programme`,
    })),
    ...(budgetCats.data ?? []).map((b: any) => ({
      id: `bcat-${b.id}`, type: 'Budget', icon: '💰',
      label: b.name,
      href: `/mariage/${slug}/budget`,
    })),
    ...(budgetItems.data ?? []).map((b: any) => ({
      id: `bi-${b.id}`, type: 'Budget', icon: '💰',
      label: b.label,
      sub: b.notes ?? undefined,
      href: `/mariage/${slug}/budget`,
    })),
    ...(budgetQuotes.data ?? []).map((b: any) => ({
      id: `bq-${b.id}`, type: 'Devis', icon: '📄',
      label: b.vendor_name,
      sub: b.notes ?? undefined,
      href: `/mariage/${slug}/budget`,
    })),
    ...(contacts.data ?? []).map((c: any) => ({
      id: `contact-${c.id}`, type: 'Contacts', icon: '📞',
      label: c.name,
      sub: [c.role, c.email ?? c.phone].filter(Boolean).join(' · ') || undefined,
      href: `/mariage/${slug}/contacts`,
    })),
    ...(accommodations.data ?? []).map((a: any) => ({
      id: `accom-${a.id}`, type: 'Hébergements', icon: '🏡',
      label: a.name,
      sub: a.address ?? undefined,
      href: `/mariage/${slug}/hebergements`,
    })),
    ...(vendors.data ?? []).map((v: any) => ({
      id: `vendor-${v.id}`, type: 'Prestataires', icon: '🤝',
      label: v.name,
      sub: v.category ?? undefined,
      href: `/mariage/${slug}/prestataires`,
    })),
    ...(guestbook.data ?? []).map((g: any) => ({
      id: `gb-${g.id}`, type: "Livre d'Or", icon: '📖',
      label: g.author_name,
      sub: (g.content as string)?.slice(0, 60),
      href: `/mariage/${slug}/livre-dor`,
    })),
    ...(dayTasks.data ?? []).map((t: any) => ({
      id: `dt-${t.id}`, type: 'Checklist', icon: '✅',
      label: t.title,
      sub: [t.assigned_to, t.moment ? MOMENT_LABELS[t.moment] : null].filter(Boolean).join(' · ') || undefined,
      href: `/mariage/${slug}/checklist`,
    })),
    ...(retroTasks.data ?? []).map((t: any) => ({
      id: `rt-${t.id}`, type: 'Rétro-planning', icon: '🗓️',
      label: t.title,
      sub: t.assigned_to ?? undefined,
      href: `/mariage/${slug}/retro-planning`,
    })),
    ...(photos.data ?? []).map((p: any) => ({
      id: `photo-${p.id}`, type: 'Photos', icon: '📷',
      label: p.uploaded_by_name ?? 'Photo',
      sub: p.moment_tag ? MOMENT_LABELS[p.moment_tag] ?? p.moment_tag : undefined,
      href: `/mariage/${slug}/photos`,
    })),
    ...(photoComments.data ?? []).map((c: any) => ({
      id: `pc-${c.id}`, type: 'Photos', icon: '💬',
      label: c.author_name,
      sub: (c.content as string)?.slice(0, 60),
      href: `/mariage/${slug}/photos`,
    })),
  ]

  return NextResponse.json(results)
}
