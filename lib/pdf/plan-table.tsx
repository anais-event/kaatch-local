import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { UniversSettings, WeddingInfo, TableInfo } from './types'

// A2 portrait = 420 × 594 mm → pts : 1190.6 × 1683.8
const W = 1190.6
const H = 1683.8

export function PlanTablePDF({ univers, wedding, tables }: {
  univers: UniversSettings
  wedding: WeddingInfo
  tables: TableInfo[]
}) {
  const { colors, displayFont, bodyFont } = univers

  const s = StyleSheet.create({
    page: {
      width: W, height: H,
      backgroundColor: colors.bg,
      padding: 0,
    },
    topBar: {
      height: 10,
      backgroundColor: colors.accent,
    },
    header: {
      alignItems: 'center',
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 80,
    },
    overline: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 14,
      color: colors.subtle,
      letterSpacing: 5,
      textTransform: 'uppercase',
      marginBottom: 20,
    },
    title: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 72,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 1.1,
    },
    ampersand: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: 40,
      color: colors.accent,
      textAlign: 'center',
      marginVertical: 6,
    },
    ornamentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 36,
      width: 200,
      gap: 12,
    },
    ornamentLine: {
      flex: 1,
      height: 0.8,
      backgroundColor: colors.accent,
      opacity: 0.4,
    },
    ornamentDot: {
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: colors.accent,
    },
    subtitle: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 12,
      color: colors.subtle,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 80,
      paddingBottom: 60,
      gap: 20,
    },
    tableCard: {
      width: (W - 160 - 40) / 3,  // 3 colonnes avec gap
      backgroundColor: 'transparent',
      borderWidth: 0.8,
      borderColor: colors.accent,
      borderStyle: 'solid',
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    tableName: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 24,
      color: colors.text,
      marginBottom: 10,
    },
    tableAccentLine: {
      width: 20,
      height: 0.7,
      backgroundColor: colors.accent,
      opacity: 0.6,
      marginBottom: 12,
    },
    guestName: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 11,
      color: colors.subtle,
      lineHeight: 1.7,
    },
    bottomBar: {
      height: 6,
      backgroundColor: colors.accent,
      opacity: 0.4,
    },
  })

  const [p1, p2] = (wedding.name ?? '').split(' & ')
  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <Document>
      <Page size={[W, H]} style={s.page}>
        <View style={s.topBar} />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.overline}>Plan de table</Text>
          <Text style={s.title}>{p1 ?? 'Prénom'}</Text>
          <Text style={s.ampersand}>&amp;</Text>
          <Text style={s.title}>{p2 ?? 'Prénom'}</Text>
          <View style={s.ornamentRow}>
            <View style={s.ornamentLine} />
            <View style={s.ornamentDot} />
            <View style={s.ornamentLine} />
          </View>
          {dateStr && <Text style={s.subtitle}>{dateStr.toUpperCase()}</Text>}
        </View>

        {/* Tables grid */}
        <View style={s.grid}>
          {tables.map((table) => (
            <View key={table.id} style={s.tableCard}>
              <Text style={s.tableName}>{table.name}</Text>
              <View style={s.tableAccentLine} />
              {table.guests.map((guestName, gi) => (
                <Text key={gi} style={s.guestName}>{guestName}</Text>
              ))}
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />
        <View style={s.bottomBar} />
      </Page>
    </Document>
  )
}
