import React, { useState, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '../../contexts/authContext'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import './Transaction.css'
import { DataGrid} from '@mui/x-data-grid'
import EditTransactionModal from '../../components/Transaction/Modal'
import RowActionMenu from '../../components/Transaction/RowActionMenu'
import { IoSearchSharp, IoAddCircleSharp} from 'react-icons/io5'
import { useTransaction } from '../../contexts/TransactionContext'
import prettyMapCategory from '../../constants/prettyMapCategory'

// Memoized category cell component to prevent re-renders
const CategoryCell = React.memo(({ value }) => (
  <div className="flex justify-start items-center h-full w-full">
    <div
      title={value ?? prettyMapCategory.Other.name}
      className={`flex items-center gap-2 rounded-full px-3 py-1 overflow-hidden
        ${prettyMapCategory[value]?.color ?? prettyMapCategory.Other.color}
      `}>
      <img
        src={prettyMapCategory[value]?.icon || "../../public/icons/badge-question-imark.svg"}
        alt="Category Icon"
      />
      <span className="text-sm font-bold sm:truncate hidden md:inline">
        {value || "Other"}
      </span>
    </div>
  </div>
));


export default function Transaction() {
  console.log("Transaction rendered")
  const { currentUser } = useAuth();
  const { transactions } = useTransaction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const searchInput = useRef('');
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [selectedRowIds, setSelectedRowIds] = useState([]);


  // Memorie function
  const handleOpenEditModal = useCallback((row) => {
    setSelectedTx(row);
    setIsModalOpen(true);
  }, []);  // Function stay the same

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTx(null);
  }, []);

  const handleDeleteTransaction = useCallback((row) => {

  }, []);

  const columns = useMemo(() => [
    { field: 'account', headerName: 'Account', flex: 1.5 },
    { field: 'date', headerName: 'Date', flex: 1 },
    {
      field: 'merchant_name',
      headerName: 'Merchant',
      flex: 1.5,
    },
    {
      field: 'category',
      headerName: 'Category',
      renderCell: (params) => (
        <CategoryCell value={params.value} />
      ),
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
      <RowActionMenu
        row={params.row}
        handleOpenEditModal={handleOpenEditModal}
        handleDeleteTransaction={handleDeleteTransaction}
      />
    )
  }
  ], [handleOpenEditModal, handleDeleteTransaction]);

  const formattedRows = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    return transactions.map((tx) => ({
      id: tx.id,
      transaction_id: tx.transaction_id,
      account_id: tx.account_id,
      merchant_name: tx.merchant_name || tx.name,
      amount: tx.amount,
      date: tx.date,
      category: tx.category || 'Other',
      account: `${tx.account_name}`,
      mask: tx.account_mask,
      notes: tx.notes,
    }));
  }, [transactions]);

  // Memoize row selection handler
  const handleRowSelectionChange = useCallback((newSelection) => {
    let ids = [];
    // newSelection.ids is type Set
    if (newSelection?.type === 'include') {
      setSelectedRowCount(newSelection.ids.size);
      setSelectedRowIds(Array.from(newSelection.ids)); // Convert Set to Array
      return;
    }
    if (newSelection?.type === 'exclude') {
      const excluded = newSelection.ids || new Set();
      ids = transactions.filter(row => !excluded.has(String(row.id))).map(row => row.id);
    }
    setSelectedRowIds(ids);
    setSelectedRowCount(ids.length);
  }, [transactions]) // same function

    return (
      <>
        <div className="flex h-screen text-gray-500">
          {/* Sidebar */}
          <Sidebar />     
          
          {/* Page Content*/}
          <div className="flex-1 overflow-auto">
            {/* Topbar*/}
            <Topbar pageName='Transaction' userFirstInitial={currentUser.displayName?.charAt(0)} />             
            
            <span className="w-full h-px bg-gray-200 block my-5"></span>

            {/* Search transaction */}
            <div className="flex items-center justify-between mb-2 mx-2">
              <div className="relative grow mr-4">
                  <IoSearchSharp className="absolute top-1/2 left-2 transform -translate-y-1/2" />
                  <input 
                    id="searchTransaction"
                    placeholder="Search for a transaction"
                    className="w-full pl-8 py-1 tracking-wider text-md text-black bg-white border-2 border-gray-300 rounded-md "
                  />
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-1 py-1 px-3 bg-black text-white rounded-md font-medium hover:opacity-80 transition cursor-pointer"
                >
                  <IoAddCircleSharp/>
                  <span>Add Transaction</span>
                </button>
                <button
                  className="flex items-center gap-1 py-1 px-3 bg-red-600 text-white rounded-md font-medium hover:opacity-80 transition cursor-pointer"
                >
                  <IoAddCircleSharp />
                  <span>Delete Selected ({selectedRowCount})</span>
                </button>
              </div>
            </div>

            <section>
                <div className="w-full">
                  <DataGrid
                    rows={formattedRows}
                    columns={columns}
                    disableColumnResize={true}
                    checkboxSelection
                    onRowSelectionModelChange={handleRowSelectionChange}
                    disableRowSelectionOnClick
                    loading={!transactions}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    pageSizeOptions={[5, 10, 25, { value: -1, label: 'All' }]}
                />
              </div>
              {isModalOpen && 
                <EditTransactionModal
                  open={isModalOpen}
                  onClose={handleCloseModal}
                  transaction={selectedTx}
                />
              }
            </section>
          </div>
        </div>
      </>
    )
}