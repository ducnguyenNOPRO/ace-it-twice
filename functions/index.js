const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');

if (!admin.apps.length) {
  admin.initializeApp(); // Only initialize if not already done
}

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
exports.createLinkToken = onCall(async (request) => {
  if (!request.auth) {
      throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const plaidRequest = {
      user: {
          client_user_id: uid,  // use Firebase user ID to associate with Plaid
      },
      client_name: 'Ace It Twice',
      products: ['auth', 'transactions'],
      language: 'en',
      redirect_uri: "http://localhost:5173/Setting",
      country_codes: ['US'],
  };

  try {
      // Generate a Link token, frontend use to launch bank connection popup
      const response = await plaidClient.linkTokenCreate(plaidRequest);
      return {
          link_token: response.data.link_token
      }
  } catch (error) {
      console.error("Plaid error:", error.response?.data || error.message || error);
      throw new HttpsError("internal", error.message || "Unknown error with Plaid");
  }
});

// Exchange public token for permanent access token
exports.exchangePublicToken = onCall(async (request) => {
  //debugger;
  const public_token = request.data.public_token;

  if (!public_token) {
    throw new HttpsError("invalid-argument", "Public token is required.");
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    console.log("Exchange response:", response.data);

    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get the user id
    const uid = request.auth.uid;
    const plaidRef = admin.firestore().collection('users').doc(uid).collection("plaid")
    // Check if any access token already exists
    const existing = await plaidRef.limit(1).get();

    if (!existing.empty) {
      throw new HttpsError("already-exists", "Bank already connected.");
    }

    await plaidRef.add({accessToken, itemId})

    return {success: true, message: "Token Exchange succefully"}
  } catch (error) {
    console.error("Plaid error:", error.response?.data || error.message || error);
    throw new HttpsError("internal", error.message || "Unknown error with Plaid");
  }
})

// Get all user data from firestore
exports.getUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  try {
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User profile not found");
    }
    return userDoc.data();
  } catch (error) {
    console.error("Error fetching user profile", error);
    throw new HttpsError("internal", "Fail to get user profile")
  }
})

// Update user profile in Firebase Authentication
exports.updateUserAuth = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
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
    throw new HttpsError("internal", "Fail to update user")
  }
})

// Update user in firestore database
exports.updateUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const userData = request.data;

  try {
    // Update user in Firestore
    await admin.firestore().collection("users").doc(uid).set(userData, { merge: true })
    return {success: true, message: "User profile updated"}
  } catch (error) {
    console.error("Error updating user in Firestore:", error);
    throw new HttpsError("internal", "Fail to update user")
  }
})
