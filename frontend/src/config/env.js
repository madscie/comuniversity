// Environment configuration
export const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD
};

export default env;