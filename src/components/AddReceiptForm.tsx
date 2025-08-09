import { useState, useEffect } from 'react'
import type { NewReceiptInput } from '../types/receipt'
import { Button } from './Button'
import { useReceipts } from '../context/ReceiptsContext'

interface AddReceiptFormProps {
  onSuccess: () => void
  mode?: 'create' | 'edit'
  initial?: NewReceiptInput & { id?: string } // id present when editing
}

type FieldErrors = Partial<Record<keyof NewReceiptInput, string>> & { form?: string }

const categories = ['General', 'Food', 'Travel', 'Supplies', 'Other']

export function AddReceiptForm({ onSuccess, mode = 'create', initial }: AddReceiptFormProps) {
  const { addReceipt, updateReceipt } = useReceipts()
  const today = new Date().toISOString().slice(0, 10)
  const [values, setValues] = useState<NewReceiptInput>(() => initial ? {
    date: initial.date,
    merchant: initial.merchant,
    totalCents: initial.totalCents,
    category: initial.category,
    notes: initial.notes || ''
  } : {
    date: today,
    merchant: '',
    totalCents: 0,
    category: 'General',
    notes: ''
  })
  // Separate controlled string for dollar input to preserve user formatting
  const [dollarsInput, setDollarsInput] = useState(() => initial ? (initial.totalCents/100).toFixed(2) : '')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(v: NewReceiptInput): FieldErrors {
    const err: FieldErrors = {}
    const now = new Date()
    const dateObj = new Date(v.date + 'T00:00:00')
    if (!v.date) err.date = 'Date is required'
    else if (isNaN(dateObj.getTime())) err.date = 'Invalid date'
    else if (dateObj > now) err.date = 'Date cannot be in the future'

    if (!v.merchant.trim()) err.merchant = 'Merchant is required'
    if (!dollarsInput.trim()) err.totalCents = 'Total is required'
    else {
      // Validate dollars format (up to 2 decimals)
      if (!/^\d+(\.\d{0,2})?$/.test(dollarsInput.trim())) err.totalCents = 'Invalid amount format'
      else if (v.totalCents <= 0) err.totalCents = 'Total must be positive'
    }

    if (!v.category) err.category = 'Category is required'
    if (v.notes && v.notes.length > 500) err.notes = 'Notes too long (max 500 chars)'
    return err
  }

  useEffect(() => {
    setErrors(validate(values))
  }, [values])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    if (name === 'totalDollars') {
      // Allow only digits and dot in intermediate state
      if (/^[0-9]*\.?[0-9]{0,2}$/.test(value) || value === '') {
        setDollarsInput(value)
        const cents = value === '' ? 0 : Math.round(parseFloat(value) * 100)
        setValues(v => ({ ...v, totalCents: isNaN(cents) ? 0 : cents }))
      }
    } else {
      setValues(v => ({ ...v, [name]: value }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLElement>) {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    setTouched(t => ({ ...t, [target.name]: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const currentErrors = validate(values)
    setErrors(currentErrors)
    setTouched({ date: true, merchant: true, totalCents: true, category: true, notes: true })
    if (Object.keys(currentErrors).length > 0) return
    setSubmitting(true)
    try {
      if (mode === 'edit' && initial?.id) {
        updateReceipt(initial.id, values)
      } else {
        addReceipt(values)
      }
      onSuccess()
    } catch (err) {
      setErrors(e => ({ ...e, form: 'Failed to save receipt' }))
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = 'flex flex-col gap-1'
  const labelStyle = { fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '.5px' }
  const inputBase: React.CSSProperties = {
    border: '1px solid var(--color-surface-border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.55rem 0.75rem',
    fontSize: 'var(--fs-sm)',
    background: 'var(--color-background-primary)'
  }
  const errorStyle: React.CSSProperties = { color: 'var(--color-error)', fontSize: 'var(--fs-xs)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors.form && <div style={errorStyle}>{errors.form}</div>}
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        <div className={fieldClass}>
          <label htmlFor="date" style={labelStyle}>Date *</label>
          <input id="date" name="date" type="date" max={today} value={values.date} onChange={handleChange} onBlur={handleBlur} style={inputBase} required />
          {touched.date && errors.date && <span style={errorStyle}>{errors.date}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="merchant" style={labelStyle}>Merchant *</label>
          <input id="merchant" name="merchant" value={values.merchant} onChange={handleChange} onBlur={handleBlur} style={inputBase} placeholder="Store / Vendor" required />
          {touched.merchant && errors.merchant && <span style={errorStyle}>{errors.merchant}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="totalDollars" style={labelStyle}>Total ($) *</label>
          <input
            id="totalDollars"
            name="totalDollars"
            inputMode="decimal"
            type="text"
            value={dollarsInput}
            onChange={handleChange}
            onBlur={(e) => { handleBlur(e as any); if (dollarsInput && /^\d+\.\d$/.test(dollarsInput)) { // normalize 12.3 -> 12.30 display
              const normalized = parseFloat(dollarsInput).toFixed(2)
              setDollarsInput(normalized)
            } }}
            style={inputBase}
            placeholder="e.g. 12.99"
            required
          />
          {touched.totalCents && errors.totalCents && <span style={errorStyle}>{errors.totalCents}</span>}
        </div>
        <div className={fieldClass}>
          <label htmlFor="category" style={labelStyle}>Category *</label>
          <select id="category" name="category" value={values.category} onChange={handleChange} onBlur={handleBlur} style={inputBase} required>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {touched.category && errors.category && <span style={errorStyle}>{errors.category}</span>}
        </div>
      </div>
      <div className={fieldClass}>
        <label htmlFor="notes" style={labelStyle}>Notes</label>
        <textarea id="notes" name="notes" value={values.notes} onChange={handleChange} onBlur={handleBlur} style={{ ...inputBase, minHeight: '90px', resize: 'vertical' }} placeholder="Optional details, up to 500 chars" />
        {touched.notes && errors.notes && <span style={errorStyle}>{errors.notes}</span>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
  <Button type="submit" disabled={submitting || Object.values(errors).some(Boolean)}>
          {submitting ? (mode==='edit' ? 'Updating...' : 'Saving...') : (mode==='edit' ? 'Update' : 'Save')}
        </Button>
      </div>
    </form>
  )
}
