import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { UniversSettings, GuestInfo } from './types'

// Chevalet A6 landscape = 148 × 105 mm → en points : 419.5 × 297.6
const W = 419.5
const H = 297.6

export function MarquePlacePDF({ univers, guest }: {
  univers: UniversSettings
  guest: GuestInfo
}) {
  const { colors, displayFont, bodyFont } = univers

  const styles = StyleSheet.create({
    page: {
      width: W, height: H,
      backgroundColor: colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftBar: {
      position: 'absolute',
      left: 0, top: 0, bottom: 0,
      width: 5,
      backgroundColor: colors.accent,
    },
    name: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 32,
      color: colors.text,
      textAlign: 'center',
    },
    divider: {
      width: 30,
      height: 0.7,
      backgroundColor: colors.accent,
      opacity: 0.6,
      marginVertical: 8,
    },
    table: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 8,
      color: colors.accent,
      letterSpacing: 2,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    foldLine: {
      position: 'absolute',
      left: 30, right: 30,
      top: H / 2,
      height: 0.4,
      backgroundColor: colors.subtle,
      opacity: 0.3,
    },
  })

  const fullName = [guest.firstName, guest.lastName]
    .filter(v => v && v !== 'null')
    .join(' ')

  return (
    <Document>
      <Page size={[W, H]} style={styles.page}>
        <View style={styles.leftBar} />
        <View style={styles.foldLine} />

        <Text style={styles.name}>{fullName}</Text>
        <View style={styles.divider} />
        {guest.tableName && (
          <Text style={styles.table}>{guest.tableName}</Text>
        )}
      </Page>
    </Document>
  )
}
