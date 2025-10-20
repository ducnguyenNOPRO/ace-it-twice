import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import prettyMapCategory from "../../../constants/prettyMapCategory"
import { useMemo, useState } from "react"
import { addBudget } from "../../../api/budget"
import { useQueryClient } from "@tanstack/react-query"


export default function AddCategoryModal({ open, onClose, currentDate }) {
    const [errors, setErrors] = useState({});
    const queryClient = useQueryClient();
    

    // Memmoize category options to prevent re-rendering
    const categoryOptions = useMemo(() => {
        return Object.entries(prettyMapCategory).map(([key]) => 
            (
            <MenuItem
                key={key}
                value={key}
                sx={{
                    '&:hover': {
                        backgroundColor: "#def6f8",
                        color: 'black'
                    }
                }}
            >
                {key}
            </MenuItem>
        ))
    }, [])

    const validateInput = (data) => {
        const newErrors = {};

        if (!data.category_name) {
            newErrors.category_name = "Goal name is required";
        }

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

    // Format both as YYYY-MM-DD
    const formatDate = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    
    const refecthBudget = (startDate, endDate) => {
        queryClient.invalidateQueries({
            queryKey: ["budgets", startDate, endDate]
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget)
        const formValues = Object.fromEntries(formData.entries());

        if (!validateInput(formValues)) {
            return;
        }

        // start of month
        const startDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

        // end of month
        const endDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0))

        const budgetToAdd = {
            ...formValues,
            start_date: startDate,
            end_date: endDate
        }

        await addBudget(budgetToAdd, onClose);
        refecthBudget(startDate, endDate);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add New Budget</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        select
                        margin="normal"
                        label="Category"
                        name="category_name"
                        defaultValue=""
                        required
                        error={!!errors.category_name}
                        helperText={errors.category_name}
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
                    >
                        {categoryOptions}
                    </TextField>
                    <TextField
                        type="number"
                        margin="normal"
                        label="Budget"
                        name="target_amount"
                        placeholder="$1"
                        // error={!!errors.target_amount}
                        // helperText={errors.target_amount}
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