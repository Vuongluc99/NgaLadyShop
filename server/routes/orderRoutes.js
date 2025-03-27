/**
 * Order Routes
 * 
 * This module defines API endpoints for order operations
 * and connects them to their respective controller functions.
 */

const express = require('express');
const {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderToPaid,
  updateOrderStatus,
  getOrderStats
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/myorders', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', updateOrderToPaid);

// Admin routes
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.get('/stats', authorize('admin'), getOrderStats);

module.exports = router;