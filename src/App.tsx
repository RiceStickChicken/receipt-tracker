import { useState } from 'react'
import Header from './components/Header'
import ReceiptForm from './components/ReceiptForm'
import ReceiptList from './components/ReceiptList'
import MonthlySpendingChart from './components/MonthlySpendingChart'
import mockReceipts from './data/mockReceipts'

export type Receipt = {
    id: number
    store: string
    date: string
    amount: number
    category: string
}

export default function App() {
    const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts)

    function addReceipt(newReceipt: Omit<Receipt, 'id'>) {
        setReceipts(prev => [
            { ...newReceipt, id: Date.now() },
            ...prev,
        ])
    }

    return (
        <>
            <Header />
            <main className='p-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4'>
                    <ReceiptForm onAdd={addReceipt} />
                    <ReceiptList receipts={receipts} />
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    <MonthlySpendingChart />
                </div>
            </main>
        </>
    )
}
