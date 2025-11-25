import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {prettyMapCategory} from "../../constants/prettyMapCategory";
import { addMultipleBudgets } from "../../api/budget";
import { useQueryClient } from "@tanstack/react-query";

export default function AutoSetBudgetModal({ open, onClose, categoryBudgetList, categorySpendingData, averageSpendings, currentDate }) {
    const queryClient = useQueryClient();
    const categoriesName = new Set(categoryBudgetList.map(cat => cat.category_name));
    const UnbudgetCategories =
        Object.entries(categorySpendingData)
            .filter(([cat]) => !categoriesName.has(cat));

    const refecthBudget = (month, year) => {
        queryClient.invalidateQueries({
            queryKey: ["budgets", { month, year }]
        })
    }
    
    const handleSave = async () => {
        // start of month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDateFormatted = startDate.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
        });

        // end of month
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        const endDateFormatted = endDate.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
        });
        const categoryArray = UnbudgetCategories.map(([category_name]) => ({
            category_name
        }))

        const budgetArray = categoryArray.map(item => {
            const average = averageSpendings.find(cat => cat.category === item.category_name).average || 0;
            return {
                ...item,  // category_name
                target_amount: Number(average),
                start_date: startDate,
                start_date_formatted: startDateFormatted,
                end_date: endDate,
                end_date_formatted: endDateFormatted,
                notes: ""
            }
        })

        await addMultipleBudgets(budgetArray, onClose);
        refecthBudget(endDate.getMonth() + 1, endDate.getFullYear());
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Auto Set Budget</DialogTitle>
            <DialogContent dividers>
                <p>We’ll analyze your spending from the past 5 months and set your unbudget categories automatically.
                    You can review and adjust them later if needed.</p>
                
                <table className="mt-5">
                    <thead className="border-b">
                        <tr className="text-left">
                            <th className="gap-2 py-2 px-4 w-[30%] ">Category</th>
                            <th className="py-2 px-4 w-[30%] text-right">Spent</th>
                            <th className="py-2 px-4 w-[40%]">Suggested Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        {UnbudgetCategories.map(([category_name, value]) => {
                            const average = averageSpendings.find(item => item.category === category_name).average || 0;
                            return (
                                <tr
                                    key={category_name}
                                    className="hover:bg-blue-50"
                                >
                                    <td className="py-2 px-4">
                                        <div
                                            className={`flex items-center gap-2 rounded-full px-3 py-1 w-fit 
                                        ${value.color || prettyMapCategory[category_name].color}`
                                            }
                                            title={category_name}
                                        >
                                            <img className="w-5 h-5 flex-shrink-0"
                                                src={value.icon || prettyMapCategory[category_name].icon}
                                                alt={`${category_name} Icon`}
                                            />
                                            <span className="text-sm font-bold truncate hidden md:inline">
                                                {category_name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="py-2 px-4 text-red-400 text-right tracking-wide cursor-default">
                                        ${value.total.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 text-green-500 tracking-wide cursor-default">${average}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                        
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Close
                </Button>
                <Button onClick={handleSave}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}