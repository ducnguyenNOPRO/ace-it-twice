import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {
    registerUserWithEmailAndPassword,
    signInUserWithEmailAndPassword,
    signInWithGoogle
} from '../../firebase/authHelpers'
import { useAuth } from '../../contexts/authContex'

export default function Login() {
    const navigate = useNavigate();
        
    const { user, loading } = useAuth();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard')  // Go to dashboard if already logged in
        }
    }, [user, loading]) 
    
    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        // User must enter both email and passowrd
        if (!email || !password) {
            setErrorMsg("Please enter both your email and password")
            return;
        }

        if (!isSigningIn) { 
            setIsSigningIn(true);
            try {
                await signInUserWithEmailAndPassword(email, password)
            } catch (error) {
                console.error('Error signing in:', error.message)
                console.log('email:', email);
                console.log('password:', password);
                 // Provide specific error messages based on Firebase error codes
                if (error.code === 'auth/invalid-credential') {
                    setErrorMsg('No account found with the provided credentials.');
                } else if (error.code === 'auth/wrong-password') {
                    setErrorMsg('Incorrect password. Please try again.');
                } else if (error.code === 'auth/invalid-email') {
                    setErrorMsg('Invalid email address format. Please check and try again.');
                } else {
                    setErrorMsg('Failed to sign in. Please try again later.');
                }
            } finally {
                setIsSigningIn(false);
            }
        }
    }

    const onGoogleSignIn = async (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            await signInWithGoogle().catch(err => {
                setIsSigningIn(false)
            })
        }
    }
    return (
        <>  
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Login to Ace-It Twice
                    </h1>

                    {/* Login Form */ }
                    <form onSubmit={onSubmit}>
                        <label className="text-sm text-gray-600 font=bold" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your username or email"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500"
                            required
                            value={email}
                            onChange={(e) => {setEmail(e.target.value)}}
                            autoComplete="email" />
                        
                        <label className="text-sm text-gray-600 font=bold" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500"
                            required
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}
                            autoComplete="current-password"/>
                        {errorMsg && (
                            <span className="text-red-600 font-bold">{errorMsg }</span>
                        )}
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
                            disabled={isSigningIn}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                            {isSigningIn ? 'Signing In' : 'Sign In'}
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