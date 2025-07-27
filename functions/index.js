const {onCall, HttpsError, onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore")
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

    await plaidRef.doc(itemId).set({accessToken, itemId})

    return {success: true, message: "Token Exchange succefully", itemId}
  } catch (error) {
    console.error("Plaid error:", error.response?.data || error.message || error);
    throw new HttpsError("internal", error.message || "Unknown error with Plaid");
  }
})

exports.getAccounts = onCall(async (request) => {
  if (!request.auth) {
      throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const itemId = request.data.itemId

  try {
    // Get access token from firestore
    const plaidDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId);
    
    const plaidDoc = await plaidDocRef.get();
    
    if (!plaidDoc.exists) {
      throw new HttpsError("not-found", "Plaid item not found.");
    }

    const access_token = plaidDoc.data().accessToken;

    // Call Plaid to get Accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: access_token
    })

    // List of accounts
    const accounts = accountsResponse.data.accounts;
    const result = [];
    console.log("List of Accounts:", accounts);

    // Store accounts in Firestore
    const batch = admin.firestore().batch();  // Used to write multiple documents at once
    const accountsRef = plaidDocRef.collection("accounts")
    
    accounts.forEach(account => {
      const docRef = accountsRef.doc(account.account_id);
      batch.set(docRef, {
        name: account.name,
        official_name: account.official_name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
        balances: account.balances,
        updatedAt: FieldValue.serverTimestamp(),
      });
      result.push(account);
    });

    await batch.commit();

    return { success: true, message: "Accounts synced", result };
  }
  catch (error) {
    console.log("syncAccounts erorr:", error);
    throw new HttpsError("internal", "Fail to sync account.");
  }
})

exports.getTransactions = onCall(async (request) => {
  if (!request.auth) {
      throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const itemId = request.data.itemId

  try {
    // Get access token from firestore
    const plaidDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId);
    
    const plaidDoc = await plaidDocRef.get();
    
    if (!plaidDoc.exists) {
      throw new HttpsError("not-found", "Plaid item not found.");
    }

    const access_token = plaidDoc.data().accessToken;

    const now = new Date();
    const endDate = now.toISOString().split("T")[0]; // today
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1); // past 1 month
    const startDate = start.toISOString().split("T")[0];

    // Call Plaid to get Accounts
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: access_token,
      start_date: startDate,
      end_date: endDate,
    })

    // List of transactions
    const transactions = transactionsResponse.data.transactions;

    // Store accounts in Firestore
    const batch = admin.firestore().batch();  // Used to write multiple documents at once
    const transactionRef = plaidDocRef.collection("transactions")
    
    
    transactions.forEach(transaction => {
      const docRef = transactionRef.doc(transaction.transaction_id);
      batch.set(docRef, {
        transaction_id: transaction.transaction_id,
        account_id: transaction.account_id, // match correct account
        merchant_name: transaction.merchant_name,
        logo_url: transaction.logo_url,  // merchange logo
        amount: transaction.amount,
        date: transaction.date,   // transaction occured
        authorized_date: transaction.authorized_date,  // authorized by financial institution
        personal_finance_category: transaction.personal_finance_category,
        personal_finance_category_icon_url: transaction.personal_finance_category_icon_url,
        pending: transaction.pending,
        payment_channel: transaction.payment_channel,        
        iso_currency_code: transaction.iso_currency_code,
      });
    });

    await batch.commit();

    return { success: true, message: "Accounts synced", count: transactions.length };
  }
  catch (error) {
    console.log("getTransactions erorr:", error);
    throw new HttpsError("internal", "Fail to get transactions.");
  }
})

/**** 
exports.plaidWebhook = onRequest(async (req, res) => {
  const body = res.body;

  try {
    const webhookType = body.webhook_type;
    const webhookCode = body.webhook_code;
    const itemId = body.item_id;

    console.log("Webhook received:", webhookType, webhookCode);

    if (webhookType === "TRANSACTIONS" && webhookCode === "TRANSACTIONS_UPDATED") {
      await handleTransactionsUpdated(itemId);
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).send("Error handling webhook");
  }
})

async function handleTransactionsUpdated(itemId) {
   // Find user that owns this itemId
  const usersSnap = await admin.firestore().collection("users").get();

  let userId = null;
  for (const userDoc of usersSnap.docs) {
    const plaidDoc = await userDoc.ref.collection("plaid").doc(itemId).get();
    if (plaidDoc.exists) {
      userId = userDoc.id;
      break;
    }
  }

  if (!userId) {
    throw new Error(`Item ID ${itemId} not found under any user.`);
  }
  await syncTransactionsWithCursor(userId, itemId);
}

async function syncTransactionsWithCursor(uid, itemId) {
  const itemDocRef = admin.firestore().collection("users").doc(uid).collection("plaid").doc(itemId);
  const itemDoc = await itemDocRef.get();

  if (!itemDoc.exists) {
    throw new Error("Plaid Document not found");
  }
  
  const { accessToken, cursor: savedCursor } = itemDoc.data();

  let cursor = savedCursor || null;
  let added = [], modified = [], removed = [];
  let hasMore = true;

  while (hasMore) {
    const res = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor: cursor,
    });

    added.push(...res.data.added);
    modified.push(...res.data.modified);
    removed.push(...res.data.removed);

    hasMore = res.data.has_more;
    cursor = res.data.next_cursor;
  }

  const transactionRef = itemDocRef.collection("transactions");
  const batch = admin.firestore().batch();

  added.forEach(tx => {
    const txDoc = transactionRef.doc(tx.transaction_id);
    batch.set(txDoc, tx);
  });

  modified.forEach(tx => {
    const txDoc = transactionRef.doc(tx.transaction_id);
    batch.set(txDoc, tx, { merge: true });
  });

  removed.forEach(tx => {
    const txDoc = transactionRef.doc(tx.transaction_id);
    batch.delete(txDoc);
  });

  await batch.commit();
  await itemDocRef.update({ cursor });
}
***/

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
