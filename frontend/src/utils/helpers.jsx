// utils/helpers.jsx - Add the missing export
import { API_BASE_URL } from "../config/apiConfig";

// // utils/helpers.jsx - More robust version
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log("🖼️ No image path provided");
    return null;
  }

  console.log("🖼️ Processing image path:", imagePath);

  // If it's already a full URL, use it directly
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Extract just the filename (handle both paths and plain filenames)
  let filename = imagePath;
  if (imagePath.includes("/")) {
    filename = imagePath.split("/").pop();
  }

  // Construct the URL
  const fullUrl = `http://localhost:5000/uploads/images/${filename}`;
  console.log("✅ Constructed image URL:", fullUrl);
  return fullUrl;
};

export const formatPrice = (price) => {
  const num = parseFloat(price || 0);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

// Validate ISBN
export const validateISBN = (isbn) => {
  if (!isbn) return true; // ISBN is optional

  const cleanISBN = isbn.replace(/[-\s]/g, "");
  return /^(?:\d{10}|\d{13})$/.test(cleanISBN);
};

// Validate Dewey Decimal
export const validateDeweyDecimal = (dewey) => {
  if (!dewey) return false;

  // Basic Dewey Decimal validation (000-999 or J 000-999 for children's)
  const deweyRegex = /^(J\s?)?(\d{1,3}(?:\.\d+)?|\d{1,3}-\d{1,3})$/;
  return deweyRegex.test(dewey.trim());
};

export const formatDate = (dateString) => {
  if (!dateString) return "Date not available";

  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// ADD THE MISSING EXPORT
export const handleImageError = (event, fallbackText = "📚") => {
  console.error("❌ Image failed to load:", event.target.src);

  const img = event.target;
  const parent = img.parentElement;

  if (parent) {
    // Create fallback
    const fallback = document.createElement("div");
    fallback.className =
      "w-full h-full flex items-center justify-center bg-gray-200 text-gray-400";
    fallback.innerHTML = `<div class="text-center"><span class="text-2xl">${fallbackText}</span></div>`;

    // Hide the broken image
    img.style.display = "none";

    // Add fallback if not already there
    if (!parent.querySelector(".image-fallback")) {
      parent.appendChild(fallback);
    }
  }
};

// Search utilities
export const buildSearchParams = (filters) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "") {
      params[key] = value;
    }
  });

  return params;
};

// Error boundary utilities
export const withErrorBoundary = (Component, FallbackComponent) => {
  return (props) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error("Component error:", error);
      return FallbackComponent ? (
        <FallbackComponent error={error} />
      ) : (
        <div>Something went wrong</div>
      );
    }
  };
};

// Debug helper
export const debugAPI = (message, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`🔧 ${message}`, data || "");
  }
};
