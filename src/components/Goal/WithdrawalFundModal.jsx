import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react"
import { withdrawalGoalFund } from "../../api/goal"

export default function AddFundModal({ open, onClose, selectedGoalItem, setSelectedGoalItem }) {
    const queryClient = useQueryClient();
    const [linkedAccount, setLinkedAccount] = useState(() => {
        const [key, value] = Object.entries(selectedGoalItem.contributions)[0];
        return { key, value };
    });
    
    const linkedAccountsArray = useMemo(() => Object.entries(selectedGoalItem.contributions) || [], [selectedGoalItem])
    
    const [errors, setErrors] = useState({});

    console.log(linkedAccount);
    
    const validateInput = (data) => {
        let newErrors = {};

        if (!data.linked_account) {
            newErrors.linked_account = "Please choose an account";
        }

        if (!data.amount) {
            newErrors.amount = "Amount is required"
        } else if (isNaN(Number(data.amount))) {
            newErrors.amount = "Amount must be a number"
        } else if (Number(data.amount) < 0) {
            newErrors.amount = "Amount must be positive"
        } else if (Number(data.amount) > linkedAccount.value.amount) {
            newErrors.amount = "Amount must be less than available balances";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const refetchGoals = () => {
        queryClient.invalidateQueries({
            queryKey: ["goals"]
        })
    }

    const handleAccountChange = (e) => {
        const newKey = e.target.value;
        const newValue = selectedGoalItem.contributions[newKey];
        setLinkedAccount({key: newKey, value: newValue})
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formValues = Object.fromEntries(formData.entries());

        const isValidated = validateInput(formValues); 
        if (!isValidated) return;

        const goalToUpdate = {
            savedAmount: selectedGoalItem.saved_amount,
            targetAmount: selectedGoalItem.target_amount,
            fund: Number(formValues.amount),
            accountId: formValues.linked_account
        }

        await withdrawalGoalFund(selectedGoalItem.goal_id, goalToUpdate, onClose);
        refetchGoals();
        setSelectedGoalItem(null);
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
                <DialogTitle>Withdrawal fund</DialogTitle>
                <DialogContent dividers>
                    <div className="flex gap-2 items-center" >
                        <div className="bg-gray-100 p-2 rounded-md">
                            <p className="font-medium text-gray-500">Saved so far</p>
                            <p className="font-medium">${selectedGoalItem.saved_amount}</p>
                        </div>

                        <div className="bg-gray-100 p-2 rounded-md w-fit">
                            <p className="font-medium text-gray-500">Target Amount</p>
                            <p className="font-medium">${selectedGoalItem.target_amount}</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <TextField
                            select
                            margin="normal"
                            label="Link Account"
                            name="linked_account"
                            value={linkedAccount.key}
                            onChange={handleAccountChange}
                            error={!!errors.linked_account}
                            helperText={errors.linked_account}
                            className="w-[70%]"
                        >
                            {linkedAccountsArray.map(([accountId, {name}]) => (
                                <MenuItem
                                    key={accountId}
                                    value={String(accountId)}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: "#def6f8",
                                            color: 'black'
                                        }
                                    }}
                                >
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            margin="normal"
                            label="Limit"
                            value={`$${linkedAccount.value.amount}`}
                            className="w-1/4"
                            disabled
                        />
                    </div>

                    <TextField
                        type="number"
                        margin="normal"
                        label="Amount to Withdrawl"
                        name="amount"
                        placeholder="$0"
                        error={!!errors.amount}
                        helperText={errors.amount}
                        slotProps={{
                            htmlInput: { min: 0, step: 0.01 }
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