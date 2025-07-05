import React from 'react' 
import Phone from '../assets/Phone.png'
import Email from '../assets/Email.png'

export default function Footer() {
    return (
        <> 
            <div className="flex items-center bg-gray-700 text-white px-30 py-10 h-50">
                <div className="flex flex-col gap-5 w-full h-full">
                    <div>
                        <h1 className="inline text-2xl font-bold text-red-500">A</h1>
                        <h1 className="inline text-2xl mr-3">ce It Twice</h1>
                    </div> 
                    

                    <div className="flex flex-col gap-2">
                        <div>
                            <img src={Phone} className="inline h-7 w-7 mr-2 invert-70" />
                            <span className="tracking-wider">email@gmail.com</span>
                        </div>
                        <div>
                            <img src={Email} className="inline h-7 w-7 mr-2 invert-70" />              
                            <span className="tracking-wider">123-456-7890</span>
                        </div>        
                    </div>
                </div>
                <div className="flex flex-col p-4">
                    <p className="py-2">Get the latest new from us</p>
                    <form className="flex gap-5">
                        <input
                            type="text"
                            placeholder="Your email address..."
                            className="text-black tracking-wider bg-white p-1 rounded-md shadow-md">   
                        </input>
                        <button className="px-6 py-2 bg-orange-400 text-white rounded-lg shadow font-medium hover:bg-orange-500 transition">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}