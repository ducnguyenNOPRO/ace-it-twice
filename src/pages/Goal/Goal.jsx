import Sidebar from "../../components/Sidebar/Sidebar"
import Topbar from "../../components/Goal/Topbar"
import { useMemo, useState, useEffect } from "react";
import AddGoalModal from "../../components/Goal/AddGoalModal";
import BudgetTable from "../../components/Goal/BudgetTable";
import { useAuth } from "../../contexts/authContext";
import { useItemId } from '../../hooks/useItemId'
import { createBudgetsQueryOptions, createGoalsQueryOptions, createMonthlyTransactionsQueryOptions } from "../../util/createQueryOptions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTotalGoalsSaving } from "../../util/totalGoalsSavingdata";
import EditGoalModal from "../../components/Goal/EditModal";
import DetailGoalPanel from "../../components/Goal/DetailGoalPanel";
import DetailCategoryPanel from "../../components/Goal/category/DetailCategoryPanel";
import AddCategoryModal from "../../components/Goal/category/AddCategoryModal";
import { getSpendingDataByCategorySorted, getMonthlySpendingDataPerCategory } from "../../util/spendingData"

export default function Goal() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddCategoryModelOpen, setIsAddCategoryModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const { itemId } = useItemId(currentUser.uid);
    const [selectedGoalItem, setSelectedGoalItem] = useState(null);
    const [selectedCategoryItem, setSelectedCategoryItem] = useState(null);
    const [editMode, setEditMode] = useState(false);  // Use for Goal Items
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
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear()
            },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }));
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

    const goalsList = goalsListResponse?.goals ?? [];
    const categoryBudgetList = budgetsListResponse?.budgets ?? [];
    const monthlyTransactions = monthlyTransactionsResponse?.monthlyTransactions ?? [];

    //return { "MMM D", total: int}
    const monthlySpendingDataByCategory = useMemo(() =>
        getMonthlySpendingDataPerCategory(monthlyTransactions, selectedCategoryItem?.category_name)
        , [monthlyTransactions, selectedCategoryItem]);
    
    //return {totalSpending: int, sortedCategories[{category, total, icon, color}]}
    const categorySpendingData = useMemo(() => getSpendingDataByCategorySorted(monthlyTransactions), [monthlyTransactions]);

    const totalGoalsSaving = useMemo(() => getTotalGoalsSaving(goalsList), [goalsList])
    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    }

    // Always enable view mode when click on a new item
    useEffect(() => {
        setEditMode(false);
    }, [selectedGoalItem]);

    console.log(queryClient.getQueryCache().getAll())

    const handleOpenAddCategoryModal = () => {
        setIsAddCategoryModalOpen(true);
    }

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    }

    const handleCloseCategoryModal = () => {
        setIsAddCategoryModalOpen(false);
    }

    if (loadingMonthlyTransactions || monthlyTransactions.length === 0) {
        return <div>Loading....</div>
    }
    return (
        <>
            <div className="flex h-screen text-gray-500">
                {/* Sidebar */}
                <Sidebar />     
                
                {/* Page Content*/}
                <div className="flex-1 flex overflow-auto">
                    <div className="flex flex-col w-1/2 border-r">
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
                                categorySpendingData={categorySpendingData}
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

                    {/* Detail Panel for Goal item */}
                    {(selectedGoalItem && !editMode) &&
                        <DetailGoalPanel
                            selectedGoalItem={selectedGoalItem}
                            setEditMode={setEditMode}
                        />
                    }

                    {/* Detail Panel for Category item */}
                    {(selectedCategoryItem) &&
                        <DetailCategoryPanel
                            selectedCategoryItem={selectedCategoryItem}
                            setSelectedCategoryItem={setSelectedCategoryItem}
                            categorySpendingData={categorySpendingData}
                            monthlySpendingDataByCategory={monthlySpendingDataByCategory}
                            monthlyTransactions={monthlyTransactions}
                            currentDate={currentDate}
                        />
                    }

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