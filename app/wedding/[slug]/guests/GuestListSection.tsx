'use client'

import { useState } from 'react'

export default function GuestListSection({ total, children }: { total: number; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 md:px-6 py-4 hover:bg-stone-50/50 transition cursor-pointer text-left"
      >
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem', fontStyle: 'italic' }}
            className="text-[#4a5240]">
          Liste ({total})
        </h2>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
             className={`w-4 h-4 text-stone-300 transition-transform ${collapsed ? '' : 'rotate-180'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 md:px-6 pt-4 pb-6 border-t border-stone-50">
          {children}
        </div>
      )}
    </div>
  )
}
