import React from 'react'

export default function TransactionHistory({ transactions }) {
    return (
        <>
            <h1 className="font-semibold text-xl text-black tracking-wider mb-6">Transaction history</h1>    
            <div className="grid grid-cols-[1fr_1.5fr_0.5fr] gap-x-5 gap-y-5 text-black ">
                {/* Header */}
                <div className="font-semibold">Merchant</div>
                <div className="font-semibold">Category</div>
                <div className="font-semibold">Amount</div>
                {/* Row */}
                {transactions.map((tx) => (
                    <React.Fragment key={tx.transaction_id}>
                        <div>{tx.merchant_name ?? "No Merchant"}</div>
                        <div>
                            <img
                                src={tx.personal_finance_category_icon_url}
                                className="w-5 h-5 inline-block align-middle mr-2"
                            />
                            <span className="text-[0.8rem] align-middle">{tx.personal_finance_category.primary}</span>
                        </div>

                        <div
                            className={tx.amount > 0 ? "text-red-500" : "text-green-500"}
                        >
                            {tx.ammount > 0 ? `-$${tx.amount}` : `$${Math.abs(tx.amount)}`}
                        </div>
                        <span className="col-span-3 h-px bg-gray-200 block"></span>
                    </React.Fragment>
                ))}
            </div>
        </>
    )
}