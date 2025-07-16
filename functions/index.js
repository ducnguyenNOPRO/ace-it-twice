const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');
require('dotenv').config()

admin.initializeApp();

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

// Create link token
// context contains user auth info
exports.createLinkToken = functions.https.onCall(async (data, context) => {
    /*
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }*/

    const plaidRequest = {
        user: {
            client_user_id: "user",  // use Firebase user ID to associate with Plaid
        },
        client_name: 'Ace It Twice',
        products: ['auth'],
        language: 'en',
        redirect_uri: 'http://localhost:5173/dashboard',
        country_codes: ['US'],
    };

    try {
        // Generate a Link token, frontend use to launch bank connection popup
        const response = await plaidClient.linkTokenCreate(plaidRequest);
        return {
            link_token: response.data.link_token
        }
    } catch (error) {
        console.error("Error creating link token:", error);
        throw new functions.https.HttpsError("internal", "Failed to create link token");
    }
});
