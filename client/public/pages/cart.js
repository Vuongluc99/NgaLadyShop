/**
 * Giỏ hàng - Xử lý chức năng giỏ hàng
 * 
 * File này chứa tất cả các chức năng liên quan đến giỏ hàng:
 * - Thêm/xóa sản phẩm
 * - Cập nhật số lượng
 * - Tính tổng tiền, thuế, phí vận chuyển
 * - Lưu giỏ hàng vào localStorage
 * - Chức năng "Lưu lại sau"
 */

document.addEventListener("DOMContentLoaded", function () {
    // Lấy các phần tử DOM
    const cartItemsContainer = document.getElementById("cart-items");
    const clearCartButton = document.getElementById("clear-cart");

    // Khởi tạo giỏ hàng từ localStorage
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
        console.error("Error parsing cart data from localStorage:", error);
        cart = [];
        localStorage.removeItem("cart");
    }

    /**
     * Lưu giỏ hàng vào localStorage và cập nhật giao diện
     */
    function saveCartAndRefresh() {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    }

    /**
     * Cập nhật hiển thị giỏ hàng
     * @param {HTMLElement} targetElement - Phần tử chứa các mục giỏ hàng
     */
    function updateCartDisplay(targetElement = cartItemsContainer) {
        targetElement.innerHTML = "";

        let totalPrice = 0;
        let totalQuantity = 0;
        cart.forEach((item, index) => {
            // Tạo phần tử cho mỗi sản phẩm
            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");

            // Tạo hình ảnh sản phẩm
            const imageElement = document.createElement("img");
            imageElement.src = item.image;
            imageElement.alt = item.name;
            imageElement.classList.add("cart-item-image");

            // Tạo phần thông tin sản phẩm
            const itemInfo = document.createElement("div");
            itemInfo.classList.add('cart-item-info');

            // Tên sản phẩm
            const itemName = document.createElement("h4");
            itemName.textContent = item.name;
            itemName.style.margin = "0 0 5px 0";
            itemInfo.appendChild(itemName);

            // Giá sản phẩm
            const itemPrice = document.createElement("p");
            itemPrice.textContent = `Đơn giá: ${item.price}`;
            itemPrice.style.margin = "0 0 5px 0";
            itemInfo.appendChild(itemPrice);

            // Số lượng sản phẩm
            const itemQuantity = document.createElement("p");
            itemQuantity.textContent = `Số lượng: ${item.quantity}`;
            itemQuantity.style.margin = "0 0 5px 0";
            itemInfo.appendChild(itemQuantity);

            // Tính và hiển thị tổng tiền sản phẩm
            const priceValue = parseInt(item.price.replace(/\D/g, ""));
            const itemTotalPrice = priceValue * item.quantity;
            const itemTotal = document.createElement("p");
            itemTotal.textContent = `Thành tiền: ${itemTotalPrice.toLocaleString()}đ`;
            itemTotal.style.fontWeight = "bold";
            itemTotal.style.color = "#e44d26";
            itemTotal.style.margin = "0";
            itemInfo.appendChild(itemTotal);

            itemElement.appendChild(imageElement);
            itemElement.appendChild(itemInfo);

            // Thêm các nút điều khiển số lượng và xóa nếu đang ở trang giỏ hàng
            if (targetElement === cartItemsContainer) {
                // Tạo container cho các nút
                const buttonContainer = document.createElement("div");
                buttonContainer.style.display = "flex";
                buttonContainer.style.flexDirection = "column";
                buttonContainer.style.gap = "5px";
                buttonContainer.style.marginLeft = "10px";

                // Container điều khiển số lượng
                const quantityControl = document.createElement("div");
                quantityControl.style.display = "flex";
                quantityControl.style.alignItems = "center";

                // Nút tăng số lượng
                const increaseButton = document.createElement("button");
                increaseButton.textContent = "➕";
                increaseButton.onclick = function () { increaseQuantity(index); };
                increaseButton.classList.add("quantity-button", "increase-button");

                // Nút giảm số lượng
                const decreaseButton = document.createElement("button");
                decreaseButton.textContent = "➖";
                decreaseButton.onclick = function () { decreaseQuantity(index); };
                decreaseButton.classList.add("quantity-button", "decrease-button");

                quantityControl.appendChild(decreaseButton);
                quantityControl.appendChild(increaseButton);
                buttonContainer.appendChild(quantityControl);

                // Nút xóa sản phẩm
                const removeButton = document.createElement("button");
                removeButton.textContent = "🗑 Xóa";
                removeButton.onclick = function () { removeFromCart(index); };
                removeButton.classList.add("remove-button");
                buttonContainer.appendChild(removeButton);

                // Nút lưu lại sau
                const saveButton = document.createElement("button");
                saveButton.textContent = "💾 Lưu lại sau";
                saveButton.onclick = function () { saveForLater(index); };
                saveButton.style.backgroundColor = "#4267B2";
                saveButton.style.color = "white";
                saveButton.style.border = "none";
                saveButton.style.padding = "5px 10px";
                saveButton.style.cursor = "pointer";
                saveButton.style.borderRadius = "5px";
                buttonContainer.appendChild(saveButton);

                itemElement.appendChild(buttonContainer);
            }

            targetElement.appendChild(itemElement);

            // Tính tổng cho tóm tắt đơn hàng
            const itemPriceValue = parseInt(item.price.replace(/\D/g, ""));
            const itemTotalValue = itemPriceValue * item.quantity;
            totalPrice += itemTotalValue;
            totalQuantity += item.quantity;
        });

        /**
         * Cập nhật số lượng sản phẩm trên icon giỏ hàng
         */
        function updateCartTotalTotal() {
            const cartCountElements = document.querySelectorAll("#cart-count");
            cartCountElements.forEach(cartCountElement => {
                cartCountElement.textContent = totalQuantity;
            });
        }
        updateCartTotalTotal();

        // Hiển thị thông báo nếu giỏ hàng trống
        if (cart.length === 0) {
            const emptyCartMessage = document.createElement("div");
            emptyCartMessage.style.textAlign = "center";
            emptyCartMessage.style.padding = "20px";
            emptyCartMessage.style.color = "#666";
            emptyCartMessage.innerHTML = `
                <i class="fas fa-shopping-cart" style="font-size: 48px; color: #ddd; margin-bottom: 10px;"></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <a href="index.html" style="color: #ff5733; text-decoration: none;">Tiếp tục mua sắm</a>
            `;
            targetElement.appendChild(emptyCartMessage);
        }

        // Tạo hoặc cập nhật tóm tắt đơn hàng
        let orderSummary = document.getElementById("order-summary");
        if (!orderSummary && cart.length > 0) {
            orderSummary = document.createElement("div");
            orderSummary.id = "order-summary";
            orderSummary.style.marginTop = "20px";
            orderSummary.style.padding = "15px";
            orderSummary.style.backgroundColor = "#f9f9f9";
            orderSummary.style.borderRadius = "5px";
            orderSummary.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            cartItemsContainer.parentNode.insertBefore(orderSummary, cartItemsContainer.nextSibling);
        } else if (orderSummary) {
            orderSummary.innerHTML = "";
            if (cart.length === 0) {
                orderSummary.style.display = "none";
            } else {
                orderSummary.style.display = "block";
            }
        }

        // Tạo nội dung tóm tắt đơn hàng nếu có sản phẩm
        if (cart.length > 0 && orderSummary) {
            // Tiêu đề hóa đơn
            const summaryTitle = document.createElement("h3");
            summaryTitle.textContent = "Hóa đơn mua hàng";
            summaryTitle.style.marginTop = "0";
            orderSummary.appendChild(summaryTitle);

            // Tạm tính
            const subtotal = document.createElement("p");
            subtotal.innerHTML = `Tạm tính: <span style="float: right;">${totalPrice.toLocaleString()}đ</span>`;
            orderSummary.appendChild(subtotal);

            // Tính thuế (10%)
            const taxAmount = Math.round(totalPrice * 0.1);
            const tax = document.createElement("p");
            tax.innerHTML = `Thuế (10%): <span style="float: right;">${taxAmount.toLocaleString()}đ</span>`;
            orderSummary.appendChild(tax);

            // Tính phí vận chuyển (miễn phí cho đơn hàng trên 500,000đ)
            let shippingCost = 30000; // Phí vận chuyển mặc định
            if (totalPrice >= 500000) {
                shippingCost = 0;
            }

            // Hiển thị phí vận chuyển
            const shipping = document.createElement("p");
            shipping.innerHTML = `Phí vận chuyển: <span style="float: right;">${shippingCost > 0 ? shippingCost.toLocaleString() + 'đ' : 'Miễn phí'}</span>`;
            orderSummary.appendChild(shipping);

            // Hiển thị ghi chú về miễn phí vận chuyển
            if (totalPrice < 500000) {
                const freeShippingNote = document.createElement("p");
                freeShippingNote.style.fontSize = "12px";
                freeShippingNote.style.color = "#666";
                freeShippingNote.textContent = `Mua thêm ${(500000 - totalPrice).toLocaleString()}đ để được miễn phí vận chuyển`;
                orderSummary.appendChild(freeShippingNote);
            }

            // Thêm đường phân cách
            const divider = document.createElement("hr");
            divider.style.margin = "10px 0";
            divider.style.border = "none";
            divider.style.borderTop = "1px solid #ddd";
            orderSummary.appendChild(divider);

            // Tính tổng cuối cùng
            const finalTotal = totalPrice + taxAmount + shippingCost;
            const total = document.createElement("p");
            total.style.fontWeight = "bold";
            total.style.fontSize = "18px";
            total.innerHTML = `Tổng tiền: <span style="float: right; color: #e44d26;">${finalTotal.toLocaleString()}đ</span>`;
            orderSummary.appendChild(total);
        }

        // Cập nhật hiển thị nút xóa giỏ hàng
        if (clearCartButton) {
            clearCartButton.style.display = cart.length > 0 ? "inline-block" : "none";
        }

        // Cập nhật hiển thị nút thanh toán
        const checkoutButton = document.getElementById("checkout-button");
        if (checkoutButton) {
            checkoutButton.style.display = cart.length > 0 ? "inline-block" : "none";
        }
    }

    // Chức năng "Lưu lại sau"
    let savedItems = [];
    try {
        savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];
    } catch (error) {
        console.error("Error parsing saved items from localStorage:", error);
        savedItems = [];
        localStorage.removeItem("savedItems");
    }

    /**
     * Chuyển sản phẩm từ giỏ hàng sang danh sách lưu
     * @param {number} index - Vị trí sản phẩm trong giỏ hàng
     */
    window.saveForLater = function (index) {
        // Chuyển sản phẩm từ giỏ hàng sang danh sách đã lưu
        const item = cart.splice(index, 1)[0];
        savedItems.push(item);
        localStorage.setItem("savedItems", JSON.stringify(savedItems));
        saveCartAndRefresh();
        updateSavedItemsDisplay();
    };

    /**
     * Cập nhật hiển thị danh sách sản phẩm đã lưu
     */
    function updateSavedItemsDisplay() {
        // Tạo hoặc lấy container cho sản phẩm đã lưu
        let savedItemsSection = document.getElementById("saved-items-section");
        if (!savedItemsSection && savedItems.length > 0) {
            savedItemsSection = document.createElement("section");
            savedItemsSection.id = "saved-items-section";
            savedItemsSection.classList.add("cart-container");
            savedItemsSection.style.marginTop = "30px";

            const savedItemsTitle = document.createElement("h2");
            savedItemsTitle.textContent = "Sản phẩm đã lưu";
            savedItemsSection.appendChild(savedItemsTitle);

            const savedItemsContainer = document.createElement("div");
            savedItemsContainer.id = "saved-items";
            savedItemsSection.appendChild(savedItemsContainer);

            document.querySelector(".cart-container").parentNode.appendChild(savedItemsSection);
        } else if (savedItemsSection) {
            const savedItemsContainer = document.getElementById("saved-items");
            savedItemsContainer.innerHTML = "";

            if (savedItems.length === 0) {
                savedItemsSection.style.display = "none";
            } else {
                savedItemsSection.style.display = "block";

                // Hiển thị các sản phẩm đã lưu
                savedItems.forEach((item, index) => {
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("cart-item");

                    const imageElement = document.createElement("img");
                    imageElement.src = item.image;
                    imageElement.alt = item.name;
                    imageElement.classList.add("cart-item-image");

                    const itemInfo = document.createElement("div");
                    itemInfo.classList.add('cart-item-info');

                    const itemName = document.createElement("h4");
                    itemName.textContent = item.name;
                    itemInfo.appendChild(itemName);

                    const itemPrice = document.createElement("p");
                    itemPrice.textContent = `Giá: ${item.price}`;
                    itemInfo.appendChild(itemPrice);

                    itemElement.appendChild(imageElement);
                    itemElement.appendChild(itemInfo);

                    // Nút thêm vào giỏ hàng
                    const addToCartButton = document.createElement("button");
                    addToCartButton.textContent = "🛒 Thêm vào giỏ hàng";
                    addToCartButton.style.backgroundColor = "#4CAF50";
                    addToCartButton.style.color = "white";
                    addToCartButton.style.border = "none";
                    addToCartButton.style.padding = "5px 10px";
                    addToCartButton.style.cursor = "pointer";
                    addToCartButton.style.borderRadius = "5px";
                    addToCartButton.onclick = function () { moveToCart(index); };

                    // Nút xóa
                    const removeButton = document.createElement("button");
                    removeButton.textContent = "🗑 Xóa";
                    removeButton.classList.add("remove-button");
                    removeButton.style.marginLeft = "10px";
                    removeButton.onclick = function () { removeSavedItem(index); };

                    const buttonContainer = document.createElement("div");
                    buttonContainer.appendChild(addToCartButton);
                    buttonContainer.appendChild(removeButton);
                    itemElement.appendChild(buttonContainer);

                    savedItemsContainer.appendChild(itemElement);
                });
            }
        }
    }

    /**
     * Chuyển sản phẩm từ danh sách lưu sang giỏ hàng
     * @param {number} index - Vị trí sản phẩm trong danh sách lưu
     */
    window.moveToCart = function (index) {
        // Chuyển sản phẩm từ danh sách đã lưu sang giỏ hàng
        const item = savedItems.splice(index, 1)[0];

        // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
        const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += item.quantity;
        } else {
            cart.push(item);
        }

        localStorage.setItem("savedItems", JSON.stringify(savedItems));
        saveCartAndRefresh();
        updateSavedItemsDisplay();
    };

    /**
     * Xóa sản phẩm khỏi danh sách lưu
     * @param {number} index - Vị trí sản phẩm trong danh sách lưu
     */
    window.removeSavedItem = function (index) {
        savedItems.splice(index, 1);
        localStorage.setItem("savedItems", JSON.stringify(savedItems));
        updateSavedItemsDisplay();
    };

    /**
     * Tăng số lượng sản phẩm trong giỏ hàng
     * @param {number} index - Vị trí sản phẩm trong giỏ hàng
     */
    window.increaseQuantity = function (index) {
        cart[index].quantity++;
        saveCartAndRefresh();
    };

    /**
     * Giảm số lượng sản phẩm trong giỏ hàng
     * @param {number} index - Vị trí sản phẩm trong giỏ hàng
     */
    window.decreaseQuantity = function (index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            cart.splice(index, 1);
        }
        saveCartAndRefresh();
    };

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * @param {number} index - Vị trí sản phẩm trong giỏ hàng
     */
    window.removeFromCart = function (index) {
        cart.splice(index, 1);
        saveCartAndRefresh();
    };

    // Xử lý nút xóa giỏ hàng
    if (clearCartButton) {
        clearCartButton.addEventListener("click", function () {
            cart = [];
            saveCartAndRefresh();
        });
    }

    // Khởi tạo hiển thị giỏ hàng
    updateCartDisplay();

    /**
     * Lấy danh sách sản phẩm trong giỏ hàng
     * @returns {Array} Mảng các sản phẩm trong giỏ hàng
     */
    window.getCartItems = function () {
        return cart;
    }

    /**
     * Cập nhật số lượng sản phẩm hiển thị trên icon giỏ hàng
     * @param {number} count - Số lượng sản phẩm
     */
    window.updateCartCount = function (count) {
        const cartCountElements = document.querySelectorAll("#cart-count");
        cartCountElements.forEach(item => {
            item.textContent = count;
        });
    }

    /**
     * Cập nhật tổng số lượng sản phẩm trong giỏ hàng
     */
    window.updateTotal = function () {
        let totalPrice = 0;
        let totalQuantity = 0;
        cart.forEach((item, index) => {
            const itemPrice = parseInt(item.price.replace(/\D/g, ""));
            const itemTotal = itemPrice * item.quantity;
            totalPrice += itemTotal;
            totalQuantity += item.quantity;
        });
        const cartCountElements = document.querySelectorAll("#cart-count");
        cartCountElements.forEach(cartCountElement => {
            cartCountElement.textContent = totalQuantity;
        });
    }
    window.updateTotal();
});