import React from 'react'

export default function Card() {
    return (
        <>
            <div className="text-white p-4 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl shadow-xl font-mono">
                <div className="mb-6 text-lg font-semibold tracking-widest">
                    Chase Bank
                </div>

                <p className="text-xl tracking-widest mb-6">1234 5678 9012 3456</p>

                <div className="flex justify-between text-xs">
                    <div>
                        <p className="uppercase opacity-70">Card Holder</p>
                        <p className="font-medium">Mike Nguyen</p>
                    </div>
                    <div>
                        <p className="uppercase opacity-70">Exp Date</p>
                        <p className="font-medium">06/21</p>
                      </div>
                    </div>
            </div>
        </>
    )
}