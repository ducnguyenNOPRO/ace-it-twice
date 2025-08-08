import { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db, functions } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "./authContext";

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const [itemId, setItemId] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const uid = currentUser.uid;

    // Fetch itemId
    useEffect(() => {
        if (!uid) return;

        const fetchItemId = async () => {
            try {
                const ref = collection(db, 'users', uid, 'plaid');
                const snap = await getDocs(ref);
                if (!snap.empty) {
                    setItemId(snap.docs[0].id);
                } else {
                    throw new Error("No Plaid ItemId found");
                }
            } catch (error) {
                console.error("Error fetching itemId:", error);
            }
        };

        fetchItemId();
    }, [uid]);

     // Fetch accouts once itemId is ready
    useEffect(() => {
        if (!uid || !itemId) return;

        const accountsRef = collection(db, 'users', uid, 'plaid', itemId, 'accounts');

        const unsubscribe = onSnapshot(
            accountsRef,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    ...doc.data(),
                }))
                setAccounts(data);
                setLoading(false);
            },
            (error) => {
                console.log("Error loading accounts:", error);
                setLoading(false);
            }
        )

        return () => unsubscribe();
    }, [uid, itemId]);

    return (
        <AccountContext.Provider value={{ itemId, accounts, loading}}>
            {!loading && children}
        </AccountContext.Provider>
    )
}

export const useAccount = () => useContext(AccountContext)