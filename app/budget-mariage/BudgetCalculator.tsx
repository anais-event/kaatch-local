'use client'

import { useState } from 'react'
import Step1QuickEstimate, { type EstimateData } from './Step1QuickEstimate'
import Step2Personalization, { type PersonalizationData } from './Step2Personalization'
import Step3Recap from './Step3Recap'

export default function BudgetCalculator() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [estimate, setEstimate] = useState<EstimateData | null>(null)
  const [selections, setSelections] = useState<PersonalizationData | null>(null)

  const handleStep1Next = (data: EstimateData) => {
    setEstimate(data)
    setStep(2)
  }

  const handleStep2Next = (data: PersonalizationData) => {
    setSelections(data)
    setStep(3)
  }

  const handleStep2Back = () => {
    setStep(1)
  }

  const handleStep3Back = () => {
    setStep(2)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex-1 flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
            step >= 1 ? 'bg-[#4a5240] text-white' : 'bg-stone-200 text-stone-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 ${step > 1 ? 'bg-[#4a5240]' : 'bg-stone-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
            step >= 2 ? 'bg-[#4a5240] text-white' : 'bg-stone-200 text-stone-600'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 ${step > 2 ? 'bg-[#4a5240]' : 'bg-stone-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
            step >= 3 ? 'bg-[#4a5240] text-white' : 'bg-stone-200 text-stone-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-stone-100 p-8">
        {step === 1 && <Step1QuickEstimate onNext={handleStep1Next} initialData={estimate || undefined} />}
        {step === 2 && estimate && (
          <Step2Personalization
            estimate={estimate}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            initialData={selections || undefined}
          />
        )}
        {step === 3 && estimate && selections && (
          <Step3Recap estimate={estimate} selections={selections} onBack={handleStep3Back} />
        )}
      </div>
    </div>
  )
}
