const fetch = require("node-fetch");
const crypto = require("crypto");

const keyCache = new Map();

const verifyPlaidWebhook = async (req) => {
  try {
    const { jwtVerify, importJWK } = await import("jose"); // dynamic import

    const plaidJwt = req.headers["plaid-verification"];
    if (!plaidJwt) {
      console.warn("No Plaid-Verification header found");
      return false;
    }

    const [headerB64] = plaidJwt.split(".");
    const header = JSON.parse(Buffer.from(headerB64, "base64").toString());
    const keyId = header.kid;

    if (!keyId) {
      console.warn("No keyID (kid) in JWT header");
      return false;
    }

    let jwk = keyCache.get(keyId);

    if (!jwk) {
      const response = await fetch("https://sandbox.plaid.com/webhook_verification_key/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.PLAID_CLIENT_ID,
          secret: process.env.PLAID_SECRET,
          key_id: keyId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch Plaid JWK:", await response.text());
        return false;
      }

      const data = await response.json();
      jwk = data.key;
      keyCache.set(keyId, jwk);
    }

    const publicKey = await importJWK(jwk, "ES256");
    const { payload } = await jwtVerify(plaidJwt, publicKey, {
      algorithms: ['ES256'] // Explicitly define expected algorithm
    });
      
    console.log(payload);

    // Need to check for older webhook
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (5 * 60); // 5 minutes
    if (payload.iat < fiveMinutesAgo) {
      console.warn(`Plaid webhook timestamp is too old.`);
      return false; 
    }
      
    // Check for body
    const hash = crypto.createHash("sha256").update(req.rawBody.toString('utf-8')).digest("hex"); // hash exact raw byte of body
    if (hash !== payload.request_body_sha256) {
      console.warn("Webhook body hash mismatch");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Plaid webhook verification failed:", err);
    return false;
  }
};

module.exports = { verifyPlaidWebhook };
