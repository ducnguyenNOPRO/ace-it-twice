import React from 'react'

import { IoSearchSharp } from "react-icons/io5";

export default function Topbar({pageName, userFirstInitial}) {
    return (
        <>
            <div className="flex justify-between items-center pt-5 px-10 h-20">
                <div>
                    <h1 className="text-2xl text-black font-medium">
                        {pageName}
                    </h1>
                </div>
                <div className="flex items-center gap-2 relative">

                    {/* Search transaction */}
                    <div>
                        <IoSearchSharp className="absolute top-1/2 left-2 transform -translate-y-1/2" />
                        <input 
                            id="searchTransaction"
                            placeholder="Search"
                            className="text-center tracking-wider text-lg bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                        <label htmlFor="searchTransaction"></label>
                    </div>
                    
                    <div className="flex items-center justify-center bg-amber-300 w-10 h-10 rounded-full">
                        {userFirstInitial}
                    </div>       
                </div>
            </div>
        </>
    )
}