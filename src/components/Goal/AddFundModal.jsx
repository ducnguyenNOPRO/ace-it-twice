import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createAccountsQueryOptions } from "../../util/createQueryOptions";
import { useMemo, useState } from "react"
import { addGoalFund } from "../../api/goal"

export default function AddFundModal({ open, onClose, itemId, selectedGoalItem, setSelectedGoalItem }) {
    const queryClient = useQueryClient();
    const { data: accounts = [], isLoading: loadingAccs } = useQuery(
            createAccountsQueryOptions({ itemId },
            {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
                }))
    
    const [errors, setErrors] = useState({});
    
    const defaultAccount = useMemo(() =>
        selectedGoalItem ? Object.keys(selectedGoalItem.contributions)[0] : "Other"
        , [selectedGoalItem]);
    
    const validateInput = (data) => {
        let newErrors = {};
        const account = accounts.find(a => a.account_id === data.linked_account)

        if (!data.linked_account) {
            newErrors.linked_account = "Please an account";
        }

        if (!data.amount) {
            newErrors.amount = "Amount is required"
        } else if (isNaN(Number(data.amount))) {
            newErrors.amount = "Amount must be a number"
        } else if (Number(data.amount) < 0) {
            newErrors.amount = "Amount muse be positive"
        } else if (Number(data.amount) > account.balances.available) {
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formValues = Object.fromEntries(formData.entries());

        const isValidated = validateInput(formValues); 
        if (!isValidated) return;

        const account = accounts.find(a => a.account_id === formValues.linked_account )

        const goalToUpdate = {
            accountName: account.name,
            savedAmount: selectedGoalItem.saved_amount,
            targetAmount: selectedGoalItem.target_amount,
            fund: Number(formValues.amount),
            accountId: formValues.linked_account
        }

        await addGoalFund(selectedGoalItem.goal_id, goalToUpdate, onClose);
        refetchGoals();
        setSelectedGoalItem(null);
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
                <DialogTitle>Add Fund</DialogTitle>
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
                    <TextField
                        select
                        margin="normal"
                        label="Link Account"
                        name="linked_account"
                        defaultValue={defaultAccount}
                        error={!!errors.linked_account}
                        helperText={errors.linked_account}
                        fullWidth
                    >
                        {accounts.map((account) => (
                            <MenuItem
                                key={account.account_id}
                                value={String(account.account_id)}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: "#def6f8",
                                        color: 'black'
                                    }
                                }}
                            >
                                {account.name} - Balance: ${account.balances.available}
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
                    <TextField
                        type="number"
                        margin="normal"
                        label="Amount to add"
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