import Sidebar from "../../components/Sidebar/Sidebar"
import Topbar from "../../components/Goal/Topbar"
import { useMemo, useState } from "react";
import AddGoalModal from "../../components/Goal/AddGoalModal";
import BudgetTable from "../../components/Goal/BudgetTable";
import { useAuth } from "../../contexts/authContext";
import { useItemId } from '../../hooks/useItemId'
import { createBudgetsQueryOptions, createGoalsQueryOptions } from "../../util/createQueryOptions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTotalGoalsSaving } from "../../util/totalGoalsSavingdata";
import EditGoalModal from "../../components/Goal/EditModal";
import DetailPanel from "../../components/Goal/DetailPanel";
import AddCategoryModal from "../../components/Goal/category/AddCategoryModal";
import formatDate from "../../util/formatDate";

export default function Goal() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddCategoryModelOpen, setIsAddCategoryModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const { itemId } = useItemId(currentUser.uid);
    const [selectedGoalItem, setSelectedGoalItem] = useState(null);
    const [selectedCategoryItem, setSelectedCategoryItem] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const { data: goalsListResponse } = useQuery(
        createGoalsQueryOptions(
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }));
    const { data: budgetsListResponse } = useQuery(
        createBudgetsQueryOptions(
            {
                startDate: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)),
                endDate: formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0))
            },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }));

    const goalsList = goalsListResponse?.goals ?? [];
    const categoryBudgetList = budgetsListResponse?.budgets ?? [];

    console.log(queryClient.getQueryCache().getAll())

    const totalGoalsSaving = useMemo(() => getTotalGoalsSaving(goalsList), [goalsList])
    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    }

    const handleOpenAddCategoryModal = () => {
        setIsAddCategoryModalOpen(true);
    }

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    }

    const handleCloseCategoryModal = () => {
        setIsAddCategoryModalOpen(false);
    }
    return (
        <>
            <div className="flex h-screen text-gray-500">
                {/* Sidebar */}
                <Sidebar />     
                
                {/* Page Content*/}
                <div className="flex-1 flex overflow-auto">
                    <div className="flex flex-col w-[63%] border-r">
                        {/* Topbar*/}
                        <Topbar currentDate={currentDate} setCurrentDate={setCurrentDate} />
            
                        {/* Main Content */}
                        <main className="text-black mb-10">
                            <div className="flex items-center px-6 gap-5">
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
                            </div>
                            <BudgetTable
                                openModel={handleOpenAddModal}
                                openCategoryModal={handleOpenAddCategoryModal}
                                goalsList={goalsList}
                                categoryBudgetList={categoryBudgetList}
                                setSelectedGoalItem={setSelectedGoalItem}
                                setSelectedCategoryItem={setSelectedCategoryItem}
                                itemId={itemId}
                            />

                        </main>
                        {isAddModalOpen && (
                            <AddGoalModal
                                open={isAddModalOpen}
                                onClose={handleCloseAddModal}
                                itemId={itemId}
                            />
                        )}
                        {isAddCategoryModelOpen && (
                            <AddCategoryModal
                                open={isAddCategoryModelOpen}
                                onClose={handleCloseCategoryModal}
                                currentDate={currentDate}
                            />
                        )}
                    </div>

                    {/* Detail Panel */}
                    {(selectedGoalItem && !editMode &&
                        <DetailPanel
                        selectedGoalItem={selectedGoalItem}
                        selectedCategoryItem={selectedCategoryItem}
                            editMode={editMode}
                            setEditMode={setEditMode}
                        />
                    )}


                    {/* Entering Editing mode */}
                    {(selectedGoalItem && editMode) &&
                        <div className="flex-1">
                            <EditGoalModal
                                selectedGoalItem={selectedGoalItem}
                                setSelectedGoalItem={setSelectedGoalItem}
                                setEditMode={setEditMode}
                            />
                        </div>
                    }
                </div>
            </div>
        </>
    )
}