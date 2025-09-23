// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import configurations and routes
import { connectDatabase } from "./config/database.js";
import { JWT_SECRET, CORS_OPTIONS } from "./config/constants.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initializeDatabase } from "./utils/databaseSetup.js";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors(CORS_OPTIONS));

// Handle preflight requests
app.options('*', cors(CORS_OPTIONS));

// Connect to database
connectDatabase();

// Initialize database tables
initializeDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server and database are running",
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.redirect('http://localhost:5173' + req.url);
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Comversity server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

export default app;