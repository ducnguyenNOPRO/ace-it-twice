import { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
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

        const initializeTransactions = async () => {
            try {
                const transactionRef = collection(db, 'users', uid, 'plaid', itemId, 'transactions');
                const snapshot = await getDocs(transactionRef);

                if (snapshot.empty) {
                    console.log("No transactions found, fetching from Plaid...");
                    const getTransactions = httpsCallable(functions, "getTransactions");
                    await getTransactions({ itemId });
                } else {
                    console.log("Transaction already exist, skipping Plaid call");
                }
            } catch (error) {
                console.error("Error calling getTransactions:", error);
            }
        }

        // TODO: Remove this call when webhook sync is implemented
        initializeTransactions();

        const transactionRef = collection(db, 'users', uid, 'plaid', itemId, 'transactions');

        const unsubscribe = onSnapshot(
            transactionRef,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                data.sort((a, b) => b.date.localeCompare(a.date));
                setTransactions(data);
                setLoading(false);
            },
            (error) => {
                console.log("Error loading transaction:", error);
                setLoading(false);
            }
        )

        return () => unsubscribe();
    }, [uid, itemId]);

    // Manually refresh for lated data
    const refreshTransactions = async () => {
        if (!itemId) return;

        try {
            setLoading(true);
            const getTransactions = httpsCallable(functions, "getTransactions");
            await getTransactions({ itemId });
            // OnSnapShot will autimatically pick up the new data
        } catch (error) {
            console.log("Error refreshing transaction:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <TransactionContext.Provider value={{ itemId, transactions, loading, refreshTransactions }}>
            {!loading && children}
        </TransactionContext.Provider>
    )
}

export const useTransaction = () => useContext(TransactionContext)