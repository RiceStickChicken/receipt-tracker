import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: React.ReactNode
}

const base: React.CSSProperties = {
  fontSize: 'var(--fs-sm)',
  fontWeight: 500,
  padding: 'var(--space-md) var(--space-lg)',
  borderRadius: 'var(--radius-lg)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  lineHeight: 1.2,
  transition: 'background .15s ease, box-shadow .15s ease, opacity .15s ease'
}

const styles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-primary-main)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    boxShadow: 'var(--shadow-sm)'
  },
  secondary: {
    background: 'var(--color-surface-main)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-surface-border)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent'
  }
}

export function Button({ variant = 'primary', style, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{ ...base, ...styles[variant], ...(disabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}), ...style }}
      {...rest}
    >
      {children}
    </button>
  )
}
