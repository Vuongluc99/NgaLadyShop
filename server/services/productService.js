/**
 * Product Service
 * 
 * This service handles business logic for product operations
 * including creating, reading, updating, and deleting products,
 * as well as managing reviews and inventory.
 */

const Product = require('../models/product');
const { ApiError } = require('../utils/error');

/**
 * Get all products with filtering, pagination, and sorting
 * @param {Object} queryParams - Query parameters for filtering
 * @returns {Object} Products and pagination details
 */
const getAllProducts = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Build query
  let query = {};
  
  // Filter by category
  if (queryParams.category) {
    query.category = queryParams.category;
  }
  
  // Filter by price range
  if (queryParams.minPrice || queryParams.maxPrice) {
    query.price = {};
    if (queryParams.minPrice) {
      query.price.$gte = parseFloat(queryParams.minPrice);
    }
    if (queryParams.maxPrice) {
      query.price.$lte = parseFloat(queryParams.maxPrice);
    }
  }
  
  // Search by name or description
  if (queryParams.search) {
    query.$or = [
      { name: { $regex: queryParams.search, $options: 'i' } },
      { description: { $regex: queryParams.search, $options: 'i' } }
    ];
  }
  
  // Filter by featured
  if (queryParams.featured) {
    query.featured = queryParams.featured === 'true';
  }
  
  // Count total matching documents
  const total = await Product.countDocuments(query);
  
  // Build sort option
  let sortOption = {};
  if (queryParams.sort) {
    // Handle sort format like 'price:desc,name:asc'
    const sortFields = queryParams.sort.split(',');
    sortFields.forEach(field => {
      const [key, value] = field.split(':');
      sortOption[key] = value === 'desc' ? -1 : 1;
    });
  } else {
    // Default sort by newest
    sortOption = { createdAt: -1 };
  }
  
  // Execute query with pagination
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(startIndex)
    .limit(limit)
    .populate('seller', 'name email');
  
  // Prepare pagination info
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  // Add next and previous page info
  if (startIndex + limit < total) {
    pagination.next = page + 1;
  }
  if (startIndex > 0) {
    pagination.prev = page - 1;
  }
  
  return {
    products,
    pagination
  };
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Object} Product
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate('seller', 'name email')
    .populate({
      path: 'reviews.user',
      select: 'name'
    });
  
  if (!product) {
    throw new ApiError('Không tìm thấy sản phẩm', 404);
  }
  
  return product;
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @param {string} userId - User ID (seller)
 * @returns {Object} Created product
 */
const createProduct = async (productData, userId) => {
  // Add seller to product data
  productData.seller = userId;
  
  // Create product
  const product = await Product.create(productData);
  
  return product;
};

/**
 * Update a product
 * @param {string} productId - Product ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID (must be seller or admin)
 * @returns {Object} Updated product
 */
const updateProduct = async (productId, updateData, userId) => {
  // Find product
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError('Không tìm thấy sản phẩm', 404);
  }
  
  // Check if user is seller or admin
  const userIsSellerOrAdmin = product.seller.equals(userId) || updateData.isAdminRequest;
  if (!userIsSellerOrAdmin) {
    throw new ApiError('Không được phép cập nhật sản phẩm này', 403);
  }
  
  // Remove fields that shouldn't be updated directly
  delete updateData.seller;
  delete updateData.reviews;
  delete updateData.isAdminRequest;
  
  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true, runValidators: true }
  );
  
  return updatedProduct;
};

/**
 * Delete a product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (must be seller or admin)
 * @returns {boolean} Success status
 */
const deleteProduct = async (productId, userId) => {
  // Find product
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError('Không tìm thấy sản phẩm', 404);
  }
  
  // Check if user is seller or admin
  const userIsSellerOrAdmin = product.seller.equals(userId) || product.isAdminRequest;
  if (!userIsSellerOrAdmin) {
    throw new ApiError('Không được phép xóa sản phẩm này', 403);
  }
  
  // Delete product
  await product.remove();
  
  return true;
};

/**
 * Add a review to a product
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data
 * @param {string} userId - User ID
 * @param {string} userName - User name
 * @returns {Object} Updated product
 */
const addProductReview = async (productId, reviewData, userId, userName) => {
  // Find product
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError('Không tìm thấy sản phẩm', 404);
  }
  
  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    review => review.user.toString() === userId.toString()
  );
  
  if (alreadyReviewed) {
    throw new ApiError('Bạn đã đánh giá sản phẩm này rồi', 400);
  }
  
  // Create review object
  const review = {
    user: userId,
    name: userName,
    rating: reviewData.rating,
    comment: reviewData.comment
  };
  
  // Add review to product
  product.reviews.push(review);
  
  // Calculate average rating
  product.calculateAverageRating();
  
  // Save product
  await product.save();
  
  return product;
};

/**
 * Update product inventory (decrease quantity)
 * @param {Array} items - Array of {productId, quantity} objects
 * @returns {boolean} Success status
 */
const updateProductInventory = async (items) => {
  const updateOperations = items.map(item => {
    return {
      updateOne: {
        filter: { _id: item.productId },
        // Decrease stock by quantity
        update: { $inc: { stock: -item.quantity } }
      }
    };
  });
  
  const result = await Product.bulkWrite(updateOperations);
  
  return result.isOk();
};

/**
 * Get top rated products
 * @param {number} limit - Number of products to return
 * @returns {Array} Top rated products
 */
const getTopProducts = async (limit = 5) => {
  const products = await Product.find({})
    .sort({ rating: -1 })
    .limit(limit);
  
  return products;
};

/**
 * Get featured products
 * @param {number} limit - Number of products to return
 * @returns {Array} Featured products
 */
const getFeaturedProducts = async (limit = 6) => {
  const products = await Product.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(limit);
  
  return products;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  updateProductInventory,
  getTopProducts,
  getFeaturedProducts
};