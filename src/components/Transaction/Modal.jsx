import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import MenuItem from "@mui/material/MenuItem"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"
import { IoIosHelpCircleOutline } from "react-icons/io"
import prettyMapCategory from "../../constants/prettyMapCategory"
import { useAccount } from "../../contexts/AccountContext"

export default function EditTransactionModal({ open, onClose, transaction }) {
    const { accounts } = useAccount();
    const [errors, setErrors] = useState({});
    if (!open) {
        return null;
    }

    if (!transaction || accounts.length === 0) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <div>Loading...</div>
                </DialogContent>
            </Dialog>
        );
    }

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
    
    const accountOptions = useMemo(() => {
        return (
            accounts.map((account) => (
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
                    {account.name} * {account.mask}
                </MenuItem>
            ))
        )
    }, [accounts])

    const validateInput = useCallback((data) => {
        const newErrors = {};

        if (!data.account) {
            newErrors.account = "Account is required";
        }
        if (!data.date) {
            newErrors.date = "Date is required";
        }
        if (!data.merchant) {
            newErrors.merchant = "Merchant name is required";
        }
        if (!data.category) {
            newErrors.category = "Must select a category";
        }
        if (!data.amount) {
            newErrors.amount = "Amount is required, Check ? for more details";
        } else if (isNaN(Number(data.amount))) {
            newErrors.amount = "Amount must be a number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [])  

    const defaultValues = useMemo(() => ({
        transaction_id: transaction.transaction_id || transaction.id,
        account: transaction.account || '',
        mask: transaction.mask || '',
        date: transaction.date || '',
        merchant: transaction.merchant_name || '',
        category: transaction.category || '',
        amount: transaction.amount || 0,
        notes: transaction.notes || ''
    }), [transaction]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        const formValues = Object.fromEntries(formData.entries());

        const validate = validateInput(formValues);
        console.log(errors)
        if (validate) {
            console.log("Success")
        }

    }, [validateInput, errors])

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Transaction</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        select
                        margin="normal"
                        label="Account Name"
                        name="account"
                        defaultValue={defaultValues.account}
                        error={!!errors.account}
                        helperText={errors.account}
                        fullWidth
                    >
                        <MenuItem value=''></MenuItem>
                        {accountOptions}
                    </TextField>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Merchant"
                        name="merchant"
                        defaultValue={defaultValues.merchant}
                        error={!!errors.merchant}
                        helperText={errors.merchant}
                    />
                    <TextField
                        fullWidth
                        type="date"
                        margin="normal"
                        label="Date"
                        name="date"
                        defaultValue={defaultValues.date}
                        error={!!errors.date}
                        helperText={errors.date}
                    />
                    <TextField
                        fullWidth
                        select
                        margin="normal"
                        label="Category"
                        name="category"
                        defaultValue={defaultValues.category}
                        error={!!errors.category}
                        helperText={errors.category}
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
                        fullWidth
                        margin="normal"
                        label={
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                Amount *
                                <Tooltip title="User positive for expense, negative for income" arrow>
                                    <IoIosHelpCircleOutline className="text-2xl text-blue"/>
                                </Tooltip>
                            </span>
                        }
                        name="amount"
                        slotProps={{
                            inputLabel: {
                                shrink: true
                            }
                        }}
                        sx={{
                            '& .MuiFormLabel-asterisk': {
                            display: 'none',
                            },
                        }}
                        defaultValue={defaultValues.amount}
                        error={!!errors.amount}
                        helperText={errors.amount}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        label="Notes"
                        name="notes"
                        defaultValue={defaultValues.notes}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                    <Button type="submit">
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}