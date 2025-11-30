import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {prettyMapCategory} from "../../constants/prettyMapCategory";
import { useState, useEffect } from "react";
import { editMultipleBudgets } from "../../api/budget";
import { useQueryClient } from "@tanstack/react-query";

export default function RebalanceModal({ open, onClose, currentDate, categoryBudgetList, categorySpendingData }) {
    const queryClient = useQueryClient();
    const [previewBudgets, setPreviewBudgets] = useState([]);
    const [message, setMessage] = useState("");

    const overspent = categoryBudgetList.find(item => {
            const spent = categorySpendingData[item.category_name].total;
            return spent > item.target_amount;
    }); 

    useEffect(() => {
        if (open) {
            const {list, message} = rebalance(categoryBudgetList, categorySpendingData);
            setPreviewBudgets(list);
            setMessage(message)
        }
    }, [open]);

    const rebalance = (budgets, spending) => {
        // clone array
        let list = budgets.map(b => ({ ...b }));
        
        // Find overspent category
        const overspent = list.find(item => {
            const spent = spending[item.category_name].total;
            return spent > item.target_amount;
        });

        if (!overspent) return { list, message: "NO_OVERSPENT" };


        // Calculate total surplus
        let surplus = 0;

        list.forEach(item => {
            const spent = spending[item.category_name].total;
            const remaining = item.target_amount - spent;
            if (remaining > 0) surplus += remaining;
        });

        if (surplus <= 0) {
            return {list, message: "NO_SURPLUS"}
        }

        // overspent details
        const spent = spending[overspent.category_name].total;
        const needed = spent - overspent.target_amount;
        const amountToAdd = Math.min(needed, surplus);

        // add to overspent budget
        overspent.target_amount += amountToAdd;

        let surplusLeft = amountToAdd; // amount needed for redistribute

        list = list.map(item => {
            const spent = spending[item.category_name].total;
            const remaining = item.target_amount - spent;

            if (remaining > 0 && surplusLeft > 0) {
            const reduction = Math.min(remaining, surplusLeft);
            surplusLeft -= reduction;

            return {
                ...item,
                target_amount: item.target_amount - reduction
            };
            }

            return item;
        });

        return { list, message: "SUCCESS"};
    };

    const refecthBudget = (month, year) => {
        queryClient.invalidateQueries({
            queryKey: ["budgets", { month, year }]
        })
    }
    
    const handleSave = async () => {
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        const changedBudgets = previewBudgets.filter(item => {
            const original = categoryBudgetList.find(orig => orig.category_name === item.category_name)
            return original && original.target_amount !== item.target_amount;
        })

        await editMultipleBudgets(changedBudgets, onClose);
        refecthBudget(endDate.getMonth() + 1, endDate.getFullYear());
    }

    if (!previewBudgets || previewBudgets.length === 0) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <div>Loading...</div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle textAlign={"center"}>Preview Budget Changes</DialogTitle>
            <DialogContent dividers>
                <p className="text-center font-medium">These change will balance your budgets without changing your total budget amount</p>
                
                <table className="mt-5">
                    <thead className="border-b">
                        <tr className="text-left">
                            <th className="gap-2 py-2 px-4 w-[20%] ">Category</th>
                            <th className="py-2 px-4 w-[20%] text-right">Spent</th>
                            <th className="py-2 px-4 w-[30%] text-right">New Budget</th>
                            <th className="py-2 px-4 w-[30%]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryBudgetList.map(item => {
                            const category = previewBudgets.find((p) => p.category_name === item.category_name)
                            const changes = category
                                ? category.target_amount - item.target_amount
                                : 0;
                            return (
                                <tr
                                    key={item.budget_id}
                                    className="hover:bg-blue-50"
                                >
                                    <td className="py-2 px-4">
                                        <div
                                            className={`flex items-center gap-2 rounded-full px-3 py-1 w-fit 
                                    ${prettyMapCategory[item.category_name].color}`
                                            }
                                            title={item.category_name}
                                        >
                                            <img className="w-5 h-5 flex-shrink-0"
                                                src={prettyMapCategory[item.category_name].icon}
                                                alt={`${item.category_name} Icon`}
                                            />
                                            <span className="text-sm font-bold truncate hidden md:inline">
                                                {item.category_name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className={`py-2 px-4 text-right tracking-wide cursor-default
                                    ${categorySpendingData[item.category_name].total > item.target_amount
                                            ? "text-red-500" : ""
                                        } `}>
                                        ${categorySpendingData[item.category_name].total.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 text-center ">
                                        ${category.target_amount.toFixed(2) || 0}
                                    </td>
                                    <td className={`text-right ${
                                        changes > 0 ? "text-green-500" :
                                        changes < 0 ? "text-red-500" : "text-black"
                                        }`}>
                                        {changes > 0 ? "+" : changes < 0 ? "−" : ""}${Math.abs(changes).toFixed(2)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {message === "NO_SURPLUS" && 
                    <p className="mt-10">
                        <b>No Rebalance Possible</b>
                        <br /><br />You overspent in <b>{overspent.category_name}</b> this month, but all of your other
                        categories are fully allocated. There is no unused budget 
                        available to move.

                        <br/><br/>To cover this overspending, you may:

                        <br/>• Increase your <b>{overspent.category_name}</b> budget
                        <br/>• Decrease another category manually
                        <br/>• Add funds for this month
                    </p>
                }
                        
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Close
                </Button>
                {message === "SUCCESS" &&
                    <Button onClick={handleSave}>
                    Confirm
                </Button>}
            </DialogActions>
        </Dialog>
    )
}