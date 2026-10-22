import crypto from 'crypto'
import { cookies } from 'next/headers'

/**
 * Session invité / prestataire signée (HMAC-SHA256).
 *
 * Le cookie `guest_[slug]` / `vendor_[slug]` reste au format JSON (lu via les
 * helpers ci-dessous), accompagné d'un cookie de signature `__sig_guest_[slug]`
 * / `__sig_vendor_[slug]` (httpOnly) qui authentifie le payload.
 *
 * La signature lie : le TYPE de session (guest/vendor), le SLUG du mariage et le
 * PAYLOAD. Un cookie ne peut donc pas être rejoué pour un autre type ni un autre
 * mariage. Le payload porte `exp` (expiration), vérifiée côté serveur.
 *
 * Secret : variable d'env serveur dédiée GUEST_COOKIE_SECRET (jamais exposée au navigateur).
 */

function getSecret(): string {
  const s = process.env.GUEST_COOKIE_SECRET
  if (!s) throw new Error('GUEST_COOKIE_SECRET manquant côté serveur')
  return s
}

function hmac(kind: 'guest' | 'vendor', slug: string, data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(`${kind}.${slug}.${data}`).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

const COOKIE_OPTS = {
  httpOnly: true as const,
  secure: true as const,
  sameSite: 'lax' as const,
  path: '/' as const,
}

export type GuestPayload = { id: string; firstName?: string; lastName?: string }
export type VendorPayload = { id: string; name?: string; category?: string; permissions?: unknown }

/** Deux cookies à poser par les émetteurs (payload JSON signé + signature). */
export function buildSessionCookies(
  kind: 'guest' | 'vendor',
  slug: string,
  payload: Record<string, unknown>,
  maxAge: number
) {
  const full = { ...payload, exp: Date.now() + maxAge * 1000 }
  const value = JSON.stringify(full)
  const sig = hmac(kind, slug, value)
  return [
    { name: `${kind}_${slug}`, value, options: { ...COOKIE_OPTS, maxAge } },
    { name: `__sig_${kind}_${slug}`, value: sig, options: { ...COOKIE_OPTS, maxAge } },
  ]
}

function verify(
  kind: 'guest' | 'vendor',
  slug: string,
  payloadValue: string | undefined,
  sigValue: string | undefined
): Record<string, unknown> | null {
  if (!payloadValue || !sigValue) return null
  let expected: string
  try {
    expected = hmac(kind, slug, payloadValue)
  } catch {
    return null
  }
  if (!safeEqual(sigValue, expected)) return null
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(payloadValue)
  } catch {
    return null
  }
  // Expiration vérifiée côté serveur
  const exp = parsed.exp
  if (typeof exp !== 'number' || exp < Date.now()) return null
  return parsed
}

/** Lit + vérifie la session invité (signature + type + mariage + expiration). */
export async function getGuestSession(slug: string): Promise<GuestPayload | null> {
  const store = await cookies()
  const p = verify('guest', slug, store.get(`guest_${slug}`)?.value, store.get(`__sig_guest_${slug}`)?.value)
  return p && typeof p.id === 'string' ? (p as GuestPayload) : null
}

/** Lit + vérifie la session prestataire (signature + type + mariage + expiration). */
export async function getVendorSession(slug: string): Promise<VendorPayload | null> {
  const store = await cookies()
  const p = verify('vendor', slug, store.get(`vendor_${slug}`)?.value, store.get(`__sig_vendor_${slug}`)?.value)
  return p && typeof p.id === 'string' ? (p as VendorPayload) : null
}
