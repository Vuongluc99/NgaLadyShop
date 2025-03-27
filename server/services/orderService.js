/**
 * Order Service
 * 
 * This service handles business logic for order operations
 * including creating orders, getting order details, updating
 * order status, and processing payments.
 */

const Order = require('../models/order');
const Product = require('../models/product');
const productService = require('./productService');
const { ApiError } = require('../utils/error');

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {string} userId - User ID
 * @returns {Object} Created order
 */
const createOrder = async (orderData, userId) => {
  const { orderItems, shippingAddress, paymentMethod } = orderData;
  
  if (!orderItems || orderItems.length === 0) {
    throw new ApiError('Không có sản phẩm trong đơn hàng', 400);
  }
  
  // Verify all products exist and have enough stock
  const productIds = orderItems.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  
  if (products.length !== productIds.length) {
    throw new ApiError('Một hoặc nhiều sản phẩm không tồn tại', 400);
  }
  
  // Map products for easy lookup
  const productMap = products.reduce((map, product) => {
    map[product._id.toString()] = product;
    return map;
  }, {});
  
  // Calculate prices and check stock
  let itemsPrice = 0;
  
  const orderItemsWithDetails = await Promise.all(orderItems.map(async (item) => {
    const product = productMap[item.product.toString()];
    
    // Check stock
    if (product.stock < item.quantity) {
      throw new ApiError(`Sản phẩm ${product.name} không đủ số lượng trong kho`, 400);
    }
    
    // Calculate price
    const price = product.discountedPrice > 0 ? product.discountedPrice : product.price;
    const totalPrice = price * item.quantity;
    itemsPrice += totalPrice;
    
    return {
      product: item.product,
      name: product.name,
      quantity: item.quantity,
      price,
      image: product.images.length > 0 ? product.images[0].url : '',
      totalPrice
    };
  }));
  
  // Calculate shipping price
  // For example: free shipping for orders over 500,000 VND
  const shippingPrice = itemsPrice > 500000 ? 0 : 30000;
  
  // Calculate tax price (e.g., 10% VAT)
  const taxPrice = Math.round(itemsPrice * 0.1);
  
  // Calculate total price
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  
  // Create order
  const order = await Order.create({
    user: userId,
    orderItems: orderItemsWithDetails,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  });
  
  // Update product inventory
  await productService.updateProductInventory(
    orderItems.map(item => ({
      productId: item.product,
      quantity: item.quantity
    }))
  );
  
  return order;
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for authorization)
 * @param {boolean} isAdmin - Whether user is admin
 * @returns {Object} Order
 */
const getOrderById = async (orderId, userId, isAdmin) => {
  const order = await Order.findById(orderId).populate('user', 'name email');
  
  if (!order) {
    throw new ApiError('Không tìm thấy đơn hàng', 404);
  }
  
  // Check if user is authorized to see this order
  if (!isAdmin && order.user._id.toString() !== userId.toString()) {
    throw new ApiError('Không được phép xem đơn hàng này', 403);
  }
  
  return order;
};

/**
 * Get logged in user orders
 * @param {string} userId - User ID
 * @returns {Array} Orders
 */
const getUserOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return orders;
};

/**
 * Get all orders (admin only)
 * @param {Object} queryParams - Query parameters
 * @returns {Object} Orders and pagination
 */
const getAllOrders = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Build query
  let query = {};
  
  // Filter by order status
  if (queryParams.status) {
    query.orderStatus = queryParams.status;
  }
  
  // Filter by payment status
  if (queryParams.isPaid) {
    query.isPaid = queryParams.isPaid === 'true';
  }
  
  // Filter by delivery status
  if (queryParams.isDelivered) {
    query.isDelivered = queryParams.isDelivered === 'true';
  }
  
  // Count total matching documents
  const total = await Order.countDocuments(query);
  
  // Execute query with pagination
  const orders = await Order.find(query)
    .populate('user', 'id name email')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Prepare pagination info
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  return {
    orders,
    pagination
  };
};

/**
 * Update order to paid
 * @param {string} orderId - Order ID
 * @param {Object} paymentResult - Payment result from payment provider
 * @returns {Object} Updated order
 */
const updateOrderToPaid = async (orderId, paymentResult) => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new ApiError('Không tìm thấy đơn hàng', 404);
  }
  
  // Update payment status
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = paymentResult;
  
  // Save updated order
  const updatedOrder = await order.save();
  
  return updatedOrder;
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Object} Updated order
 */
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new ApiError('Không tìm thấy đơn hàng', 404);
  }
  
  // Update order status
  order.orderStatus = status;
  
  // If status is "Đã giao hàng", update delivery status
  if (status === 'Đã giao hàng') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  
  // If status is "Đã hủy" and items were reserved, return them to inventory
  if (status === 'Đã hủy' && !order.inventoryRestored) {
    // Return items to inventory
    await Promise.all(order.orderItems.map(async (item) => {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } }
      );
    }));
    
    order.inventoryRestored = true;
  }
  
  // Save updated order
  const updatedOrder = await order.save();
  
  return updatedOrder;
};

/**
 * Get order stats (admin only)
 * @returns {Object} Order statistics
 */
const getOrderStats = async () => {
  // Get total sales
  const totalSalesResult = await Order.aggregate([
    {
      $match: { isPaid: true }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalPrice' }
      }
    }
  ]);
  
  const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;
  
  // Get count of all orders
  const totalOrders = await Order.countDocuments();
  
  // Get count of paid orders
  const paidOrders = await Order.countDocuments({ isPaid: true });
  
  // Get count of delivered orders
  const deliveredOrders = await Order.countDocuments({ isDelivered: true });
  
  // Get count of orders by status
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Format orders by status
  const formattedOrdersByStatus = ordersByStatus.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
  
  return {
    totalSales,
    totalOrders,
    paidOrders,
    deliveredOrders,
    ordersByStatus: formattedOrdersByStatus
  };
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderToPaid,
  updateOrderStatus,
  getOrderStats
};