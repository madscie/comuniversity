// config/constants.js
export const JWT_SECRET = "your_secure_jwt_secret_key_change_in_production";

export const CORS_OPTIONS = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};