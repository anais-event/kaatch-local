'use client'

interface BreakdownItem {
  name: string
  value: number
  color: string
}

interface BreakdownChartProps {
  data: BreakdownItem[]
  total: number
}

export default function BreakdownChart({ data, total }: BreakdownChartProps) {
  return (
    <div className="space-y-4">
      {data.map((item) => {
        const percentage = (item.value / total) * 100

        return (
          <div key={item.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-stone-700">{item.name}</span>
              <span className="text-sm text-stone-600">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(item.value)}{' '}
                ({Math.round(percentage)}%)
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
