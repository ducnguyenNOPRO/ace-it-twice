import React from "react";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

export default function MonthlySpending({data}) {
    return (
        <>
            <ResponsiveContainer
                width="100%"
                height="90%"
            >
                <LineChart data={data}>
                    <XAxis dataKey="month" />
                    <YAxis
                        label={{ value: 'Total ($)', position: 'insideLeft', angle: -90 }}
                        domain={['dataMin - 50', 'dataMax + 50']}
                    />
                    <Tooltip
                        formatter={(value) => `$${value}`}    
                        labelClassName="text-sm font-semibold"
                    />
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