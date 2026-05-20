export type VendorPermissionKey =
  | 'guest_count'
  | 'guest_names'
  | 'guest_allergies'
  | 'programme'
  | 'playlist'
  | 'seating_plan'
  | 'location'

export type VendorPermissions = Partial<Record<VendorPermissionKey, boolean>>

export const PERMISSION_LABELS: Record<VendorPermissionKey, string> = {
  guest_count: "Nombre d'invités",
  guest_names: "Liste des noms",
  guest_allergies: "Allergies & régimes",
  programme: "Programme du jour J",
  playlist: "Playlist musicale",
  seating_plan: "Plan de table",
  location: "Lieu & adresse",
}

export const PERMISSION_ICONS: Record<VendorPermissionKey, string> = {
  guest_count: '👥',
  guest_names: '📋',
  guest_allergies: '🥗',
  programme: '⏰',
  playlist: '🎵',
  seating_plan: '🪑',
  location: '📍',
}

export const ALL_PERMISSIONS: VendorPermissionKey[] = [
  'guest_count', 'guest_names', 'guest_allergies',
  'programme', 'playlist', 'seating_plan', 'location',
]

export const DEFAULT_TYPE_PERMISSIONS: Record<string, VendorPermissions> = {
  'Traiteur': { guest_count: true, guest_allergies: true, programme: true, seating_plan: true, location: true },
  'Musique & DJ': { guest_count: true, programme: true, playlist: true, location: true },
  'Photo & vidéo': { guest_count: true, guest_names: true, programme: true, location: true },
  'Fleurs & déco': { programme: true, location: true },
  "Lieu & réception": { guest_count: true, programme: true },
  'Décorateur/trice': { guest_count: true, programme: true, seating_plan: true, location: true },
  'Coiffure & maquillage': { programme: true, location: true },
  'Gâteau': { guest_count: true, programme: true, location: true },
  'Animation': { guest_count: true, programme: true, location: true },
  'Transport': { guest_count: true, programme: true, location: true },
}

export function getDefaultPermissions(category: string): VendorPermissions {
  return DEFAULT_TYPE_PERMISSIONS[category] ?? { programme: true, location: true }
}

export function hasPermission(permissions: VendorPermissions, key: VendorPermissionKey): boolean {
  return permissions[key] === true
}
