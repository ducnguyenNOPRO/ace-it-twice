import React from 'react'
import { MdArrowOutward } from "react-icons/md";
import { Link } from 'react-router-dom';

export default function TransactionHistory({ transactions }) {
    // List of category with icon and background/text color
    const prettyMapCategory = {
        ENTERTAINMENT: {
            name: "Entertainment",
            color: "bg-purple-100 text-purple-800",
            icon: "../../public/icons/gamepad-2.svg"
        },
        FOOD_AND_DRINK: {
            name: "Food",
            color: "bg-yellow-100 text-yellow-800",
            icon: "../../public/icons/utensils.svg"
        },
        HEALTHCARE: {
            name: "Healthcare",
            color: "bg-red-100 text-red-800",
            icon: "../../public/icons/heart-pulse.svg"
        },
        HOUSING: {
            name: "Housing",
            color: "bg-blue-100 text-blue-800",
            icon: "../../public/icons/house.svg"
        },
        TRANSPORTATION: {
            name: "Transportation",
            color: "bg-green-100 text-green-800",
            icon: "../../public/icons/car.svg"
        },
        UTILITIES: {
            name: "Utilities",
            color: "bg-indigo-100 text-indigo-800",
            icon: "../../public/icons/wrench.svg"
        },
        SHOPPING: {
            name: "Shopping",
            color: "bg-pink-100 text-pink-800",
            icon: "../../public/icons/shirt.svg"
        },
        INCOME: {
            name: "Income",
            color: "bg-green-100 text-green-800",
            icon: "../../public/icons/piggy-bank.svg"
        },
        TRANSFER_IN: {
            name: "Transfer",
            color: "bg-gray-100 text-gray-800",
            icon: "../../public/icons/circle-arrow-down.svg"
        },
        TRANSFER_OUT: {
            name: "Transfer",
            color: "bg-gray-100 text-gray-800",
            icon: "../../public/icons/circle-arrow-up.svg"
        },
        BANK_FEES: {
            name: "Bank fees",
            color: "bg-rose-100 text-rose-800",
            icon: "../../public/icons/receipt-text.svg"
        },
        LOAN_PAYMENTS: {
            name: "Loans",
            color: "bg-orange-100 text-orange-800",
            icon: "../../public/icons/hand-coins.svg"
        },
        INVESTMENTS: {
            name: "Investments",
            color: "bg-teal-100 text-teal-800",
            icon: "../../public/icons/chart-line.svg"
        },
        PERSONAL_CARE: {
            name: "Personal Care",
            color: "bg-fuchsia-100 text-fuchsia-800",
            icon: "../../public/icons/sparkles.svg"
        },
        RECURRING_SUBSCRIPTION: {
            name: "Subscription",
            color: "bg-cyan-100 text-cyan-800",
            icon: "../../public/icons/bell-plus.svg"
        },
        TRAVEL: {
            name: "Travel",
            color: "bg-sky-100 text-sky-800",
            icon: "../../public/icons/plane.svg"
        },
        OTHER: {   // Default
            name: "Other",
            color: "bg-zinc-100 text-zinc-800",
            icon: "../../public/icons/badge-question-imark.svg"
        }
    }
    
    return (
        <>
            <div className="flex justify-between">
                <h1 className="font-semibold text-xl text-black tracking-wider mb-6">Transaction history</h1> 
                    <Link to="/Transaction">
                        <div
                            className="flex items-center gap-1 p-1 rounded-lg group cursor-pointer hover:bg-gray-200 hover:scale-110 transition"> 
                            View Full
                            <MdArrowOutward />
                        </div>
                    </Link>                 
            </div>
 
            <div className="grid grid-cols-[1.5fr_1fr_0.5fr] gap-x-10 gap-y-5 text-black ">
                {/* Column */}
                <div className="font-semibold text-gray-400">Merchant</div>
                <div className="font-semibold text-gray-400">Category</div>
                <div className="font-semibold text-gray-400">Amount</div>
                {/* Row */}
                {transactions.map((tx) => (
                    <React.Fragment key={tx.transaction_id}>
                        {/* Merchant Name: allow wrapping */}
                        <div className="overflow-hidden truncate">
                            {tx.merchant_name || tx.name}
                        </div>

                        {/* Category pill: force single line, ellipsis if too long */}
                            {/* Background and text color */}
                            <div
                            className={`inline-flex items-center rounded-full px-3 py-1 max-w-full sm:w-fit whitespace-nowrap overflow-hidden
                                ${prettyMapCategory[tx.personal_finance_category.primary].color || "bg-zinc-100 text-zinc-800"}
                            `}
                            title={prettyMapCategory[tx.personal_finance_category.primary].name || "Other"} // optional tooltip
                        >
                            {/* Icon */}
                            <img
                                src={prettyMapCategory[tx.personal_finance_category.primary].icon || "../../public/icons/badge-question-imark.svg"}
                                alt="Category Icon"
                                className="mr-2 flex-shrink-0"
                            />
                            {/* Category Name */}
                            <span className="text-sm text-purple-800 font-medium truncate">
                                {prettyMapCategory[tx.personal_finance_category.primary].name || "Other"}
                            </span>
                            </div>    

                        {/* Amount */}
                        <div className={tx.amount > 0 ? "text-red-500" : "text-green-500"}>
                        {tx.amount > 0 ? `-$${tx.amount}` : `$${Math.abs(tx.amount)}`}
                        </div>
                        <span className="col-span-3 h-px bg-gray-200 block"></span>
                    </React.Fragment>
                ))}
            </div>
        </>
    )
}