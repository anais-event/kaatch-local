import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { weddingSlug, montant, detail } = await req.json()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('slug', weddingSlug)
    .single()

  if (!wedding) return NextResponse.json({ error: 'Mariage introuvable' }, { status: 404 })

  // Cherche catégorie "Faire-part" existante, sinon prend la première
  const { data: categories } = await supabase
    .from('budget_categories')
    .select('id, name')
    .eq('wedding_id', wedding.id)

  const cat = categories?.find(c => c.name.toLowerCase().includes('faire') || c.name.toLowerCase().includes('papeterie'))
    ?? categories?.[0]

  if (!cat) return NextResponse.json({ error: 'Aucune catégorie budget trouvée' }, { status: 400 })

  // Upsert : si ligne "Papeterie Studio" existe déjà, on la met à jour
  const { data: existing } = await supabase
    .from('budget_items')
    .select('id')
    .eq('wedding_id', wedding.id)
    .ilike('label', '%papeterie%')
    .maybeSingle()

  if (existing) {
    await supabase
      .from('budget_items')
      .update({ estimated_amount: montant, description: detail })
      .eq('id', existing.id)
  } else {
    await supabase.from('budget_items').insert({
      wedding_id: wedding.id,
      category_id: cat.id,
      label: 'Papeterie de mariage',
      estimated_amount: montant,
      description: detail,
      status: 'devis',
    })
  }

  return NextResponse.json({ success: true })
}
