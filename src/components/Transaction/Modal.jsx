import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import React, { useState, useMemo, useCallback } from "react"
import MenuItem from "@mui/material/MenuItem"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"
import { IoIosHelpCircleOutline } from "react-icons/io"
import prettyMapCategory from "../../constants/prettyMapCategory"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { addTransaction, editTransactionById } from "../../api/transactions"
import { createAccountsQueryOptions, createTransactionsQueryOptions } from "../../util/createQueryOptions"

export default function AddAndEditTransactionModal({ open, onClose, setPaginationModel, setLastDocumentIds,
    mode, transaction, itemId, paginationModel, lastDocumentIds
}) {
    const queryClient = useQueryClient();
    // default to empty [] till fetched
    const { data: accounts = [], isLoading: loadingAccs } = useQuery(
        createAccountsQueryOptions({ itemId },
          {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
    }))
    const [errors, setErrors] = useState({});
    
    if (!open) {
        return null;
    }

    const defaultValues = useMemo(() => ({
        account_name: transaction?.account_name || '',
        account_mask: transaction?.account_mask || '',
        date: transaction?.date || '',
        merchant_name: transaction?.merchant_name || '',
        category: transaction?.category || '',
        amount: transaction?.amount || 0,
        notes: transaction?.notes || '',
        pending: transaction?.pending || 'true'
    }), [transaction]);

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
                    {account.name} - {account.mask}
                </MenuItem>
            ))
        )
    }, [accounts])

    const validateInput = useCallback((data) => {
        const newErrors = {};

        if (!data.account_name) {
            newErrors.account_name = "Account is required";
        }
        if (!data.date) {
            newErrors.date = "Date is required";
        }
        if (!data.merchant_name) {
            newErrors.merchant_name = "Merchant name is required";
        }
        if (!data.category) {
            newErrors.category = "Must select a category";
        }
        if (!data.pending) {
            newErrors.pending = "Provide a pending status";
        }
        if (!data.amount) {
            newErrors.amount = "Amount is required, Check ? for more details";
        } else if (isNaN(Number(data.amount))) {
            newErrors.amount = "Amount must be a number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [])
    
    // Remove all cache instead of reinvalidating
    // There're more query key so reinvaliding would just keep old cache
    // and add new cache when refetch instead replace old cache
    const refetchTransactions = useCallback(async () => {
        queryClient.removeQueries({
            queryKey: ["transactions", itemId]
        })
        // Clear lastDocumentIds state
        setLastDocumentIds({});

        // Refetch page 0
        setPaginationModel((prev) => ({
            ...prev,
            page: 0
        }))
    }, [itemId])

    // Update a specific transaction in the current cache
    const manuallyUpdateCache = (transactionToUpdateId, transactionToUpdate) => {
        queryClient.setQueryData(
            createTransactionsQueryOptions({
                itemId,
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                lastDocumentId: paginationModel.page > 0 ? lastDocumentIds[paginationModel.page - 1] : null,
            }).queryKey,
            (oldData) => {
                if (!oldData) return oldData;
                const updatedData = {
                    ...oldData,
                    transactions: oldData.transactions.map(tx => 
                        tx.transaction_id === transactionToUpdateId 
                            ? { ...tx, ...transactionToUpdate } 
                            : tx
                    )
                };
                
                return updatedData;
            }
        )
    }

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        const formValues = Object.fromEntries(formData.entries());

        const validate = validateInput(formValues);

        if (!validate) {
            return;
        }
        // Find the account chosen by user in the drop down
        const account = accounts.find(acc =>
            acc.name.toLowerCase() === formValues.account_name.toLowerCase()
        )

        if (mode === "Add") {
            const transactionToAdd = {
                ...formValues,
                name: formValues.merchant_name,
                amount: Number(formValues.amount),
                pending: formValues.pending === "true" || formValues.pending === true,
                account_mask: account.mask,
                account_id: account.account_id,
                iso_currency_code: "USD",
            }
            await addTransaction(transactionToAdd, itemId, onClose);
            // Remove all cache and refetch page 0
            refetchTransactions();
        } else if (mode === "Edit") {
            const transactionToUpdateId = transaction.transaction_id || transaction.id;
            const transactionToUpdate = {
                ...formValues,
                name: formValues.merchant_name,
                amount: Number(formValues.amount),
                account_mask: account.mask,
                account_id: account.account_id,
            }
            await editTransactionById(transactionToUpdateId, transactionToUpdate, itemId, onClose);

            // Update cache if date field not change
            if (transaction.date === transactionToUpdate.date) {
                manuallyUpdateCache(transactionToUpdateId, transactionToUpdate)
                return;
            }
            // Remove all cache and refetch page 0
            refetchTransactions();
        }
    }, [validateInput, errors, accounts]);

    if (mode === "Edit") {
        if (!transaction || loadingAccs) {
            return (
                <Dialog open={open} onClose={onClose}>
                    <DialogContent>
                        <div>Loading...</div>
                    </DialogContent>
                </Dialog>
            );
        }
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
                <DialogTitle>{mode} Transaction</DialogTitle>      
                <DialogContent dividers>
                    <p className="text-right text-red-500">* All fields are required, except Notes</p>
                    <TextField
                        select
                        margin="normal"
                        label="Account Name"
                        name="account_name"
                        defaultValue={defaultValues.account_name}
                        error={!!errors.account_name}
                        helperText={errors.account_name}
                        fullWidth
                    >
                        {accountOptions}
                    </TextField>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Merchant Name"
                        name="merchant_name"
                        defaultValue={defaultValues.merchant_name}
                        error={!!errors.merchant_name}
                        helperText={errors.merchant_name}
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
                        slotProps={{
                            inputLabel: {
                                shrink: true
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        select
                        margin="normal"
                        label="Pending"
                        name="pending"
                        defaultValue={defaultValues.pending}
                        error={!!errors.pending}
                        helperText={errors.pending}
                        slotProps={{
                            inputLabel: {
                                shrink: true
                            }
                        }}
                    >
                        <MenuItem 
                            value="true"
                            sx={{
                                '&:hover': {
                                    backgroundColor: "#def6f8",
                                    color: 'black'
                                }
                            }}
                        >
                            Yes
                            </MenuItem>
                        <MenuItem
                            value="false"
                            sx={{
                                '&:hover': {
                                    backgroundColor: "#def6f8",
                                    color: 'black'
                                }
                            }}
                        >
                            No
                        </MenuItem>
                    </TextField>
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
                                Amount
                                <Tooltip title="Use positive number for expense, negative for income" arrow>
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