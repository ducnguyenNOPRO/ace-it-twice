import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react"
import { db} from "../firebase/firebase";


export const useAccounts = (uid, itemId) => {
    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setloadingAccounts] = useState(true);

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