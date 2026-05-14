import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { UniversSettings, WeddingInfo } from './types'

// A5 portrait = 419.5 × 595.3 pt
const W = 419.5
const H = 595.3

export function MenuPDF({ univers, wedding, courses }: {
  univers: UniversSettings
  wedding: WeddingInfo
  courses: string[]
}) {
  const { colors, displayFont, bodyFont } = univers

  const styles = StyleSheet.create({
    page: {
      width: W, height: H,
      backgroundColor: colors.bg,
      padding: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    topAccent: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 4,
      backgroundColor: colors.accent,
    },
    title: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 32,
      color: colors.text,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 6,
    },
    subtitle: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 8,
      color: colors.subtle,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: 28,
    },
    divider: {
      width: 40,
      height: 0.7,
      backgroundColor: colors.accent,
      opacity: 0.5,
      marginBottom: 30,
    },
    courseLabel: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 7,
      color: colors.accent,
      letterSpacing: 2,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: 5,
    },
    courseName: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    bottomAccent: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 4,
      backgroundColor: colors.accent,
      opacity: 0.3,
    },
  })

  const defaultCourses = ['Amuse-bouche', 'Entrée', 'Poisson', 'Viande', 'Dessert']
  const displayed = courses.length > 0 ? courses : defaultCourses

  return (
    <Document>
      <Page size={[W, H]} style={styles.page}>
        <View style={styles.topAccent} />

        <Text style={styles.title}>Menu</Text>
        <Text style={styles.subtitle}>{wedding.name ?? ''}</Text>
        <View style={styles.divider} />

        {displayed.map((course, i) => (
          <View key={i} style={{ alignItems: 'center', width: '100%' }}>
            <Text style={styles.courseLabel}>{['I', 'II', 'III', 'IV', 'V', 'VI'][i] ?? String(i + 1)}</Text>
            <Text style={styles.courseName}>{course}</Text>
          </View>
        ))}

        <View style={styles.bottomAccent} />
      </Page>
    </Document>
  )
}
