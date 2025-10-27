import useGoalMonthlySaving from "../../hooks/useGoalMonthlySaving";
import { RiSparkling2Fill } from "react-icons/ri";

export default function DetailGoalPanel({ selectedGoalItem, setEditMode }) {
    const goalMonthlySaving = useGoalMonthlySaving(selectedGoalItem);
    return (
        <>
            <div className="flex-1">
                <div className="flex items-center h-12 px-10 border-b border-gray-300 p-2">
                    <h1 className="text-2xl text-black font-medium">
                        Goal
                    </h1>
                    <button
                        className="ml-auto border py-1 px-3 text-blue-500 cursor-pointer"
                        onClick={() => setEditMode(true)}
                    >
                        Edit
                    </button>
                </div>
                <div className="px-4 py-2 text-black">
                    <h1 className="text-3xl font-bold text-black my-5">{selectedGoalItem.goal_name}</h1>

                    <div className="flex flex-col gap-1 my-5">
                        <p>Progress ({(selectedGoalItem.progress).toFixed(2)}%)</p>
                        <div className="bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${(selectedGoalItem.progress)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-5 hover:scale-125 transition-scale duration-500">
                        <RiSparkling2Fill className="text-blue-500"/>
                        <span className="text-black">You need to save <b>${goalMonthlySaving}</b> this month</span>
                    </div>

                    <span className="inline-block h-px w-full bg-gray-300 my-5"></span>

                    <div className="mb-5">
                        <h3 className="text-xl font-bold mb-2">Summary</h3>
                        <div className="grid grid-cols-2 gap-y-1">
                            <span className="text-gray-400 font-medium">Target Amount</span>
                            <span className="text-right font-medium">${selectedGoalItem.target_amount}</span>

                            <span className="text-gray-400 font-medium">Saved Amount</span>
                            <span className="text-right font-medium">${selectedGoalItem.saved_amount}</span>
                            
                            <span className="text-gray-400 font-medium">Start Date</span>
                            <span className="text-right font-medium">{selectedGoalItem.start_date_formatted}</span>

                            <span className="text-gray-400 font-medium">Target Date</span>
                            <span className="text-right font-medium">{selectedGoalItem.target_date_formatted}</span>                             
                        </div>
                    </div>

                    <span className="inline-block h-px w-full bg-gray-300 my-5"></span>

                    <div>
                        <h3 className="text-xl font-bold mb-2">Contributions</h3>
                        {selectedGoalItem.contributions.map((item) => (
                            <div
                                className="grid grid-cols-2 gap-y-1"
                                key={item.date}
                            >
                                <span className=" font-medium">{item.date}</span>
                                <span className="text-right font-medium">${item.amount}</span>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </>
    )
}