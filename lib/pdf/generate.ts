import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { registerFonts, TYPO_FAMILIES } from './fonts'
import { FairePartPDF } from './faire-part'
import { MarquePlacePDF } from './marque-place'
import { MenuPDF } from './menu'
import type { UniversSettings, UniversColors, WeddingInfo, GuestInfo } from './types'

const AMBIANCE_PALETTES: Record<string, string[]> = {
  campagne:   ['#e8dcc8', '#c4a882', '#7a8c6e', '#5c4a3a'],
  editorial:  ['#f8f6f1', '#888888', '#2c2c2c', '#2c2c2c'],
  italien:    ['#fdf6ed', '#d4c5a9', '#c4622d', '#3a2a1a'],
  romance:    ['#fdf4f0', '#d4a89a', '#b87333', '#3a2a2a'],
  chateau:    ['#f5f0e4', '#4a4e5a', '#b5962a', '#1a2744'],
}

export function extractUniversSettings(moduleUnivers: unknown): UniversSettings {
  const u = (moduleUnivers ?? {}) as {
    ambianceId?: string
    customColors?: Record<string, string>
    typoIndex?: number
  }

  const palette = AMBIANCE_PALETTES[u.ambianceId ?? 'editorial'] ?? AMBIANCE_PALETTES.editorial
  const custom  = u.customColors ?? {}

  // Palette labels per ambiance (order matches AMBIANCES in UniversClient)
  const paletteLabels: Record<string, string[]> = {
    campagne:  ['Blé', 'Terre', 'Sauge', 'Humus'],
    editorial: ['Ivoire', 'Cendre', 'Graphite', 'Or'],
    italien:   ['Terracotta', 'Citron', 'Méditerranée', 'Pierre'],
    romance:   ['Rose poudré', 'Nude', 'Cuivre', 'Crème'],
    chateau:   ['Navy', 'Ivoire', 'Or vieilli', 'Ardoise'],
  }
  const labels = paletteLabels[u.ambianceId ?? 'editorial'] ?? []

  const colors: UniversColors = {
    bg:     custom[labels[0]] ?? palette[0],
    subtle: custom[labels[1]] ?? palette[1],
    accent: custom[labels[2]] ?? palette[2],
    text:   custom[labels[3]] ?? palette[3],
  }

  const typo = TYPO_FAMILIES[u.typoIndex ?? 0] ?? TYPO_FAMILIES[0]

  return { colors, displayFont: typo.display, bodyFont: typo.body }
}

export async function generateFairePartBuffer(univers: UniversSettings, wedding: WeddingInfo): Promise<Buffer> {
  registerFonts()
  return renderToBuffer(createElement(FairePartPDF, { univers, wedding }) as any)
}

export async function generateMarquePlaceBuffer(univers: UniversSettings, guest: GuestInfo): Promise<Buffer> {
  registerFonts()
  return renderToBuffer(createElement(MarquePlacePDF, { univers, guest }) as any)
}

export async function generateMenuBuffer(univers: UniversSettings, wedding: WeddingInfo, courses: string[] = []): Promise<Buffer> {
  registerFonts()
  return renderToBuffer(createElement(MenuPDF, { univers, wedding, courses }) as any)
}
