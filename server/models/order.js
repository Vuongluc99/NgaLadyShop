/**
 * Order Model
 * 
 * This model represents customer orders in the e-commerce system.
 * It tracks order details, items, payments, and status.
 */

const mongoose = require('mongoose');

// OrderItem Schema (nested within Order)
const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng không được nhỏ hơn 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá không được âm']
  },
  image: {
    type: String
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không được âm']
  }
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [OrderItemSchema],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập tên người nhận']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    address: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ giao hàng']
    },
    city: {
      type: String,
      required: [true, 'Vui lòng nhập thành phố/tỉnh']
    },
    district: {
      type: String,
      required: [true, 'Vui lòng nhập quận/huyện']
    },
    ward: {
      type: String
    },
    postalCode: {
      type: String
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Vui lòng chọn phương thức thanh toán'],
    enum: ['COD', 'Chuyển khoản ngân hàng', 'Ví điện tử', 'Thẻ tín dụng']
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Đang xử lý', 'Đã xác nhận', 'Đang vận chuyển', 'Đã giao hàng', 'Đã hủy'],
    default: 'Đang xử lý'
  },
  note: {
    type: String,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total prices before saving
OrderSchema.pre('save', function(next) {
  // Calculate items price if orderItems are modified
  if (this.isModified('orderItems')) {
    this.itemsPrice = this.orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    // Recalculate total price
    this.totalPrice = this.itemsPrice + this.shippingPrice + this.taxPrice;
  }
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);