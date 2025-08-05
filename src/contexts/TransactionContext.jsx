import { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, functions } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "./authContext";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [itemId, setItemId] = useState(null);
    const [transactions, setTransactions] = useState([]);
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

     // Fetch transactions once itemId is ready
    useEffect(() => {
        if (!uid || !itemId) return;

        const fetchTransactions = async () => {
            try {
                const getTransactions = httpsCallable(functions, "getTransactions");
                await getTransactions({ itemId });

                const ref = collection(db, "users", uid, "plaid", itemId, "transactions");
                const snap = await getDocs(ref);
                const data = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                data.sort((a, b) => b.date.localeCompare(a.date));
                setTransactions(data);
            } catch (error) {
                console.error("Error loading transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [uid, itemId]);

    return (
        <TransactionContext.Provider value={{ itemId, transactions, loading }}>
            {!loading && children}
        </TransactionContext.Provider>
    )
}

export const useTransaction = () => useContext(TransactionContext)