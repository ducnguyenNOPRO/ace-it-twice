import React from 'react'

export default function Transaction() {
    return (
        <>
            <div className="border border-gray-200 rounded-lg shadow-2xl p-6"> 
                <h1 className="font-semibold text-xl text-black tracking-wider mb-6">Transaction history</h1>    
                <div className="grid grid-cols-[2fr_2fr_2fr_1fr] gap-x-10 gap-y-5 ">
                    {/* Header */}
                    <div className="font-semibold">Reciever</div>
                    <div className="font-semibold">Type</div>
                    <div className="font-semibold">Date</div>
                    <div className="font-semibold">Amount</div>
                    {/* Row */}
                    {[1, 2, 3].map((_, i) => (
                        <React.Fragment key={i}>
                            <div>Taco Bell</div>
                            <div>Expense</div>
                            <div>Jul 7, 2025</div>
                            <div className="text-right text-red-500">-$120.00</div>
                            <span className="col-span-4 h-px bg-gray-200 block"></span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </>
    )
}