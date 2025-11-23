const {onCall, HttpsError, onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore")
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');
const prettyMapCategory = require('./constants/prettyMapCategory');
const { validateFilters } = require('./utils/validateFilters')
const { verifyPlaidWebhook } = require('./utils/validatePlaidWebhook');
const { format } = require("date-fns");
const { onSchedule } = require("firebase-functions/scheduler");
const { getLast3Months } = require('./utils/getMonths')
const {groupByCategory} = require('./utils/averageBudget')

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
      webhook: "https://myapp.loca.lt/ace-it-twice/us-central1/plaidWebhook"
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

exports.aggregatePreviousMonthSpending = onSchedule({
  schedule: "5 0 1 * *",
  timeZone: "America/Los_Angeles"
}, async (event) => {
  console.log("Scheduled job running!", event);
  
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  const year_month = `${year}-${month.toString().padStart(2, "0")}`;
  
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
  const endOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
  
  console.log("Start", startOfMonth);
  console.log("End", endOfMonth);
  try {
// Fetch all user
  const usersSnapshot = await admin.firestore().collection("users").get();
  
  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
  
      const plaidItemsSnapshot = await admin.firestore()
          .collection("users")
          .doc(uid)
          .collection("plaid")
          .get();
      
      const monthlyCategoryTotals = {};
      
      for (const plaidItemDoc of plaidItemsSnapshot.docs) {
          const txsSnapshot = await admin.firestore()
              .collection("users")
              .doc(uid)
              .collection("plaid")
              .doc(plaidItemDoc.id)
              .collection("transactions")
              .where("date", ">=", startOfMonth.toISOString())
              .where("date", "<", endOfMonth.toISOString())
              .get();
          
          txsSnapshot.forEach(txDoc => {
            const tx = txDoc.data();
            if (tx.amount > 0) return;
            const category = tx.category || "Other";
            const key = `${year_month}_${category}`;
            if (!monthlyCategoryTotals[key]) {
                monthlyCategoryTotals[key] = {
                    year_month,
                    category,
                    total_spent: 0
                }
            }
            monthlyCategoryTotals[key].total_spent += tx.amount;
          });
      }
      const batch = admin.firestore().batch();
      for (const [key, summary] of Object.entries(monthlyCategoryTotals)) {
          const docRef = admin.firestore()
              .collection("users")
              .doc(uid)
              .collection("monthlyCategorySpending")
              .doc(key);
          batch.set(docRef, {
              ...summary,
              updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
      }
  
    await batch.commit();
    console.log("Completed")
  };
  } catch (error) {
    console.log(error);
  }  
})

async function aggregateAfterPlaidSync(uid, transactions) {
  // Group by month + category
  const monthlyCategoryTotals = {};

  // Group spending transactions by month + category
  transactions.filter(tx => tx.amount < 0).forEach(tx => {
    const date = new Date(tx.date);
    const year_month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const category = tx.category || "Other";
    const key = `${year_month}_${category}`;

    if (!monthlyCategoryTotals[key]) {
      monthlyCategoryTotals[key] = {
        year_month,
        category,
        total_spent: 0
      }
    }
    monthlyCategoryTotals[key].total_spent += (tx.amount * -1);
  });
  try {
    // Batch write to firestore
    const batch = admin.firestore().batch();
    for (const [key, summary] of Object.entries(monthlyCategoryTotals)) {
      const docRef = admin.firestore()
        .collection("users")
        .doc(uid)
        .collection("monthlyCategorySpending")
        .doc(key);
      batch.set(docRef, {
        ...summary,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
  } catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Unable to aggregate monthly spending.");
  }
}
    

async function saveAccountData(uid, itemId, accounts) {
  console.log(`]avingAccount] data for user ${uid}, itemId ${itemId}`)

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
    });

    await batch.commit();

    return { success: true, message: "Accounts synced"};
  }
  catch (error) {
    throw new HttpsError("internal", "Fail to save account.");
  }
}

// Fetch transactins from Plaid and save to DB
async function syncPlaidTransaction(uid, itemId) {
  console.log(`[syncPlaidTransactions] Syncing for user ${uid}, item ${itemId}`);
  try {
    // Get access token from firestore
    const plaidDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId);
    
    const batch = admin.firestore().batch();  // Used to write multiple documents at once
    const transactionRef = plaidDocRef.collection("transactions")
    
    const plaidDoc = await plaidDocRef.get();
    
    if (!plaidDoc.exists) {
      throw new HttpsError("not-found", "Plaid item not found.");
    }

    const data = plaidDoc.data();
    const access_token = data.accessToken;
    let cursor = data.cursor || null;

    let added = []; // new transactions
    let modified = []; // updates to existing transactions
    let removed = []; // transactions to delete or mark as removed
    let hasMore = true;
    let response;

    while (hasMore) {
      response = await plaidClient.transactionsSync({
        access_token,
        cursor
      });
      
      const data = response.data;

      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    // List of accounts
    const accountsMap = {};
    for (const acc of response.data.accounts) {
      accountsMap[acc.account_id] = {
        name: acc.name,
        mask: acc.mask
      };
    }

    // Process added + modified transactions
    // Merge account data: name and mask to transaction data
    const transactionsToSave = [...added, ...modified].map(tx => {
      const accountInfo = accountsMap[tx.account_id];
      return {
        transaction_id: tx.transaction_id,
        merchant_name: tx.merchant_name || tx.name,
        merchant_name_lower: tx.merchant_name?.toLowerCase() || tx.name?.toLowerCase(),
        amount: tx.amount * -1,
        amount_filter: tx.amount < 0 ? tx.amount * -1 : tx.amount,
        iso_currency_code: tx.iso_currency_code,
        date: tx.date,
        //datetime: tx.datetime,
        //authorized_date: tx.authorized_date,
        //authorized_datetime: tx.authorized_datetime,
        // location: tx.location,
        // logo_url: tx.logo_url,
        pending: tx.pending,
        category: prettyMapCategory[tx.personal_finance_category.primary] || "Other",
        category_lower: prettyMapCategory[tx.personal_finance_category.primary]?.toLowerCase() || "Other",
        account_id: tx.account_id,
        notes: '',
        removed: false,

        // merged account info:
        account_name: accountInfo.name || "Unknown",
        account_name_lower: accountInfo.name?.toLowerCase() || "unknown",
        account_mask: accountInfo.mask || "****",
      }
    })
    
    // Process removed transactions
    removed.forEach(tx => {
      const docRef = transactionRef.doc(tx.transaction_id);
      batch.update(docRef, {removed: true})
    })
    
    transactionsToSave.forEach(tx => {
      const docRef = transactionRef.doc(tx.transaction_id);
      batch.set(docRef, tx, {merge: true});
    });

    await batch.commit();

    await plaidDocRef.update({ cursor });

    // Save Account data
    saveAccountData(uid, itemId, response.data.accounts);

    // Calculate monthly spending
    aggregateAfterPlaidSync(uid, transactionsToSave);

    return {
      success: true,
      message: "Transactions synced",
      count: transactionsToSave.length
    };
  }
  catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Fail to fetch transactions.");
  }
}

// Exchange public token for permanent access token
exports.exchangePublicToken = onCall(async (request) => {
  //debugger;
  const public_token = request.data.public_token;

  if (!public_token) {
    throw new HttpsError("invalid-argument", "Public token is required.");
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

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

exports.plaidWebhook = onRequest(async (req, res) => {
  const body = req.body;
  try {
    // Plaid sends a JSON object with:
    // body.webhook_type, body.webhook_code, body.item_id
    const { webhook_code, item_id } = body;
    console.log(JSON.stringify(req.headers))
    console.log(JSON.stringify(body));

    // Only act on SYNC_UPDATES_AVAILABLE
    if (webhook_code !== "SYNC_UPDATES_AVAILABLE") {
      console.log("Ignoring webhook:", webhook_code);
      return res.status(200).send("Ignored");
    }

    // Verify webhook from Plaid
    const verified = await verifyPlaidWebhook(req);
    if (!verified) {
      console.warn("Plaid webhook failed verification");
      return res.status(401).send("Invalid Signature");
    }

    // Look up users who own this item
    const userRef = admin.firestore().collection("users");
    const snapshot = await userRef.get();

    let userDoc = null;
    for (const doc of snapshot.docs) {
      const plaidDoc = await doc.ref.collection("plaid").doc(item_id).get();
      if (plaidDoc.exists) {
        userDoc = doc;
        break;
      }
    }

    if (!userDoc) {
      return res.status(404).send("Item not found");
    }

    // Call sync
    await syncPlaidTransaction(userDoc.id, item_id)
    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing webhook");
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
  return syncPlaidTransaction(uid, itemId);
})

// Cursor based Pagination
exports.getTransactionsFilteredPaginated = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const { itemId, pagination, filters } = request.data;
  const { page = 0, pageSize = 5, lastDocumentId = null } = pagination;

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  if (pageSize < 1 || pageSize > 100) {
    throw new HttpsError("invalid-argument", "Out of bound page size");
  }

  const {
    name,
    account,
    startDate,
    endDate,
    category,
    minAmount,
    maxAmount
  } = validateFilters(filters);

  try {
    const transactionsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection('transactions');
    
    let query = transactionsRef.orderBy("date", "desc").where("removed", "!=", true);
    if (name) {  // merchant name 
      query = query
        .where("merchant_name_lower", ">=", name) // use third party app for case sensitive search
        .where("merchant_name_lower", "<=", name + "\uf8ff");
    }
    if (account) {
      query = query.where("account_name", "==", account)
    }
    if (startDate) {
      query = query.where("date", ">=", startDate)
    }
    if (endDate) {
      query = query.where("date", "<=", endDate)
    }
    if (category) {
      query = query.where("category", "==", category)
    }
    if (minAmount !== null && minAmount !== undefined) {
      query = query.where("amount_filter", ">=", minAmount)
    }
    if (maxAmount !== null && maxAmount !== undefined) {
      query = query.where("amount_filter", "<=", maxAmount)
    }

    // Use count() aggregation (Admin SDK doesn’t have getCountFromServer)
    const totalCountSnapshot = await query.count().get();
    const totalDocs = totalCountSnapshot.data().count;

    // Apply pagination
    if (lastDocumentId) {
      const lastDocRef = transactionsRef.doc(lastDocumentId);
      const lastDocSnapshot = await lastDocRef.get();

      if (!lastDocSnapshot.exists) {
        throw new HttpsError("invalid-argument", "Invalid cursor document");
      }

      query = query.startAfter(lastDocSnapshot);
    }

    const snapshot = await query.limit(pageSize).get();

    const hasNextPage = ((page * pageSize) + snapshot.docs.length) < totalDocs;
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
        count: transactions.length,
        totalPages: Math.ceil(totalDocs / pageSize)
      }
    };
  } catch (error) {
    console.log(error);
    throw new HttpsError("internal", "Fail to get transactions.");
  }
})

// Get recent transaction for Dashboard Page
exports.getRecentTransactions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const { itemId, limit} = request.data;

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  try {
    const transactionsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection('transactions');
    
    const query = transactionsRef.orderBy("date", "desc").where("removed", "!=", true).limit(limit);
    const snapshot = await query.get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return {
      success: true,
      message: "Recent transactions fetched succesfully",
      totalTransactions: transactions.length,
      recentTransactions: transactions,
    }
  } catch (error) {
    console.log(error);
    throw new HttpsError("internal", "Fail to get recent transactions.");
  }
})

// Get monthly transaction for Dashboard Page
exports.getMonthlyTransactions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const { itemId, date } = request.data;
  const { month, year } = date;

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  try {
    const transactionsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection('transactions');
    
    // Current month
    const startDate = format(new Date(year, month -1, 1), "yyyy-MM-dd");
    const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");

    console.log(startDate, endDate)
    
    const query = transactionsRef
      .where("removed", "!=", true)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "desc");
    const snapshot = await query.get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return {
      success: true,
      message: "Monthly transactions fetched succesfully",
      totalTransactions: transactions.length,
      monthlyTransactions: transactions,
    }
  } catch (error) {
    console.log(error);
    throw new HttpsError("internal", "Fail to get monthly transactions.");
  }
})

exports.get3MonthTransactionsPerCategory = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const { itemId, category, date } = request.data;
  const { month, year } = date;

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  try {
    const transactionsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection('transactions');
    
    // Current month
    const startDate = format(new Date(year, month - 3, 1), "yyyy-MM-dd");
    const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");

    console.log(startDate, endDate)
    
    const query = transactionsRef
      .where("removed", "!=", true)
      .where("category", "==", category)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "desc");
    const snapshot = await query.get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return {
      success: true,
      message: "Monthly transactions fetched succesfully",
      totalTransactions: transactions.length,
      monthlyTransactions: transactions,
    }
  } catch (error) {
    console.log(error);
    throw new HttpsError("internal", "Fail to get monthly transactions.");
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
  const transactionData = request.data.transaction;
  const itemId = request.data.itemId;

  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }
  if (!transactionData) {
    throw new HttpsError("invalid-argument", "Missing transaction data");
  }

  try {
    // Create a new doc ref with an auto generated ID
    const newTxDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection("transactions")
      .doc();

    const newTxDocData = {
      ...transactionData,
      transaction_id: newTxDocRef.id,
      removed: false
    }

    // Add the transaction
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
  const transactionToUpdateId = request.data.transactionToUpdateId;  // Transaction Id
  const transactionData = request.data.transactionData;
  const itemId = request.data.itemId

  if (!transactionToUpdateId) {
    throw new HttpsError("invalid-argument", "Missing transaction Id");
  }
  if (!transactionData) {
    throw new HttpsError("invalid-argument", "Missing transaction data");
  }
  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing Item Id");
  }

  try {
    // Get the Bank document using itemId
    const transactionDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection("transactions")
      .doc(transactionToUpdateId);

    await transactionDocRef.update(transactionData);
    return {success: true, message: `Transaction updated successfully`}
  } catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Fail to update transaction")
  }
})

exports.deleteTransactionById= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const transactionToDeleteId = request.data.transactionToDeleteId;  // Transaction Id
  const itemId = request.data.itemId

  if (!transactionToDeleteId) {
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
      .doc(transactionToDeleteId);

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
  const transactionsToDelete = request.data.selectedTransactionIds;  // Array
  const itemId = request.data.itemId

  if (!transactionsToDelete) {
    throw new HttpsError("invalid-argument", "Missing transactions to delete");
  }
  if (!itemId) {
    throw new HttpsError("invalid-argument", "Missing itemId");
  }

  const batch = admin.firestore().batch(); // used to write multiple documents
  try {
    
    const txCollectionRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('plaid')
      .doc(itemId)
      .collection("transactions")
    
    transactionsToDelete.forEach(txId => {
      const txDocRef = txCollectionRef.doc(txId);
      batch.delete(txDocRef);
    })

    await batch.commit();

    return { success: true, message: `Successfully deleted ${transactionsToDelete.length} transactions` }
  } catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Fail to delete batch transactions")
  }
})

exports.getGoals = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;

  try {
    const goalsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('goals');
    
    const query = goalsRef.orderBy("target_amount", "desc");
    const snapshot = await query.get();

    const goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return {
      success: true,
      message: "Goals fetched succesfully",
      totalGoals: goals.length,
      goals: goals,
    }
  } catch (error) {
    console.log(error);
    throw new HttpsError("internal", "Fail to get recent transactions.");
  }
})

exports.addGoal = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const goalData = request.data.goalData;
  const {id, name} = request.data.linkedAccount;

  if (!goalData || !id || !name) {
    throw new HttpsError("invalid-argument", "Missing goal data");
  }

  try {
    // Create a new doc ref with an auto generated ID
    const newGoalDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection("goals")
      .doc();
    const newGoalDocData = {
      ...goalData,
      goal_id: newGoalDocRef.id,
      contributions: {
        [id]: {
          amount: goalData.saved_amount,
          name: name
        }
      }
    }

    // Add the transaction
    await newGoalDocRef.set(newGoalDocData);
    return {success: true, message: `Goal added successfully`}
  } catch (error) {
    throw new HttpsError("internal", "Fail to add transaction")
  }
})

exports.addGoalFund= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const goalToUpdateId = request.data.goalToUpdateId;  // budget Id
  const { accountName, fund, accountId } = request.data.goalData; 
  if (!goalToUpdateId) {
    throw new HttpsError("invalid-argument", "Missing goal Id");
  }
  if (!accountName || !fund || !accountId) {
    throw new HttpsError("invalid-argument", "Missing goal data");
  }


  try {
    // Get the Bank document using itemId
    const goalDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection("goals")
      .doc(goalToUpdateId);
    
    const update = {
      [`contributions.${accountId}.amount`]: FieldValue.increment(fund),
      [`contributions.${accountId}.name`]: accountName,
      saved_amount: FieldValue.increment(fund),
    }

    await goalDocRef.update(update);
    return {success: true, message: `Goal fund added successfully`}
  } catch (error) {
    console.error(error.message);
    throw new HttpsError("internal", "Fail to added fund to goal")
  }
})

exports.withdrawalGoalFund= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const goalToUpdateId = request.data.goalToUpdateId;  // budget Id
  const {targetAmount, fund, accountId} = request.data.goalData;
  if (!goalToUpdateId) {
    throw new HttpsError("invalid-argument", "Missing goal Id");
  }
  if (!targetAmount || !fund || !accountId) {
    throw new HttpsError("invalid-argument", "Missing goal data");
  }

  try {
    // Get the Bank document using itemId
    const goalDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection("goals")
      .doc(goalToUpdateId);
    
    const update = {
      [`contributions.${accountId}.amount`]: FieldValue.increment(fund * -1),
      saved_amount: FieldValue.increment(fund * -1)
    }

    await goalDocRef.update(update);
    return {success: true, message: `Goal withdrawl successfully`}
  } catch (error) {
    console.error(error.message);
    throw new HttpsError("internal", "Fail to withdrawl fund from goal")
  }
})

exports.editGoalById= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const goalToUpdateId = request.data.goalToUpdateId;  // Transaction Id
  const goalData = request.data.goalData;

  if (!goalToUpdateId) {
    throw new HttpsError("invalid-argument", "Missing goal Id");
  }
  if (!goalData) {
    throw new HttpsError("invalid-argument", "Missing goal data");
  }

  try {
    // Get the Bank document using itemId
    const goalDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection("goals")
      .doc(goalToUpdateId);

    await goalDocRef.update(goalData);
    return {success: true, message: `Goal updated successfully`}
  } catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Fail to update goal")
  }
})

exports.getBudgets = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const { month, year } = request.data;

  if (!month || !year) {
    throw new HttpsError("invalid-argument", "Missing month or year argument");
  }
  // 0-based index
  const startOfMonth = new Date(year, month - 1, 1).toISOString(); 
  const endOfMonth = new Date(year, month, 0).toISOString(); // last day of month

  console.log(startOfMonth, endOfMonth);

  try {
    const budgetsRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('budgets');
    
    const query = budgetsRef
      .where("end_date", ">=", startOfMonth)
      .where("start_date", "<=", endOfMonth)
      .orderBy("target_amount", "desc");
    const snapshot = await query.get();

    const budgets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return {
      success: true,
      message: "Goals fetched succesfully",
      totalItems: budgets.length,
      budgets: budgets,
    }
  } catch (error) {
    console.log(error);
    throw new HttpsError("internal", "Fail to get budget items.");
  }
})

// Get 5 months spending average for all categories
// Need to fix to get spendings for specific sets of categories (unbudgeted ones for current month)
exports.getAverageBudget = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }
  const uid = request.auth.uid;
  const { currentMonth} = request.data.requestData;
  if (!currentMonth) {
    throw new HttpsError("invalid-argument", "Missing month");
  }
  const months = getLast3Months(currentMonth, 5);
  try {
    const budgetsRef = admin.firestore()
      .collection("users")
      .doc(uid)
      .collection("monthlyCategorySpending");
    
    const query = budgetsRef
      .where("year_month", "in", months);
    
    const snapshot = await query.get();
    const groupedWithAverage = groupByCategory(snapshot.docs, months);
    return {
      message: "Success",
      averages: groupedWithAverage
    }
    
  } catch (error) {
    console.log(error);
    throw new HttpsError("internal", "Fail to get average budget");
  }
})

exports.addBudget = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const budgetData = request.data.budgetData;

  if (!budgetData) {
    throw new HttpsError("invalid-argument", "Missing budget data");
  }

  try {
    // Create a new doc ref with an auto generated ID
    const newBudgetDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection("budgets")
      .doc();
    
    const newBudgetDocData = {
      ...budgetData,
      budget_id: newBudgetDocRef.id,
      createdAt: FieldValue.serverTimestamp(),
    }

    // Add the transaction
    await newBudgetDocRef.set(newBudgetDocData);
    return {success: true, message: `Budget added successfully`}
  } catch (error) {
    throw new HttpsError("internal", "Fail to add budget")
  }
})

exports.addMultipleBudgets = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const budgetArray = request.data.budgetArray;

  if (!budgetArray) {
    throw new HttpsError("invalid-argument", "Missing budget array");
  }

  try {

    const batch = admin.firestore().batch();

    budgetArray.forEach(budget => {
      // Create a new doc ref with an auto generated ID
      const newBudgetDocRef = admin.firestore()
        .collection('users')
        .doc(uid)
        .collection("budgets")
        .doc();
      
      const budgetData = {
        ...budget,
        budget_id: newBudgetDocRef.id,
        createdAt: FieldValue.serverTimestamp(),
      }

      batch.set(newBudgetDocRef, budgetData, { merge: true });
    })
    // Add the transaction
    await batch.commit();
    return {success: true, message: `${budgetArray.length} added successfully`}
  } catch (error) {
    throw new HttpsError("internal", `Fail to add ${budgetArray.length} budget`)
  }
})

exports.editBudgetById= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const budgetToUpdateId = request.data.budgetToUpdateId;  // budget Id
  const {target_amount, notes} = request.data.budgetData;

  if (!budgetToUpdateId) {
    throw new HttpsError("invalid-argument", "Missing budget Id");
  }
  if (!target_amount) {
    throw new HttpsError("invalid-argument", "Missing budget amount");
  }

  try {
    // Get the Bank document using itemId
    const budgetDocRef = admin.firestore()
      .collection('users')
      .doc(uid)
      .collection("budgets")
      .doc(budgetToUpdateId);

    await budgetDocRef.update({ target_amount, notes });
    return {success: true, message: `Budget updated successfully`}
  } catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Fail to update goal")
  }
})

exports.editMultipleBudgets= onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("Unauthenticated", "User must be logged in");
  }

  const uid = request.auth.uid;
  const budgets = request.data.budgetArray;
  if (!budgets || budgets.length === 0) {
    throw new HttpsError("invalid-argument", "Missing budgets array");
  }

  try {
    const batch = admin.firestore().batch();
    budgets.forEach(item => {
      // Get the Bank document using itemId
      const budgetDocRef = admin.firestore()
        .collection('users')
        .doc(uid)
        .collection("budgets")
        .doc(item.budget_id);
      batch.update(budgetDocRef, { target_amount: item.target_amount });
    })
    

    await batch.commit();
    return {success: true, message: `Budget updated successfully`}
  } catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Fail to update multiple budgets")
  }
})