import React from "react";
import prettyMapCategory from "../../constants/prettyMapCategory";
import { createBudgetsQueryOptions } from "../../util/createQueryOptions";
import { useQuery } from "@tanstack/react-query";
export default function Topcategoryegories({ categorySpendingData }) {
    if (!categorySpendingData || categorySpendingData.sorted?.length == 0) {
        return (
            <div className="text-lg">
                No Monthly Spending Data
            </div>
        )
    }
    const now = new Date();

    const { data: budgetsListResponse } = useQuery(
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
    
    const categoryBudgetList = budgetsListResponse?.budgets ?? [];
    return (
        <>
            <div className="mt-5 grid grid-cols-[auto_auto_0.8fr_auto] gap-y-5 gap-x-3">
                {categoryBudgetList.map((category) => {
                    const percent = (categorySpendingData[category.category_name]?.total || 0) / category.target_amount * 100;
                    return (
                        <React.Fragment key={category.budget_id}>
                            <div
                                className={`flex items-center gap-2 rounded-full px-3 py-1 sm:w-fit overflow-hidden 
                                    ${categorySpendingData[category.category_name]?.color || prettyMapCategory[category.category_name].color}
                                    `}
                                title={category.category_name}
                            >
                                <img
                                    className="w-5 h-5 flex-shrink-0"
                                    src={categorySpendingData[category.category_name]?.icon
                                            || prettyMapCategory[category.category_name].icon}
                                    alt={`${category.category_name} Icon`} />
                                <span className="text-sm font-bold truncategorye hidden md:inline">
                                    {category.category_name}
                                </span>
                            </div>
                            <div className="text-md text-right font-medium text-gray-700">
                                ${categorySpendingData[category.category_name]?.total.toFixed(2) || category.spent_amount}
                            </div>
                            <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`${percent < 100 ? "bg-green-500" : "bg-red-500"} h-2 rounded-full`}
                                        style={{ width: `${Math.min(percent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <span className="text-md font-medium text-gray-700">${Math.round(category.target_amount)}</span>
                        </React.Fragment>
                    )
                })}
            </div>   
        </>
    )
}