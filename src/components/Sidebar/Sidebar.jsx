import React from 'react'
import './Sidebar.css'
import { signUserOut } from '../../firebase/authHelpers';
import { MdOutlineSpaceDashboard } from "react-icons/md"
import { AiOutlineTransaction } from "react-icons/ai";
import { IoPricetagOutline } from "react-icons/io5";
import { GoGoal } from "react-icons/go";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate } from 'react-router-dom'


export default function Sidebar() {
    const navigate = useNavigate();

    const goToDashboard = () => {
        navigate("/Dashboard")
    }
    const goToTransaction = () => {
        navigate("/Transaction")
    }
    const goToSpendingPlan = () => {
        navigate("/Categories")
    }
    const goToGoal = () => {
        navigate("/Goal")
    }

    const onLogOut = () => {
        signUserOut();
        navigate("/")
    }
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
                        <li onClick={goToDashboard}>
                            <MdOutlineSpaceDashboard />
                           Dashboard
                        </li>
                        <li onClick={goToTransaction}>
                            <AiOutlineTransaction  />
                            Transaction
                        </li>
                        <li onClick={goToSpendingPlan}>
                            <IoPricetagOutline />
                                SpendingPlan
                        </li>
                        <li onClick={goToGoal}>
                            <GoGoal />
                            Goal
                        </li>
                    </ul>
                      
                    {/* Bottom section */}
                    <ul className="mt-auto mb-10">
                        <li>
                            <IoIosHelpCircleOutline />
                            Help
                        </li>
                        <li onClick={onLogOut}>
                            <IoIosLogOut  />
                            Log out
                        </li>
                    </ul>      
                </div>
            </div>
        </>
    )
}