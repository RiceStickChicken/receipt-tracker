import React from 'react'
import { Button } from './Button'

interface PageShellProps {
  title: string
  subtitle?: string
  onAdd?: () => void
  children: React.ReactNode
  addLabel?: string
}

export function PageShell({ title, subtitle, onAdd, children, addLabel = 'Add Receipt' }: PageShellProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</h1>
          {subtitle && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>}
        </div>
        {onAdd && (
          <div>
            <Button onClick={onAdd}>+ {addLabel}</Button>
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
