import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Receipt, NewReceiptInput } from '../types/receipt'

interface ReceiptsContextValue {
  receipts: Receipt[]
  addReceipt: (input: NewReceiptInput) => Receipt
  updateReceipt: (id: string, patch: Partial<NewReceiptInput>) => Receipt | undefined
  deleteReceipt: (id: string) => void
}

const ReceiptsContext = createContext<ReceiptsContextValue | undefined>(undefined)

export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const STORAGE_KEY = 'receiptTracker.receipts.v1'
  const [hydrated, setHydrated] = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>([])

  // Hydrate from localStorage once
  useEffect(() => {
    if (hydrated) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setReceipts(parsed.filter(r => r && typeof r.id === 'string'))
        }
      }
    } catch (e) {
      console.warn('[ReceiptsProvider] Failed to parse stored receipts', e)
    } finally {
      setHydrated(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on change after hydration
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts))
    } catch (e) {
      console.warn('[ReceiptsProvider] Failed to persist receipts', e)
    }
  }, [receipts, hydrated])

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setReceipts(parsed)
        } catch {/* ignore */}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const addReceipt = useCallback((input: NewReceiptInput) => {
    const now = new Date().toISOString()
    const receipt: Receipt = {
      id: crypto.randomUUID(),
      createdAt: now,
      ...input
    }
    setReceipts(r => [receipt, ...r])
    return receipt
  }, [])

  const updateReceipt = useCallback((id: string, patch: Partial<NewReceiptInput>) => {
    let updated: Receipt | undefined
    setReceipts(rs => rs.map(r => {
      if (r.id === id) {
        updated = { ...r, ...patch }
        return updated
      }
      return r
    }))
    return updated
  }, [])

  const deleteReceipt = useCallback((id: string) => {
    setReceipts(rs => rs.filter(r => r.id !== id))
  }, [])

  return (
  <ReceiptsContext.Provider value={{ receipts, addReceipt, updateReceipt, deleteReceipt }}>
      {children}
    </ReceiptsContext.Provider>
  )
}

export function useReceipts() {
  const ctx = useContext(ReceiptsContext)
  if (!ctx) throw new Error('useReceipts must be used within ReceiptsProvider')
  return ctx
}
