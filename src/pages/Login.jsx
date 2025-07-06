import React from 'react'

export default function Login() {
    return (
        <>  
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Login to Ace-It Twice
                    </h1>

                    {/* Login Form */ }
                    <form>
                        <input
                            type="text"
                            placeholder="Enter your username or email"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500"
                            required
                            autocomplete="username"/>

                        <input
                            type="text"
                            placeholder="Enter your password"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500"
                            required
                            autocomplete="current-password"/>

                        {/* Show/Hide Password Option */}
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="show-password"
                                className="mr-2"/>
                            <label htmlFor="show-password" className="text-gray-700">
                                Show Password
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                            Sign In
                        </button>
                    </form>
                    
                    {/* Forgot Password Link */}
                    <p className="text-sm text-gray-600 mt-4 text-center">
                        <a href="/Forgot-password" className="text-blue-500 hover:underline">
                            Forgot password?
                        </a>
                    </p>

                    {/* Register Link */}
                    <p className="text-sm text-gray-600 mt-4 text-center">
                        Don’t have an account?{' '}
                        <a href="/Register" className="text-blue-500 hover:underline">
                            Register here.
                        </a>
                    </p>
                </div>
            </div>
        </>
    )
}