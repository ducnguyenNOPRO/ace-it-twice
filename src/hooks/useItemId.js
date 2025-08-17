import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebase';

export const useItemId = (uid) => {
    const [itemId, setItemId] = useState(null);
    const [loadingItemId, setLoadingItemId] = useState(true);

    useEffect(() => {
        if (!uid) return;

        const fetchItemId = async () => {
            try {
                const ref = collection(db, 'users', uid, 'plaid');
                const snap = await getDocs(ref);
                if (!snap.empty) {
                    const id = snap.docs[0].id;
                    console.log("ItemId in hook", id);
                    setItemId(id);
                } else {
                    throw new Error("No Plaid ItemId found");
                }
            } catch (error) {
                console.error("Error fetching itemId:", error);
            } finally {
                setLoadingItemId(false);
            }
        }
        fetchItemId();
    }, [uid])

    return { itemId, loadingItemId };
}