'use client'

import type { WeddingLevel, Region } from '@/lib/calculator/budget-formulas'

interface InputsProps {
  guestCount: number
  level: WeddingLevel
  region: Region
  includeHoneymoon: boolean
  onGuestCountChange: (count: number) => void
  onLevelChange: (level: WeddingLevel) => void
  onRegionChange: (region: Region) => void
  onIncludeHoneymoonChange: (included: boolean) => void
}

export default function Inputs({
  guestCount,
  level,
  region,
  includeHoneymoon,
  onGuestCountChange,
  onLevelChange,
  onRegionChange,
  onIncludeHoneymoonChange,
}: InputsProps) {
  return (
    <div className="space-y-8">
      {/* Guest Count Slider */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <label className="block text-sm font-medium text-stone-700 mb-4">
          Nombre d{"'"}invités : <span className="text-lg text-[#4a5240] font-semibold">{guestCount}</span>
        </label>
        <input
          type="range"
          min="20"
          max="300"
          value={guestCount}
          onChange={(e) => onGuestCountChange(Number(e.target.value))}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#4a5240]"
        />
        <div className="flex justify-between text-xs text-stone-500 mt-2">
          <span>20</span>
          <span>300</span>
        </div>
      </div>

      {/* Level Radio Buttons */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <label className="block text-sm font-medium text-stone-700 mb-4">Niveau de gamme</label>
        <div className="space-y-3">
          {(['simple', 'classique', 'premium'] as const).map((opt) => (
            <label key={opt} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="level"
                value={opt}
                checked={level === opt}
                onChange={(e) => onLevelChange(e.target.value as WeddingLevel)}
                className="w-4 h-4 accent-[#4a5240]"
              />
              <span className="ml-3 capitalize text-stone-700">
                {opt === 'simple' && 'Simple (budget serré)'}
                {opt === 'classique' && 'Classique (équilibré)'}
                {opt === 'premium' && 'Premium (haut de gamme)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Region Dropdown */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <label htmlFor="region" className="block text-sm font-medium text-stone-700 mb-4">
          Région
        </label>
        <select
          id="region"
          value={region}
          onChange={(e) => onRegionChange(e.target.value as Region)}
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#4a5240]"
        >
          <option value="province">Province (référence)</option>
          <option value="grandes-villes">Grandes villes / Côte d{"'"}Azur (+15%)</option>
          <option value="paris">Paris & Île-de-France (+25%)</option>
        </select>
      </div>

      {/* Honeymoon Toggle */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={includeHoneymoon}
            onChange={(e) => onIncludeHoneymoonChange(e.target.checked)}
            className="w-5 h-5 rounded accent-[#4a5240]"
          />
          <span className="ml-3 text-stone-700">Voyage de noces inclus dans le budget</span>
        </label>
        <p className="text-xs text-stone-500 mt-3">
          Le voyage de noces peut être financé par le couple ou les invités (corbeille de mariage).
        </p>
      </div>
    </div>
  )
}
