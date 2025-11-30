import {useState, useEffect} from "react";
import {prettyMapCategory} from "../../../constants/prettyMapCategory"
import useDebounce from "../../../hooks/useDebounce"
import {
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Bar,
    ReferenceLine
} from "recharts";
import TextField from "@mui/material/TextField";
import { editBudgetById } from "../../../api/budget";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AddUnbudgetModal from "./AddUnbudgetModal";
import { create3MonthTransactionsPerCategoryQueryOptions} from "../../../util/createQueryOptions";

function ReferenceLabel({
  fill,
  value,
viewBox,
  editMode,
  setEditMode,
  setInputValues,
}) {
    const [dailyBudgetAmount, setdailyBudgetAmount] = useState(value);

    const debouncedBudget = useDebounce(dailyBudgetAmount, 1500);

    const x = viewBox.width + viewBox.x;
    const y = viewBox.y - 11;

    // approximate width per character
    const textWidth = dailyBudgetAmount.toString().length == 0 ? "0.00".length * 8 : dailyBudgetAmount.toString().length * 8;
    const foWidth = textWidth + 30; // padding

    // Sync local state with prop
    useEffect(() => {
        setdailyBudgetAmount(value);
    }, [value]);

    // Update parent state after debounce
    useEffect(() => {
        const budget = Number(debouncedBudget);
        setInputValues((prev) => ({ ...prev, target_amount: budget }));
    }, [debouncedBudget]);

    return (
        <foreignObject x={x} y={y} width={foWidth} height={24}>
        {editMode ? (
            <input
                type="number"
                min="0"
                value={dailyBudgetAmount}
                title="Daily Budget"
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) {
                        setdailyBudgetAmount(val);
                    }
                    }}
                placeholder="0.00"
                autoFocus
                style={{
                    fontSize: "15px",
                    color: fill,
                    background: "black",
                    borderRadius: "25px 0 0 25px",
                    cursor: "pointer",
                    padding: "0 10px",
                }}
            />
        ) : (
            <div
                style={{
                    fontSize: "15px",
                    color: fill,
                    background: "black",
                    borderRadius: "25px 0 0 25px",
                    cursor: "pointer",
                    padding: "0 10px",
                }}
                title="Daily Budget"
                onClick={() => {
                    setEditMode(true);
                }}
            >
                ${dailyBudgetAmount}
            </div>
        )}
        </foreignObject>
    );
}

function DailySpendChart({ monthlySpendingDataByCategory, editMode, setEditMode
    , setInputValues, budget, budgetId
}) {
    const data = monthlySpendingDataByCategory.filter(item => item.totalSpent > 0);
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{right: 80}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearMonth" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 'dataMax + 20']} />
                <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelStyle={{ fontWeight: "bold" }}
                />
                <Bar
                    dataKey="totalSpent"
                    fill="#00ff00"
                    radius={[4, 4, 0, 0]}
                />
                {budgetId && <ReferenceLine
                    y={budget}
                    stroke="#000000"
                    strokeWidth={2}
                    title="Month Spending"
                    label={
                        <ReferenceLabel
                            value={budget.toFixed(2)}
                            fill="#FFFFFF"
                            editMode={editMode}
                            setEditMode={setEditMode}
                            setInputValues={setInputValues}
                        />
                    }
                />}
            </BarChart>
        </ResponsiveContainer>
    )
}

function NotesInput({ notes, setInputValues }) {
    const [localInput, setLocalInput] = useState(notes);
    const debouncedNotes = useDebounce(localInput);

    // Sync local state when parent changes
    useEffect(() => {
        setLocalInput(notes);
    }, [notes]);

    // Update parent after debounce
    useEffect(() => {
        setInputValues((prev) => ({ ...prev, notes: debouncedNotes }));
    }, [debouncedNotes])

    return(
        <TextField
            fullWidth
            margin="normal"
            value={localInput}
            multiline
            rows={3}
            label="Notes"
            onChange={(e) => setLocalInput(e.target.value)}
        />
    )
}

export default function DetailCategoryPanel(
    {
        selectedCategoryItem, setSelectedCategoryItem, categorySpendingData
        ,currentDate, itemId, averageSpending
    }) {
    
    const [editMode, setEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValues, setInputValues] = useState(selectedCategoryItem)

    const { data: response } = useQuery(
        create3MonthTransactionsPerCategoryQueryOptions(
            {
                itemId,
                category: selectedCategoryItem.category_name,
                date: {
                    month: currentDate.getMonth() + 1, // 1-based indexed
                    year: currentDate.getFullYear()
                }
            },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }
        )
    )
    const selectedCategoryData = averageSpending.find(
        item => item.category === selectedCategoryItem.category_name
    );
    const previous3MonthsSpending = selectedCategoryData?.months || [];
    const monthTranactionsPerCategory = response?.monthlyTransactions ?? [];

    const queryClient = useQueryClient();

    // Always refresh when new category item is selected
    useEffect(() => {
        setEditMode(false);
        setInputValues(selectedCategoryItem)
    }, [selectedCategoryItem]);
    
    const monthlyTransactionsByCategoryAndDate = Object.entries(
        monthTranactionsPerCategory
            .filter(tx => tx.category === selectedCategoryItem.category_name)
            .reduce((acc, item) => {
                const key = new Date(item.date).toLocaleString("en-us", { month: "long" });
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(item);
                return acc;
            }, {})
    ).map(([date, txs]) => ({
        date,
        transactions: txs
    }));
    const formattedCurrentDate = currentDate.toLocaleString("en-us", { month: "short"})

    const validateInput = () => {
        return !isNaN(inputValues.target_amount) && Number(inputValues.target_amount) >= 0;
    }

    const refetchBudget = () => {
        queryClient.invalidateQueries({
            queryKey: [
                "budgets",
                {
                    month: new Date(inputValues.start_date).getMonth() + 1,
                    year: new Date(inputValues.start_date).getFullYear()
                }
            ]
        })
    }

    const handleUpdateBudget = async () => {
        if (!validateInput()) return;

        const budgetId = inputValues.budget_id;
        const { target_amount, notes } = inputValues;
        await editBudgetById(budgetId, {target_amount, notes}, () => setEditMode(false));
        refetchBudget();
        setSelectedCategoryItem(inputValues);
    }

    const handleOpenAddModal = () => {
        setIsModalOpen(true);
    }

    const handleCloseAddModal = () => {
        setIsModalOpen(false);
    }
    return (
        <div className="flex-1">
            <div className="flex items-center h-12 px-10 border-b border-gray-400">
                <h1 className="text-3xl lg:text-2xl text-black font-medium">
                    Budget
                </h1>
                {selectedCategoryItem.budget_id ? (
                    !editMode ? (
                        <button
                            className="ml-auto border py-1 px-3 text-blue-500 cursor-pointer"
                            onClick={() => setEditMode(true)}
                        >
                            Edit Budget
                        </button>
                    ) : (
                        <button
                            className="ml-auto border py-1 px-3 text-blue-500 cursor-pointer"
                            onClick={handleUpdateBudget}
                        >
                            Save Budget
                    </button>    
                )) : (
                    <button
                        className="ml-auto border py-1 px-3 text-blue-500 cursor-pointer"
                        onClick={handleOpenAddModal}
                    >
                        Add Budget
                    </button>
                )
                }
            </div>
            <div className="px-4 py-2 text-black">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <img className="w-7 h-7"
                            src={prettyMapCategory[selectedCategoryItem.category_name]?.icon}
                            alt={`${selectedCategoryItem.category_name} Icon`} />
                        <h1 className="text-2xl font-bold text-black">
                            {selectedCategoryItem.category_name}
                        </h1>
                    </div>
                    {/* Header */}
                    <div>
                        <div className="font-medium text-right">
                            Spent in {formattedCurrentDate}
                        </div>
                        <div className=" flex items-baseline justify-end font-bold">
                            <span className="relative self-start top-1 text-sm">$</span>
                            <h1 className="text-2xl">
                                {categorySpendingData[selectedCategoryItem.category_name]?.total.toFixed(2) || 0}
                            </h1>
                        </div>
                        <div className="flex items-baseline justify-end font-medium text-gray-400">
                            <span className="relative self-start top-1 text-[0.75rem]">$</span>
                            {inputValues.target_amount && inputValues.target_amount >= Number(categorySpendingData[selectedCategoryItem.category_name]?.total)
                                ?
                                    <h3 className="text-lg">
                                        {(inputValues.target_amount - Number(categorySpendingData[selectedCategoryItem.category_name]?.total) || 0).toFixed(2)} left
                                    </h3>
                                : 
                                    <h3 className="text-lg">
                                            {(((inputValues.target_amount || 0) - Number(categorySpendingData[selectedCategoryItem.category_name]?.total)) * -1).toFixed(2)} needed
                                    </h3>
                            }
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {previous3MonthsSpending.length > 0 ?
                    <DailySpendChart
                        monthlySpendingDataByCategory={previous3MonthsSpending}
                        setInputValues={setInputValues}
                        editMode={editMode}
                        setEditMode={setEditMode}
                        budgetId={inputValues.budget_id}
                        budget={inputValues.target_amount}
                    />
                    : <div className="text-center text-lg">No spendings data in previous month</div>
                }
                
                <span className="inline-block h-[2px] w-full bg-gray-400"></span>

                {selectedCategoryItem.budget_id &&
                    <div>
                        <NotesInput notes={inputValues.notes} setInputValues={setInputValues} />
                        <span className="inline-block h-[2px] w-full bg-gray-400"></span>
                    </div>
                }

                {/* Transactions List */}

                {monthlyTransactionsByCategoryAndDate.map((group) => (
                    <div key={group.date}>
                        <h3 className="text-lg font-bold my-2">
                            {group.date}
                        </h3>
                        {group.transactions.map(tx => (
                            <div
                                key={tx.transaction_id}    
                                className="grid grid-cols-[0.5fr_1fr_auto_0.5fr] text-black gap-y-3 hover:bg-blue-100 p-2"
                            >
                                <span>{new Date(tx.date).toLocaleString("en-us", {month: "short", day: "2-digit"})}</span>
                                <span className="truncate" title={tx.merchant_name}>{tx.merchant_name}</span>
                                <div
                                    className={`flex items-center gap-2 rounded-full px-2 py-1 sm:w-fit overflow-hidden 
                                        ${prettyMapCategory[tx.category].color}`}
                                    title={tx.category}
                                >
                                    <img className="w-5 h-5 flex-shrink-0"
                                        src={prettyMapCategory[tx.category].icon}
                                        alt={`${tx.category} Icon`}
                                    />
                                    <span className="text-sm font-bold truncate hidden md:inline">
                                        {tx.category}
                                    </span>
                                </div>
                                <div className={`text-right font-medium ${tx.amount < 0 ? "" : "text-green-500"}`}>${tx.amount_filter}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <AddUnbudgetModal
                open={isModalOpen}
                onClose={handleCloseAddModal}
                currentDate={currentDate}
                categoryName={selectedCategoryItem.category_name}
            />
        </div>
    )
}