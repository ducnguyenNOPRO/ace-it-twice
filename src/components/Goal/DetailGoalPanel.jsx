import useGoalMonthlySaving from "../../hooks/useGoalMonthlySaving";
import { RiSparkling2Fill } from "react-icons/ri";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { FiPlusCircle } from "react-icons/fi";
import { FiMinusCircle } from "react-icons/fi";

export default function DetailGoalPanel({selectedGoalItem, setEditMode, handleOpenAddFundModal, handleOpenWithdrawalFundModal }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const goalMonthlySaving = useGoalMonthlySaving(selectedGoalItem);

    const handleOpenAddModal = () => {
        setIsMenuOpen(false);
        handleOpenAddFundModal();
    }
    const handleOpenWithdrawalModal = () => {
        setIsMenuOpen(false);
        handleOpenWithdrawalFundModal();
    }
    return (
        <>
            <div className="flex-1">
                <div className="flex items-center justify-between h-12 px-10 border-b border-gray-300 p-2">
                    <h1 className="text-3xl lg:text-2xl text-black font-medium">
                        Goal
                    </h1>
                    <div className="relative">
                        <button
                            className="border p-1 text-blue-500 cursor-pointer"
                            onClick={() => setIsMenuOpen(prev => !prev)}
                        >
                            <BsThreeDotsVertical />
                        </button>
                        
                        {isMenuOpen && (
                            <div className="text-black w-45 right-0 shadow-lg rounded-md bg-white text-left p-2 absolute z-9999">
                                <ul className="list-none">
                                    <li
                                        className="flex items-center gap-1 p-1 hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
                                        onClick={() => setEditMode(true)}
                                    >
                                        <MdEdit/>
                                        <span>Edit</span>
                                    </li>
                                    <li
                                        className="flex items-center gap-1 p-1 border-t hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
                                        onClick={handleOpenAddModal}
                                    >
                                        <FiPlusCircle/>
                                        <span>Add Fund</span>
                                    </li>
                                    <li
                                        className="flex items-center gap-1 p-1 border-b hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
                                        onClick={handleOpenWithdrawalModal}
                                    >
                                        <FiMinusCircle/>
                                        <span>Withdrawal Fund</span>
                                    </li>
                                </ul>

                            </div>
                        )}
                    </div>

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
                        <span className="text-black">You need to save <b>${goalMonthlySaving}</b> every month</span>
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
                        {Object.entries(selectedGoalItem.contributions).map(([accountId, { name, amount }]) => {
                            if (amount > 0) {
                                return (
                                    <div
                                        className="grid grid-cols-2 mb-1"
                                        key={accountId}
                                    >
                                        <span className="text-gray-400 font-medium">{name}</span>
                                        <span className="text-right font-medium">${amount}</span>
                                    </div>
                                );
                            }
                            return null; // ensures React always returns something
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}