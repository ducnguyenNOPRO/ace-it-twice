import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import MenuItem from "@mui/material/MenuItem"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import prettyMapCategory from "../../constants/prettyMapCategory"
import Tooltip from "@mui/material/Tooltip"
import { IoIosHelpCircleOutline } from "react-icons/io"
import { useAccounts } from "../../hooks/useAccounts"
import Paper from "@mui/material/Paper"

export default function EditTransactionModal({ open, onClose, transaction }) {
    const { accounts } = useAccounts();
    const [errors, setErrors] = useState({});

    // Mempoze category options to prevent re-rendering
    const categoryOptions = useMemo(() => {
        return Object.entries(prettyMapCategory).map(([key, { name }]) => 
            (
            <MenuItem
                key={key}
                value={name}
                sx={{
                    '&:hover': {
                        backgroundColor: "#def6f8",
                        color: 'black'
                    }
                }}
            >
                {name}
            </MenuItem>
        ))
    }, [])

        // Add this check
    if (!transaction) {
        return (
            <div>Loading...</div>
        ); // or return a loading spinner
    }

    const defaultValues = {
        account: transaction.account || '',
        mask: transaction.mask || '',
        date: transaction.date || '',
        merchant: transaction.merchant_name || '',
        category: prettyMapCategory[transaction.category].name || '',
        amount: transaction.amount || 0,
    }

    const fieldsValidation = (account, date, merchant, category, amount) => {
        
    }

    const handleSumbit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        const formValues = Object.fromEntries(formData.entries());
        console.log("Form Values:", formValues);
    }
    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <form onSubmit={handleSumbit}>
                <DialogTitle>Edit Transaction</DialogTitle>
                <DialogContent dividers>

                        <TextField
                            select
                            margin="normal"
                            label="Account Name"
                            name="account"
                            defaultValue={defaultValues.account}
                            fullWidth
                            required
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
                                    {account.name} * {account.mask}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            type="date"
                            margin="normal"
                            label="Date"
                            name="date"
                            defaultValue={defaultValues.date}
                            required
                        />
                        <TextField
                            fullWidth
                            select
                            margin="normal"
                            label="Category"
                            name="category"
                            defaultValue={defaultValues.category}
                            required
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
                            type="number"
                            required
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