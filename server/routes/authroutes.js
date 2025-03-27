/**
 * Authentication Routes
 * 
 * This module defines API endpoints for authentication operations
 * and connects them to their respective controller functions.
 */

const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require authentication)
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updatePassword);

module.exports = router;