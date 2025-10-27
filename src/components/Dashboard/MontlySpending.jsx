import {
    Line,
    LineChart,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

export default function MonthlySpending({ monthlySpendingData }) {
    if (monthlySpendingData.length == 0) {
        return (
            <div className="text-lg ">
                No Monthly Spending Data
            </div>
        )
    }

    return (
        <>
            <ResponsiveContainer
                width="100%"
                height="90%"
            >
                <LineChart data={monthlySpendingData} margin={{ top: -10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal="true" vertical=""/>
                    <XAxis
                        dataKey="date"
                        padding={{ left: 40, right: 40 }}
                    />
                    <YAxis
                        domain={[0, 'dataMax + 50']}  // matches the visible range in the image
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        formatter={(value) => `$${value}`}    
                        labelClassName="text-sm font-semibold"
                    />
                    <Legend verticalAlign="top" />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            
        </>
    )
}