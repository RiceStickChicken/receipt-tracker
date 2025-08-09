import { StatCard } from './StatCard'
import { useReceipts } from '../context/ReceiptsContext'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

// Helper: start of week (Mon) for a date
function startOfWeek(d: Date) {
  const copy = new Date(d)
  const day = copy.getDay() // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day // move to Monday
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0,0,0,0)
  return copy
}

// Format money cents → string
const fmtMoney = (c: number) => `$${(c/100).toFixed(2)}`

// Colors for charts (map categories deterministically to palette)
const chartPalette = [
  'var(--color-chart-primary)',
  'var(--color-chart-secondary)',
  'var(--color-chart-tertiary)',
  'var(--color-chart-accent)',
  'var(--color-primary-dark)',
  'var(--color-warning)',
  'var(--color-success)',
  'var(--color-error)'
]

function getColorForCategory(cat: string) {
  let hash = 0
  for (let i=0;i<cat.length;i++) hash = (hash*31 + cat.charCodeAt(i)) >>> 0
  return chartPalette[hash % chartPalette.length]
}

export function AnalyticsPage() {
  const { receipts } = useReceipts()
  const now = new Date()
  const MS_DAY = 86400000
  const cutoff30 = now.getTime() - 29 * MS_DAY // inclusive 30 day window

  // 30‑day window metrics
  const windowReceipts = receipts.filter(r => {
    const t = Date.parse(r.date + 'T00:00:00')
    return !isNaN(t) && t >= cutoff30 && t <= now.getTime()
  })
  let spend30 = 0
  const categorySpend: Record<string, number> = {}
  for (const r of windowReceipts) {
    spend30 += r.totalCents
    categorySpend[r.category] = (categorySpend[r.category] || 0) + r.totalCents
  }
  const receipts30 = windowReceipts.length
  const avgPerDayCents = receipts30 ? Math.round(spend30 / 30) : 0
  let topCategory = '—'
  if (receipts30) {
    const sortedCats = Object.entries(categorySpend).sort((a,b) => b[1]-a[1])
    if (sortedCats.length) topCategory = sortedCats[0][0]
  }

  // Weekly spend (last 8 weeks incl current)
  const weeks: { start: Date; end: Date; label: string; total: number }[] = []
  const thisWeekStart = startOfWeek(now)
  for (let i = 7; i >= 0; i--) {
    const start = new Date(thisWeekStart)
    start.setDate(start.getDate() - i * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23,59,59,999)
    const label = `${start.getMonth()+1}/${start.getDate()}` // M/D
    weeks.push({ start, end, label, total: 0 })
  }
  // Aggregate receipts into weeks
  for (const r of receipts) {
    const t = Date.parse(r.date + 'T00:00:00')
    if (isNaN(t)) continue
    const d = new Date(t)
    for (const w of weeks) {
      if (d >= w.start && d <= w.end) { w.total += r.totalCents; break }
    }
  }
  const weeklyData = weeks.map(w => ({ week: w.label, spend: +(w.total/100).toFixed(2) }))

  // Category split pie (30‑day window)
  const categoryData = Object.entries(categorySpend)
    .sort((a,b) => b[1]-a[1])
    .map(([name,value]) => ({ name, value: +(value/100).toFixed(2) }))

  const pieTotal = categoryData.reduce((a,b)=>a+b.value,0)

  return (
    <div className="space-y-8">
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <StatCard label="Spend (30d)" value={fmtMoney(spend30)} />
        <StatCard label="Receipts (30d)" value={receipts30} />
        <StatCard label="Avg / Day" value={fmtMoney(avgPerDayCents)} />
        <StatCard label="Top Category" value={topCategory} />
      </div>
      <div className="grid gap-8" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px' }}>
        <div className="card">
          <h2 className="text-base font-semibold mb-4">Weekly Spend (Last 8 Weeks)</h2>
          <div style={{ width: '100%', height: 280 }}>
            {weeklyData.every(d => d.spend === 0) ? (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>No data yet – add receipts to see weekly trends.</p>
            ) : (
              <ResponsiveContainer>
                <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v)=>'$'+v} tick={{ fontSize: 12 }} width={45} />
                  <Tooltip formatter={(v:number)=>fmtMoney(Math.round(v*100))} labelClassName="text-xs" />
                  <Bar dataKey="spend" radius={[6,6,0,0]} fill="var(--color-chart-secondary)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="card">
          <h2 className="text-base font-semibold mb-4">Category Split (30d)</h2>
          <div style={{ width: '100%', height: 280 }}>
            {categoryData.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>No receipt data in the last 30 days.</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={getColorForCategory(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v:number, _n, p:any)=>[fmtMoney(Math.round(v*100)), p?.payload?.name]} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {pieTotal > 0 && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Total: {fmtMoney(Math.round(pieTotal*100))}</p>
          )}
        </div>
      </div>
    </div>
  )
}
