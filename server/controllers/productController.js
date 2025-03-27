/**
 * Product Controller
 * 
 * This controller handles HTTP requests related to products
 * including CRUD operations, reviews, and special product lists.
 */

const { asyncHandler } = require('../utils/error');
const productService = require('../services/productService');

/**
 * @desc    Get all products with filtering, pagination, and sorting
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  // Get products with query parameters for filtering
  const result = await productService.getAllProducts(req.query);
  
  res.status(200).json({
    success: true,
    products: result.products,
    pagination: result.pagination
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  
  res.status(200).json({
    success: true,
    product
  });
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Seller/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  // Add seller info
  const userId = req.user._id;
  
  // Create product
  const product = await productService.createProduct(req.body, userId);
  
  res.status(201).json({
    success: true,
    product,
    message: 'Sản phẩm đã được tạo thành công'
  });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Seller/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  
  // Add admin flag for authorization in service
  if (isAdmin) {
    req.body.isAdminRequest = true;
  }
  
  // Update product
  const updatedProduct = await productService.updateProduct(
    req.params.id,
    req.body,
    userId
  );
  
  res.status(200).json({
    success: true,
    product: updatedProduct,
    message: 'Sản phẩm đã được cập nhật thành công'
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Seller/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  
  // Delete product
  await productService.deleteProduct(
    req.params.id,
    userId,
    isAdmin
  );
  
  res.status(200).json({
    success: true,
    message: 'Sản phẩm đã được xóa thành công'
  });
});

/**
 * @desc    Create new review or update existing review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const userName = req.user.name;
  
  // Add review
  await productService.addProductReview(
    req.params.id,
    { rating, comment },
    userId,
    userName
  );
  
  res.status(201).json({
    success: true,
    message: 'Đánh giá đã được thêm thành công'
  });
});

/**
 * @desc    Get top rated products
 * @route   GET /api/products/top
 * @access  Public
 */
const getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const products = await productService.getTopProducts(limit);
  
  res.status(200).json({
    success: true,
    products
  });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 6;
  const products = await productService.getFeaturedProducts(limit);
  
  res.status(200).json({
    success: true,
    products
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts
};