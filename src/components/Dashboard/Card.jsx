import React from 'react'

export default function Card({account}) {
    const subtype = account?.subtype?? 'N/A';
    const formattedSubtype = subtype
        ? subtype
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "";
    return (
        <>
            <div className="text-white p-4 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl shadow-xl font-mono">
                <div className="mb-6 text-lg lg:text-2xl font-semibold tracking-widest">
                    Chase Bank
                </div>

                <p className="text-lg lg:text-2xl tracking-widest mb-6">xxxx xxxx xxxx {account?.mask?? '----'}</p>

                <div className="flex justify-between text-lg">
                    <div>
                        <p className="uppercase opacity-70">Balance</p>
                        <p className="font-medium">${account?.balances?.available?? '0'}</p>
                    </div>
                    <div>
                        <p className="uppercase opacity-70">Type</p>
                        <p className="font-medium">{formattedSubtype}</p>
                      </div>
                    </div>
            </div>
        </>
    )
}