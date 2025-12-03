import React from 'react'
import { MdArrowOutward } from "react-icons/md";
import { Link } from 'react-router-dom';
import {prettyMapCategory} from '../constants/prettyMapCategory';

export default function TransactionHistory({ recentTransactions }) {
    if (recentTransactions.length == 0) {
        return <div>No Recent Transactions.</div>
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
 
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-5 gap-y-5 text-black ">
                {/* Column */}
                <div className="font-semibold text-gray-400">Merchant</div>
                <div className="font-semibold text-gray-400">Category</div>
                <div className="font-semibold text-gray-400">Amount</div>
                {/* Row */}
                {recentTransactions.map((tx) => (
                    <React.Fragment key={tx.transaction_id}>
                        {/* Merchant Name: allow wrapping */}
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            {/* Merchant name should shrink only when necessary */}
                            <span className="truncate" title={tx.merchant_name || tx.name}>
                                {tx.merchant_name || tx.name}
                            </span>

                            {/* Account name + mask should truncate first */}
                            <span 
                                className="text-gray-400 text-sm font-medium truncate"
                                title={`${tx.account_name} • ${tx.account_mask}`}>
                                {tx.account_name} • {tx.account_mask}
                            </span>
                        </div>

                        {/* Category pill: force single line, ellipsis if too long */}
                            {/* Background and text color */}
                        <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 sm:w-fit overflow-hidden
                                ${prettyMapCategory[tx.category].color ??  prettyMapCategory.Other.color}
                            `}
                            title={tx.cateogry ?? prettyMapCategory.Other.name} // optional tooltip
                        >
                            {/* Icon */}
                            <img
                                src={prettyMapCategory[tx.category].icon
                                    || "/icons/badge-question-imark.svg"}
                                alt="Category Icon"
                                className="m-auto"
                            />
                            {/* Category Name */}
                            <span className="text-sm font-bold sm:truncate hidden md:inline">
                                {tx.category || "Other"}
                            </span>
                        </div>    

                        {/* Amount */}
                        <div className={tx.amount < 0 ? "text-red-500" : "text-green-500"}>
                            {tx.amount < 0 ? `-$${Math.abs(tx.amount)}`:  `${tx.amount}`}
                        </div>
                        <span className="col-span-3 h-px bg-gray-200 block"></span>
                    </React.Fragment>
                ))}
            </div>
        </>
    )
}