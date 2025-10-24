// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initializeDatabase = require('./utils/initializeDatabase');

const app = express();

// Check for required environment variables
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Communiversity API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const affiliateRoutes = require('./routes/affiliates');
const articleRoutes = require('./routes/articles');
const webinarRoutes = require('./routes/webinars');
const paymentRoutes = require('./routes/payments');
const downloadRoutes = require('./routes/downloads');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/downloads', downloadRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// General 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Please check the URL.'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler:', error.name, error.message);
  
  // Handle multer file size errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please check the file size limits.'
      });
    }
  }
  
  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Handle database errors
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Communiversity Server Started Successfully!');
    console.log('='.repeat(50));
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base URL: http://localhost:${PORT}`);
    console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Books API: http://localhost:${PORT}/api/books`);
    console.log(`📄 Articles API: http://localhost:${PORT}/api/articles`);
    console.log(`🎓 Webinars API: http://localhost:${PORT}/api/webinars`);
    console.log(`👤 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🛡️ Admin API: http://localhost:${PORT}/api/admin`);
    console.log('='.repeat(50) + '\n');
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});