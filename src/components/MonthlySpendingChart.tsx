import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import mockReceipts from '../data/mockReceipts';

interface MonthlyData {
    month: string;
    amount: number;
}

export default function MonthlySpendingChart() {
    const monthlyData: MonthlyData[] = mockReceipts.reduce((acc, receipt) => {
        const date = new Date(receipt.date);
        // const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        const existingMonth = acc.find(item => item.month === monthLabel);
        if (existingMonth) {
            existingMonth.amount += receipt.amount;
        } else {
            acc.push({ month: monthLabel, amount: receipt.amount });
        }

        return acc;
    }, [] as MonthlyData[])
        .sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime());

    const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

    return (
        <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Spending</h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                            labelStyle={{ color: '#374151' }}
                        />
                        <Bar
                            dataKey="amount"
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}