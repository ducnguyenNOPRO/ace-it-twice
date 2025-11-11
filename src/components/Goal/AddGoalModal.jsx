import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import { useState } from "react"
import { addGoal } from "../../api/goal"
import { useQueryClient } from "@tanstack/react-query"
import formatDate from "../../util/formatDate"
import useLocalBalance from "../../hooks/useLocalBalance"


export default function AddGoalModal({ open, onClose, itemId }) {
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState({});
    
    const localBalance = useLocalBalance(itemId);

    const validateInput = (data) => {
        const newErrors = {};
        const account = localBalance.find(a => a.accountId === data.linked_account);

        if (!data.goal_name) {
            newErrors.goal_name = "Goal name is required";
        }

        if (!data.target_date) {
            newErrors.target_date = "Date is required";
        }

        if (!data.linked_account) {
            newErrors.linked_account = "Please choose an account";
        } else if (data.linked_account === "Other") {
            // handle the "Other" case — maybe skip balance validation
            if (!data.saved_amount) {
                newErrors.saved_amount = "Amount is required";
            } else if (isNaN(Number(data.saved_amount))) {
                newErrors.saved_amount = "Amount must be a number";
            } else if (Number(data.saved_amount) < 0) {
                newErrors.saved_amount = "Amount must be positive";
            }
        } else {
            if (!data.saved_amount) {
                newErrors.saved_amount = "Saved amount is required";
            } else if (isNaN(Number(data.saved_amount))) {
                newErrors.saved_amount = "Saved amount must be a number";
            } else if (Number(data.saved_amount) > Number(data.target_amount)) {
                newErrors.saved_amount = "Saved amount must be less than target amount";
            } else if (Number(data.saved_amount) > account.computedBalance) {
                newErrors.saved_amount = "Saved amount must be less than available balance"
            }
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

        const account = localBalance.find(a => a.accountId === formValues.linked_account)

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
        const linkedAccount = {
            id: account?.accountId ?? "Other",
            name: account?.accountName ?? "Other"
        }

        const goalToAdd = {
            goal_name: formValues.goal_name,
            target_amount: targetAmount,
            saved_amount: savedAmount,
            start_date: startDate,
            start_date_formatted: startDateFormatted,
            target_date: formValues.target_date,
            target_date_formatted: targetDateFormatted,
            iso_currency_code: "USD",
        }

        await addGoal(goalToAdd, linkedAccount, onClose);
        refetchGoals();
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
                        error={!!errors.target_date}
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
                        {localBalance.map((account) => (
                            <MenuItem
                                key={account.accountId}
                                value={String(account.accountId)}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: "#def6f8",
                                        color: 'black'
                                    }
                                }}
                            >
                                {account.accountName} - balance: {account.computedBalance}
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