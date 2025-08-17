import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import Card from '../../components/Dashboard/Card'
import TopCategories from '../../components/Dashboard/TopCategories'
import TransactionHistory from '../../components/TransactionHistory'
import './Dashboard.css'
import { useAuth } from '../../contexts/authContext'
import MonthlySpending from '../../components/Dashboard/MontlySpending'
import { getMonthlySpendingData, getSpendingDataByCategory } from '../../util/spendingData'
import { useQuery } from '@tanstack/react-query'
import { createTransactionsQueryOptions, createAccountsQueryOptions} from '../../util/createQueryOptions'
import { useItemId } from '../../hooks/useItemId'

export default function Dashboard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentUser } = useAuth();
  const { itemId } = useItemId(currentUser.uid);
  const { data: transactions, isLoading: loadingTxs } = useQuery(
    createTransactionsQueryOptions({ itemId },
      {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }));
  const { data: accounts, isLoading: loadingAccs } = useQuery(
    createAccountsQueryOptions({ itemId },
      {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }))
  if (loadingTxs || loadingAccs) {
    return <div>Loading...</div>
  }
  const monthlySpendingData = getMonthlySpendingData(transactions);  //return { "MMM YYYY", totalSpending: int}
  const categorySpendingData = getSpendingDataByCategory(transactions);  //return {totalSpending: int, sortedCategories[{total, icon, color}]}

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? accounts.length - 1 : prev - 1));
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === accounts.length - 1 ? 0 : prev + 1));
  }

  return (
    <>
      <div className="flex h-screen text-gray-500">
        {/* Sidebar */}
        <Sidebar />     
        
        {/* Page Content*/}
        <div className="flex-1 overflow-auto">
          {/* Topbar*/}
          <Topbar pageName='Dashboard' userFirstInitial={currentUser.displayName?.charAt(0)} />

          {/* Main Content */}
          <main className="px-6 mb-10">
            <div className="flex flex-wrap justify-between gap-6 w-full p-5 ">

              {/* Card Section */}
              <section className="border border-gray-200 rounded-lg shadow-2xl p-5">
                  <h1 className="mb-3 font-semibold text-xl text-black tracking-wider">Card</h1>
            
                {/* Cards */}
                {loadingAccs
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
                <MonthlySpending data={monthlySpendingData} />
              </section>
            </div>


            <section className="flex flex-wrap gap-6 w-full p-5">
              {/* Transaction History */}
              <div className="w-fit lg:w-1/2 border border-gray-200 rounded-lg shadow-2xl p-6"> 
                <TransactionHistory transactions={transactions?.slice(0,3)} />  
              </div>
              {/* Top catogories */}
              <div className="grow md:w-fit border-gray-200 rounded-lg shadow-2xl p-6">
                <TopCategories data={categorySpendingData} />
              </div>
            </section>

          </main>

        </div>
      </div>
    </>
  )
}

