import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/authContext'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar/Topbar'
import './Transaction.css'

export default function Transaction() {
    const { currentUser, loading } = useAuth();

    // Redirects to the login page if no user is logged in.
    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
            navigate("/Account/Login")  // Redirect to login page if not authenticated
            }

        }
    }, [currentUser, loading]);

        // Show a loading indicator while authentication state is being determined
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }
    return (
        <>
            <div className="flex h-screen text-gray-500">
                {/* Sidebar */}
                <Sidebar />     
                
                {/* Page Content*/}
                <div className="flex-1 overflow-auto">
                    {/* Topbar*/}
                    <Topbar pageName='Dashboard' userFirstInitial={currentUser.displayName?.charAt(0)}/>
                    
                    <span className="w-full h-px bg-gray-200 block my-5"></span>
                    <section className="px-6">
                        
                        <div className="text-black grid grid-cols-[2fr_1fr_2fr_2fr_1.5fr_80px] gap-y-3 items-center">
                            {/* Header */}
                            <div className="table-header">Account</div>
                            <div className="table-header">Date</div>
                            <div className="table-header">Company</div>
                            <div className="table-header">Category</div>
                            <div className="table-header">Amount</div>
                            <div className="table-header">Action</div>
                            
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="contents group">
                                    <p className=" py-2 px-3 group-hover:bg-blue-50">Chase Sapphire</p>
                                    <p className=" py-2 px-3 group-hover:bg-blue-50 font-bold ">Jul 7, 2025</p>
                                    <p className=" py-2 px-3 group-hover:bg-blue-50">Taco Bell</p>
                                    <p className=" py-2 px-3 group-hover:bg-blue-50">Food</p>
                                    <p className=" py-2 px-3 group-hover:bg-blue-50 font-bold">$120.00</p>
                                    <button className="rounded-full py-2 text-white bg-orange-400 hover:bg-orange-300 ">View</button>
                                    <span className="col-span-6 h-px bg-gray-200 block"></span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}