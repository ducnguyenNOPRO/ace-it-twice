import Sidebar from "../../components/Sidebar/Sidebar"
import Topbar from "../../components/Topbar"
import { useAuth } from "../../contexts/authContext";
import Button from "@mui/material/Button";
import GoalCard from "../../components/Goal/GoalCard";
import { CiCirclePlus } from "react-icons/ci";
import { useState } from "react";
import AddGoalModal from "../../components/Goal/AddGoalModal";

export default function Goal() {
    const { currentUser } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    }

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    }
    return (
        <>
            <div className="flex h-screen text-gray-500">
                {/* Sidebar */}
                <Sidebar />     
                
                {/* Page Content*/}
                <div className="flex-1 overflow-auto">
                    {/* Topbar*/}
                    <Topbar pageName='My Saving Goals' userFirstInitial={currentUser.displayName?.charAt(0)} />
        
                    {/* Main Content */}
                    <main className="text-black px-6 mb-10">
                        <div className="flex items-center gap-5">
                            <div className="relative border w-fit rounded-md border-blue-500 px-7 py-5 text-center">
                                <p className="font-bold absolute -top-3.5 transform left-1/2 -translate-x-1/2 bg-white px-2">Summary</p>
                                <p className="uppercase">Total Goal Savings</p>
                                <p className="font-bold text-4xl">$23,5000</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CiCirclePlus />}
                                    onClick={handleOpenAddModal}
                                >
                                    Add New Goal
                                </Button>
                                <div>
                                    <div className="mb-1">Sort By:</div>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                    >
                                        Progress (Most Completed)
                                    </Button>
                                </div>
                            </div>

                        </div>

                        <section className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
                            {[0, 1, 2, 3, 4, 5].map((_, i) => (
                                <GoalCard key={i} />
                            ))}
                        </section>
                    </main>
                    {isAddModalOpen && (
                        <AddGoalModal open={isAddModalOpen} onClose={handleCloseAddModal} />
                    )}
                </div>
            </div>
        </>
    )
}