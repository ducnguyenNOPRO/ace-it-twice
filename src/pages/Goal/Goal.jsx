import Sidebar from "../../components/Sidebar/Sidebar"
import Topbar from "../../components/Goal/Topbar"
import { useMemo, useState, useEffect } from "react";
import AddGoalModal from "../../components/Goal/AddGoalModal";
import AddFundModal from "../../components/Goal/AddFundModal";
import WithdrawalFundModal from "../../components/Goal/WithdrawalFundModal";
import BudgetTable from "../../components/Goal/BudgetTable";
import { useAuth } from "../../contexts/authContext";
import { useItemId } from '../../hooks/useItemId'
import { createBudgetsQueryOptions, createAccountsQueryOptions, createGoalsQueryOptions, createMonthlyTransactionsQueryOptions, createAverageBudgetsQueryOptions } from "../../util/createQueryOptions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EditGoalModal from "../../components/Goal/EditModal";
import DetailGoalPanel from "../../components/Goal/DetailGoalPanel";
import DetailCategoryPanel from "../../components/Goal/category/DetailCategoryPanel";
import AddCategoryModal from "../../components/Goal/category/AddCategoryModal";
import { getSpendingDataByCategorySorted} from "../../util/spendingData"
import BudgetPieChart from "../../components/Goal/BudgetPieChar";
import AutoSetBudgetModal from "../../components/Goal/AutoSetBudgetModal";
import RebalanceModal from "../../components/Goal/RebalanceModal";

export default function Goal() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddCategoryModelOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isAddFundModalOpen, setIsAddFundModallOpen] = useState(false);
    const [isWithdrawalFundModalOpen, setIsWithdrawalFundModalOpen] = useState(false);
    const [isSetBudgetModalOpen, setIsSetBudgetModalOpen] = useState(false);
    const [isOpenRebalanceModal, setIsOpenRebalanceModal] = useState(false);
    const { currentUser } = useAuth();
    const { itemId } = useItemId(currentUser.uid);
    const [selectedGoalItem, setSelectedGoalItem] = useState(null);
    const [selectedCategoryItem, setSelectedCategoryItem] = useState(null);
    const [editMode, setEditMode] = useState(false);  // Use for Goal Items
    const [currentDate, setCurrentDate] = useState(new Date());
    const { data: averageBudgetResponse } = useQuery(
        createAverageBudgetsQueryOptions(
            {
                currentMonth: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
            },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }
        ))
    const { data: goalsListResponse } = useQuery(
        createGoalsQueryOptions(
            {},
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }));
    const { data: budgetsListResponse } = useQuery(
        createBudgetsQueryOptions(
            {
                month: currentDate.getMonth() + 1, // used 1-based index for query key
                year: currentDate.getFullYear()
            },
            {
                staleTime: Infinity,
                refetchOnWindowFocus:false,
                refetchOnReconnect: false
            }));
    const { data: monthlyTransactionsResponse} = useQuery(
        createMonthlyTransactionsQueryOptions(
            {
                itemId,
                date: {
                    month: currentDate.getMonth() + 1, // used 1-based index for query key
                    year: currentDate.getFullYear()
                }
            },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                enabled: !!itemId
            }
        )
    )

        // Always enable view mode when click on a new item
    useEffect(() => {
        setEditMode(false);
    }, [selectedGoalItem]);

    useEffect(() => {
        queryClient.prefetchQuery(
            createAccountsQueryOptions(
                { itemId },
                { staleTime: Infinity, refetchOnWindowFocus: false, refetchOnReconnect: false }
            ));
    }, [itemId, queryClient])

    const goalsList = goalsListResponse?.goals ?? [];
    const categoryBudgetList = budgetsListResponse?.budgets ?? []; // Array of budgeted category from DB
    const monthlyTransactions = monthlyTransactionsResponse?.monthlyTransactions ?? [];
    const averages = averageBudgetResponse?.averages ?? []; // Array of spendings categorys for 3 last months
    
    // Spending for all category for current month
    //return [{category: {total, icon, color}}]
    const categorySpendingData = useMemo(() => getSpendingDataByCategorySorted(monthlyTransactions), [monthlyTransactions]);
    
    const handleOpenAddModal = async () => {
        setIsAddModalOpen(true);
    }

    const handleOpenAddCategoryModal = () => {
        setIsAddCategoryModalOpen(true);
    }

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    }

    const handleCloseAddFundModal = () => {
        setIsAddFundModallOpen(false);
    }

    const handleOpenAddFundModal = () => {
        setIsAddFundModallOpen(true);
    }

    const handleOpenWithdrawalFundModal = () => {
        setIsWithdrawalFundModalOpen(true);
    }

    const handleCloseWithdrawalFundModal = () => {
        setIsWithdrawalFundModalOpen(false);
    }

    const handleCloseCategoryModal = () => {
        setIsAddCategoryModalOpen(false);
    }

    const handleOpenSetBudgetModal = () => {
        setIsSetBudgetModalOpen(true);
    }

    const handleCloseSetBudgetModal = () => {
        setIsSetBudgetModalOpen(false);
    }

    const handleOpenRebalnceModal = () => {
        setIsOpenRebalanceModal(true);
    }

    const handleCloseRebalnceModal = () => {
        setIsOpenRebalanceModal(false);
    }

    return (
        <>
            <div className="flex h-screen text-gray-500 relative">
                {/* Sidebar */}
                <Sidebar />     
                
                {/* Page Content*/}
                <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
                    <div className="flex flex-col not-lg:w-full w-[60%] border-r">
                        {/* Topbar*/}
                        <Topbar
                            currentDate={currentDate}
                            setCurrentDate={setCurrentDate}
                            setSelectedGoalItem={setSelectedGoalItem}
                            setSelectedCategoryItem={setSelectedCategoryItem}
                            openSetBudgetModal={handleOpenSetBudgetModal}
                            openReblanceModal={handleOpenRebalnceModal}
                        />
            
                        {/* Main Content */}
                        <main className="text-black mb-10">
                            <BudgetPieChart
                                currentDate={currentDate}
                                categorySpendingData={categorySpendingData}
                                categoryBudgetList={categoryBudgetList}
                            />

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
                    </div>

                    {/* Detail Panel for Goal item */}
                    {(selectedGoalItem && !editMode) &&
                        <DetailGoalPanel
                            itemId={itemId}
                            selectedGoalItem={selectedGoalItem}
                            setEditMode={setEditMode}
                            handleOpenAddFundModal={handleOpenAddFundModal}
                            handleOpenWithdrawalFundModal={handleOpenWithdrawalFundModal}
                        />
                    }

                    {/* Detail Panel for Category item */}
                    {(selectedCategoryItem) &&
                        <DetailCategoryPanel
                            selectedCategoryItem={selectedCategoryItem}
                            setSelectedCategoryItem={setSelectedCategoryItem}
                            categorySpendingData={categorySpendingData}
                            currentDate={currentDate}
                            itemId={itemId}
                            averageSpending={averages}
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
                        categoryBudgetList={categoryBudgetList}
                        categorySpendingData={categorySpendingData}
                    />
                )}
                {isAddFundModalOpen && selectedGoalItem && (
                    <AddFundModal
                        open={isAddFundModalOpen}
                        onClose={handleCloseAddFundModal}
                        itemId={itemId}
                        selectedGoalItem={selectedGoalItem}
                        setSelectedGoalItem={setSelectedGoalItem}
                    />
                )}
                {isWithdrawalFundModalOpen && selectedGoalItem && (
                    <WithdrawalFundModal
                        open={isWithdrawalFundModalOpen}
                        onClose={handleCloseWithdrawalFundModal}
                        itemId={itemId}
                        selectedGoalItem={selectedGoalItem}
                        setSelectedGoalItem={setSelectedGoalItem}
                    />
                )}
                {isSetBudgetModalOpen && (
                    <AutoSetBudgetModal
                        open={isSetBudgetModalOpen}
                        onClose={handleCloseSetBudgetModal}
                        categoryBudgetList={categoryBudgetList}
                        categorySpendingData={categorySpendingData}
                        averageSpendings={averages}
                        currentDate={currentDate}
                    />
                )}

                {isOpenRebalanceModal && (
                    <RebalanceModal 
                        open={isOpenRebalanceModal}
                        onClose={handleCloseRebalnceModal}
                        categoryBudgetList={categoryBudgetList}
                        categorySpendingData={categorySpendingData}
                        currentDate={currentDate}
                    />
                )}
            </div>
        </>
    )
}