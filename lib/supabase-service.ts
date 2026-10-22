import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase service_role — STRICTEMENT côté serveur.
 * Ne jamais importer dans un composant client ni exposer la clé au navigateur.
 *
 * Usage : lookups d'autorisation (validation d'un token de lien) et lectures/écritures
 * dont l'autorisation a déjà été vérifiée côté serveur. Chaque appel doit scoper
 * explicitement par le mariage/ressource autorisé — le service_role contourne la RLS.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY/URL manquant côté serveur')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
