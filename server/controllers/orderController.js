/**
 * Order Controller
 * 
 * This controller handles HTTP requests related to orders
 * including order creation, payment, status updates, and admin operations.
 */

const { asyncHandler } = require('../utils/error');
const orderService = require('../services/orderService');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Create order
  const order = await orderService.createOrder(req.body, userId);
  
  res.status(201).json({
    success: true,
    order,
    message: 'Đơn hàng đã được tạo thành công'
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  
  // Get order
  const order = await orderService.getOrderById(req.params.id, userId, isAdmin);
  
  res.status(200).json({
    success: true,
    order
  });
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get user orders
  const orders = await orderService.getUserOrders(userId);
  
  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  // Get all orders with pagination
  const result = await orderService.getAllOrders(req.query);
  
  res.status(200).json({
    success: true,
    orders: result.orders,
    pagination: result.pagination
  });
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const {
    id,
    status,
    update_time,
    email_address
  } = req.body;
  
  // Update order payment status
  const updatedOrder = await orderService.updateOrderToPaid(req.params.id, {
    id,
    status,
    updateTime: update_time,
    emailAddress: email_address
  });
  
  res.status(200).json({
    success: true,
    order: updatedOrder,
    message: 'Đơn hàng đã được thanh toán thành công'
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  // Update order status
  const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
  
  res.status(200).json({
    success: true,
    order: updatedOrder,
    message: `Trạng thái đơn hàng đã được cập nhật thành ${status}`
  });
});

/**
 * @desc    Get order statistics
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
  // Get order statistics
  const stats = await orderService.getOrderStats();
  
  res.status(200).json({
    success: true,
    stats
  });
});

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderToPaid,
  updateOrderStatus,
  getOrderStats
};