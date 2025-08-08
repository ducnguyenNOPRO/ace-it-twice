import React from "react";

export default function TopCategories({data}) {
    return (
    <>
        <h1 className="font-semibold text-xl text-black tracking-wider mb-6">Top categories</h1>
            <select
                className="text-md font-semibold border rounded px-2 py-1">
            <option>This month</option>
            <option>Last month</option>
        </select>

        <div className="mt-5 grid grid-cols-[auto_auto_1fr_auto] gap-y-5 gap-x-3">
        {data.sorted.map((cat) => (
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
                <span className="text-md font-medium text-gray-700">${data.totalSpending.toFixed(0)}</span>
            </React.Fragment>
        ))}
        </div>   
    </>
    )
}