import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/authContext'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import './Transaction.css'
import { DataGrid, useGridApiRef } from '@mui/x-data-grid'

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

const columns = [
    { field: 'account', headerName: 'Account', flex: 1.5 },
    { field: 'date', headerName: 'Date', flex: 1 },
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
      flex: 1,
      renderCell: (params) => (
        <span className={params.value < 0 ? 'text-red-500' : 'text-green-600'}>
          ${Math.abs(params.value).toFixed(2)}
        </span>
      ),
    },
  ];

export default function Transaction() {
    const [rows, setRows] = useState(initialRows);
    const { currentUser, loading } = useAuth();
    const apiRef = useGridApiRef();   // Reference to manually control the DataGrid

    const handleProcessRowUpdate = (newRow, oldRow) => {
        // Replace the old row with the new one
        setRows((prev) =>
            prev.map((row) => (row.id === oldRow.id ? newRow : row))
        );
        console.log(rows);
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
                                experimentalFeatures={{ newEditingApi: true }}
                                onCellClick={(params, event) => {
                                    const { id, field, colDef } = params;
                                    // Only start edit if the field is editable
                                    if (!colDef.editable) return;

                                    const cellMode = apiRef.current.getCellMode(id, field); // "view" or "edit"

                                    if (cellMode !== 'edit') {
                                        apiRef.current.startCellEditMode({ id, field });
                                    }
                                }}
                                processRowUpdate={handleProcessRowUpdate}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}