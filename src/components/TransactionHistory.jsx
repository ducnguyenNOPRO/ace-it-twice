import React from 'react'
import { MdArrowOutward } from "react-icons/md";
import { Link } from 'react-router-dom';
import prettyMapCategory from '../constants/prettyMapCategory';

export default function TransactionHistory({ transactions }) {
    if (transactions.length === 0) {
        return <div>No Transactions to Load.</div>
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
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 max-w-full sm:w-fit whitespace-nowrap overflow-hidden
                                ${prettyMapCategory[tx.personal_finance_category.primary].color ??  prettyMapCategory.OTHER.color}
                            `}
                            title={prettyMapCategory[tx.personal_finance_category.primary].name ?? prettyMapCategory.OTHER.name} // optional tooltip
                        >
                            {/* Icon */}
                            <img
                                src={prettyMapCategory[tx.personal_finance_category.primary].icon
                                    || "../../public/icons/badge-question-imark.svg"}
                                alt="Category Icon"
                            />
                            {/* Category Name */}
                            <span className="text-sm font-bold truncate">
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