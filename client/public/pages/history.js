/**
 * Lịch sử đơn hàng - Hiển thị và quản lý lịch sử đơn hàng
 * 
 * File này xử lý các chức năng:
 * - Lấy dữ liệu lịch sử đơn hàng từ localStorage
 * - Sắp xếp đơn hàng theo thời gian (mới nhất trước)
 * - Hiển thị thông tin chi tiết của từng đơn hàng
 * - Cập nhật số lượng sản phẩm trong giỏ hàng
 */

document.addEventListener("DOMContentLoaded", function() {
    // Lấy phần tử DOM container chứa lịch sử đơn hàng
    const orderHistoryContainer = document.getElementById("order-history");
    
    // Lấy dữ liệu lịch sử đơn hàng từ localStorage
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng (nếu có hàm)
    if (window.updateCartCount) {
        const cart = JSON.parse(localStorage.getItem("cart") || '[]');
        let totalQuantity = 0;
        cart.forEach(item => {
            totalQuantity += item.quantity;
        });
        window.updateCartCount(totalQuantity);
    }
    
    // Hiển thị lịch sử đơn hàng
    if (orderHistory.length === 0) {
        // Nếu không có đơn hàng, hiển thị thông báo trống
        orderHistoryContainer.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <h3>Không có đơn hàng nào</h3>
                <p>Bạn chưa có đơn hàng nào. Hãy quay lại cửa hàng và mua sắm.</p>
                <a href="index.html" style="color: #ff5733; text-decoration: none; display: inline-block; margin-top: 15px;">Quay lại cửa hàng</a>
            </div>
        `;
    } else {
        // Sắp xếp đơn hàng theo thời gian (mới nhất trước)
        orderHistory.sort((a, b) => b.id - a.id);
        
        // Hiển thị từng đơn hàng
        orderHistory.forEach(order => {
            // Tạo card cho mỗi đơn hàng
            const orderCard = document.createElement("div");
            orderCard.classList.add("order-card");
            
            // Tạo phần header của đơn hàng với ngày và trạng thái
            const orderHeader = document.createElement("div");
            orderHeader.classList.add("order-header");
            orderHeader.innerHTML = `
                <div>
                    <h3>Đơn hàng #${order.id.toString().slice(-6)}</h3>
                    <p><i class="far fa-calendar-alt"></i> ${order.date}</p>
                </div>
                <div>
                    <span class="order-status">${order.status}</span>
                </div>
            `;
            
            // Tạo phần thông tin khách hàng
            const orderDetails = document.createElement("div");
            orderDetails.classList.add("order-details");
            orderDetails.innerHTML = `
                <h4>Thông tin khách hàng</h4>
                <p><i class="fas fa-user"></i> ${order.customer.name}</p>
                <p><i class="fas fa-phone"></i> ${order.customer.phone}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${order.customer.address}</p>
                <p><i class="fas fa-money-bill-wave"></i> ${order.customer.payment}</p>
                ${order.customer.transactionId ? `<p><i class="fas fa-receipt"></i> Mã giao dịch: ${order.customer.transactionId}</p>` : ''}
            `;
            
            // Tạo phần sản phẩm đã đặt
            const orderItems = document.createElement("div");
            orderItems.classList.add("order-items");
            orderItems.innerHTML = "<h4>Sản phẩm đã đặt</h4>";
            
            // Thêm từng sản phẩm vào phần sản phẩm đã đặt
            order.items.forEach(item => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("order-item");
                
                // Tính tổng tiền của sản phẩm
                const itemPriceNumber = parseInt(item.price.replace(/\D/g, ""));
                const itemTotal = itemPriceNumber * item.quantity;
                
                // Tạo HTML cho sản phẩm
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <p style="font-weight: bold;">${item.name}</p>
                        <p>${item.quantity} x ${item.price} = ${itemTotal.toLocaleString()}đ</p>
                    </div>
                `;
                
                // Thêm sản phẩm vào container
                orderItems.appendChild(itemElement);
            });
            
            // Tạo phần tổng tiền đơn hàng
            const orderTotal = document.createElement("div");
            orderTotal.classList.add("order-total");
            orderTotal.innerHTML = `Tổng cộng: ${order.totalPrice.toLocaleString()}đ`;
            
            // Thêm tất cả các phần vào card đơn hàng
            orderCard.appendChild(orderHeader);
            orderCard.appendChild(orderDetails);
            orderCard.appendChild(orderItems);
            orderCard.appendChild(orderTotal);
            
            // Thêm card đơn hàng vào container
            orderHistoryContainer.appendChild(orderCard);
        });
    }
});