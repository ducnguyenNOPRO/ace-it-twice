import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import React, { useState, useEffect } from "react"
import MenuItem from "@mui/material/MenuItem"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import prettyMapCategory from "../../constants/prettyMapCategory"

export default function EditTransactionModal({ open, onClose, transaction }) {
    console.log('Modal received transaction:', transaction); // ← Add this debug
    const [formData, setFormData] = useState({
        account: '',
        date: '',
        merchant_name: '',
        category: '',
        amount: '',
        notes: ''
    })

    const handleInputChange = () => {

    }
    useEffect(() => {
        if (transaction) {
            setFormData({
                account: transaction.account || '',
                date: transaction.date || '',
                merchant_name: transaction.merchant_name || '',
                category: prettyMapCategory[transaction.category].name,
                amount: transaction.amount,
                notes: transaction.notes || ''
            })
        }
    }, [transaction])
    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Account"
                    name="account"
                    value={formData.account}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    type="date"
                    margin="normal"
                    label="Date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Merchant Name"
                    name="merchant_name"
                    value={formData.merchant_name}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    select
                    margin="normal"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                >
                    <MenuItem value="Shopping">Shopping</MenuItem>
                    <MenuItem value="Food">Food</MenuItem>
                    <MenuItem value="Transportation">Transportation</MenuItem>
                    <MenuItem value="Utilities">Utilities</MenuItem>
                    <MenuItem value="Entertainment">Entertainment</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    Close
                </Button>
                <Button>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}