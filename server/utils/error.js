/**
 * Error Utilities
 * 
 * This module provides standardized error handling for the application.
 * It includes custom error classes and a central error handler.
 */

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates this is an operational error, not a programming error

    Error.captureStackTrace(this, this.constructor);
  }
}

// Create a standardized error response
const errorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Lỗi máy chủ nội bộ',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  });
};

// Async handler to eliminate try/catch blocks in route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Không tìm thấy tài nguyên với ID: ${err.value}`;
    error = new ApiError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Giá trị ${field} đã tồn tại. Vui lòng sử dụng giá trị khác.`;
    error = new ApiError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(message, 400);
  }

  // JSON Web Token error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Không được xác thực. Vui lòng đăng nhập lại.';
    error = new ApiError(message, 401);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    error = new ApiError(message, 401);
  }

  // Send standardized error response
  errorResponse(res, error);
};

module.exports = {
  ApiError,
  errorResponse,
  asyncHandler,
  errorHandler
};