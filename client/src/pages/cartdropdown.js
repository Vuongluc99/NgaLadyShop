/**
 * Cart Dropdown - Hiển thị dropdown cho giỏ hàng
 * 
 * File này chứa các chức năng để hiển thị giỏ hàng dạng dropdown khi di chuột qua icon giỏ hàng
 * - Hiển thị sản phẩm đã thêm vào giỏ hàng
 * - Hiển thị số lượng và giá sản phẩm
 * - Hiển thị tổng giá trị đơn hàng
 * - Liên kết đến trang giỏ hàng
 */

document.addEventListener("DOMContentLoaded", function() {
    // Lấy các phần tử DOM cần thiết
    const cartContainer = document.querySelector('.cart');
    const cartDropdown = document.getElementById('cart-dropdown');
    
    if (!cartContainer || !cartDropdown) return;
    
    // Thêm sự kiện hiển thị/ẩn dropdown khi di chuột vào/ra giỏ hàng
    cartContainer.addEventListener('mouseenter', showDropdown);
    cartContainer.addEventListener('mouseleave', hideDropdown);
    
    // Hiển thị dropdown
    function showDropdown() {
        updateCartDropdown();
        cartDropdown.style.display = 'block';
    }
    
    // Ẩn dropdown
    function hideDropdown() {
        cartDropdown.style.display = 'none';
    }
    
    // Cập nhật nội dung dropdown
    function updateCartDropdown() {
        // Lấy dữ liệu giỏ hàng từ localStorage
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem("cart")) || [];
        } catch (error) {
            console.error("Error parsing cart data from localStorage:", error);
            cart = [];
        }
        
        // Xóa nội dung hiện tại của dropdown
        cartDropdown.innerHTML = "";
        
        // Nếu giỏ hàng trống, hiển thị thông báo
        if (cart.length === 0) {
            cartDropdown.innerHTML = `
                <div class="empty-cart">
                    <p>Giỏ hàng của bạn đang trống</p>
                    <a href="index.html">Tiếp tục mua sắm</a>
                </div>
            `;
            return;
        }
        
        // Tạo phần hiển thị danh sách sản phẩm
        const cartItemsContainer = document.createElement('div');
        cartItemsContainer.classList.add('cart-items');
        
        // Giới hạn hiển thị tối đa 3 sản phẩm trong dropdown
        const itemsToShow = cart.slice(0, 3);
        let totalPrice = 0;
        
        // Thêm từng sản phẩm vào dropdown
        itemsToShow.forEach(item => {
            // Tính giá trị của sản phẩm
            const itemPrice = parseInt(item.price.replace(/\D/g, ""));
            const itemTotal = itemPrice * item.quantity;
            totalPrice += itemTotal;
            
            // Tạo phần tử hiển thị sản phẩm
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">SL: ${item.quantity}</div>
                    <div class="item-price">${itemTotal.toLocaleString()}đ</div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Thêm phần hiển thị "còn nữa" nếu có nhiều hơn 3 sản phẩm
        if (cart.length > 3) {
            const moreItems = document.createElement('div');
            moreItems.classList.add('more-items');
            moreItems.textContent = `Còn ${cart.length - 3} sản phẩm khác...`;
            moreItems.style.textAlign = 'center';
            moreItems.style.padding = '8px';
            moreItems.style.color = '#666';
            moreItems.style.fontStyle = 'italic';
            cartItemsContainer.appendChild(moreItems);
        }
        
        // Tính tổng giá trị tất cả sản phẩm trong giỏ hàng (không chỉ những sản phẩm được hiển thị)
        totalPrice = 0;
        cart.forEach(item => {
            const itemPrice = parseInt(item.price.replace(/\D/g, ""));
            const itemTotal = itemPrice * item.quantity;
            totalPrice += itemTotal;
        });
        
        // Tạo phần hiển thị tổng giá trị
        const cartTotal = document.createElement('div');
        cartTotal.classList.add('cart-total');
        cartTotal.innerHTML = `
            <span>Tổng tiền:</span>
            <span>${totalPrice.toLocaleString()}đ</span>
        `;
        
        // Tạo nút xem giỏ hàng
        const cartActions = document.createElement('div');
        cartActions.classList.add('cart-actions');
        cartActions.innerHTML = `
            <a href="cart.html" class="view-cart-btn">Xem giỏ hàng</a>
        `;
        
        // Thêm tất cả các phần tử vào dropdown
        cartDropdown.appendChild(cartItemsContainer);
        cartDropdown.appendChild(cartTotal);
        cartDropdown.appendChild(cartActions);
    }
    
    // Ban đầu, đảm bảo dropdown được ẩn
    hideDropdown();
    
    // Cập nhật dropdown khi có thay đổi trong giỏ hàng
    // Lắng nghe sự kiện "storage" để cập nhật khi localStorage thay đổi
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartDropdown();
        }
    });
    
    // Cập nhật dropdown khi trang được tải
    updateCartDropdown();
});