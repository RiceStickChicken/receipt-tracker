export interface Receipt {
  id: string
  date: string // ISO date (YYYY-MM-DD)
  merchant: string
  totalCents: number
  category: string
  notes?: string
  createdAt: string // ISO timestamp
}

export type NewReceiptInput = Omit<Receipt, 'id' | 'createdAt'>
