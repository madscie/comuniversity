// src/constants/tailwindColors.js
export const tailwindColors = {
  // Primary grayscale - from your theme
  gray: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },

  // Accent colors
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
};

// Predefined class combinations for common elements
export const componentClasses = {
  // Buttons
  btn: {
    primary:
      "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95",
    secondary:
      "border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer active:scale-95",
    success:
      "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95",
    outline:
      "border-2 border-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600 hover:text-white transition-all duration-300 cursor-pointer active:scale-95",
    ghost:
      "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer",
  },

  // Cards
  card: {
    base: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-default",
    elevated:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer",
  },

  // Inputs
  input: {
    base: "border border-gray-300 dark:border-gray-600 rounded-lg focus:border-gray-500 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all duration-300 cursor-text bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
    search:
      "border border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30 transition-all duration-300 cursor-text bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
  },
};

// Common gradient combinations using ONLY our color palette
export const gradients = {
  primary:
    "bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800",
  primaryText:
    "text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-800",
  success:
    "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
  successText:
    "text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600",
  subtle:
    "bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800",
  hero: "bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-900/20",
  feature:
    "bg-gradient-to-br from-gray-100 to-green-100 dark:from-gray-800 dark:to-green-900/10",
};

// Color mappings for consistent usage
export const colorMap = {
  primary: {
    bg: "bg-gray-800 dark:bg-gray-700",
    text: "text-gray-800 dark:text-gray-200",
    border: "border-gray-800 dark:border-gray-600",
    hover: {
      bg: "hover:bg-gray-900 dark:hover:bg-gray-600",
      text: "hover:text-gray-900 dark:hover:text-gray-100",
    },
  },
  success: {
    bg: "bg-green-500 dark:bg-green-600",
    text: "text-green-500 dark:text-green-400",
    border: "border-green-500 dark:border-green-400",
    hover: {
      bg: "hover:bg-green-600 dark:hover:bg-green-700",
      text: "hover:text-green-600 dark:hover:text-green-300",
    },
  },
  error: {
    bg: "bg-red-500 dark:bg-red-600",
    text: "text-red-500 dark:text-red-400",
    border: "border-red-500 dark:border-red-400",
    hover: {
      bg: "hover:bg-red-600 dark:hover:bg-red-700",
      text: "hover:text-red-600 dark:hover:text-red-300",
    },
  },
};
