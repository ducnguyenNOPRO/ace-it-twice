const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');

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
exports.createLinkToken = functions.https.onCall(async (request) => {
    if (!request.auth) {
        throw new functions.https.HttpsError("Unauthenticated", "User must be logged in");
    }
    const plaidRequest = {
        user: {
            client_user_id: "user",  // use Firebase user ID to associate with Plaid
        },
        client_name: 'Ace It Twice',
        products: ['auth', 'transactions'],
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

// Exchange public token for permanent access token
exports.exchangePublicToken = functions.https.onCall(async (request) => {
  //debugger;
  const public_token = request.data.public_token;

  if (!public_token) {
    throw new functions.https.HttpsError("invalid-argument", "Public token is required.");
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    console.log("✅ Exchange response:", response.data);

    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get the user id
    const uid = request.auth.uid;
    await admin.firestore().collection('users').doc(uid).collection("plaid").add({
      accessToken,
      itemId
    })

    return {accessToken, itemId}
  } catch (error) {
    console.error("Error exchanging public token:", error);
    throw new functions.https.HttpsError("internal", "Failed to exchange token");
  }
})
