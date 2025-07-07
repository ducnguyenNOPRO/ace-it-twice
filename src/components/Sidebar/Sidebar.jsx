import React from 'react'
import './Sidebar.css'
import { MdOutlineSpaceDashboard } from "react-icons/md"
import { AiOutlineTransaction } from "react-icons/ai";
import { IoPricetagOutline } from "react-icons/io5";
import { GoGoal } from "react-icons/go";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";


export default function Sidebar() {
    return (
        <>
            <div className="w-60 not-sm:w-35 bg-gray-100 font-medium">
                <div className="flex flex-col pt-7 h-full">
                    {/* Logo */}
                    <div className="text-center">
                        <h1 className="inline text-2xl font-bold text-red-500">A</h1>
                        <h1 className="inline text-2xl">ce It Twice</h1>
                    </div>
                    
                    {/* Navigation links */}
                    <ul className="flex flex-col mt-10 p-0">
                        <li>
                            <MdOutlineSpaceDashboard />
                            Dashboard
                        </li>
                        <li>
                            <AiOutlineTransaction  />
                            Transaction
                        </li>
                        <li>
                            <IoPricetagOutline />
                            Categories
                        </li>
                        <li>
                            <GoGoal />
                            Goals
                        </li>
                    </ul>
                      
                    {/* Bottom section */}
                    <ul className="mt-auto mb-10">
                        <li>
                            <IoIosHelpCircleOutline />
                            Help
                        </li>
                        <li>
                            <IoIosLogOut  />
                            Log out
                        </li>
                    </ul>      
                </div>
            </div>
        </>
    )
}