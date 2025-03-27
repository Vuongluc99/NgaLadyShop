/**
 * Authentication Controller
 * 
 * This controller handles HTTP requests related to authentication
 * including user registration, login, profile management, etc.
 */

const { asyncHandler } = require('../utils/error');
const authService = require('../services/authService');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  
  // Register user
  const { user, token } = await authService.register({ name, email, password });
  
  // Send response
  res.status(201).json({
    success: true,
    user,
    token,
    message: 'Đăng ký tài khoản thành công'
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Login user
  const { user, token } = await authService.login(email, password);
  
  // Set JWT as HTTP-Only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  
  // Send response
  res.status(200).json({
    success: true,
    user,
    token,
    message: 'Đăng nhập thành công'
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  // Clear cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // Get user profile
  const user = await authService.getCurrentUser(req.user._id);
  
  res.status(200).json({
    success: true,
    user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, address } = req.body;
  
  // Update profile
  const updatedUser = await authService.updateProfile(req.user._id, {
    name,
    email,
    phoneNumber,
    address
  });
  
  res.status(200).json({
    success: true,
    user: updatedUser,
    message: 'Cập nhật thông tin thành công'
  });
});

/**
 * @desc    Update user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Update password
  const result = await authService.updatePassword(
    req.user._id,
    currentPassword,
    newPassword
  );
  
  // Set JWT as HTTP-Only cookie
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  
  res.status(200).json({
    success: true,
    message: result.message,
    token: result.token
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updatePassword
};