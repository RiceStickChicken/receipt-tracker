import { useState } from 'react'
import type { Receipt } from '../App'

type Props = {
    onAdd: (receipt: Omit<Receipt, 'id'>) => void
}

function getToday() {
    const d = new Date()
    return d.toISOString().slice(0, 10)
}

export default function ReceiptForm({ onAdd }: Props) {
    const [store, setStore] = useState('')
    const [date, setDate] = useState(getToday())
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!store || !date || !amount || !category) return
        onAdd({
            store,
            date,
            amount: parseFloat(amount),
            category,
        })
        setStore('')
        setDate(getToday())
        setAmount('')
        setCategory('')
    }

    return (
        <div className='bg-gray-100 p-4 rounded'>
            <h2 className="text-lg font-semibold mb-4">Add Receipt</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 whitespace-nowrap">
                        Store Name
                    </label>
                    <input
                        type="text"
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. Costco"
                        value={store}
                        onChange={e => setStore(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 whitespace-nowrap">
                        Date
                    </label>
                    <input
                        type="date"
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 whitespace-nowrap">
                        Amount
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. 29.99"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 whitespace-nowrap">
                        Category
                    </label>
                    <select
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="">Select a category</option>
                        <option value="groceries">Groceries</option>
                        <option value="dining">Dining</option>
                        <option value="travel">Travel</option>
                        <option value="utilities">Utilities</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full cursor-pointer"
                >
                    Add Receipt
                </button>
            </form>
        </div>
    );
}
