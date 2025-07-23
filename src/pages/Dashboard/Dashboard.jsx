import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar'
import Card from '../../components/Card'
import TransactionHistory from '../../components/TransactionHistory'
import './Dashboard.css'
import { useAuth } from '../../contexts/authContext'

const BalanceAndIncome = () => {
  return (
    <>
        <div className="flex flex-col gap-5 items-end text-right">
          <div>
            <h1 className="text-blue-500 text-3xl font-bold">$2000</h1>
            <p className="small-text">Current Balance</p>
          </div>
          <div>
            <h2 className="text-green-500 text-2xl font-bold">$1000</h2>
            <p className="small-text">Income</p>
        </div>
      </div>
    </>
  )
}

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
          
  const { currentUser, loading } = useAuth();

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
          <div className="px-6">
            <div className="flex flex-wrap gap-6 w-full p-5 ">
              {/* Balance, Income Section */}
              <section className="border border-gray-200 rounded-lg shadow-2xl p-6">
                <h1 className="font-semibold text-xl text-black tracking-wider mb-6">Card</h1>
                <div className="flex gap-5">
                  {/* Cards */}
                  <Card />
                  <span className="w-px bg-gray-200"></span>
                  {/* Balance, Income */ }
                  <BalanceAndIncome />
                </div>
              </section>

              {/* Charts */}
              <div className="grow border border-gray-200 rounded-lg shadow-2xl p-6">
                <p className="text-xl">Some Chart go here</p>
              </div>
            
            </div>
            {/* Transaction History */}
            <section className="flex flex-wrap gap-6 w-full p-5">
                <TransactionHistory />
              
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

