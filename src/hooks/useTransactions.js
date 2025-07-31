import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react"
import { db, functions } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";


export const useTransactions = (uid, itemId) => {
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);

    useEffect(() => {
        if (!uid || !itemId) return;

        const fetchAndLoadTransaction = async () => {
            try {
                // trigger backend sync (first time or refresh)
                const getTransactions = httpsCallable(functions, "getTransactions")
                await getTransactions({ itemId });

                // Read from Firestore
                const ref = collection(db, "users", uid, "plaid", itemId, "transactions");
                const snap = await getDocs(ref);

                if (!snap.empty) {
                    const data = snap.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    
                    // Sort recent to oldest
                    data.sort((a, b) => b.date.localeCompare(a.date));
                    setTransactions(data);
                } else {
                    throw new Error("No transactions docs found");
                }
            } catch (error) {
                console.error("Error loading transactions:", error);
            } finally {
                setLoadingTransactions(false);
            }
        }

        fetchAndLoadTransaction();
    }, [uid, itemId]);
    return { transactions, loadingTransactions };
} 