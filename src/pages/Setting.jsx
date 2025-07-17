import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { httpsCallable } from "firebase/functions";
import  {functions} from '../firebase/firebase'

const PlaidInterface = () => {
    const [linkToken, setLinkToken] = useState(null);
    const [shouldOpen, setShouldOpen] = useState(false); // trigger to open when ready

    // Get link token for Plaid Link
    const fetchLinkToken = async () => {
        try {
            const createLinkToken = httpsCallable(functions, "createLinkToken");
            const result = await createLinkToken();
            console.log("✅ Link Token:", result.data.link_token);
            setLinkToken(result.data.link_token);
            setShouldOpen(true);
        } catch (error) {
            console.error("Failed to get link token:", error);
        }
    }

    // Set up Plaid Link
    // Get public toekn and exchange it for a permanent access token
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            // TODO: Send public_token to your backend to exchange for access_token
            try {
                console.log(public_token)
                const exchangeToken = httpsCallable(functions, "exchangePublicToken");
                const result = await exchangeToken({ public_token })
            } catch (error) {
                console.error("Error exchanging token:", error);
            }
        },
            onExit: (error, metadata) => {
            console.warn("⚠️ User exited Plaid Link", error, metadata);
        },
    });
    
    useEffect(() => {
        if (shouldOpen && ready) {
            open();
            setShouldOpen(false);
        }
    }, [ready, shouldOpen, open])

    return (
        <>
            <button
                disabled={shouldOpen}
                onClick={() => fetchLinkToken() }
                className="border-2 bg-amber-400 cursor-pointer"
            >
                Connect you bank
            </button>
        </>
    )
}

export default function Setting() {
    
}