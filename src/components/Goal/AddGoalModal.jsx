import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import { useState } from "react"
import { addGoal } from "../../api/goal"
export default function AddGoalModal({ open, onClose }) {
    const [errors, setErrors] = useState({});

    const validateInput = (data) => {
        const newErrors = {};

        if (!data.goal_name) {
            newErrors.goal_name = "Goal name is required";
        }

        if (!data.target_amount) {
            newErrors.target_amount = "Target amount is required";
        } else if (isNaN(Number(data.target_amount))) {
            newErrors.target_amount = "Amount must be a number";
        } else if (data.target_amount <= 0) {
            newErrors.target_amount = "Amount must be greater than 0";
        }
    
        if (!data.saved_amount) {
            newErrors.saved_amount = "Saved amount is required";
        } else if (isNaN(Number(data.saved_amount))) {
            newErrors.saved_amount = "Saved amount must be a number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async ( e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        const formValues = Object.fromEntries(formData.entries());

        const validate = validateInput(formValues);

        if (!validate) {
            return;
        }

        const targetAmount = Number(formValues.target_amount);
        const savedAmount = Number(formValues.saved_amount);

        const goalToAdd = {
            ...formValues,
            target_amount: targetAmount,
            saved_amount: savedAmount,
            iso_currency_code: "USD",
        }

        await addGoal(goalToAdd, onClose);
        //refetchGoals();
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        margin="normal"
                        label="Goal Name"
                        name="goal_name"
                        placeholder="e. Dream Vacation"
                        error={!!errors.goal_name}
                        helperText={errors.goal_name}
                        fullWidth
                    />
                    <TextField
                        type="number"
                        min="0"
                        margin="normal"
                        label="Target amount"
                        name="target_amount"
                        placeholder="$0"
                        error={!!errors.target_amount}
                        helperText={errors.target_amount}
                        fullWidth
                    />
                    <TextField
                        type="number"
                        min="0"
                        margin="normal"
                        label="Current saved amount"
                        name="saved_amount"
                        placeholder="$0"
                        error={!!errors.saved_amount}
                        helperText={errors.saved_amount}
                        fullWidth
                    />
                    <TextField
                        type="date"
                        margin="normal"
                        label="Target Date"
                        name="target_date"
                        placeholder="Target Date"
                        slotProps={{
                            inputLabel: {
                                shrink: true
                            }
                        }}
                        fullWidth
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