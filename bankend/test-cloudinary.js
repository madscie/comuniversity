require("dotenv").config();
const cloudinary = require("cloudinary").v2;

console.log("🔧 Testing Cloudinary Configuration...\n");

// Check environment variables
console.log("📋 Environment Variables Check:");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "✅ Present" : "❌ Missing"
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "✅ Present" : "❌ Missing"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "✅ Present" : "❌ Missing"
);

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.log("\n❌ Missing Cloudinary environment variables");
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  secure: true,
});

// Test connection
async function testConnection() {
  try {
    console.log("\n🔄 Testing Cloudinary API connection...");

    // Method 1: Try ping
    console.log("Testing ping...");
    const pingResult = await cloudinary.api.ping();
    console.log("✅ Ping successful:", pingResult);

    // Method 2: Try to list resources (more reliable)
    console.log("Testing resource listing...");
    const resources = await cloudinary.api.resources({
      max_results: 1,
    });
    console.log("✅ Resource listing successful");

    return true;
  } catch (error) {
    console.log("\n❌ Cloudinary test failed:");
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);
    console.log("Error HTTP code:", error.http_code);
    console.log("Full error:", error);

    // Common issues:
    if (error.http_code === 401) {
      console.log(
        "\n🔍 Solution: Check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET"
      );
      console.log(
        "   - Make sure they are correct in your Cloudinary dashboard"
      );
      console.log("   - Ensure there are no extra spaces in your .env file");
    } else if (error.http_code === 404) {
      console.log("\n🔍 Solution: Check your CLOUDINARY_CLOUD_NAME");
      console.log(
        "   - Make sure the cloud name is exactly as shown in Cloudinary dashboard"
      );
    }

    return false;
  }
}

// Run test
testConnection().then((success) => {
  if (success) {
    console.log("\n🎉 All Cloudinary tests passed!");
  } else {
    console.log("\n💡 Troubleshooting tips:");
    console.log(
      "1. Visit https://cloudinary.com/console to verify your credentials"
    );
    console.log("2. Check that your .env file is in the correct directory");
    console.log("3. Ensure no trailing spaces in your .env values");
    console.log("4. Verify your Cloudinary account is active");
  }
  process.exit(success ? 0 : 1);
});
