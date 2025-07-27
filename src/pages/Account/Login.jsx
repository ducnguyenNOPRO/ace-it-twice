import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import {
    signInUserWithEmailAndPassword,
    signInWithGoogle,
    signInWithFacebook
} from '../../firebase/authHelpers'
import { useAuth } from '../../contexts/authContext'
import { FcGoogle } from "react-icons/fc";
import { ImFacebook2 } from "react-icons/im";

export default function Login() {
    const navigate = useNavigate();
        
    const { currentUser, loading } = useAuth();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [showPassword, setShowPassword] = useState(false); // Checkbox to show password

    useEffect(() => {
        if (!loading && currentUser) {
            navigate('/setting')  // Go to dashboard if already logged in
        }
    }, [currentUser, loading]) 
    
    // Log in with Email and Password
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

    // Log In with Google
    const onGoogleSignIn = async (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            try {
                await signInWithGoogle()
                navigate('/setting')
            } catch (error) {
                console.error("Google sign-in failed:", error);
            } finally {
                setIsSigningIn(false);
            }
        }
    }

    // Log In wit Facebook
    const onFacebookSignIn = async (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            try {
                await signInWithFacebook()
                navigate('/setting')
            } catch (error) {
                console.error("Facebook sign-in failed:", error);
            } finally {
                setIsSigningIn(false);
            }
        }
    }
    
        if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }
    return (
        <>  
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Login to Ace-It Twice
                    </h1>

                    {/* Email Password log in Form */ }
                    <form onSubmit={onSubmit}>
                        <label className="text-sm text-gray-600 font=bold" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your username or email"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
                            required
                            value={email}
                            onChange={(e) => {setEmail(e.target.value)}}
                            autoComplete="email" />
                        
                        <label className="text-sm text-gray-600 font=bold" htmlFor="password">
                            Password
                        </label>
                        <input
                            type={ showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
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
                                checked = {showPassword}
                                onChange={() => setShowPassword((prev) => !prev)}
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
                        <Link to="/Account/Forgot-password" className="text-blue-500 hover:underline">
                            Forgot password?
                        </Link>
                    </p>
                    
                    <div className="mt-3 flex justify-around text-gray-500">
                        <button
                            type="button"
                            className="flex items-center gap-2 p-2 shadow-lg border border-b-black border-gray-200  rounded-md cursor-pointer"
                            onClick={onGoogleSignIn}>
                            <FcGoogle />
                            <span>Sign In with Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-2 p-2 shadow-lg border border-b-black border-gray-200  rounded-md cursor-pointer"
                            onClick={onFacebookSignIn}>
                            <ImFacebook2 className="text-blue-500" />
                            <span>Sign In with Facebook</span>
                        </button>
                    </div>

                    {/* Register Link */}
                    <p className="text-sm text-gray-600 mt-4 text-center">
                        Don’t have an account?{' '}
                        <Link to="/Account/Register" className="text-blue-500 hover:underline">
                            Register here.
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}