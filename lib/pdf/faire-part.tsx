import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { UniversSettings, WeddingInfo } from './types'

// A5 = 148 × 210 mm → en points PDF : 419.5 × 595.3
const W = 419.5
const H = 595.3

export function FairePartPDF({ univers, wedding }: {
  univers: UniversSettings
  wedding: WeddingInfo
}) {
  const { colors, displayFont, bodyFont } = univers

  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const styles = StyleSheet.create({
    page: {
      width: W, height: H,
      backgroundColor: colors.bg,
      padding: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    overline: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 7,
      color: colors.subtle,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 18,
    },
    dividerLine: {
      width: 30,
      height: 0.7,
      backgroundColor: colors.accent,
      marginBottom: 18,
    },
    names: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 38,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 1.15,
    },
    ampersand: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: 22,
      color: colors.accent,
      textAlign: 'center',
      marginVertical: 4,
    },
    ornamentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 22,
      gap: 8,
    },
    ornamentLine: {
      flex: 1,
      height: 0.6,
      backgroundColor: colors.accent,
      opacity: 0.5,
    },
    ornamentDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.accent,
    },
    dateText: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 9,
      color: colors.subtle,
      textAlign: 'center',
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    location: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 8.5,
      color: colors.subtle,
      textAlign: 'center',
    },
    invitationBox: {
      borderWidth: 0.6,
      borderColor: colors.accent,
      borderStyle: 'solid',
      paddingVertical: 9,
      paddingHorizontal: 18,
      marginTop: 24,
    },
    invitationText: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 8,
      color: colors.text,
      textAlign: 'center',
      letterSpacing: 1,
    },
    accentBar: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 5,
      backgroundColor: colors.accent,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 3,
      backgroundColor: colors.accent,
      opacity: 0.4,
    },
  })

  const [p1, p2] = (wedding.name ?? 'Prénom1 & Prénom2').split(' & ')

  return (
    <Document>
      <Page size={[W, H]} style={styles.page}>
        <View style={styles.accentBar} />

        <Text style={styles.overline}>Mariage</Text>

        <View style={styles.dividerLine} />

        <Text style={styles.names}>{p1 ?? 'Prénom'}</Text>
        <Text style={styles.ampersand}>&amp;</Text>
        <Text style={styles.names}>{p2 ?? 'Prénom'}</Text>

        <View style={styles.ornamentRow}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDot} />
          <View style={styles.ornamentLine} />
        </View>

        {dateStr && (
          <Text style={styles.dateText}>{dateStr.toUpperCase()}</Text>
        )}
        {wedding.location && (
          <Text style={styles.location}>{wedding.location}</Text>
        )}

        <View style={styles.invitationBox}>
          <Text style={styles.invitationText}>VOUS ÊTES INVITÉ(E)</Text>
        </View>

        <View style={styles.bottomBar} />
      </Page>
    </Document>
  )
}
