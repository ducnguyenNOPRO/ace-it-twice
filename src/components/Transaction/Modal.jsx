import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import React, { useState, useEffect } from "react"
import MenuItem from "@mui/material/MenuItem"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"

export default function EditTransactionModal({open, onClose, transaction}) {
    const [formData, setFormData] = useState({
        merchant_name: '',
        category: '',
        amount: '',
        notes: ''
    })
    useEffect(() => {
        if (transaction) {
            setFormData({
                merchant_name: transaction.merchant_name || '',
                category: transaction.category,
                amount: transaction.amount,
                notes: transaction.notes || ''
            }, [transaction])
        }
    })
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
                    label="Merchant Name"
                    name="merchant_name"
                    value={formData.merchant_name}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Category"
                    name="category"
                    value={formData.category}
                >
                    {['Food', 'Shopping', 'Utilities', 'Travel', 'Other'].map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat}
                        </MenuItem>
                    ))}
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