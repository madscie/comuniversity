const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initializeDatabase = require('./utils/initializeDatabase');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Communiversity API is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('uploads'));
// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API available at: http://localhost:${PORT}/api`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Sample books: http://localhost:${PORT}/api/books`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});