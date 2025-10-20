import { FaPlusCircle } from "react-icons/fa";
import { BiSolidDownArrow } from "react-icons/bi";
import { BiSolidRightArrow } from "react-icons/bi";
import { useState } from "react";
import { createMonthlyTransactionsQueryOptions } from "../../util/createQueryOptions";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getSpendingDataByCategorySorted } from "../../util/spendingData";


export default function BudgetTable({itemId, goalsList, categoryBudgetList, openModel, openCategoryModal, setSelectedGoalItem}) {
    const [isShowGoalDataRow, setIsShowGoalDataRow] = useState(true);
    const [isShowCategoryDataRow, setIsShowCategoryDataRow] = useState(true);
    const { data: monthlyTransactionsResponse, isLoading: loadingMonthlyTransactions } = useQuery(
        createMonthlyTransactionsQueryOptions(
          { itemId},
          {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            enabled: !!itemId
          }
        )
    )
    
    const monthlyTransactions = monthlyTransactionsResponse?.monthlyTransactions ?? [];
    //return {totalSpending: int, sortedCategories[{category, total, icon, color}]}
    const categorySpendingData = useMemo(() => getSpendingDataByCategorySorted(monthlyTransactions), [monthlyTransactions]);
    console.log(categorySpendingData)
    
    if (loadingMonthlyTransactions || monthlyTransactions.length === 0) {
        return <div>Loading....</div>
    }
    return (
        <div className="w-full mt-4 border-t">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="text-left border-b font-semibold text-lg">
                        <th className="gap-2 py-2 px-4 w-[30%]">
                            <div className="flex items-center gap-1">
                                {isShowGoalDataRow
                                    ? 
                                    <span>
                                        <BiSolidDownArrow
                                            className="text-gray-400 text-lg"
                                            onClick={() => setIsShowGoalDataRow(prev => !prev)}

                                        />
                                    </span> 
                                    :
                                    <span>
                                        <BiSolidRightArrow
                                            className="text-gray-400 text-lg"
                                            onClick={() => setIsShowGoalDataRow(prev => !prev)}

                                        />
                                    </span> 

                                }
                                <span>Goals</span>
                                <span>
                                    <FaPlusCircle
                                        className="text-blue-400 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
                                        onClick={openModel}
                                    />
                                </span>
                            </div>
                        </th>
                        <th className="py-2 px-4 w-[20%] text-gray-400 text-right">Saved</th>
                        <th className="py-2 px-4 w-[30%]"></th>
                        <th className="py-2 px-4 w-[20%] text-gray-400">Target</th>
                    </tr>
                </thead>
                {isShowGoalDataRow && 
                    <tbody>
                        {goalsList.map((goal) => (
                            <tr
                                key={goal.goal_id}
                                className="hover:bg-blue-50"
                                onClick={() => setSelectedGoalItem(goal)}
                            >
                                <td className="py-2 px-4">{goal.goal_name}</td>
                                <td className="py-2 px-4 text-right font-medium tracking-wide">${Math.round(goal.saved_amount)}</td>
                                <td className="py-2 px-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${(goal.progress)}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="py-2 px-4 font-medium tracking-wide">${Math.round(goal.target_amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                }
                <thead>
                    <tr className="text-left border-b border-t font-semibold text-lg">
                        <th className="gap-2 py-2 px-4 w-[30%]">
                            <div className="flex items-center gap-1">
                                {isShowCategoryDataRow
                                    ? 
                                    <span>
                                        <BiSolidDownArrow
                                            className="text-gray-400 text-lg"
                                            onClick={() => setIsShowCategoryDataRow(prev => !prev)}

                                        />
                                    </span> 
                                    :
                                    <span>
                                        <BiSolidRightArrow
                                            className="text-gray-400 text-lg"
                                            onClick={() => setIsShowCategoryDataRow(prev => !prev)}

                                        />
                                    </span> 

                                }
                                <span>Categories</span>
                                <span>
                                    <FaPlusCircle
                                        className="text-blue-400 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
                                        onClick={openCategoryModal}
                                    />
                                </span>
                            </div>
                        </th>
                        <th className="py-2 px-4 w-[20%] text-gray-400 text-right">Spent</th>
                        <th className="py-2 px-4 w-[30%]"></th>
                        <th className="py-2 px-4 w-[20%] text-gray-400">Budget</th>
                    </tr>
                </thead>
                {isShowCategoryDataRow && 
                    <tbody>
                        {categoryBudgetList.map((category) => (
                            <tr
                                key={category.budget_id}
                                className="hover:bg-blue-50"
                                onClick={() => setSelectedGoalItem(category)}
                            >
                                <td className="py-2 px-4">
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 w-fit ${categorySpendingData.sorted[category.category_name]?.color}`}
                                        title={category.category_name}
                                    >
                                        <img className="w-5 h-5 flex-shrink-0"
                                            src={categorySpendingData.sorted[category.category_name]?.icon}
                                            alt={`${category.category_name} Icon`}
                                        />
                                        <span className="text-sm font-bold truncate hidden md:inline">
                                            {category.category_name}
                                        </span>
                                    </div>
                                </td>

                                <td className="py-2 px-4 text-right font-medium tracking-wide">
                                    ${categorySpendingData.sorted[category.category_name]?.total || category.spent_amount}
                                </td>
                                <td className="py-2 px-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${categorySpendingData.sorted[category.category_name]?.percent || 0}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="py-2 px-4 font-medium tracking-wide">${Math.round(category.target_amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                }
            </table>
        </div>
    )
}