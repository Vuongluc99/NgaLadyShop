/**
 * Authentication Middleware
 * 
 * This middleware handles JWT token verification, user authentication,
 * and role-based authorization.
 */

const jwt = require('jsonwebtoken');
const { ApiError, asyncHandler } = require('../utils/error');
const User = require('../models/user');

/**
 * Protect routes - Only authenticated users can access
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Or get from cookie if exists
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return next(new ApiError('Vui lòng đăng nhập để truy cập tài nguyên này', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError('Không tìm thấy người dùng với token này', 401));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError('Không được phép truy cập, token không hợp lệ', 401));
  }
});

/**
 * Authorize specific roles
 * @param {...String} roles - Roles allowed to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Vui lòng đăng nhập trước', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `Vai trò ${req.user.role} không được phép thực hiện hành động này`,
          403
        )
      );
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize
};