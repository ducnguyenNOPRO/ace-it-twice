import React, { useState} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import {registerUserWithEmailAndPassword} from '../../firebase/authHelpers'
import { useAuth } from '../../contexts/authContext'

export default function Register() {
    const navigate = useNavigate();
    const { loading } = useAuth();

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordComfirmation] = useState('')
    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercse: false,
        numeric: false
    })
    const [showPassword, setShowPassword] = useState(false); // Checkbox to show password
    const [errorMsg, setErrorMsg] = useState(null)

    // Validate password on change
    const onPasswordChange = (value) => {
        setPassword(value);
        setPasswordValidations({
            length: value.length >= 6,
            uppercase: /[A-Z]/.test(value),
            numeric: /[0-9]/.test(value),
        })
        setErrorMsg(null)
    }

    // Validate password on submit
    const passwordValidation = (password) => {
        if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            setErrorMsg("Password does not meet the requirements")
            return false;
        }
        return true;
    }

    // Log in with Email and Password
    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        // User must enter email,password and password confirmation
        if (!fullName || !email || !password || !passwordConfirmation) {
            setErrorMsg("Please enter all your field")
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMsg("Password do not match")
            return
        }

        if (!passwordValidation(password)) {
            return
        }
        console.log("Passed validation");
        try {
            await registerUserWithEmailAndPassword(email, password, fullName);
            navigate("/Account/Login")  // back to login page after succesfull created account
        } catch (error) {
            if (error.code === "auth/weak-password") {
                setErrorMsg("Weak password - Password must be at least 6 characters")
            } else if (error.code === "auth/email-already-in-use") {
                setErrorMsg("Email is already in use")
            } else {
                setErrorMsg(error.code)
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
                        Create An Account
                    </h1>

                    {/* Email Password log in Form */ }
                    <form onSubmit={onSubmit}>

                        <label className="text-sm text-gray-600 font=bold" htmlFor="full-name">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="full-name"
                            placeholder="Enter your username"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
                            required
                            value={fullName}
                            onChange={(e) => {setFullName(e.target.value)}}
                            autoComplete="email" />
                        <label className="text-sm text-gray-600 font=bold" htmlFor="email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
                            required
                            value={email}
                            onChange={(e) => {setEmail(e.target.value)}}
                            autoComplete="email" />
                        
                        <label className="text-sm text-gray-600 font=bold" htmlFor="password">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
                            required
                            value={password}
                            onChange={(e) => {onPasswordChange(e.target.value) }}
                            autoComplete="current-password" />
                        
                        <label className="text-sm text-gray-600 font=bold" htmlFor="passwordConfirmation">
                            Confirm Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="passwordConfirmation"
                            placeholder="Enter your password"
                            className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
                            required
                            value={passwordConfirmation}
                            onChange={(e) => {setPasswordComfirmation(e.target.value)}}
                            autoComplete="current-password" />
                        
                         <div className="text-left mb-4">
                            {/* Password Validation Messages */}
                            <p className={`text-sm ${passwordValidations.length ? "text-green-500" : "text-red-500"}`}>
                                • Minimum password length of 6 characters
                            </p>
                            <p className={`text-sm ${passwordValidations.uppercase ? "text-green-500" : "text-red-500"}`}>
                                • At least one uppercase character
                            </p>
                            <p className={`text-sm ${passwordValidations.numeric ? "text-green-500" : "text-red-500"}`}>
                                • At least one numeric character
                            </p>
                        </div>
                        {errorMsg && (
                            <span className="text-red-600 font-bold">{errorMsg }</span>
                        )}

                        {/* Show/Hide Password Option */}
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="show-password"
                                checked={showPassword}
                                onChange={() => setShowPassword((prev) => !prev)}
                                className="mr-2"/>
                            <label htmlFor="show-password" className="text-gray-700">
                                Show Password
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                            Create Account
                        </button>
                    </form>

                    {/* Return to Login */}
                    <p className="text-sm text-gray-600 mt-4 text-center">
                        Already have an account?{' '}
                        <Link to="/Account/Login" className="text-blue-500 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}