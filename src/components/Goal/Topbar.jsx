
import { FaArrowCircleLeft } from "react-icons/fa";
import { FaArrowCircleRight } from "react-icons/fa";
export default function Topbar({ currentDate, setCurrentDate, setSelectedGoalItem, setSelectedCategoryItem, openSetBudgetModal, openReblanceModal }) {
    const formattedMonthYear = currentDate.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric'
    });

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)));
        setSelectedGoalItem(null);
        setSelectedCategoryItem(null);
    };

    const handlePreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)));
        setSelectedGoalItem(null);
        setSelectedCategoryItem(null);
    };

    return (
        <>
            <div className="mx-5 flex items-center gap-x-10 px-10 mb-5 py-2 border-b border-gray-300">
                <h1 className="text-2xl text-black font-medium">
                    My Budget
                </h1>
                <div className="flex gap-2">
                    <button onClick={handlePreviousMonth}>
                        <FaArrowCircleLeft className="text-blue-500 hover:scale-150 cursor-pointer" />
                    </button>
                    <span className="text-black text-2xl font-bold">
                        {formattedMonthYear}
                    </span>
                    <button onClick={handleNextMonth}>
                        <FaArrowCircleRight className="text-blue-500 hover:scale-150 cursor-pointer"/>
                    </button>
                </div>
                <div className="ml-auto">
                    <button
                        className="border mr-3 py-1 px-3 text-blue-500 cursor-pointer"
                        onClick={openSetBudgetModal}
                    >
                            Auto Set Budget
                        </button>
                    <button
                        className="border py-1 px-3 text-blue-500 cursor-pointer"
                        onClick={openReblanceModal}
                    >
                        Rebalance
                    </button>
                </div>
            </div>
        </>
    )
}