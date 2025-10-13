import React from "react";

export default function TopCategories({ categorySpendingData }) {
    if (categorySpendingData.sorted.length == 0) {
        return (
            <div className="text-lg">
                No Monthly Spending Data
            </div>
        )
    }
    return (
        <>
            {/* <select
                className="text-md font-semibold border rounded px-2 py-1"
                onChange={(e) => setFilterRange(e.target.value)}
            >
                <option value="this month">This month</option>
                <option value="last month">Last month</option>
            </select> */}

            <div className="mt-5 grid grid-cols-[auto_auto_1fr_auto] gap-y-5 gap-x-3">
            {categorySpendingData.sorted.map((cat) => (
                <React.Fragment key={cat.category}>
                    <div
                        className={`flex items-center gap-2 rounded-full px-3 py-1 sm:w-fit overflow-hidden ${cat.color}`}
                        title={cat.category}
                    >
                        <img className="w-5 h-5 flex-shrink-0" src={cat.icon} alt={`${cat.category} Icon`} />
                        <span className="text-sm font-bold truncate hidden md:inline">
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
                    <span className="text-md font-medium text-gray-700">${categorySpendingData.totalSpending.toFixed(0)}</span>
                </React.Fragment>
            ))}
            </div>   
        </>
    )
}