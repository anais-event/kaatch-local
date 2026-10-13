// Autorisation admin Kaatch — vérifiée CÔTÉ SERVEUR uniquement.
// Le rôle admin vit dans la table `admins` (RLS sans policy → lisible via service_role seulement).
// Être connecté comme marié/invité/prestataire ne donne aucun accès : il faut un user_id dans `admins`.
// Jamais d'email admin en dur, jamais d'autorisation fondée sur l'URL ou l'interface.

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

/** True si l'utilisateur est un admin plateforme. Lecture service_role, jamais exposée au client. */
export async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId) return false
  try {
    const svc = createServiceClient()
    const { data } = await svc.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
    return !!data
  } catch {
    // Pas de service_role (local) → pas d'admin. On ne retombe JAMAIS sur un contrôle anon.
    return false
  }
}

/** Récupère l'utilisateur courant et vérifie qu'il est admin. */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return (await isAdmin(user.id)) ? user : null
}

/**
 * Garde de page admin : redirige vers /admin/login si non authentifié,
 * ou /admin/login?denied=1 si connecté sans droits admin. Retourne l'admin sinon.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  if (!(await isAdmin(user.id))) redirect('/admin/login?denied=1')
  return user
}
