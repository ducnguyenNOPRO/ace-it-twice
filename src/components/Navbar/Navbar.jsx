import React from 'react'
import "./Navbar.css"
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate();
        
    const goToLogin = () => {
            navigate("/Login");
    }
    return (
        <>
            <div className="flex flex-wrap justify-between sticky top-0 px-20 py-4 shadow-lg ">
                <div className="flex  items-center justify-between gap-x-7">
                    <div>
                        {/*<img src={Logo} className="w-7 h-7"></img>*/}
                        <h1 className="inline text-2xl font-bold text-red-500">A</h1>
                        <h1 className="inline text-2xl text-gray-500 mr-3">ce It Twice</h1>
                    </div>
                    <a className="nav-item" href="#overview">Overview</a>
                    <a className="nav-item">Features</a>
                    <a className="nav-item" href="#contact-us">Contact Us</a>
                </div>

                <button
                    className="cursor-pointer px-7 py-2 bg-orange-400 hover:bg-orange-500 transition text-white font-medium rounded-lg shadow cursor-pointer "
                    onClick={goToLogin}>
                    Log In
                </button>
            </div>
        </>
    )
}