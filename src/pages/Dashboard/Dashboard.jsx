import React, { useState, useMemo } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import Card from '../../components/Dashboard/Card'
import TopCategories from '../../components/Dashboard/TopCategories'
import TransactionHistory from '../../components/TransactionHistory'
import './Dashboard.css'
import { useAuth } from '../../contexts/authContext'
import MonthlySpending from '../../components/Dashboard/MontlySpending'
import { getMonthlySpendingData, getSpendingDataByCategorySorted } from '../../util/spendingData'
import { useQuery } from '@tanstack/react-query'
import { createRecentTransactionsQueryOptions, createAccountsQueryOptions, createMonthlyTransactionsQueryOptions} from '../../util/createQueryOptions'
import { useItemId } from '../../hooks/useItemId'

export default function Dashboard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentUser } = useAuth();
  const { itemId } = useItemId(currentUser.uid);
  const { data: recentTransactionsResponse, isLoading: loadingTransactions } = useQuery(
    createRecentTransactionsQueryOptions(
      { itemId },
      {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        enabled: !!itemId
      }
    ))
  const { data: monthlyTransactionsResponse, isLoading: loadingMonthlyTransactions } = useQuery(
    createMonthlyTransactionsQueryOptions(
      { itemId},
      {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        enabled: !!itemId
      }
    )
  )
  const { data: accounts, isLoading: loadingAccounts } = useQuery(
    createAccountsQueryOptions({ itemId },
      {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }))

  const recentTransactions = recentTransactionsResponse?.recentTransactions ?? [];
  const monthlyTransactions = monthlyTransactionsResponse?.monthlyTransactions ?? [];

  //return { "MMM YYYY", totalSpending: int}
  const monthlySpendingData = useMemo(() => getMonthlySpendingData(monthlyTransactions), [monthlyTransactions]);

  
  const categorySpendingData = useMemo(() => getSpendingDataByCategorySorted(monthlyTransactions), [monthlyTransactions]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? accounts.length - 1 : prev - 1));
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === accounts.length - 1 ? 0 : prev + 1));
  }

  console.log("MonthlySpending", monthlySpendingData)
  if (loadingTransactions || loadingAccounts || loadingMonthlyTransactions) {
    return <div>Loading...</div>
  }
  return (
    <>
      <div className="flex h-screen text-gray-500">
        {/* Sidebar */}
        <Sidebar />     
        
        {/* Page Content*/}
        <div className="mx-5 flex-1 overflow-auto">
          {/* Topbar*/}
          <Topbar pageName='Dashboard' userFirstInitial={currentUser.displayName?.charAt(0)} />

          {/* Main Content */}
          <main className="mb-10">
            <div className="flex flex-col md:flex-row justify-between gap-6 w-full p-5 ">

              {/* Card Section */}
              <section className="border border-gray-200 rounded-lg shadow-2xl p-5">
                  <h1 className="mb-3 font-semibold text-xl text-black tracking-wider">Card</h1>
            
                {/* Cards */}
                {loadingAccounts
                  ? <p>Loading Bank Accounts</p>
                  :
                  <div className="flex gap-x-1">
                    <button
                      onClick={handlePrev}
                      title="Previous Card"
                      className="font-semibold text-4xl text-blue-600 tracking-wider cursor-pointer">
                      {"<"}
                    </button>

                    <Card account={accounts[currentIndex]} />

                    <button
                      onClick={handleNext}
                      title="Next Card"
                      className="font-semibold text-4xl text-blue-600 tracking-wider cursor-pointer">
                      {">"}
                    </button>
                  </div>
                }
              </section>

              {/* Charts */}
              <section className="grow border border-gray-200 rounded-lg shadow-2xl py-6 px-5 h-70">
                <h1 className="font-semibold text-xl text-black tracking-wider">Monthly Spending</h1>
                <MonthlySpending monthlySpendingData={monthlySpendingData} />
              </section>
            </div>


            <section className="flex flex-col lg:flex-row gap-6 w-full p-5">
              {/* Transaction History */}
              <div className="lg:w-1/2 border border-gray-200 rounded-lg shadow-2xl p-6"> 
                <TransactionHistory recentTransactions={recentTransactions} />  
              </div>

              {/* Top catogories */}
              <div className="lg:w-1/2 border-gray-200 rounded-lg shadow-2xl p-6">
                <h1 className="font-semibold text-xl text-black tracking-wider">Top categories</h1>
                <TopCategories
                  categorySpendingData={categorySpendingData}
                />
              </div>
            </section>

          </main>

        </div>
      </div>
    </>
  )
}

