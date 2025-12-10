// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

// Import configs
import connectDB from "./config/database.js";
import db from "./config/database.js";

// Import routes
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import articleRoutes from "./routes/articles.js";
import webinarRoutes from "./routes/webinars.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import uploadRoutes from "./routes/upload.js";

// Import database initialization
import initializeDatabase from "./utils/initializeDatabase.js";
import { connectCloudinary } from "./config/cloudinary.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8080",
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'REMOVED_SECRET');

// Initialize PayPal SDK
let paypalEnvironment;
if (process.env.NODE_ENV === 'production') {
  paypalEnvironment = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
} else {
  paypalEnvironment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  console.log('📦 Request body:', req.body);
  next();
});

// ==================== STATIC FILE SERVING ====================
console.log("📁 Setting up static file serving from:", path.join(__dirname, "uploads"));

app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      console.log(`📤 Serving static file: ${filePath}`);
    },
  })
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ==================== PAYMENT ROUTES ====================

// Stripe Payment
app.post("/api/pay/stripe", async (req, res) => {
  try {
    const { amount, articleId, email, successUrl, cancelUrl } = req.body;
    if (!amount || !articleId || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, articleId, email',
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Premium Article Access', description: `Unlock premium article: ${articleId}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: successUrl || `http://localhost:5173/articles/${articleId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `http://localhost:5173/articles/${articleId}?payment=cancelled`,
      metadata: { articleId, type: 'article', email }
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('❌ Stripe error:', error);
    res.status(500).json({ success: false, error: error.message, message: 'Payment processing failed' });
  }
});

// PayPal Payment
app.post("/api/pay/paypal", async (req, res) => {
  try {
    const { amount, articleId, email, successUrl, cancelUrl } = req.body;
    if (!amount || !articleId || !email) {
      return res.status(400).json({ success: false, error: 'Missing required fields: amount, articleId, email' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        { amount: { currency_code: "USD", value: amount.toString() }, custom_id: articleId }
      ],
      application_context: {
        brand_name: "Communiversity",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: successUrl || `http://localhost:5173/articles/${articleId}?payment=success`,
        cancel_url: cancelUrl || `http://localhost:5173/articles/${articleId}?payment=cancelled`,
      }
    });

    const order = await paypalClient.execute(request);
    const approvalUrl = order.result.links.find(link => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      return res.status(500).json({ success: false, message: "Unable to get PayPal approval URL" });
    }

    res.json({ success: true, url: approvalUrl, orderId: order.result.id });
  } catch (error) {
    console.error('❌ PayPal error:', error);
    res.status(500).json({ success: false, error: error.message, message: 'PayPal payment failed' });
  }
});

// Test Payment
app.post("/api/pay/test", async (req, res) => {
  const { email, articleId } = req.body;
  res.json({ success: true, message: 'Test purchase successful!', articleId, email, unlocked: true, test: true });
});

// ==================== BASIC ROUTES ====================
app.get("/", (req, res) => res.json({ success: true, message: "Communiversity API is running!", timestamp: new Date().toISOString() }));

// ==================== API ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/webinars", webinarRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ success: true, message: "Server is healthy", timestamp: new Date().toISOString() }));

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ success: false, message: "Internal server error", error: process.env.NODE_ENV === "development" ? err.message : undefined });
});

// ==================== SERVER START ====================
const startServer = async () => {
  try {
    await initializeDatabase();
    connectCloudinary();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n" + "=".repeat(50));
      console.log("🎉 SERVER STARTED ON PORT:", PORT);
      console.log("✅ Database: CONNECTED");
      console.log("☁️  Cloudinary: CONFIGURED");
      console.log("💳 Stripe: READY");
      console.log("💳 PayPal: READY");
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
