import React from "react"
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Logo from '../assets/Logo.png'
import Finance from '../assets/Finance.png'
import Footer from '../components/Footer'

export default function Home() {
    const navigate = useNavigate();
    
    const goToLogin = () => {
        navigate("/Login");
    }

    return (
        <>
            <Navbar />

            {/*Overview*/}
            <section id="overview" className="flex items-center w-full h-[70vh] mt-20 px-25">
                <div className="flex  flex-col justify-center gap-10  grow font-semibold">
                    <h1 className="text-6xl">
                        <span className="text-red-500">A</span>
                        <span>ce It Twice</span>
                    </h1>
                    <p className="text-[1.2rem] font-normal">
                        A finance tool for students.
                        Budget, save, plan & reach all your financial goals.
                    </p>
                    <button
                        className="self-start w-fit px-8 py-3 bg-orange-400 hover:bg-orange-500 transition text-white rounded-2xl shadow cursor-pointer"
                        onClick={goToLogin}>
                        Log In
                    </button>
                </div>
                <div className=" grow-[1.5] flex justify-center items-center h-full">
                    <img src={Finance} className="w-full h-full object-contain"></img>
                </div>
            </section>
            
            {/*Footer*/}
            <section id="contact-us">
                <Footer />
            </section>

        </>
    )
}