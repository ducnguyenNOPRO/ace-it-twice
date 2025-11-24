import React from "react";
import { createBudgetsQueryOptions } from "../../util/createQueryOptions";
import { useQuery } from "@tanstack/react-query";
export default function Topcategoryegories({ categorySpendingData }) {
    if (!categorySpendingData || Object.keys(categorySpendingData).length == 0) {
        return (
            <div className="text-lg">
                No Monthly Spending Data
            </div>
        )
    }
    const now = new Date();

    const { data: budgetsListResponse, isLoading } = useQuery(
        createBudgetsQueryOptions(
            {
                month: now.getMonth() + 1,
                year: now.getFullYear()
            },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }));
    
    if (!budgetsListResponse || isLoading) {
        return <div>Loading Categories....</div>
    }
    
    const budgetsMap = Object.fromEntries(
        (budgetsListResponse?.budgets ?? []).map(b => [b.category_name, b])
    );
    return (
        <>
            <div className="mt-5 grid grid-cols-[auto_auto_0.8fr_auto] gap-y-5 gap-x-3">
                {Object.entries(categorySpendingData).map(([categoryName, data]) => {
                    const spending = data.total ?? 0;
                    const budget = budgetsMap[categoryName]?.target_amount; // maybe undefined
                    const percent = budget ? spending / budget * 100 : 101;
                    return (
                        <React.Fragment key={categoryName}>
                            
                            {/* Category name + icon */}
                            <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${data.color}`}>
                                <img src={data.icon} className="w-5 h-5" />
                                <span className="text-sm font-bold hidden md:inline">
                                    {categoryName}
                                </span>
                            </div>

                            {/* Total spending */}
                            <div className="text-md text-right font-medium text-gray-700">
                                ${spending.toFixed(2)}
                            </div>

                            {/* Progress bar */}
                            <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                className={`${percent <= 100 ? "bg-green-500" : "bg-red-500"} h-2 rounded-full`}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                                ></div>
                            </div>
                            </div>

                            {/* Target amount OR “No budget” */}
                            <span className="text-md font-medium text-gray-700">
                                {budget ? `$${Math.round(budget)}` : "No Budget"}
                            </span>

                        </React.Fragment>
                        );
                })}
            </div>   
        </>
    )
}