import React from "react";
import { useState, useEffect, useContext } from 'react'
import { auth } from '../../firebase/firebase'
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext();

// Custom hook to access authentication context
export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, [])
    
    async function initializeUser(user) {
        if (user) {
            setCurrentUser({ ...user })
        } else {
            setCurrentUser(null)
        }
        setLoading(false);
    }

    const userState = {
        currentUser,
        loading
    }

    return (
        < AuthContext.Provider value={ userState }>
            {!loading && children}
        </AuthContext.Provider >
    )
}