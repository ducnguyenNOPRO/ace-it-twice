import React, { useState, useRef, useMemo, useCallback, useId, useEffect } from 'react'
import { useAuth } from '../../contexts/authContext'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import './Transaction.css'
import { DataGrid} from '@mui/x-data-grid'
import AddAndEditTransactionModal from '../../components/Transaction/Modal'
import RowActionMenu from '../../components/Transaction/RowActionMenu'
import { IoAddCircleSharp} from 'react-icons/io5'
import { useItemId } from '../../hooks/useItemId'
import prettyMapCategory from '../../constants/prettyMapCategory'
import { FiRefreshCw } from "react-icons/fi"
import SearchTransaction from '../../components/Transaction/SearchBar'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransactionsQueryOptions } from '../../util/createQueryOptions'
import { deleteBatchTransaction, deleteSingleTransaction, fetchTransactionsFromPlaid } from '../../api/transactions'

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
  const { currentUser } = useAuth();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5
  })
  const [lastDocumentIds, setLastDocumentIds] = useState({})
  const queryClient = useQueryClient();
  const { itemId, loadingItemId } = useItemId(currentUser.uid);
  const { data, isLoading: loadingTransactions} = useQuery(
    createTransactionsQueryOptions(
      {
        itemId,
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        lastDocumentId: paginationModel.page > 0 ? lastDocumentIds[paginationModel.page - 1] : null,
      },
      {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        enabled: !!itemId
      }))
    console.log(queryClient.getQueryCache().getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [selectedRowIds, setSelectedRowIds] = useState([]);  // For Batch transaction deletion

  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination ?? {};

  useEffect(() => {
    if (pagination?.nextCursor) {
      setLastDocumentIds((prev) => ({
        ...prev,
        [pagination.page]: pagination.nextCursor
      }))
    }
  }, [pagination])


  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, [])

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setSelectedTx(null);
  }, []);

  const handleOpenEditModal = useCallback((row) => {
    setSelectedTx(row);
    setIsEditModalOpen(true);
  }, []);  // Function stay the same

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedTx(null);
  }, []);

  // Delete a single a transaction
  const handleDeleteSingleTransaction = useCallback(async (row) => {
    const transactionId = row.id || row.transaction_id;
    await deleteSingleTransaction(transactionId, itemId);
    queryClient.invalidateQueries({
      queryKey: createTransactionsQueryOptions().queryKey
    });
  }, [itemId]);

  // Delete many transaction at once
  const handleDeleteBatchTransactions = useCallback(async () => {
    const result = await deleteBatchTransaction(selectedRowIds, itemId);

    if (result.data.success) { 
      queryClient.invalidateQueries({
        queryKey: createTransactionsQueryOptions().queryKey
      });
      setSelectedRowCount(0);
      setSelectedRowIds([]);
    }
  }, [selectedRowIds, itemId])

  const columns = useMemo(() => [
    { field: 'account_name', headerName: 'Account', flex: 1.5 },
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
          handleDeleteTransaction={handleDeleteSingleTransaction}
        />
      )
    }
  ], [handleOpenEditModal, handleDeleteSingleTransaction]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery || searchQuery.length === 0) return transactions;
    return transactions.filter((tx) =>
      tx.account_name.toLowerCase().includes(searchQuery) ||
      tx.date.toLowerCase().includes(searchQuery) ||
      tx.merchant_name.toLowerCase().includes(searchQuery) ||
      tx.category.toLowerCase().includes(searchQuery) ||
      tx.amount.toString().toLowerCase().includes(searchQuery)
    );
  }, [transactions, searchQuery]);

  // Memoize row selection handler
  const handleRowSelectionChange = useCallback((newSelection) => {
    let ids = [];
    // newSelection.ids is type Set
    if (newSelection?.type === 'include') {
      // inclde type = selected transaciton stored in ids Set
      setSelectedRowCount(newSelection.ids.size);
      setSelectedRowIds(Array.from(newSelection.ids)); // Convert Set to Array
      return;
    }
    if (newSelection?.type === 'exclude') {
      const excluded = newSelection.ids || new Set();
      // exclude type = transactions that are not selected
      // are now store in ids.
      // Keep the selected transactions by filtering the non selected txs
      ids = transactions.filter(row => !excluded.has(String(row.id))).map(row => row.id);
      console.log(ids);
    }
    setSelectedRowIds(ids);
    setSelectedRowCount(ids.length);
  }, [transactions]) // same function

  const handlePaginationModelChange = useCallback((newModel) => {
    setPaginationModel(newModel);
  }, []);

  if (loadingItemId) return <div>Loading...</div>

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
            <div className="flex items-center justify-between mb-2 mx-2 gap-1">
              {/* Search transaction */}
              <SearchTransaction onSearch={setSearchQuery} />
      
              <div className="flex items-center gap-3">
                {/* Add transaction */}    
                <button
                  className="flex items-center gap-1 py-1 px-3 bg-black text-white rounded-md font-medium hover:opacity-80 transition cursor-pointer"
                  onClick={handleOpenAddModal}
                >
                  <IoAddCircleSharp/>
                  <span>Add Transaction</span>
                </button>
                {/* Delete batch transaction */}    
                <button
                  className="flex items-center gap-1 py-1 px-3 bg-red-600 text-white rounded-md font-medium hover:opacity-80 transition cursor-pointer"
                  onClick={handleDeleteBatchTransactions}
                >
                  <IoAddCircleSharp />
                  <span>
                    {selectedRowCount > 0 ? `Delete Selected (${selectedRowCount})` : 'Delete'}
                  </span>
                </button>
              </div>
            </div>

            <section>
              <div className="w-full">
                <DataGrid
                  rows={filteredTransactions}
                  columns={columns}
                  disableColumnResize={true}
                  checkboxSelection
                  paginationMode="server"
                  paginationModel={paginationModel}
                  rowCount={data?.totalCount}
                  disableRowSelectionOnClick
                  loading={loadingTransactions}
                  pageSizeOptions={[5, 10, 25]}
                  onPaginationModelChange={handlePaginationModelChange}
                  onRowSelectionModelChange={handleRowSelectionChange}
                  hideFooterPagination={loadingTransactions}
              />
              </div>
              {isEditModalOpen && 
                <AddAndEditTransactionModal
                  open={isEditModalOpen}
                  onClose={handleCloseEditModal}
                  transaction={selectedTx}
                  itemId={itemId}
                  mode="Edit"
                />
              }
              {isAddModalOpen && 
                <AddAndEditTransactionModal
                  open={isAddModalOpen}
                  onClose={handleCloseAddModal}
                  itemId={itemId}
                  mode="Add"
                />
              }
            </section>
          </div>
        </div>
      </>
    )
}