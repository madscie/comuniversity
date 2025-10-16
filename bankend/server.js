const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, testConnection } = require('./config/database'); // import pool & testConnection
const { createTables } = require('./utils/databaseSetup'); // create users/admin tables
const authRoutes = require('./routes/auth'); // login/register routes
const adminRoutes = require('./routes/admin'); // admin endpoints
const webinarsRoutes = require('./routes/webinars'); // webinars endpoints
const errorHandler = require('./middleware/errorHandler'); // error middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database
const initializeDatabase = async () => {
  console.log('🔌 Initializing database connection...');
  const connected = await testConnection();
  if (connected) {
    try {
      await createTables();
      console.log('✅ Database tables created/verified successfully');
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
    }
  } else {
    console.error('❌ Database initialization failed');
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webinars', webinarsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Communiversity API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

// Catch-all 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Start server
const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
