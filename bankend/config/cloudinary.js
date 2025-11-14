// config/cloudinary.js - FIXED VERSION
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(
        `Missing required Cloudinary environment variable: ${key}`
      );
    }
  }

  console.log("☁️ Cloudinary Config Check:");
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(
    `   API Key: ${
      process.env.CLOUDINARY_API_KEY
        ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4)
        : "MISSING"
    }`
  );
  console.log(
    `   API Secret: ${
      process.env.CLOUDINARY_API_SECRET
        ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4)
        : "MISSING"
    }`
  );
};

// Configure Cloudinary
try {
  validateCloudinaryConfig();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log("✅ Cloudinary configured successfully");
} catch (error) {
  console.error("❌ Cloudinary configuration failed:", error.message);
  throw error;
}

// Test Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection test passed");
    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection test failed:", error.message);
    return false;
  }
};

export { cloudinary };
export const connectCloudinary = testCloudinaryConnection;
