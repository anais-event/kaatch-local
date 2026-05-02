'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function createWedding(formData: FormData) {
  console.log('🔵 Action appelée')

  const supabase = await createSupabaseServerClient()

  // Récupère l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  console.log('🔵 User ID:', user?.id)

  if (!user) {
    console.log('🔴 Pas d\'utilisateur!')
    return
  }

  const firstName = (formData.get('first_name') as string)?.trim()
  const partnerName = (formData.get('partner_name') as string)?.trim()
  const name = `${firstName} et ${partnerName}`
  const date = formData.get('date') as string
  const theme = formData.get('theme') as string

  console.log('🔵 Données récupérées:', { name, date, theme })

  // Génère un slug unique à partir des deux prénoms
  const slug = `${firstName}-et-${partnerName}`
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 8)

  console.log('🔵 Slug:', slug)

  // Crée le mariage dans la base
  const { data, error } = await supabase
    .from('weddings')
    .insert({
      couple_id: user.id,
      name,
      slug,
      theme
    })
    .select()
    .single()

  if (error) {
    console.error('🔴 ERREUR Supabase:', error)
    return
  }

  console.log('🟢 Mariage créé:', data)

  // Redirige vers le dashboard du mariage
  redirect(`/mariage/${slug}`)
}
