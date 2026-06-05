import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/', '/pricing', '/fonctionnalites/:path*', '/guide', '/studio', '/budget-mariage/:path*', '/outils', '/checklist-mariage', '/(fr|en|es|it|de)/:path*'],
}
