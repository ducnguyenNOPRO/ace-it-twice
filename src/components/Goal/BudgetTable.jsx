import { FaPlusCircle } from "react-icons/fa";
import { BiSolidDownArrow } from "react-icons/bi";
import { BiSolidRightArrow } from "react-icons/bi";
import { useState } from "react";
import {prettyMapCategory} from "../../constants/prettyMapCategory";


export default function BudgetTable(
    { goalsList, categoryBudgetList, openModel, openCategoryModal,
        setSelectedGoalItem, setSelectedCategoryItem, categorySpendingData
    }) {
    const [isShowGoalDataRow, setIsShowGoalDataRow] = useState(true);
    const [isShowCategoryDataRow, setIsShowCategoryDataRow] = useState(true);
    const [isShowUnbudgetDataRow, setIsShowUnbudgetDataRow] = useState(true);

    const categoriesName = new Set(categoryBudgetList.map(cat => cat.category_name));
    const UnbudgetCategories =
        Object.entries(categorySpendingData)
            .filter(([cat]) => !categoriesName.has(cat));

    const handleOpenGoalDetailPanel = (goalItem) => {
        setSelectedGoalItem(goalItem);
        setSelectedCategoryItem(null);
    }

    const handleOpenCategoryDetailPanel = (categoryItem) => {
        setSelectedCategoryItem(categoryItem);
        setSelectedGoalItem(null);
    }

    const handleOpenUnbudgetDetailPanel = (categoryItem) => {
        setSelectedCategoryItem(categoryItem);
        setSelectedGoalItem(null);
    }

    const handleShowGoalTable = () => {
        setIsShowGoalDataRow(prev => !prev);
        setSelectedGoalItem(null);
    }

    const handleShowCategoryTable = () => {
        setIsShowCategoryDataRow(prev => !prev);
        setSelectedCategoryItem(null);
    }

    const handleShowUnbudgetTable = () => {
        setIsShowUnbudgetDataRow(prev => !prev);
        setSelectedCategoryItem(null);
    }
    return (
        <div className="mx-5 mt-4 overflow-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="text-left border font-semibold text-lg bg-blue-100">
                        <th className="gap-2 py-2 px-4 w-[30%]">
                            <div className="flex items-center gap-1">
                                {isShowGoalDataRow
                                    ? 
                                    <span>
                                        <BiSolidDownArrow
                                            className="text-gray-400 text-lg cursor-pointer"
                                            onClick={handleShowGoalTable}

                                        />
                                    </span> 
                                    :
                                    <span>
                                        <BiSolidRightArrow
                                            className="text-gray-400 text-lg cursor-pointer"
                                            onClick={() => setIsShowGoalDataRow(prev => !prev)}

                                        />
                                    </span> 

                                }
                                <span>Goals</span>
                                <button>
                                    <FaPlusCircle
                                        className="text-blue-400 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
                                        onClick={openModel}
                                    />
                                </button>
                            </div>
                        </th>
                        <th className="py-2 px-4 w-[20%] text-gray-400 text-right">Saved</th>
                        <th className="py-2 px-4 w-[30%]"></th>
                        <th className="py-2 px-4 w-[20%] text-gray-400">Target</th>
                    </tr>
                </thead>
                {isShowGoalDataRow && 
                    <tbody>
                        {goalsList.map((goal) => {
                            const progress = (goal.saved_amount / (goal.target_amount || 0)) * 100;
                            return (
                                <tr
                                    key={goal.goal_id}
                                    className="hover:bg-blue-50"
                                    onClick={() => handleOpenGoalDetailPanel(goal)}
                                >
                                    <td className="py-2 px-4">{goal.goal_name}</td>
                                    <td className="py-2 px-4 text-right font-medium tracking-wide">${Math.round(goal.saved_amount)}</td>
                                    <td className="py-2 px-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${progress < 100 ? "bg-yellow-500" : "bg-green-500"}`}
                                                style={
                                                    {
                                                        width: `${Math.min(progress, 100)}%`
                                                    }
                                                }
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 font-medium tracking-wide">${Math.round(goal.target_amount)}</td>
                                </tr>
                        )})}
                    </tbody>
                }
                <thead>
                    <tr className="text-left border font-semibold text-lg bg-blue-100">
                        <th className="gap-2 py-2 px-4 w-[30%] ">
                            <div className="flex items-center gap-1">
                                {isShowCategoryDataRow
                                    ? 
                                    <button>
                                        <BiSolidDownArrow
                                            className="text-gray-400 text-lg cursor-pointer"
                                            onClick={handleShowCategoryTable}

                                        />
                                    </button> 
                                    :
                                    <button>
                                        <BiSolidRightArrow
                                            className="text-gray-400 text-lg cursor-pointer"
                                            onClick={() => setIsShowCategoryDataRow(prev => !prev)}

                                        />
                                    </button> 

                                }
                                <span>Categories</span>
                                <button>
                                    <FaPlusCircle
                                        className="text-blue-400 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300"
                                        onClick={openCategoryModal}
                                    />
                                </button>
                            </div>
                        </th>
                        <th className="py-2 px-4 w-[20%] text-gray-400 text-right">Spent</th>
                        <th className="py-2 px-4 w-[30%]"></th>
                        <th className="py-2 px-4 w-[20%] text-gray-400">Budget</th>
                    </tr>
                </thead>
                {isShowCategoryDataRow && categoryBudgetList.length > 0 &&
                    <tbody>
                        {categoryBudgetList.map((category) => {
                            const spending = categorySpendingData[category.category_name]?.total || 0;
                            const budget = category.target_amount;
                            const percent = spending / budget * 100;
                            return (
                                <tr
                                    key={category.budget_id}
                                    className="hover:bg-blue-50"
                                    onClick={() => handleOpenCategoryDetailPanel(category)}
                                >
                                    <td className="py-2 px-4">
                                        <div
                                            className={`flex items-center gap-2 rounded-full px-3 py-1 w-fit 
                                            ${categorySpendingData[category.category_name]?.color || prettyMapCategory[category.category_name].color}`
                                            }
                                            title={category.category_name}
                                        >
                                            <img className="w-5 h-5 flex-shrink-0"
                                                src={categorySpendingData[category.category_name]?.icon
                                                    || prettyMapCategory[category.category_name].icon
                                                }
                                                alt={`${category.category_name} Icon`}
                                            />
                                            <span className="text-sm font-bold truncate hidden md:inline">
                                                {category.category_name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="py-2 px-4 text-right font-medium tracking-wide">
                                        ${spending.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`${spending <= budget ? "bg-green-500" : "bg-red-500"} h-2 rounded-full`}
                                                style={
                                                    {
                                                        width: `${Math.min(percent, 100)}%`
                                                    }
                                                }
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 font-medium tracking-wide">${(category.target_amount).toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                }
                <thead>
                    <tr className="text-left border font-semibold text-lg bg-blue-100">
                        <th className="gap-2 py-2 px-4 w-[30%] ">
                            <div className="flex items-center gap-1">
                                {isShowUnbudgetDataRow
                                    ? 
                                    <button>
                                        <BiSolidDownArrow
                                            className="text-gray-400 text-lg cursor-pointer"
                                            onClick={handleShowUnbudgetTable}

                                        />
                                    </button> 
                                    :
                                    <button>
                                        <BiSolidRightArrow
                                            className="text-gray-400 text-lg cursor-pointer" 
                                            onClick={() => setIsShowUnbudgetDataRow(prev => !prev)}

                                        />
                                    </button> 

                                }
                                <span>Unbudget</span>
                            </div>
                        </th>
                        <th className="py-2 px-4 w-[20%] text-gray-400 text-right">Spent</th>
                        <th className="py-2 px-4 w-[30%]"></th>
                        <th className="py-2 px-4 w-[20%] text-gray-400">Budget</th>
                    </tr>
                </thead>
                {isShowUnbudgetDataRow && UnbudgetCategories.length > 0 &&
                    <tbody>
                        {UnbudgetCategories.map(([category_name, value]) => (
                            <tr
                                key={category_name}
                                className="hover:bg-blue-50"
                                onClick={() => handleOpenUnbudgetDetailPanel({category_name})}
                            >
                                <td className="py-2 px-4">
                                    <div
                                        className={`flex items-center gap-2 rounded-full px-3 py-1 w-fit 
                                        ${value.color || prettyMapCategory[category_name].color}`
                                        }
                                        title={category_name}
                                    >
                                        <img className="w-5 h-5 flex-shrink-0"
                                            src={value.icon || prettyMapCategory[category_name].icon }
                                            alt={`${category_name} Icon`}
                                        />
                                        <span className="text-sm font-bold truncate hidden md:inline">
                                            {category_name}
                                        </span>
                                    </div>
                                </td>

                                <td className="py-2 px-4 text-right font-medium tracking-wide">
                                    ${value.total.toFixed(2)}
                                </td>
                                <td className="py-2 px-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full w-full"
                                        ></div>
                                    </div>
                                </td>
                                <td className="py-2 px-4 font-medium tracking-wide">$0</td>
                            </tr>
                        ))}
                    </tbody>
                }
            </table>
        </div>
    )
}