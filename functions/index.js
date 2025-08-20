const {onCall, HttpsError, onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore")
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');
const prettyMapCategory = require('./constants/prettyMapCategory');
const { error } = require("firebase-functions/logger");

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
    throw new HttpsError("internal", error.message || "Unknown error with Plaid");
  }
})

exports.fetchAccountsFromPlaid = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const itemId = request.data.itemId
  if (!itemId) throw new HttpsError("invalid-argument", "Missing ItemId")

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

    // Store accounts in Firestore
    const batch = admin.firestore().batch();  // Used to write multiple documents at once
    const accountsRef = plaidDocRef.collection("accounts")
    
    accounts.forEach(account => {
      const docRef = accountsRef.doc(account.account_id);
      batch.set(docRef, {
        account_id: account.account_id,
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
    throw new HttpsError("internal", "Fail to sync account.");
  }
})

exports.getAccounts = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const itemId = request.data.itemId;

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }
  try {
    const accountsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection('accounts');
    
    const snapshot = await accountsRef.get();

    const accounts = snapshot.docs.map(doc => doc.data());
    return {
      success: true,
      message: "Transactions fetched DB",
      count: accounts.length,
      accounts: accounts
    };
  } catch (error) {
    throw new HttpsError("internal", "Fail to get transactions.");
  }
})

exports.fetchTransactionsFromPlaid = onCall(async (request) => {
  if (!request.auth) {
      throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const itemId = request.data.itemId

  if (!itemId) throw new HttpsError("invalid-argument", "Missing itemId");

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

    const now = new Date();   // YYYY-MM-DD T HH:MM::SS
    const aYearAgo = new Date();
    aYearAgo.setMonth(now.getMonth() - 12);

    // Format as YYYY-MM-DD if needed (depends on your DB)
    const startDate = aYearAgo.toISOString().split("T")[0]; // e.g., "2025-01-30"
    console.log(startDate)
    const endDate = now.toISOString().split("T")[0]; // e.g., "2025-07-30"

    // Call Plaid to get Accounts
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: access_token,
      start_date: startDate,
      end_date: endDate,
    })

    // List of accounts
    const accountsMap = {};
    for (const acc of transactionsResponse.data.accounts) {
      accountsMap[acc.account_id] = {
        name: acc.name,
        mask: acc.mask
      };
    }

    // Merge account data: name and mask to transaction data
    const transactionsToSave = transactionsResponse.data.transactions.map(tx => {
      const accountInfo = accountsMap[tx.account_id];
      return {
        transaction_id: tx.transaction_id,
        name: tx.name,
        merchant_name: tx.merchant_name || tx.name,
        amount: tx.amount,
        iso_currency_code: tx.iso_currency_code,
        date: tx.date,
        //datetime: tx.datetime,
        //authorized_date: tx.authorized_date,
        //authorized_datetime: tx.authorized_datetime,
        location: tx.location,
        logo_url: tx.logo_url,
        pending: tx.pending,
        category: prettyMapCategory[tx.personal_finance_category.primary],
        account_id: tx.account_id,
        notes: '',

        // merged account info:
        account_name: accountInfo.name || "Unknown",
        account_mask: accountInfo.mask || "****",
      }
    })

    // Store accounts in Firestore
    const batch = admin.firestore().batch();  // Used to write multiple documents at once
    const transactionRef = plaidDocRef.collection("transactions")
    
    
    transactionsToSave.forEach(transaction => {
      const docRef = transactionRef.doc(transaction.transaction_id);
      batch.set(docRef, transaction);
    });

    await batch.commit();

    return {
      success: true,
      message: "Accounts synced",
      count: transactionsToSave.length
    };
  }
  catch (error) {
    throw new HttpsError("internal", "Fail to fetch transactions.");
  }
})

// Cursor based Pagination
exports.getTransactions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const { itemId, page = 0, pageSize = 5, lastDocumentId = null } = request.data;

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  if (pageSize < 1 || pageSize > 100) {
    throw new HttpsError("invalid-argument", "Out of bound page size");
  }

  try {
    const transactionsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection('transactions');
    
    // Use count() aggregation (Admin SDK doesn’t have getCountFromServer)
    const totalCountSnapshot = await transactionsRef.count().get();
    const totalDocs = totalCountSnapshot.data().count;
    
    let query = transactionsRef.orderBy("date", "desc")

    // Start after the lastDocumentId
    if (lastDocumentId) {
      const lastDocRef = transactionsRef.doc(lastDocumentId);
      const lastDocSnapshot = await lastDocRef.get();

      if (!lastDocSnapshot.exists) {
        throw new HttpsError("invalid-argument", "Invalid cursor document");
      }

      query = query.startAfter(lastDocSnapshot);
    }

    const snapshot = await query.limit(pageSize).get();

    const hasNextPage = snapshot.docs.length === pageSize;
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
        ...doc.data()
    }))

    const nextCursorId = transactions.length > 0 ? transactions[transactions.length - 1].id : null;

    return {
      success: true,
      message: "Transactions fetched DB",
      totalCount: totalDocs,
      transactions: transactions,
      pagination: {
        page,
        pageSize,
        hasNextPage,
        nextCursor: hasNextPage ? nextCursorId : null,
        count: transactions.length
      }
    };
  } catch (error) {
    console.log(error);
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
    throw new HttpsError("internal", "Fail to update user")
  }
})

exports.addTransaction = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const txData = request.data.transaction;
  const itemId = request.data.itemId;

  console.log("ItemId:", itemId);

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }
  if (!txData) {
    throw new HttpsError("invalid-argument", "Missing transaction data");
  }

  try {
    // Get the Bank document using itemId
    const newTxDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection("transactions")
      .doc();

    const newTxDocData = {
      ...txData,
      transaction_id: newTxDocRef.id
    }

    // Save the transaction
    await newTxDocRef.set(newTxDocData);
    return {success: true, message: `Transaction added successfully`}
  } catch (error) {
    throw new HttpsError("internal", "Fail to add transaction")
  }
})

exports.editTransactionById= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const txId = request.data.transactionId;  // Transaction Id
  const txData = request.data.transaction;
  const itemId = request.data.itemId

  if (!txId) {
    throw new HttpsError("invalid-argument", "Missing transaction Id");
  }
  if (!txData) {
    throw new HttpsError("invalid-argument", "Missing transaction data");
  }
  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  try {
    // Get the Bank document using itemId
    const txDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection("transactions")
      .doc(txId);

    // Get transaction doc with Id
    const txDoc = await txDocRef.get();

    // Prevent editing non-existing document
    if (!txDoc.exists) {
      throw new HttpsError("not-found", "Transaction document not found.");
    }
    const newTxDocData = {
      ...txData
    }

    // Save the transaction
    await txDocRef.set(newTxDocData, {merge: true});
    return {success: true, message: `Transaction updated successfully`}
  } catch (error) {
    throw new HttpsError("internal", "Fail to update transaction")
  }
})

exports.deleteTransactionById= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const txId = request.data.transactionId;  // Transaction Id
  const itemId = request.data.itemId

  if (!txId) {
    throw new HttpsError("invalid-argument", "Missing transaction Id");
  }
  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  try {
    // Get the Bank document using itemId
    const txDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection("transactions")
      .doc(txId);

    // Get transaction doc with Id
    const txDoc = await txDocRef.get();

    // Prevent deleting non-existing document
    if (!txDoc.exists) {
      throw new HttpsError("not-found", "Transaction document not found.");
    }

    // Save the transaction
    await txDocRef.delete();
    return {success: true, message: `Transaction deleted successfully`}
  } catch (error) {
    throw new HttpsError("internal", "Fail to delete transaction")
  }
})

exports.deleteBatchTransaction = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const txsToDelete = request.data.selectedTransactionIds;  // Array
  const itemId = request.data.itemId

  if (!txsToDelete) {
    throw new HttpsError("invalid-argument", "Missing transactions");
  }
  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing itemId");
  }

  const batch = admin.firestore().batch(); // used to write multiple documents
  try {
    // Get the Bank document using itemId
    const txCollectionRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection("transactions")
    
    txsToDelete.forEach(txId => {
      const txDocRef = txCollectionRef.doc(txId);
      batch.delete(txDocRef);
    })

    await batch.commit();

    return { success: true, message: `Successfully deleted ${txsToDelete.length} transactions` }
  } catch (error) {
    throw new HttpsError("internal", "Fail to delete batch transactions")
  }
})