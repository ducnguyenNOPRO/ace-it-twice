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
  const { itemId, loadingItemId } = useItemId(currentUser.uid);
  const queryClient = useQueryClient();
  const [lastDocumentIds, setLastDocumentIds] = useState({})
  const [paginationModel, setPaginationModel] = useState({  // Manually handle page model
    page: 0,
    pageSize: 5
  })
  const [rowSelectionModel, setRowSelectionModel] = useState({  // Manually handle row model
    type: "include",
    ids: new Set(),
  });
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Delete a single a transaction
  const handleDeleteSingleTransaction = useCallback(async (row) => {
    setIsDeleting(true);
    const transactionToDeleteId = row.id || row.transaction_id;
    await deleteSingleTransaction(transactionToDeleteId, itemId);
    setIsDeleting(false);
    refetchTransactions();
  }, [itemId, refetchTransactions]);

  // Delete many transaction at once
  const handleDeleteBatchTransactions = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteBatchTransaction(selectedRowIds, itemId);

    if (result?.success) { 
      refetchTransactions();
      setSelectedRowCount(0);
      setSelectedRowIds([]);
    }
    setIsDeleting(false);
  }, [selectedRowIds, itemId, refetchTransactions])

  const handleRowSelectionChange = useCallback((newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel)
    let ids = [];
    if (newRowSelectionModel?.type === 'include') {
      // "include" type --> selected transactions stored in ids Set
      setSelectedRowCount(newRowSelectionModel.ids.size);
      setSelectedRowIds(Array.from(newRowSelectionModel.ids)); // Convert Set to Array
      return;
    }
    if (newRowSelectionModel?.type === 'exclude') {
      const excluded = newRowSelectionModel.ids || new Set();
      // "exclude" type --> transactions that are not selected are store in ids.
      // Keep the selected transactions by filtering the non selected txs
      ids = transactions.filter(row => !excluded.has(String(row.id))).map(row => row.id);
      setSelectedRowIds(ids);
      setSelectedRowCount(ids.length);
    }

  }, [transactions]) // same function

  const handlePaginationModelChange = useCallback((newModel) => {
    // Reset row selection model
    // Uncheck all rows
    setRowSelectionModel({ type: "include", ids: new Set() });
    setPaginationModel(newModel);

    setSelectedRowCount(0);
    setSelectedRowIds([]);
  }, []);

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
        <span className={params.value > 0 ? 'text-green-600' : 'text-red-500'}>
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
          isDeleting={isDeleting}
        />
      )
    }
  ], [handleOpenEditModal, handleDeleteSingleTransaction]);

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
            <div className="flex items-center justify-between mb-2 mx-2 gap-3">
              {/* Search transaction */}
              <SearchTransaction onSearch={setSearchQuery} />
      
              <div className="flex items-center gap-3">
                {/* Add transaction */}    
                <button
                  className="flex items-center gap-1 py-1 px-3 bg-green-500 text-white rounded-md font-medium hover:opacity-80 transition cursor-pointer"
                  onClick={handleOpenAddModal}
                >
                  <IoAddCircleSharp/>
                  <span>Add Transaction</span>
                </button>
                {/* Delete batch transaction */}    
                <button
                  className="flex items-center gap-1 py-1 px-3 bg-red-600 text-white rounded-md font-medium hover:opacity-80 transition cursor-pointer"
                  onClick={handleDeleteBatchTransactions}
                  disabled={isDeleting}
                >
                  <IoAddCircleSharp />
                  <span>
                    {
                      isDeleting ? "Deleting..." 
                        : selectedRowCount > 0 ? `Delete Selected (${selectedRowCount})` : 'Delete'
                    }

                  </span>
                </button>
              </div>
            </div>

            <section>
              <div className="w-full">
                <DataGrid
                  rows={transactions}
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
                  rowSelectionModel={rowSelectionModel}
                  hideFooterPagination={loadingTransactions}
              />
              </div>
              {isEditModalOpen && 
              <AddAndEditTransactionModal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                setPaginationModel={setPaginationModel}
                setLastDocumentIds={setLastDocumentIds}
                transaction={selectedTx}
                itemId={itemId}
                paginationModel={paginationModel}
                lastDocumentIds={lastDocumentIds}
                mode="Edit"
              />
              }
              {isAddModalOpen && 
              <AddAndEditTransactionModal
                open={isAddModalOpen}
                onClose={handleCloseAddModal}
                setPaginationModel={setPaginationModel}
                setLastDocumentIds={setLastDocumentIds}
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