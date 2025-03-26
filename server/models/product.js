/**
 * Product Model
 * 
 * This model represents products in the e-commerce system
 * with details, pricing, inventory, and reviews.
 */

const mongoose = require('mongoose');

// Review Schema (nested within Product)
const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
    maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    min: [0, 'Giá không được âm'],
    default: 0
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Giá không được âm'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục sản phẩm'],
    enum: [
      'Điện thoại',
      'Laptop',
      'Máy tính bảng',
      'Phụ kiện',
      'Thời trang',
      'Mỹ phẩm',
      'Thực phẩm',
      'Đồ gia dụng',
      'Khác'
    ]
  },
  stock: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng tồn kho'],
    min: [0, 'Số lượng tồn kho không được âm'],
    default: 0
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: 'product image'
      }
    }
  ],
  featured: {
    type: Boolean,
    default: false
  },
  reviews: [ReviewSchema],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate average rating when reviews are modified
ProductSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = (totalRating / this.reviews.length).toFixed(1);
  this.numReviews = this.reviews.length;
};

// Update rating before saving
ProductSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.calculateAverageRating();
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);