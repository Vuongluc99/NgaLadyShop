/**
 * Authentication Service
 * 
 * This service handles business logic for authentication operations
 * including user registration, login, logout, and password reset.
 */

const User = require('../models/user');
const { ApiError } = require('../utils/error');

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Object} User object and token
 */
const register = async (userData) => {
  // Check if email is already taken
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ApiError('Email đã được sử dụng', 400);
  }

  // Create user
  const user = await User.create(userData);

  // Generate JWT token
  const token = user.generateAuthToken();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User object and token
 */
const login = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError('Email hoặc mật khẩu không hợp lệ', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError('Email hoặc mật khẩu không hợp lệ', 401);
  }

  // Generate JWT token
  const token = user.generateAuthToken();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('Không tìm thấy người dùng', 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    address: user.address,
    createdAt: user.createdAt
  };
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user object
 */
const updateProfile = async (userId, updateData) => {
  // Don't allow password update through this function
  if (updateData.password) {
    throw new ApiError('Không thể cập nhật mật khẩu qua hàm này', 400);
  }

  // Find and update user
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError('Không tìm thấy người dùng', 404);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    address: user.address,
    createdAt: user.createdAt
  };
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} Success message and token
 */
const updatePassword = async (userId, currentPassword, newPassword) => {
  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError('Không tìm thấy người dùng', 404);
  }

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError('Mật khẩu hiện tại không chính xác', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = user.generateAuthToken();

  return {
    message: 'Cập nhật mật khẩu thành công',
    token
  };
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  updatePassword
};