import React, {useState} from 'react'
import { useAuth } from '../../contexts/authContext'
import { useNavigate, Link } from 'react-router-dom';
import { passwordReset } from '../../firebase/authHelpers';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const { currentUser, loading } = useAuth();
    const [message, setMessage] = useState(null)  // Succeed messsage
    const [errorMsg, setErrorMsg] = useState(null)
    const navigate = useNavigate();

        // Redirect logged-in users to the homepage
    if (!loading && currentUser) {
        navigate('/Dashboard');
        return null;
    }

    const handlePasswordReset = async () => {
        setErrorMsg(null) // clear previous error messsage

        if (!email) {
            setErrorMsg("Please enter an email to proceed")
            return
        }

        // Extra validation for email input
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {   
            await passwordChange(email);
            setMessage('A password reset email has been sent. Please check your email.');
        } catch (error) {
             // Handle Firebase-specific errors with detailed messages
            if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                setError('The email address is not valid. Please try again.');
            } else {
                setError('Failed to send password reset email. Please try again later.');
            }
        }
    }

    return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
                {/* Input field for email address */}
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                    placeholder="Enter your email"
                    className="mb-4 p-2 w-full border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
                {/* Display success or error messages */}
                {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
                <button
                    onClick={handlePasswordReset}
                    className="bg-blue-500 text-white w-full py-2 rounded-lg hover:bg-blue-600"
                >
                    Reset Password
                </button>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Remember your password?{' '}
                        <Link to="/Account/Login" className="text-blue-500 hover:underline">
                            Login here
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}