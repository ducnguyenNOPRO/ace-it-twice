import { memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const BudgetPieChart = memo(({ currentDate, categorySpendingData, categoryBudgetList }) => {
    const formattedMonth = currentDate.toLocaleString('en-US', {
        month: 'short',
    });

    const totalBudget = categoryBudgetList.reduce((acc, category) => acc + (category.target_amount || 0), 0);

    const totalSpendingThisMonth = Object.values(categorySpendingData)
        .reduce((acc, category) => acc + (category.total || 0), 0).toFixed(2);
    
    const pieData = categoryBudgetList.map((cat) => ({
        name: cat.category_name,
        value: Math.round(categorySpendingData[cat.category_name]?.total) || 0
    }));


    const categories = [
    "Entertainment",
    "Food",
    "Healthcare",
    "Housing",
    "Transportation",
    "Utilities",
    "Shopping",
    "Income",
    "Transfer_in",
    "Transfer_out",
    "Bank_fees",
    "Loans",
    "Investments",
    "Personal_Care",
    "Subscription",
    "Travel",
    "Other"
    ];

    const COLORS = [
        "#A78BFA", // Entertainment (purple-400)
        "#FBBF24", // Food (yellow-400)
        "#F87171", // Healthcare (red-400)
        "#60A5FA", // Housing (blue-400)
        "#34D399", // Transportation (green-400)
        "#818CF8", // Utilities (indigo-400)
        "#F472B6", // Shopping (pink-400)
        "#34D399", // Income (green-400)
        "#9CA3AF", // Transfer_in (gray-400)
        "#9CA3AF", // Transfer_out (gray-400)
        "#F87171", // Bank_fees (rose-400)
        "#FB923C", // Loans (orange-400)
        "#2DD4BF", // Investments (teal-400)
        "#D8B4FE", // Personal_Care (fuchsia-400)
        "#22D3EE", // Subscription (cyan-400)
        "#38BDF8", // Travel (sky-400)
        "#A1A1AA"  // Other (zinc-400)
        ];

    return (
        <div className="flex items-center justify-center px-6 gap-3 border-2 border-gray-300 rounded-lg mx-5 p-2">
            <div>
                <div>
                    <p className="font-medium text-lg">${totalSpendingThisMonth}</p>
                    <p className="text-gray-400 text-sm">spent in {formattedMonth}</p>
                </div>
                <div className="mt-10">
                    <p className="font-medium text-lg">${totalBudget}</p>
                    <p className="text-gray-400 text-sm">total Budget</p>
                </div>
            </div>

            <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        cx="50%"
                        cy="50%"
                        fill="#8884d8"
                        label
                    >
                        {pieData.map((entry, index) => {
                            const colorIndex = categories.indexOf(entry.name)
                            const fillColor = colorIndex >= 0 ? COLORS[colorIndex] : "#A1A1AA"
                            return <Cell key={`cell-${index}`} fill={fillColor}/>
                        })}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`}/>
                </PieChart>
            </ResponsiveContainer>

        </div>
    )
})

export default BudgetPieChart;