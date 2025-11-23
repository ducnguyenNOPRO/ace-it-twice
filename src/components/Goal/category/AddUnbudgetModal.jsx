import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import { useState } from "react"
import { addBudget } from "../../../api/budget"
import { useQueryClient } from "@tanstack/react-query"


export default function AddUnbudgetModal({ open, onClose, currentDate, categoryName }) {
    const [errors, setErrors] = useState({});
    const queryClient = useQueryClient();

    const validateInput = (data) => {
        const newErrors = {};

        if (!data.target_amount) {
            newErrors.target_amount = "Target amount is required";
        } else if (isNaN(Number(data.target_amount))) {
            newErrors.target_amount = "Amount must be a number";
        } else if (Number(data.target_amount) <= 0) {
            newErrors.target_amount = "Amount must be greater than 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    
    const refecthBudget = (month, year) => {
        console.log(month, year);
        queryClient.invalidateQueries({
            queryKey: ["budgets", { month, year }]
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget)
        const formValues = Object.fromEntries(formData.entries());

        if (!validateInput(formValues)) {
            return;
        }

        const now = new Date();

        // start of month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDateFormatted = now.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
        });

        // end of month
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        console.log(endDate.getMonth());
        const endDateFormatted = now.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
        });

        const budgetToAdd = {
            ...formValues,
            category_name: categoryName,
            target_amount: Number(formValues.target_amount),
            start_date: startDate.toISOString(),
            start_date_formatted: startDateFormatted,
            end_date: endDate.toISOString(),
            end_date_formatted: endDateFormatted
        }

        await addBudget(budgetToAdd, onClose);
        refecthBudget(endDate.getMonth() + 1, endDate.getFullYear());
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: 500
                    }
                }
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add New Budget</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Category"
                        value={categoryName}
                        slotProps={{
                            select: {
                                MenuProps: {
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 200,
                                        },
                                    }
                                }
                            }
                        }}
                        disabled
                    >
                        {categoryName}
                    </TextField>
                    <TextField
                        type="number"
                        margin="normal"
                        label="Budget"
                        name="target_amount"
                        placeholder="$1"
                        error={!!errors.target_amount}
                        helperText={errors.target_amount}
                        slotProps={{
                            htmlInput: { min: 1, step: 1 }
                        }}
                        fullWidth
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        label="Notes"
                        name="notes"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                    <Button type="submit">
                        Add
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}