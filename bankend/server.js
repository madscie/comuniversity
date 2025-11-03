const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const initializeDatabase = require('./utils/initializeDatabase');

const app = express();

// Check for required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadDirs = [
  'uploads', 
  'uploads/articles', 
  'uploads/articles/images', 
  'uploads/articles/documents',
  'uploads/webinars',
  'uploads/books', 
  'uploads/users'
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, {
    body: req.method !== 'GET' ? req.body : {},
    query: req.query,
    params: req.params
  });
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Communiversity API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      articles: '/api/articles',
      webinars: '/api/webinars',
      admin: '/api/admin',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection test route
app.get('/api/db-test', async (req, res) => {
  try {
    const db = require('./config/database');
    const [result] = await db.execute('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Database connection successful',
      data: result
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const articleRoutes = require('./routes/articles');
const webinarRoutes = require('./routes/webinars');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// Import controllers
const articleController = require('./controllers/articleController');
const webinarController = require('./controllers/webinarController');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Additional article routes
app.get('/api/articles/search', articleController.searchArticles);
app.get('/api/articles/category/:category', articleController.getArticlesByCategory);

// Additional webinar routes
app.post('/api/webinars/:id/register', webinarController.registerForWebinar);

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: {
        status: 'running',
        uptime: Math.floor(process.uptime()) + ' seconds',
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      services: {
        database: 'connected',
        fileUpload: 'ready',
        authentication: 'enabled'
      },
      endpoints: [
        { path: '/api/auth', methods: ['POST', 'GET'], description: 'Authentication' },
        { path: '/api/books', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Books management' },
        { path: '/api/articles', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Articles management' },
        { path: '/api/webinars', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Webinars management' },
        { path: '/api/admin', methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Admin operations' },
        { path: '/api/users', methods: ['GET'], description: 'User management' }
      ]
    }
  });
});

// Test routes for each module
app.get('/api/test/articles', async (req, res) => {
  try {
    const db = require('./config/database');
    const [articles] = await db.execute('SELECT COUNT(*) as count FROM articles');
    res.json({
      success: true,
      message: 'Articles module is working',
      data: {
        totalArticles: articles[0].count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Articles module error: ' + error.message
    });
  }
});

app.get('/api/test/webinars', async (req, res) => {
  try {
    const db = require('./config/database');
    const [webinars] = await db.execute('SELECT COUNT(*) as count FROM webinars');
    res.json({
      success: true,
      message: 'Webinars module is working',
      data: {
        totalWebinars: webinars[0].count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Webinars module error: ' + error.message
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`❌ API endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requested: {
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    },
    availableEndpoints: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/me',
      '/api/books',
      '/api/books/categories',
      '/api/books/:id',
      '/api/articles',
      '/api/articles/categories',
      '/api/articles/:id',
      '/api/articles/search',
      '/api/articles/category/:category',
      '/api/articles/:id/download',
      '/api/webinars',
      '/api/webinars/categories',
      '/api/webinars/:id',
      '/api/webinars/:id/register',
      '/api/admin/dashboard',
      '/api/admin/books',
      '/api/admin/articles',
      '/api/admin/webinars',
      '/api/admin/webinars/:id/registrations',
      '/api/users/profile'
    ]
  });
});

// General 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found. Please check the URL.',
    documentation: 'Available API endpoints at /api/status'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  // Handle multer file size errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please check the file size limits.',
        maxSize: '50MB for documents, 5MB for images'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check the field name.'
      });
    }
  }
  
  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token expired'
    });
  }

  // Default error response
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(error.status || 500).json({
    success: false,
    message: isProduction ? 'Internal server error' : error.message,
    ...(isProduction ? {} : { stack: error.stack })
  });
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🔴 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔴 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
initializeDatabase()
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 COMMUNIVERSITY LIBRARY SERVER STARTED SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log(`📍 Server Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Base URL: http://localhost:${PORT}`);
      console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
      console.log('='.repeat(60));
      console.log('🚀 AVAILABLE ENDPOINTS:');
      console.log('='.repeat(60));
      console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
      console.log(`✅ Database Test: http://localhost:${PORT}/api/db-test`);
      console.log(`✅ Server Status: http://localhost:${PORT}/api/status`);
      console.log('---');
      console.log(`📚 Books API: http://localhost:${PORT}/api/books`);
      console.log(`📄 Articles API: http://localhost:${PORT}/api/articles`);
      console.log(`🎓 Webinars API: http://localhost:${PORT}/api/webinars`);
      console.log(`👤 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`🛡️ Admin API: http://localhost:${PORT}/api/admin`);
      console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
      console.log('---');
      console.log(`📁 File Uploads: http://localhost:${PORT}/uploads/`);
      console.log('='.repeat(60));
      console.log('💡 Tip: Use /api/status for complete API documentation');
      console.log('='.repeat(60) + '\n');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.log('💡 Try:');
        console.log('   - Using a different port (set PORT environment variable)');
        console.log('   - Killing the process using the port: npx kill-port ${PORT}');
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  })
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Check if MySQL is running');
    console.log('   2. Verify database credentials in .env file');
    console.log('   3. Ensure database exists');
    console.log('   4. Check network connectivity');
    process.exit(1);
  });

module.exports = app;