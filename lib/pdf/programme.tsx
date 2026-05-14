import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { UniversSettings, WeddingInfo, ProgrammeStep } from './types'

// A5 = 148 × 210 mm → pts : 419.5 × 595.3
const W = 419.5
const H = 595.3

export function ProgrammePDF({ univers, wedding, steps }: {
  univers: UniversSettings
  wedding: WeddingInfo
  steps: ProgrammeStep[]
}) {
  const { colors, displayFont, bodyFont } = univers

  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const s = StyleSheet.create({
    page: {
      width: W, height: H,
      backgroundColor: colors.bg,
      padding: 0,
    },
    accentTop: {
      height: 5,
      backgroundColor: colors.accent,
    },
    coverBody: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 44,
    },
    overline: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 7,
      color: colors.subtle,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 16,
      textAlign: 'center',
    },
    title: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 40,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 1.15,
    },
    ampersand: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: 20,
      color: colors.accent,
      textAlign: 'center',
      marginVertical: 4,
    },
    ornamentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      gap: 8,
      width: 120,
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
    coverLabel: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 9,
      color: colors.subtle,
      letterSpacing: 2,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginTop: 4,
    },
    // Steps page
    stepsPage: {
      width: W, height: H,
      backgroundColor: colors.bg,
      padding: 0,
    },
    stepsBody: {
      flex: 1,
      paddingHorizontal: 44,
      paddingVertical: 36,
    },
    pageTitle: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 7,
      color: colors.subtle,
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 20,
      textAlign: 'center',
    },
    stepRow: {
      flexDirection: 'row',
      marginBottom: 18,
      gap: 12,
    },
    stepTime: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 8,
      color: colors.accent,
      letterSpacing: 0.5,
      width: 32,
      flexShrink: 0,
      marginTop: 2,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontSize: 14,
      color: colors.text,
      lineHeight: 1.2,
    },
    stepDesc: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 8,
      color: colors.subtle,
      marginTop: 3,
      lineHeight: 1.5,
    },
    stepDivider: {
      height: 0.5,
      backgroundColor: colors.accent,
      opacity: 0.15,
      marginTop: 18,
      marginBottom: 0,
    },
    // Back cover
    backPage: {
      width: W, height: H,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: {
      fontFamily: displayFont,
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: 22,
      color: colors.bg,
      textAlign: 'center',
    },
    backSub: {
      fontFamily: bodyFont,
      fontWeight: 300,
      fontSize: 8,
      color: colors.bg,
      opacity: 0.6,
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginTop: 14,
      textAlign: 'center',
    },
    bottomAccent: {
      height: 3,
      backgroundColor: colors.accent,
      opacity: 0.4,
    },
  })

  const [p1, p2] = (wedding.name ?? 'Prénom1 & Prénom2').split(' & ')

  // Split steps across pages (max 6 per page)
  const STEPS_PER_PAGE = 6
  const stepPages: ProgrammeStep[][] = []
  for (let i = 0; i < steps.length; i += STEPS_PER_PAGE) {
    stepPages.push(steps.slice(i, i + STEPS_PER_PAGE))
  }
  if (stepPages.length === 0) stepPages.push([])

  return (
    <Document>
      {/* Cover */}
      <Page size={[W, H]} style={s.page}>
        <View style={s.accentTop} />
        <View style={s.coverBody}>
          <Text style={s.overline}>Programme</Text>
          <Text style={s.title}>{p1 ?? 'Prénom'}</Text>
          <Text style={s.ampersand}>&amp;</Text>
          <Text style={s.title}>{p2 ?? 'Prénom'}</Text>
          <View style={s.ornamentRow}>
            <View style={s.ornamentLine} />
            <View style={s.ornamentDot} />
            <View style={s.ornamentLine} />
          </View>
          {dateStr && <Text style={s.coverLabel}>{dateStr.toUpperCase()}</Text>}
          {wedding.location && <Text style={[s.coverLabel, { marginTop: 5 }]}>{wedding.location}</Text>}
        </View>
        <View style={s.bottomAccent} />
      </Page>

      {/* Steps pages */}
      {stepPages.map((pageSteps, pi) => (
        <Page key={pi} size={[W, H]} style={s.stepsPage}>
          <View style={s.accentTop} />
          <View style={s.stepsBody}>
            <Text style={s.pageTitle}>
              {stepPages.length > 1 ? `Déroulé · ${pi + 1}/${stepPages.length}` : 'Déroulé de la journée'}
            </Text>
            {pageSteps.map((step, i) => (
              <View key={i}>
                <View style={s.stepRow}>
                  <Text style={s.stepTime}>{step.time ?? ''}</Text>
                  <View style={s.stepContent}>
                    <Text style={s.stepTitle}>{step.title}</Text>
                    {step.description && (
                      <Text style={s.stepDesc}>{step.description}</Text>
                    )}
                  </View>
                </View>
                {i < pageSteps.length - 1 && <View style={s.stepDivider} />}
              </View>
            ))}
          </View>
          <View style={s.bottomAccent} />
        </Page>
      ))}

      {/* Back cover */}
      <Page size={[W, H]} style={s.backPage}>
        <Text style={s.backText}>Avec joie</Text>
        <Text style={s.backSub}>{wedding.name ?? ''}</Text>
      </Page>
    </Document>
  )
}
