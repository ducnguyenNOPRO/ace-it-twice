import {useState, useEffect} from "react";
import prettyMapCategory from "../../../constants/prettyMapCategory"
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
import { useQueryClient } from "@tanstack/react-query";

function ReferenceLabel({
  fill,
  value,
  viewBox,
  setEditMode,
  setInputValues,
  daysInMonth,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [dailyBudgetAmount, setdailyBudgetAmount] = useState(value);

    const debouncedDailytarget_amount = useDebounce(dailyBudgetAmount, 1500);

    const x = viewBox.width + viewBox.x;
    const y = viewBox.y - 11;

    // approximate width per character
    const textWidth = dailyBudgetAmount.toString().length == 0 ? "0.00".length * 8 : dailyBudgetAmount.toString().length * 8;
    const foWidth = textWidth + 30; // padding

    // Sync local state with prop
    useEffect(() => {
        setIsEditing(false);
        setdailyBudgetAmount(value);
    }, [value]);

    // Update parent state after debounce
    useEffect(() => {
        const totaltarget_amount = Number(debouncedDailytarget_amount) * daysInMonth;
        setInputValues((prev) => ({ ...prev, target_amount: totaltarget_amount }));
    }, [debouncedDailytarget_amount, daysInMonth]);

    return (
        <foreignObject x={x} y={y} width={foWidth} height={24}>
        {isEditing ? (
            <input
                type="number"
                min="0"
                value={dailyBudgetAmount}
                title="Daily target_amount"
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
                title="Daily target_amount"
                onClick={() => {
                    setIsEditing(true);
                    setEditMode(true);
                }}
            >
                ${dailyBudgetAmount}
            </div>
        )}
        </foreignObject>
    );
}

function DailySpendChart({ monthlySpendingDataByCategory, daysInMonth, setEditMode
    , inputValues, setInputValues
}) {
    const dailyBudgetAmount = inputValues.target_amount / daysInMonth;
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySpendingDataByCategory} margin={{right: 80}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 'dataMax + 20']} />
                <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelStyle={{ fontWeight: "bold" }}
                />
                <Bar
                    dataKey="total"
                    fill="#00ff00"
                    radius={[4, 4, 0, 0]}
                />
                <ReferenceLine
                    y={dailyBudgetAmount}
                    stroke="#000000"
                    strokeWidth={2}
                    title="Daily target_amount"
                    label={
                        <ReferenceLabel
                            value={dailyBudgetAmount.toFixed(2)}
                            fill="#FFFFFF"
                            setEditMode={setEditMode}
                            daysInMonth={daysInMonth}
                            setInputValues={setInputValues}
                        />
                    }
                />
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
        selectedCategoryItem, setSelectedCategoryItem, categorySpendingData, monthlySpendingDataByCategory,
        monthlyTransactions, currentDate 
    }) {
    
    const [editMode, setEditMode] = useState(false);
    const [inputValues, setInputValues] = useState(selectedCategoryItem)

    const queryClient = useQueryClient();

    // Always refresh when new category item is selected
    useEffect(() => {
        setEditMode(false);
        setInputValues(selectedCategoryItem)
    }, [selectedCategoryItem]);
    
    const monthlyTransactionsByCategory = monthlyTransactions.filter(tx => tx.category === selectedCategoryItem.category_name);
    const formattedCurrentDate = currentDate.toLocaleString("en-us", { month: "long", year: "numeric"})

    const getDate = () => {
        let date = new Date(currentDate);
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

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

        const budgetToUpdate = {
            ...inputValues
        }
        await editBudgetById(budgetToUpdate.budget_id, budgetToUpdate, () => setEditMode(false));
        refetchBudget();
        setSelectedCategoryItem(budgetToUpdate);
    }
    return (
        <div className="flex-1">
            <div className="flex items-center h-12 px-10 border-b border-gray-300 p-2">
                <h1 className="text-2xl text-black font-medium">
                    Budget
                </h1>
                {!editMode ? (
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
                            Spent in {new Date(selectedCategoryItem.start_date).toLocaleString("en-US", { month: "short" })}
                        </div>
                        <div className=" flex items-baseline justify-end font-bold">
                            <span className="relative self-start top-1 text-sm">$</span>
                            <h1 className="text-2xl">
                                {categorySpendingData[selectedCategoryItem.category_name]?.total || 0}
                            </h1>
                        </div>
                        <div className="flex items-baseline justify-end font-medium text-gray-400">
                            <span className="relative self-start top-1 text-[0.75rem]">$</span>
                            <h3 className="text-lg">
                                {(inputValues.target_amount - Number(categorySpendingData[selectedCategoryItem.category_name]?.total) || 0).toFixed(2)} left
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <DailySpendChart
                    monthlySpendingDataByCategory={monthlySpendingDataByCategory}
                    daysInMonth={getDate()}
                    inputValues={inputValues}
                    setInputValues={setInputValues}
                    setEditMode={setEditMode}
                />

                <span className="inline-block h-[2px] w-full bg-gray-400"></span>

                <div>
                    <NotesInput notes={inputValues.notes} setInputValues={setInputValues}/>
                </div>

                {/* Transactions List */}
                <span className="inline-block h-[2px] w-full bg-gray-400"></span>
                <h3 className="text-lg font-bold my-2">{formattedCurrentDate}</h3>
                {monthlyTransactionsByCategory.map((tx) => (
                    <div
                        key={tx.transaction_id}    
                        className="grid grid-cols-4 gap-y-3 hover:bg-gray-300 py-2"
                    >
                        <span className="text-gray-400">
                            {new Date(tx.date).toLocaleString(
                            "en-us", {month: "short", day: "2-digit"}
                            )}
                        </span>
                        <span className="font-medium">{tx.merchant_name}</span>
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
                        <div className="text-right font-medium">${tx.amount_filter}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}