import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
export default function AddGoalModal({ open, onClose }) {
    const handleSubmit = (e) => {
        e.preventDefault();
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
                        //error={!!errors.account_name}
                        //helperText={errors.account_name}
                        fullWidth
                    />
                    <TextField
                        type="number"
                        margin="normal"
                        label="Target amount"
                        name="target_amount"
                        placeholder="$0"
                        //error={!!errors.account_name}
                        //helperText={errors.account_name}
                        fullWidth
                    />
                    <TextField
                        type="number"
                        margin="normal"
                        label="Current saved amount"
                        name="saved_amount"
                        placeholder="$0"
                        //error={!!errors.account_name}
                        //helperText={errors.account_name}
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
                        //error={!!errors.account_name}
                        //helperText={errors.account_name}
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