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

// Get all user data from firestore
exports.getUser = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  try {
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User profile not found");
    }
    return userDoc.data();
  } catch (error) {
    console.error("Error fetching user profile", error);
    throw new functions.https.HttpsError("internal", "Fail to get user profile")
  }
})

// Update user profile in Firebase Authentication
exports.updateUserAuth = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const userData = request.data;

  const userPhotoURL = userData.photoURL;

  try {
    await admin.auth().updateUser(uid, {
      photoURL: userPhotoURL,
      displayName: userData.fullName || userData.preferedName || undefined
    })
    return {success: true, message: "User profile updated"}
  } catch (error) {
    console.error("Error updating user in Firebase Auth:", error);
    throw new functions.https.HttpsError("internal", "Fail to update user")
  }
})

// Update user in firestore database
exports.updateUser = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const userData = request.data;
  console.log("User data passed:", userData);

  try {
    // Update user in Firestore
    await admin.firestore().collection("users").doc(uid).set(userData, { merge: true })
    return {success: true, message: "User profile updated"}
  } catch (error) {
    console.error("Error updating user in Firestore:", error);
    throw new functions.https.HttpsError("internal", "Fail to update user")
  }
})
