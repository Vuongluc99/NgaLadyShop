/**
 * Product Routes
 * 
 * This module defines API endpoints for product operations
 * and connects them to their respective controller functions.
 */

const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

// Admin routes
router.get('/admin/products', protect, authorize('admin'), getProducts);

module.exports = router;