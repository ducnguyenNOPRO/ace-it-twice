import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { GridMoreVertIcon } from "@mui/x-data-grid";
import React, { useState } from "react";
import { MdDeleteForever, MdEdit } from "react-icons/md";

export default function RowActionMenu({
    row, handleOpenEditModal, handleDeleteTransaction, isDeleting
}) {
    const [anchorEl, setAnchorEl] = useState(null); // reference to HTML elemnt --- IconButton
    const open = Boolean(anchorEl);

    const handleOpen = (e) => {
        e.stopPropagation();  // Prevent DataGrid row selection
        setAnchorEl(e.currentTarget);
    }

    const handleClose = (e) => {
        setAnchorEl(null);
    }

    const handleEdit = () => {
        handleOpenEditModal(row);
        handleClose();
    }

    const handleDelete = () => {
        handleDeleteTransaction(row);
        handleClose();
    }
    return (
        <>
            <IconButton onClick={handleOpen}>
                <GridMoreVertIcon />   
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={(e) => e.stopPropagation()}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
            >
                <MenuItem
                    onClick={handleEdit}
                    sx={{
                        '&:hover': {
                            backgroundColor: "black",
                            color: 'white'
                        }
                    }}
                >
                    <MdEdit />
                    Edit
                </MenuItem>
                <MenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    sx={{
                        '&:hover': {
                            backgroundColor: "black",
                            color: 'white'
                        }
                    }}
                >
                    <MdDeleteForever />
                    Delete
                </MenuItem>
            </Menu>       
        </>
    )
}