
interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="card">
      <h2 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</h2>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  )
}
