import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import Card from '../../components/Card'
import TransactionHistory from '../../components/TransactionHistory'
import './Dashboard.css'
import { useAuth } from '../../contexts/authContext'
import { useItemId } from '../../hooks/useItemId'
import { useTransactions } from '../../hooks/useTransactions'
import {useAccounts} from '../../hooks/useAccounts'


const TopCategories = () => {
  const topCategories = [
  { name: "Food", amount: 420, percentage: 42, color: "bg-red-400" },
  { name: "Transport", amount: 250, percentage: 25, color: "bg-yellow-400" },
  { name: "Entertainment", amount: 180, percentage: 42, color: "bg-blue-400" },
];
  return (
    <>
      <div className="border border-gray-200 rounded-lg shadow-2xl p-6"> 
        <h1 className="font-semibold text-xl text-black tracking-wider mb-6">Top categories</h1>
        <select className="text-md font-semibold border rounded px-2 py-1">
          <option>This month</option>
          <option>Last month</option>
          <option>Last year</option>
        </select>

        <div className="mt-5 grid grid-cols-[0.5fr_80px_1fr] gap-5">
          {topCategories.map((cat, i) => (
            <React.Fragment key={i}>
              {/* Icon + Name */}
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${cat.color}`}></span>
                <span>{cat.name}</span>
              </div>

              {/* Amount */}
              <div className="text-md font-medium text-gray-700 text-right">
                ${cat.amount}
              </div>

              {/* Progress bar */}
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

      </div>
          
    </>
  )
}


export default function Dashboard() {    
  const { currentUser } = useAuth();
  const { itemId, loadingItemId } = useItemId(currentUser.uid)
  const { transactions, loadingTransactions } = useTransactions(currentUser.uid, itemId);
  const { accounts, loadingAccounts } = useAccounts(currentUser.uid, itemId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? accounts.length - 1 : prev - 1));
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === accounts.length - 1 ? 0 : prev + 1));
  }

  if (loadingItemId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
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
          <div className="px-6 mb-10">
            <div className="flex flex-wrap justify-between gap-6 w-full p-5 ">

              {/* Card Section */}
              <section className="border border-gray-200 rounded-lg shadow-2xl p-5">
                  <h1 className="mb-3 font-semibold text-xl text-black tracking-wider">Card</h1>
            
                {/* Cards */}
                {loadingAccounts
                  ? <p>Loading Transactions</p>
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
              <div className="grow border border-gray-200 rounded-lg shadow-2xl p-6">
                <p className="text-xl">Some Chart go here</p>
              </div>
            </div>


            <section className="flex flex-wrap gap-6 w-full p-5">
              {/* Transaction History */}
              <div className="border border-gray-200 rounded-lg shadow-2xl p-6"> 
                {loadingTransactions
                  ? <p>Loading Transactions</p>  
                  : <TransactionHistory transactions={transactions.slice(0,3)} />
                }  
              </div>
              {/* Top catogories */}
              <div className="grow">
                <TopCategories />
              </div>
            </section>

          </div>

        </div>
      </div>
    </>
  )
}

