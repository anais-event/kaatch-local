import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { UniversSettings } from './types'

// A5 chevalet = 148 × 210 mm, pliage milieu → pts : 419.5 × 595.3
const W = 419.5
const H = 595.3

export function NumeroTablePDF({ univers, tableName }: {
  univers: UniversSettings
  tableName: string
}) {
  const { colors, displayFont, bodyFont } = univers

  const s = StyleSheet.create({
    page: {
      width: W, height: H,
      backgroundColor: colors.bg,
    },
    foldLine: {
      position: 'absolute',
      left: 30, right: 30,
      top: H / 2,
      height: 0.5,
      backgroundColor: colors.accent,
      opacity: 0.3,
    },
    // Face visible (moitié basse = ce qui est lu quand le chevalet est posé)
    face: {
      position: 'absolute',
      left: 0, right: 0,
      top: H / 2,
      height: H / 2,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 16,
    },
    label: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 7,
      color: colors.subtle,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    number: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 64,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 1,
    },
    divider: {
      width: 30,
      height: 0.7,
      backgroundColor: colors.accent,
      opacity: 0.5,
      marginTop: 12,
    },
    // Dos (moitié haute, retournée)
    back: {
      position: 'absolute',
      left: 0, right: 0,
      top: 0,
      height: H / 2,
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'rotate(180deg)',
    },
    backAccent: {
      width: 4, height: 4, borderRadius: 2,
      backgroundColor: colors.accent,
      opacity: 0.4,
    },
  })

  return (
    <Document>
      <Page size={[W, H]} style={s.page}>
        <View style={s.foldLine} />
        {/* Dos */}
        <View style={s.back}>
          <View style={s.backAccent} />
        </View>
        {/* Face */}
        <View style={s.face}>
          <Text style={s.label}>Table</Text>
          <Text style={s.number}>{tableName}</Text>
          <View style={s.divider} />
        </View>
      </Page>
    </Document>
  )
}
