/**
 * Thanh toán - Xử lý quá trình thanh toán
 * 
 * File này chứa tất cả các chức năng liên quan đến quá trình thanh toán:
 * - Hiển thị chi tiết đơn hàng
 * - Tính tổng tiền, thuế, phí vận chuyển
 * - Xử lý các phương thức thanh toán
 * - Lưu lịch sử đơn hàng
 * - Hiển thị xác nhận đơn hàng
 */

document.addEventListener("DOMContentLoaded", function() {
    // Lấy các phần tử DOM
    const checkoutForm = document.getElementById("checkout-form");
    const orderItemsContainer = document.getElementById("order-items");
    const paymentMethodSelect = document.getElementById("payment");
    const paymentConfirmSection = document.getElementById("payment-confirm-section");
    const paymentDetailsContainer = document.getElementById("payment-details");
    const orderConfirmationContainer = document.getElementById("order-confirmation-container");
    const orderConfirmationItems = document.getElementById("order-confirmation-items");
    const orderConfirmationTotal = document.getElementById("order-confirmation-total");
    const orderTotalElement = document.querySelector(".order-total"); // Lấy phần tử có class "order-total"

    // Lấy thông tin giỏ hàng từ localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
        console.error("Error parsing cart data from localStorage:", error);
        cart = [];
    }

    // Khởi tạo biến tính tổng
    let totalPrice = 0;
    let taxAmount = 0;
    let shippingCost = 0;
    let finalTotal = 0;

    /**
     * Tính tổng tiền, thuế và phí vận chuyển của đơn hàng
     */
    function calculateTotals() {
        totalPrice = 0;
        cart.forEach(item => {
            const priceValue = parseInt(item.price.replace(/\D/g, ""));
            totalPrice += priceValue * item.quantity;
        });

        // Tính thuế (10%)
        taxAmount = Math.round(totalPrice * 0.1);

        // Tính phí vận chuyển (miễn phí cho đơn hàng trên 500,000đ)
        shippingCost = totalPrice >= 500000 ? 0 : 30000;

        // Tính tổng cuối cùng
        finalTotal = totalPrice + taxAmount + shippingCost;
    }

    /**
     * Hiển thị các sản phẩm trong đơn hàng
     */
    function displayOrderItems() {
        if (!orderItemsContainer) return;

        orderItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            const emptyCartMessage = document.createElement("p");
            emptyCartMessage.textContent = "Giỏ hàng của bạn đang trống";
            orderItemsContainer.appendChild(emptyCartMessage);
            return;
        }

        calculateTotals();

        // Cập nhật phần tử hiển thị tổng tiền
        if (orderTotalElement) {
            orderTotalElement.textContent = finalTotal.toLocaleString() + "đ";
        }

        // Hiển thị từng sản phẩm
        cart.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("order-item");
            itemElement.style.display = "flex";
            itemElement.style.alignItems = "center";
            itemElement.style.marginBottom = "10px";
            itemElement.style.padding = "10px";
            itemElement.style.borderBottom = "1px solid #eee";

            // Hình ảnh sản phẩm
            const imageElement = document.createElement("img");
            imageElement.src = item.image;
            imageElement.alt = item.name;
            imageElement.style.width = "50px";
            imageElement.style.height = "50px";
            imageElement.style.marginRight = "10px";
            imageElement.style.objectFit = "cover";

            // Container thông tin sản phẩm
            const itemDetails = document.createElement("div");
            itemDetails.style.flex = "1";

            // Tên sản phẩm
            const itemName = document.createElement("h4");
            itemName.textContent = item.name;
            itemName.style.margin = "0 0 5px 0";
            itemDetails.appendChild(itemName);

            // Giá và số lượng
            const itemInfo = document.createElement("p");
            itemInfo.textContent = `${item.price} x ${item.quantity}`;
            itemInfo.style.margin = "0";
            itemDetails.appendChild(itemInfo);

            // Tổng tiền của sản phẩm
            const priceValue = parseInt(item.price.replace(/\D/g, ""));
            const itemTotal = document.createElement("p");
            itemTotal.textContent = `${(priceValue * item.quantity).toLocaleString()}đ`;
            itemTotal.style.fontWeight = "bold";
            itemTotal.style.margin = "0 0 0 auto";

            itemElement.appendChild(imageElement);
            itemElement.appendChild(itemDetails);
            itemElement.appendChild(itemTotal);

            orderItemsContainer.appendChild(itemElement);
        });

        // Thêm tóm tắt đơn hàng
        const summaryElement = document.createElement("div");
        summaryElement.classList.add("order-summary");
        summaryElement.style.marginTop = "20px";
        summaryElement.style.padding = "15px";
        summaryElement.style.backgroundColor = "#f9f9f9";
        summaryElement.style.borderRadius = "5px";

        // Tạm tính
        const subtotal = document.createElement("p");
        subtotal.innerHTML = `Tạm tính: <span style="float: right;">${totalPrice.toLocaleString()}đ</span>`;
        subtotal.style.margin = "5px 0";
        summaryElement.appendChild(subtotal);

        // Thuế
        const tax = document.createElement("p");
        tax.innerHTML = `Thuế (10%): <span style="float: right;">${taxAmount.toLocaleString()}đ</span>`;
        tax.style.margin = "5px 0";
        summaryElement.appendChild(tax);

        // Phí vận chuyển
        const shipping = document.createElement("p");
        shipping.innerHTML = `Phí vận chuyển: <span style="float: right;">${shippingCost > 0 ? shippingCost.toLocaleString() + 'đ' : 'Miễn phí'}</span>`;
        shipping.style.margin = "5px 0";
        summaryElement.appendChild(shipping);

        // Đường phân cách
        const divider = document.createElement("hr");
        divider.style.margin = "10px 0";
        divider.style.border = "none";
        divider.style.borderTop = "1px solid #ddd";
        summaryElement.appendChild(divider);

        // Tổng tiền
        const total = document.createElement("p");
        total.innerHTML = `<strong>Tổng tiền: <span style="float: right; color: #e44d26;">${finalTotal.toLocaleString()}đ</span></strong>`;
        total.style.fontSize = "16px";
        summaryElement.appendChild(total);

        orderItemsContainer.appendChild(summaryElement);
    }

    /**
     * Cập nhật thông tin thanh toán dựa trên phương thức đã chọn
     */
    function updatePaymentDetails() {
        const selectedPayment = paymentMethodSelect.value;

        // Hiển thị phần xác nhận thanh toán
        paymentConfirmSection.style.display = "block";

        // Xóa nội dung trước đó
        paymentDetailsContainer.innerHTML = "";

        if (selectedPayment === "cod") {
            paymentDetailsContainer.innerHTML = `
                <div style="text-align: center;">
                    <img src="icons/icon-shop.png" alt="COD" style="width: 60px; height: auto; margin-bottom: 10px;">
                    <p style="margin: 0; font-weight: bold;">Thanh toán khi nhận hàng</p>
                    <p style="margin: 5px 0 0;">Bạn sẽ thanh toán số tiền <strong>${finalTotal.toLocaleString()}đ</strong> khi nhận hàng</p>
                </div>
            `;
        } else if (selectedPayment === "momo") {
            paymentDetailsContainer.innerHTML = `
                <div style="text-align: center;">
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="Momo" style="width: 60px; height: auto; margin-bottom: 10px;">
                    <p style="margin: 0; font-weight: bold;">Thanh toán qua ví Momo</p>
                    <p style="margin: 5px 0;">Số điện thoại: <strong>0987654321</strong></p>
                    <p style="margin: 5px 0;">Tên người nhận: <strong>NgaLady Shop</strong></p>
                    <p style="margin: 5px 0;">Số tiền: <strong>${finalTotal.toLocaleString()}đ</strong></p>
                    <p style="margin: 5px 0;">Nội dung chuyển khoản: <strong>Thanh toán đơn hàng</strong></p>
                </div>
            `;
        } else if (selectedPayment === "QR") {
            paymentDetailsContainer.innerHTML = `
                <div style="text-align: center;">
                    <img src="https://i.imgur.com/QmOngsc.png" alt="QR Code" style="width: 150px; height: auto; margin-bottom: 10px;">
                    <p style="margin: 0; font-weight: bold;">Thanh toán qua QR Code</p>
                    <p style="margin: 5px 0;">Quét mã QR trên để thanh toán</p>
                    <p style="margin: 5px 0;">Ngân hàng: <strong>VietinBank</strong></p>
                    <p style="margin: 5px 0;">Số tài khoản: <strong>123456789</strong></p>
                    <p style="margin: 5px 0;">Tên chủ tài khoản: <strong>NgaLady Shop</strong></p>
                    <p style="margin: 5px 0;">Số tiền: <strong>${finalTotal.toLocaleString()}đ</strong></p>
                    <p style="margin: 5px 0;">Nội dung chuyển khoản: <strong>Thanh toán đơn hàng</strong></p>
                </div>
            `;
        }
    }

    /**
     * Hiển thị xác nhận đơn hàng
     * @param {Object} orderData - Dữ liệu đơn hàng
     */
    function displayOrderConfirmation(orderData) {
        if (!orderConfirmationItems || !orderConfirmationTotal) return;

        // Hiển thị các sản phẩm đã đặt
        orderConfirmationItems.innerHTML = "";

        orderData.items.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("confirmation-item");
            itemElement.style.display = "flex";
            itemElement.style.alignItems = "center";
            itemElement.style.marginBottom = "10px";
            itemElement.style.padding = "10px";
            itemElement.style.borderBottom = "1px solid #eee";

            // Thông tin sản phẩm
            const itemDetails = document.createElement("div");
            itemDetails.style.flex = "1";
            
            const itemName = document.createElement("h4");
            itemName.textContent = item.name;
            itemName.style.margin = "0 0 5px 0";
            itemDetails.appendChild(itemName);
            
            const itemInfo = document.createElement("p");
            itemInfo.textContent = `${item.price} x ${item.quantity}`;
            itemInfo.style.margin = "0";
            itemDetails.appendChild(itemInfo);
            
            // Tổng tiền sản phẩm
            const priceValue = parseInt(item.price.replace(/\D/g, ""));
            const itemTotal = document.createElement("p");
            itemTotal.textContent = `${(priceValue * item.quantity).toLocaleString()}đ`;
            itemTotal.style.fontWeight = "bold";
            itemTotal.style.margin = "0 0 0 auto";
            
            itemElement.appendChild(itemDetails);
            itemElement.appendChild(itemTotal);
            
            orderConfirmationItems.appendChild(itemElement);
        });
        
        // Vì chúng ta sử dụng cấu trúc dữ liệu đơn giản cho lịch sử đơn hàng,
        // chúng ta sẽ hiển thị các giá trị tính toán hiện tại cho trang xác nhận
        // Tính lại tạm tính từ các sản phẩm
        let subtotalValue = 0;
        orderData.items.forEach(item => {
            const priceValue = parseInt(item.price.replace(/\D/g, ""));
            subtotalValue += priceValue * item.quantity;
        });
        
        // Tính thuế và phí vận chuyển cho mục đích hiển thị
        const taxValue = Math.round(subtotalValue * 0.1);
        const shippingValue = subtotalValue >= 500000 ? 0 : 30000;
        
        // Hiển thị tổng đơn hàng và chi tiết
        orderConfirmationTotal.innerHTML = `
            <p>Tạm tính: ${subtotalValue.toLocaleString()}đ</p>
            <p>Thuế (10%): ${taxValue.toLocaleString()}đ</p>
            <p>Phí vận chuyển: ${shippingValue > 0 ? shippingValue.toLocaleString() + 'đ' : 'Miễn phí'}</p>
            <p><strong>Tổng tiền: ${orderData.totalPrice.toLocaleString()}đ</strong></p>
            <p>Phương thức thanh toán: ${orderData.customer.payment}</p>
            <p>Địa chỉ giao hàng: ${orderData.customer.address}</p>
        `;
        
        // Hiển thị container xác nhận đơn hàng
        orderConfirmationContainer.style.display = "block";
        
        // Ẩn form thanh toán
        checkoutForm.style.display = "none";
    }

    /**
     * Lấy văn bản mô tả phương thức thanh toán
     * @param {string} method - Mã phương thức thanh toán
     * @returns {string} Văn bản mô tả phương thức thanh toán
     */
    function getPaymentMethodText(method) {
        switch(method) {
            case "cod":
                return "Thanh toán khi nhận hàng (COD)";
            case "momo":
                return "Ví Momo";
            case "QR":
                return "Chuyển khoản Ngân hàng (QR code)";
            default:
                return method;
        }
    }

    /**
     * Lưu đơn hàng vào lịch sử
     * @param {Object} orderData - Dữ liệu đơn hàng
     */
    function saveOrderToHistory(orderData) {
        try {
            // Lấy các đơn hàng hiện có
            let orders = JSON.parse(localStorage.getItem("orderHistory")) || [];
            
            // Thêm đơn hàng mới
            orders.push(orderData);
            
            // Lưu vào localStorage
            localStorage.setItem("orderHistory", JSON.stringify(orders));
        } catch (error) {
            console.error("Error saving order to history:", error);
        }
    }

    /**
     * Khởi tạo trang thanh toán
     */
    function initCheckout() {
        // Hiển thị các sản phẩm trong đơn hàng
        displayOrderItems();
        
        // Thiết lập listener theo dõi thay đổi phương thức thanh toán
        paymentMethodSelect.addEventListener("change", updatePaymentDetails);
        
        // Thiết lập xử lý submit form thanh toán
        checkoutForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            // Lấy dữ liệu từ form
            const name = document.getElementById("name").value;
            const phone = document.getElementById("phone").value;
            const address = document.getElementById("address").value;
            const paymentMethod = paymentMethodSelect.value;
            
            // Tạo dữ liệu đơn hàng - cấu trúc phù hợp với trang history.html
            const orderData = {
                id: Date.now().toString(),
                date: new Date().toLocaleString(),
                customer: {
                    name: name,
                    phone: phone,
                    address: address,
                    payment: getPaymentMethodText(paymentMethod)
                },
                items: [...cart],
                totalPrice: finalTotal, // Sử dụng finalTotal để phù hợp với trang lịch sử
                status: "Đang xử lý"
            };

            // Lưu đơn hàng vào lịch sử
            saveOrderToHistory(orderData);

            // Xóa giỏ hàng
            localStorage.setItem("cart", JSON.stringify([]));

            // Cập nhật số lượng hiển thị trong giỏ hàng
            const cartCountElements = document.querySelectorAll("#cart-count");
            cartCountElements.forEach(element => {
                element.textContent = "0";
            });

            // Hiển thị xác nhận đơn hàng
            displayOrderConfirmation(orderData);
        });

        // Khởi tạo hiển thị chi tiết thanh toán nếu đã chọn phương thức
        if (paymentMethodSelect.value) {
            updatePaymentDetails();
        }
    }

    // Khởi chạy quá trình thanh toán
    initCheckout();
});