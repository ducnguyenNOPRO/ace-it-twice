import Sidebar from "../../components/Sidebar/Sidebar"
import Topbar from "../../components/Goal/Topbar"
import Button from "@mui/material/Button";
import { CiCirclePlus } from "react-icons/ci";
import { useMemo, useState } from "react";
import AddGoalModal from "../../components/Goal/AddGoalModal";
import BudgetTable from "../../components/Goal/BudgetTable";
import { useAuth } from "../../contexts/authContext";
import { useItemId } from '../../hooks/useItemId'
import { createGoalsQueryOptions } from "../../util/createQueryOptions";
import { useQuery } from "@tanstack/react-query";
import { getTotalGoalsSaving } from "../../util/totalGoalsSavingdata";

export default function Goal() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const { itemId } = useItemId(currentUser.uid);
    const { data: goalsListResponse } = useQuery(
        createGoalsQueryOptions(
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }));

    const goalsList = goalsListResponse?.goals ?? [];

    const totalGoalsSaving = useMemo(() => getTotalGoalsSaving(goalsList), [goalsList])
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
                    <Topbar />
        
                    {/* Main Content */}
                    <main className="text-black px-6 mb-10">
                        <div className="flex items-center gap-5">
                            <div className="relative border w-fit rounded-md border-blue-500 px-7 py-5 text-center">
                                <p className="uppercase">Total Goal Savings</p>
                                <p className="font-bold text-3xl">${totalGoalsSaving}</p>
                            </div>
                            <div className="border w-fit rounded-md border-blue-500 px-7 py-5 text-center">
                                <p className="uppercase">Total Buget</p>
                                <p className="font-bold text-3xl">$5000</p>
                            </div>
                             <div className="border w-fit rounded-md border-blue-500 px-7 py-5 text-center">
                                <p>Total Spent</p>
                                <p className="font-bold text-3xl">$4000</p>
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
                        <BudgetTable
                            openModel={handleOpenAddModal}
                            goalsList={goalsList}
                        />

                    </main>
                    {isAddModalOpen && (
                        <AddGoalModal
                            open={isAddModalOpen}
                            onClose={handleCloseAddModal}
                            itemId={itemId}
                        />
                    )}
                </div>
            </div>
        </>
    )
}