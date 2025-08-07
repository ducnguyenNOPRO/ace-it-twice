import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react"
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/authContext";


export const useAccounts = () => {
    const { currentUser } = useAuth();
    const [itemId, setItemId] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setloadingAccounts] = useState(true);
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

    useEffect(() => {
        if (!uid || !itemId) return;

        const fetchAndLoadTransaction = async () => {
            try {
                // Read from Firestore
                const ref = collection(db, "users", uid, "plaid", itemId, "accounts");
                const snap = await getDocs(ref);

                if (!snap.empty) {
                    const data = snap.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                
                    setAccounts(data);
                } else {
                    throw new Error("No account docs found");
                }
            } catch (error) {
                console.error("Error loading accounts:", error);
            } finally {
                setloadingAccounts(false);
            }
        }

        fetchAndLoadTransaction();
    }, [uid, itemId]);
    return { accounts, loadingAccounts };
} 