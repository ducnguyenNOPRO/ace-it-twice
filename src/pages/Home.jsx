import React from "react"
import Navbar from '../components/Navbar/Navbar'
import Logo from '../assets/Logo.png'
import Finance from '../assets/Finance.png'
import Footer from '../components/Footer'

export default function Home() {
    return (
        <>
            <Navbar />

            {/*Overview*/}
            <section id="overview" className="flex items-center w-full h-[70vh] mt-20 px-25">
                <div className="flex h-full gap-10 justify-center flex-col flex-wrap basis-0 grow font-semibold">
                    <h1 className="text-6xl">
                        <span className="text-red-500">A</span>
                        <span>ce It Twice</span>
                    </h1>
                    <p className="text-[1.2rem] font-normal">
                        A finance tool for students.
                        Budget, save, plan & reach all your financial goals.
                    </p>
                    <button className="self-start w-fit px-8 py-3 bg-orange-400 text-white font-md rounded-2xl shadow ">
                        Log In
                    </button>
                </div>
                <div className="basis-0 grow-[1.5] flex justify-center items-center h-full">
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