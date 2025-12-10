// backend/config/paypal.js
const paypal = require('@paypal/checkout-server-sdk');

console.log("🔍 Checking PayPal Environment Variables...");

// Show detailed environment variable status
console.log("PAYPAL_CLIENT_ID:", process.env.PAYPAL_CLIENT_ID ? "✔️ Set" : "❌ NOT SET");
console.log("PAYPAL_CLIENT_SECRET:", process.env.PAYPAL_CLIENT_SECRET ? "✔️ Set" : "❌ NOT SET");

// SECURITY: If missing, STOP EVERYTHING immediately
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.error("❌ FATAL PAYPAL ERROR: Missing PayPal Client ID or Secret!");
  console.error("💡 FIX: Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env file.");
  
  // THROW — do not export null
  throw new Error("PayPal configuration failed — missing credentials.");
}

let environment;
let client;

try {
  if (process.env.NODE_ENV === "production") {
    console.log("🌍 Using PayPal **LIVE** Environment");
    environment = new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  } else {
    console.log("🧪 Using PayPal **SANDBOX** Environment");
    environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
  }

  client = new paypal.core.PayPalHttpClient(environment);

  console.log("✅ PayPal SDK Client Loaded Successfully");

} catch (error) {
  console.error("❌ PayPal SDK Initialization Error:");
  console.error(error);
  throw new Error("PayPal initialization failed. Check your credentials.");
}

module.exports = client;
