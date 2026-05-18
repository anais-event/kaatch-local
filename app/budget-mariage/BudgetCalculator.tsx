'use client'

import { useState, useMemo } from 'react'
import {
  calculateBudget,
  getBudgetColor,
  getBreakdownData,
  type WeddingLevel,
  type Region,
} from '@/lib/calculator/budget-formulas'
import ResultDisplay from './ResultDisplay'
import Inputs from './Inputs'
import BreakdownChart from './BreakdownChart'
import ShareButton from './ShareButton'
import PDFDownloadButton from './PDFDownloadButton'
import CTAKaatch from './CTAKaatch'
import DisclaimerBox from './DisclaimerBox'

export default function BudgetCalculator() {
  const [guestCount, setGuestCount] = useState(100)
  const [level, setLevel] = useState<WeddingLevel>('classique')
  const [region, setRegion] = useState<Region>('province')
  const [includeHoneymoon, setIncludeHoneymoon] = useState(true)

  const breakdown = useMemo(
    () => calculateBudget(guestCount, level, region, includeHoneymoon),
    [guestCount, level, region, includeHoneymoon]
  )

  const breakdownData = useMemo(() => getBreakdownData(breakdown, guestCount), [breakdown, guestCount])
  const budgetColor = useMemo(() => getBudgetColor(breakdown.grandTotal), [breakdown.grandTotal])

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Inputs — Left column */}
      <div>
        <Inputs
          guestCount={guestCount}
          level={level}
          region={region}
          includeHoneymoon={includeHoneymoon}
          onGuestCountChange={setGuestCount}
          onLevelChange={setLevel}
          onRegionChange={setRegion}
          onIncludeHoneymoonChange={setIncludeHoneymoon}
        />
      </div>

      {/* Results — Right column (sticky on desktop) */}
      <div className="lg:sticky lg:top-8 h-fit">
        <ResultDisplay
          total={breakdown.grandTotal}
          perGuest={breakdown.grandTotalPerGuest}
          message={budgetColor.label}
          color={budgetColor}
        />

        {/* Disclaimer */}
        <DisclaimerBox />

        {/* Breakdown Chart */}
        <div className="mt-8 bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <h3 className="font-medium text-stone-800 mb-6">Répartition des coûts</h3>
          <BreakdownChart data={breakdownData} total={breakdown.grandTotal} />
        </div>

        {/* Share & Export */}
        <div className="mt-6 flex gap-3">
          <ShareButton total={breakdown.grandTotal} />
          <PDFDownloadButton
            breakdown={breakdown}
            guestCount={guestCount}
            level={level}
            region={region}
            includeHoneymoon={includeHoneymoon}
            breakdownData={breakdownData}
          />
        </div>

        {/* CTA Kaatch */}
        <CTAKaatch />
      </div>
    </div>
  )
}
