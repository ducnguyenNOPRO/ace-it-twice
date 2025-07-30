import React from "react";
import prettyMapCategory from "../../constants/prettyMapCategory";

export default function TopCategories({ transactions }) {
    // Positive amount = money out, spending
    // Negative amound = money in, income, refund, etc.
    const spendingOnly = transactions.filter(tx => tx.amount > 0)  
    const categoriesTotal = {};  // <String: {total, icon, color}>
    let totalSpending = 0;

    spendingOnly.forEach(tx => {
        const key = tx.personal_finance_category.primary;
        const mapped = prettyMapCategory[key];   // {name, icon, color}

        const name = mapped.name;
        const icon = mapped.icon;
        const color = mapped.color;
        
        // If it's tracked, just add the total
        if (categoriesTotal[name]) {
            categoriesTotal[name].total += tx.amount
        } else {
            categoriesTotal[name] = {
                total: tx.amount,
                icon,
                color
            }
        }
        totalSpending += tx.amount
    })

    const sorted = Object.entries(categoriesTotal)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([category, data]) => ({
            category,
            total: data.total,
            percent: Math.round((data.total / totalSpending) * 100),
            icon: data.icon,
            color: data.color
        }));

    return (
    <>
        <h1 className="font-semibold text-xl text-black tracking-wider mb-6">Top categories</h1>
        <select className="text-md font-semibold border rounded px-2 py-1">
            <option>This month</option>
            <option>Last month</option>
            <option>Last year</option>
        </select>

        <div className="mt-5 grid grid-cols-[auto_auto_1fr_auto] gap-y-5 gap-x-3">
        {sorted.map((cat) => (
            <React.Fragment key={cat.category}>
                <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1 max-w-full sm:w-fit overflow-hidden ${cat.color}`}
                    title={cat.category}
                >
                <img className="w-5 h-5 flex-shrink-0" src={cat.icon} alt={`${cat.category} Icon`} />
                    <span className="text-sm font-bold truncate hidden sm:inline">
                        {cat.category}
                    </span>
            </div>
            <div className="text-md font-medium text-gray-700">${cat.total}</div>
            <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${cat.percent}%` }}
                ></div>
                </div>
            </div>
            <span className="text-md font-medium text-gray-700">${totalSpending}</span>
            </React.Fragment>
        ))}
        </div>   
    </>
    )
}