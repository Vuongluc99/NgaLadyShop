/**
 * Main Server File
 * 
 * This is the entry point for the backend application.
 * It configures Express, connects to the database,
 * sets up middleware and routes, and starts the server.
 */

// Load environment variables
require('dotenv').config({ path: './config/.env' });

// Core dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

// Database connection
const connectDB = require('./config/database');

// Error handling
const { errorHandler } = require('./utils/error');

// Import routes
const authRoutes = require('./routes/authroutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded body

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('Morgan enabled in development mode');
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với API ShopBanHang',
    docs: '/api/docs'
  });
});

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    api: 'ShopBanHang API',
    version: '1.0.0',
    routes: {
      auth: '/api/auth - Đăng ký, đăng nhập, quản lý tài khoản',
      products: '/api/products - Quản lý sản phẩm, tìm kiếm, đánh giá',
      orders: '/api/orders - Đặt hàng, thanh toán, lịch sử đơn hàng'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Không tìm thấy đường dẫn ${req.originalUrl} trên máy chủ này!`
    }
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server đang chạy ở chế độ ${process.env.NODE_ENV} trên cổng ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection! Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; // For testing