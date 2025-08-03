import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/authContext'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import './Transaction.css'
import { DataGrid, useGridApiRef } from '@mui/x-data-grid'
import { useItemId } from '../../hooks/useItemId'
import { useTransactions } from '../../hooks/useTransactions'
import IconButton from '@mui/material/IconButton'
import { MdEdit } from "react-icons/md"
import EditTransactionModal from '../../components/Transaction/Modal'

const categoryOptions = ['Groceries', 'Dining', 'Bills', 'Shopping', 'Other'];
const initialRows = [
  {
    id: 1,
    account: 'Chase Checking',
    date: '2025-07-30',
    merchant_name: 'Starbucks',
    category: 'Dining',
    amount: -5.75,
  },
  {
    id: 2,
    account: 'Amex Platinum',
    date: '2025-07-29',
    merchant_name: 'Amazon',
    category: 'Shopping',
    amount: -120.45,
  },
  {
    id: 3,
    account: 'Chase Checking',
    date: '2025-07-28',
    merchant_name: 'Apple Refund',
    category: 'Other',
    amount: 25.00,
  },
];



export default function Transaction() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState(null);
  const { itemId } = useItemId(currentUser.uid);
  const { transactions } = useTransactions(currentUser.uid, itemId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const handleOpenEditModal = (row) => {
    setSelectedTx(row);
    setIsModalOpen(true);
  }
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTx(null);
  };

  const columns = [
  { field: 'account', headerName: 'Account', flex: 1.5 },
  { field: 'date', headerName: 'Date', editable:true, flex: 1 },
  {
    field: 'merchant_name',
    headerName: 'Merchant',
    editable: true,
    flex: 1.5,
  },
  {
    field: 'category',
    headerName: 'Category',
    editable: true,
    type: 'singleSelect',
    valueOptions: categoryOptions,
    flex: 1,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 0.7,
    renderCell: (params) => (
      <span className={params.value > 0 ? 'text-red-500' : 'text-green-600'}>
        ${Math.abs(params.value).toFixed(2)}
      </span>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    flex: 0.5,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <IconButton
        size="small"
        onClick={() => handleOpenEditModal(params.row)}
      >
        <MdEdit />
      </IconButton>
    )
  }
  ];
  
  useEffect(() => {
      const rows = transactions.map((tx) => ({
        id: tx.transaction_id, // Required for DataGrid

        // Only include fields you use in your columns
        merchant_name: tx.merchant_name || tx.name,
        amount: tx.amount,
        date: tx.date,
        category: tx.personal_finance_category?.primary || 'Uncategorized',
        account: `${tx.account_name}`,

        // Optional: Keep full raw transaction in case you need it for modals or advanced features
        fullData: tx,
      }));
    
    setRows(rows);
  }, [transactions])


    const apiRef = useGridApiRef();   // Reference to manually control the DataGrid

    const handleProcessRowUpdate = (newRow, oldRow) => {
        // Replace the old row with the new one
        setRows((prev) =>
            prev.map((row) => (row.id === oldRow.id ? {...row, ...newRow} : row))
        );
        return newRow;
    };
    return (
      <>
          <div className="flex h-screen text-gray-500">
              {/* Sidebar */}
              <Sidebar />     
              
              {/* Page Content*/}
              <div className="flex-1 overflow-auto">
                  {/* Topbar*/}
                  <Topbar pageName='Transaction' userFirstInitial={currentUser.displayName?.charAt(0)}/>
                  
                  <span className="w-full h-px bg-gray-200 block my-5"></span>
                  <section>
                      <div className="w-full">
                          <DataGrid
                              rows={rows}
                              columns={columns}
                              disableColumnResize={true}
                              checkboxSelection
                              disableRowSelectionOnClick
                              apiRef={apiRef}
                              editMode='row'
                              experimentalFeatures={{ newEditingApi: true }}
                              processRowUpdate={handleProcessRowUpdate}
                          />
                          </div>
                          <EditTransactionModal
                            open={isModalOpen}
                            onClose={handleCloseModal}
                            transaction={selectedTx}
                          />
                  </section>
              </div>
          </div>
      </>
    )
}