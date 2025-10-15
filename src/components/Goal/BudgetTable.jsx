import { FaPlusCircle } from "react-icons/fa";
import { BiSolidDownArrow } from "react-icons/bi";
import { BiSolidRightArrow } from "react-icons/bi";
import { RiSparkling2Fill } from "react-icons/ri";
import { useState } from "react";
import useGoalMonthlySaving from "../../hooks/useGoalMonthlySaving";
import EditGoalModal from "./EditGoalModal";

export default function BudgetTable({goalsList, openModel}) {
    const [isShowDataRows, setIsShowDataRow] = useState(true);
    const [selectedGoalItem, setSelectedGoalItem] = useState();
    const [editMode, setEditMode] = useState(false);
    const goalMonthlySaving = useGoalMonthlySaving(selectedGoalItem);
    return (
        <div className="flex mt-4 border-t-2 border-gray-300">
            {/*Table section*/}
            <div className="w-2/3 border-r-2 border-gray-300">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="text-left border-b font-semibold text-lg">
                            <th className="flex items-center gap-2 py-2 px-4 w-[30%] text-2xl">
                                {isShowDataRows
                                    ? 
                                    <span>
                                        <BiSolidDownArrow
                                            className="text-gray-500 text-lg"
                                            onClick={() => setIsShowDataRow(prev => !prev)}
                                        />
                                    </span> 
                                    :
                                    <span>
                                        <BiSolidRightArrow
                                            className="text-gray-500 text-lg"
                                            onClick={() => setIsShowDataRow(prev => !prev)}
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
                            </th>
                            <th className="py-2 px-4 w-[20%] text-gray-500 text-right">Saved</th>
                            <th className="py-2 px-4 w-[30%]"></th>
                            <th className="py-2 px-4 w-[20%] text-gray-500">Target Amount</th>
                        </tr>
                    </thead>
                    {isShowDataRows && 
                        <tbody>
                            {goalsList.map((goal) => (
                                <tr
                                    key={goal.goal_id}
                                    className="hover:bg-blue-50"
                                    onClick={() => setSelectedGoalItem(goal)}
                                >
                                    <td className="py-2 px-4 font-medium">{goal.goal_name}</td>
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
                </table>
            </div>
            {selectedGoalItem && !editMode &&
                <div className="flex-1 bg-gray-100">
                    <div className="flex items-center p-2">
                        <h1 className="text-[1.75rem] font-medium">{selectedGoalItem.goal_name}</h1>
                        <button
                            className="ml-auto text-blue-500 cursor-pointer"
                            onClick={() => setEditMode(true)}
                        >
                            Edit
                        </button>
                    </div>
                    <div className="px-4 py-2">
                        <div>
                            <span className="font-bold">Summary</span>
                            <div className="flex flex-col gap-1 mt-2 ">
                                <p className="font-bold">${selectedGoalItem.target_amount} by {selectedGoalItem.target_date}</p>
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{ width: `${(selectedGoalItem.progress)}%` }}
                                    ></div>
                                </div>
                                <div className="flex flex-wrap justify-between">
                                    <p>${selectedGoalItem.saved_amount} saved ({(selectedGoalItem.progress).toFixed(2)}%)</p>
                                    <p>Started {selectedGoalItem.start_date}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4">
                        <div className="flex items-center justify-center gap-2 mt-5 hover:scale-125 transition-scale duration-500">
                            <RiSparkling2Fill className="text-blue-500"/>
                            <span>You need to save <b>${goalMonthlySaving}</b> this month</span>
                        </div>
                        <span className="inline-block h-px w-full bg-gray-400"></span>

                        <span className="font-bold">Contributions</span>
                    </div>
                </div>
            }
            
            {/* Entering Editing mode */}
            {(selectedGoalItem && editMode) &&
                <div className="flex-1 bg-gray-50">
                    <EditGoalModal
                        goalItem={selectedGoalItem}
                        setEditMode={setEditMode}
                    />
                </div>
            }

        </div>
    )
}