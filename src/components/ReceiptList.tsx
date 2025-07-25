import type { Receipt } from "../App"

type Props = {
    receipts: Receipt[]
}

export default function ReceiptList({ receipts }: Props) {
    return (
        <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Receipts</h2>
            <div className="border border-gray-300 rounded">
                {/* Fixed header */}
                <table className="min-w-full text-sm" style={{ tableLayout: 'fixed' }}>
                    <thead className="bg-gray-300 text-gray-700">
                        <tr>
                            <th className="text-center px-2 py-1 w-1/4">Store</th>
                            <th className="text-center px-2 py-1 w-1/4">Date</th>
                            <th className="text-center px-2 py-1 w-1/4">Amount</th>
                            <th className="text-center px-2 py-1 w-1/4">Category</th>
                        </tr>
                    </thead>
                </table>
                {/* Scrollable body */}
                <div className="max-h-[350px] overflow-y-auto border-t border-gray-300">
                    <table className="min-w-full text-sm" style={{ tableLayout: 'fixed' }}>
                        <tbody>
                            {receipts.map((receipt) => (
                                <tr key={receipt.id}>
                                    <td className="text-center px-2 py-1 w-1/4">{receipt.store}</td>
                                    <td className="text-center px-2 py-1 w-1/4">{receipt.date}</td>
                                    <td className="text-center px-2 py-1 w-1/4">${receipt.amount.toFixed(2)}</td>
                                    <td className="text-center px-2 py-1 w-1/4 capitalize">{receipt.category}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
