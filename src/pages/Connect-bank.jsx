import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { httpsCallable } from "firebase/functions";
import  {functions} from '../firebase/firebase'

export default function ConnectBank() {
    const [linkToken, setLinkToken] = useState(null);


    useEffect(() => {
        const fetchLinkToken = async () => {
            try {
                const createLinkToken = httpsCallable(functions, "createLinkToken");
                const result = await createLinkToken();
                console.log("✅ Link Token:", result.data.link_token);
                setLinkToken(result.data.link_token);
            } catch (error) {
            console.error("Failed to get link token:", error);
            }
        }

        
        fetchLinkToken();
  }, []);

    // Set up Plaid Link
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            // TODO: Send public_token to your backend to exchange for access_token
            try {
                console.log(public_token)
                const exchangeToken = httpsCallable(functions, "exchangePublicToken");
                const result = await exchangeToken({ public_token })
                
                console.log("🔑 Access Token:", result.data.accessToken);
                console.log("🏦 Item ID:", result.data.itemId);
            } catch (error) {
                console.error("Error exchanging token:", error);
            }
        },
            onExit: (error, metadata) => {
            console.warn("⚠️ User exited Plaid Link", error, metadata);
        },
  });

    return (
        <>
            <button
                disabled={!ready}
                onClick={() => {
                    console.log("button clicked")
                    open()
                }}
                className="border-2 bg-amber-400 cursor-pointer"
            >
                Connect you bank
            </button>
        </>
    )
}