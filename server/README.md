# ShopBanHang Backend

Đây là phần backend của dự án ShopBanHang - một ứng dụng thương mại điện tử được xây dựng với Node.js, Express và MongoDB.

## Cấu trúc dự án

```
server/
│
├── config/               # Cấu hình ứng dụng
│   ├── .env              # Biến môi trường
│   └── database.js       # Cấu hình kết nối MongoDB
│
├── controllers/          # Bộ điều khiển xử lý request
│   ├── authController.js # Xử lý xác thực
│   ├── productController.js # Xử lý sản phẩm
│   └── orderController.js   # Xử lý đơn hàng
│
├── middleware/           # Middleware
│   └── auth.js           # Xác thực và phân quyền
│
├── models/               # Mô hình dữ liệu Mongoose
│   ├── user.js           # Mô hình người dùng
│   ├── product.js        # Mô hình sản phẩm
│   └── order.js          # Mô hình đơn hàng
│
├── routes/               # Định nghĩa API Routes
│   ├── authroutes.js     # Routes xác thực
│   ├── productRoutes.js  # Routes sản phẩm
│   └── orderRoutes.js    # Routes đơn hàng
│
├── services/             # Business logic
│   ├── authService.js    # Dịch vụ xác thực
│   ├── productService.js # Dịch vụ sản phẩm
│   └── orderService.js   # Dịch vụ đơn hàng
│
├── utils/                # Tiện ích
│   └── error.js          # Xử lý lỗi
│
├── uploads/              # Thư mục lưu file upload
├── server.js             # Điểm khởi chạy ứng dụng
├── package.json          # Cấu hình npm
└── README.md             # Tài liệu
```

## Thiết lập môi trường

### Yêu cầu

- Node.js (>= 14.x)
- MongoDB (local hoặc cloud)
- npm hoặc yarn

### Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd shopbanhang/server
```

2. Cài đặt các phụ thuộc:
```bash
npm install
```

3. Cấu hình biến môi trường:
   - Sao chép file `.env.example` thành `.env` trong thư mục `config`
   - Điều chỉnh các biến môi trường phù hợp với môi trường của bạn

```bash
# Ví dụ file .env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/shopbanhang
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. Chạy ứng dụng:
   - Chế độ phát triển:
   ```bash
   npm run dev
   ```
   - Chế độ sản xuất:
   ```bash
   npm start
   ```

## Chạy ứng dụng

### Phát triển

```bash
npm run dev
```

### Sản xuất

```bash
npm start
```

## API Endpoints

### Xác thực

- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin người dùng
- `PUT /api/auth/profile` - Cập nhật thông tin người dùng
- `PUT /api/auth/password` - Đổi mật khẩu

### Sản phẩm

- `GET /api/products` - Lấy danh sách sản phẩm (có phân trang, lọc, sắp xếp)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (yêu cầu đăng nhập)
- `PUT /api/products/:id` - Cập nhật sản phẩm (yêu cầu đăng nhập, phải là người bán hoặc admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (yêu cầu đăng nhập, phải là người bán hoặc admin)
- `POST /api/products/:id/reviews` - Thêm đánh giá sản phẩm (yêu cầu đăng nhập)
- `GET /api/products/top` - Lấy sản phẩm được đánh giá cao nhất
- `GET /api/products/featured` - Lấy sản phẩm nổi bật

### Đơn hàng

- `POST /api/orders` - Tạo đơn hàng mới (yêu cầu đăng nhập)
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng (yêu cầu đăng nhập)
- `GET /api/orders/myorders` - Lấy đơn hàng của người dùng (yêu cầu đăng nhập)
- `PUT /api/orders/:id/pay` - Cập nhật trạng thái thanh toán (yêu cầu đăng nhập)
- `GET /api/orders` - Lấy tất cả đơn hàng (yêu cầu quyền admin)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (yêu cầu quyền admin)
- `GET /api/orders/stats` - Lấy thống kê đơn hàng (yêu cầu quyền admin)

## Xác thực và Phân quyền

Hệ thống sử dụng JWT (JSON Web Tokens) để xác thực người dùng:

- Tokens được tạo khi đăng ký hoặc đăng nhập
- Tokens phải được gửi trong header Authorization dưới dạng `Bearer <token>`
- Một số API endpoints yêu cầu vai trò cụ thể (như admin)

## Mô hình dữ liệu

### User
- name: Tên người dùng
- email: Email (unique)
- password: Mật khẩu (được mã hóa)
- role: Vai trò (user/admin)
- phoneNumber: Số điện thoại
- address: Địa chỉ

### Product
- name: Tên sản phẩm
- description: Mô tả
- price: Giá gốc
- discountedPrice: Giá giảm
- category: Danh mục
- stock: Số lượng trong kho
- images: Hình ảnh sản phẩm
- reviews: Đánh giá từ người dùng
- rating: Điểm đánh giá trung bình
- seller: Người bán (tham chiếu đến User)

### Order
- user: Người mua (tham chiếu đến User)
- orderItems: Danh sách sản phẩm đặt mua
- shippingAddress: Địa chỉ giao hàng
- paymentMethod: Phương thức thanh toán
- paymentResult: Kết quả thanh toán
- itemsPrice: Tổng giá sản phẩm
- shippingPrice: Phí vận chuyển
- taxPrice: Thuế
- totalPrice: Tổng tiền
- isPaid: Đã thanh toán chưa
- isDelivered: Đã giao hàng chưa
- orderStatus: Trạng thái đơn hàng

## Triển khai

### Triển khai lên VPS/Cloud Server

1. Cài đặt Node.js, npm và MongoDB trên server
2. Clone repository và cài đặt dependencies
3. Cấu hình biến môi trường cho production
4. Sử dụng PM2 để quản lý process:

```bash
npm install -g pm2
pm2 start server.js --name "shopbanhang-api"
```

### Triển khai với Docker

1. Xây dựng Docker image:
```bash
docker build -t shopbanhang-backend .
```

2. Chạy container:
```bash
docker run -p 5000:5000 -d shopbanhang-backend
```

## Hướng dẫn bảo trì và nâng cấp

### Thêm mới Model

1. Tạo file model mới trong thư mục `models/`
2. Tạo service tương ứng trong `services/`
3. Tạo controller trong `controllers/`
4. Thêm routes mới trong `routes/`
5. Cập nhật file `server.js` để kết nối routes mới

### Cập nhật API

1. Cập nhật model (nếu cần)
2. Sửa đổi service tương ứng
3. Cập nhật controller và routes nếu cần

## Bảo mật

- Passwords được hash bằng bcrypt
- API bảo vệ bằng JWT
- Phân quyền dựa trên vai trò người dùng
- Validate dữ liệu đầu vào

---

Đây là backend cơ bản cho ứng dụng thương mại điện tử, có thể mở rộng thêm các tính năng khác trong tương lai như thanh toán tích hợp, xác thực 2 yếu tố, v.v.