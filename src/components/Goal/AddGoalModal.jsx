import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import { useState } from "react"
import { addGoal } from "../../api/goal"
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query"
import { createAccountsQueryOptions } from "../../util/createQueryOptions";
import formatDate from "../../util/formatDate"


export default function AddGoalModal({ open, onClose, itemId }) {
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState({});
    const { data: accounts = [], isLoading: loadingAccs } = useQuery(
            createAccountsQueryOptions({ itemId },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }))

    const validateInput = (data) => {
        const newErrors = {};

        if (!data.goal_name) {
            newErrors.goal_name = "Goal name is required";
        }

        if (!data.target_date) {
            newErrors.target_date = "Date is required";
        }

        if (!data.linked_account) {
            newErrors.linked_account = "Please choose an account";
        }

        if (!data.target_amount) {
            newErrors.target_amount = "Target amount is required";
        } else if (isNaN(Number(data.target_amount))) {
            newErrors.target_amount = "Amount must be a number";
        } else if (Number(data.target_amount) <= 0) {
            newErrors.target_amount = "Amount must be greater than 0";
        }

        if (!data.saved_amount) {
            newErrors.saved_amount = "Saved amount is required";
        } else if (isNaN(Number(data.saved_amount))) {
            newErrors.saved_amount = "Saved amount must be a number";
        } else if (Number(data.saved_amount) > Number(data.target_amount)) {
            newErrors.saved_amount = "Saved amount should be less than target amount";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const refetchGoals = async () => {
            queryClient.invalidateQueries({
                queryKey: ["goals"]
            })
        }

    const handleSubmit = async ( e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        const formValues = Object.fromEntries(formData.entries());

        const validate = validateInput(formValues);

        if (!validate) {
            return;
        }

        // Get local date not UTC
        const [year, month, day] = formValues.target_date.split("-");
        const targetDate = new Date(year, month - 1, day); // months are 0-indexed
        const targetDateFormatted = targetDate.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        // Get local date not UTC
        const now = new Date();
        const startDate = formatDate(now);
        const startDateFormatted = now.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const targetAmount = Number(formValues.target_amount);
        const savedAmount = Number(formValues.saved_amount);

        const goalToAdd = {
            ...formValues,
            target_amount: targetAmount,
            saved_amount: savedAmount,
            start_date: startDate,
            start_date_formatted: startDateFormatted,
            target_date_formatted: targetDateFormatted,
            contributions: [{
                date: startDate, amount: savedAmount
            }],
            iso_currency_code: "USD",
        }

        await addGoal(goalToAdd, onClose);
        refetchGoals();
    }

    if (loadingAccs) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <div>Loading...</div>
                </DialogContent>
            </Dialog>
        );
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
                        margin="normal"
                        label="Target amount"
                        name="target_amount"
                        placeholder="$0"
                        error={!!errors.target_amount}
                        helperText={errors.target_amount}
                        slotProps={{
                            htmlInput: { min: 0, step: 0.01 }
                        }}
                        fullWidth
                    />
                    <TextField
                        type="number"
                        margin="normal"
                        label="Current saved amount"
                        name="saved_amount"
                        placeholder="$0"
                        defaultValue={0}
                        error={!!errors.saved_amount}
                        helperText={errors.saved_amount}
                        slotProps={{
                            htmlInput: { min: 0, step: 0.01 }
                        }}
                        fullWidth
                    />
                    <TextField
                        type="date"
                        margin="normal"
                        label="Target Date"
                        name="target_date"
                        slotProps={{
                            inputLabel: {
                                shrink: true
                            }
                        }}
                        errors={!!errors.target_date}
                        helperText={errors.target_date}
                        fullWidth
                    />
                    <TextField
                        select
                        margin="normal"
                        label="Link Account"
                        name="linked_account"
                        defaultValue="Other"
                        error={!!errors.linked_account}
                        helperText={errors.linked_account}
                        fullWidth
                    >
                        {accounts.map((account) => (
                            <MenuItem
                                key={account.id}
                                value={account.name}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: "#def6f8",
                                        color: 'black'
                                    }
                                }}
                            >
                                {account.name} - {account.mask} - balance: {account.balances.available}
                        </MenuItem>
                        ))}
                        <MenuItem
                            value="Other"
                            sx={{
                                '&:hover': {
                                    backgroundColor: "#def6f8",
                                    color: 'black'
                                }
                            }}
                        >
                            Other
                        </MenuItem>
                    </TextField>
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