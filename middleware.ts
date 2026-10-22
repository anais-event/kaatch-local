import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // '/guide' retiré : page FR-only sans route app/[locale]/guide → le middleware
  // next-intl la réécrivait vers /fr/guide (inexistante) → 404. Hors matcher, elle
  // est servie directement par app/guide/page.tsx.
  matcher: ['/', '/pricing', '/fonctionnalites/:path*', '/studio', '/budget-mariage/:path*', '/outils', '/checklist-mariage', '/plan-de-table-mariage', '/discours-mariage', '/liste-invites-mariage', '/programme-mariage', '/(fr|en|es|it|de)/:path*'],
}
