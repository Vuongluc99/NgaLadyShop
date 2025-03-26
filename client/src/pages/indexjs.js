/**
 * Trang chính - Xử lý chức năng cho trang chủ
 * 
 * File này xử lý các chức năng:
 * - Tìm kiếm sản phẩm
 * - Thêm sản phẩm vào giỏ hàng
 * - Cập nhật số lượng sản phẩm trong giỏ hàng
 */

// Khởi tạo biến toàn cục
let cartCount = 0;
const buttons = document.querySelectorAll(".add-to-cart");
const cartCountElement = document.getElementById("cart-count");
let cart = [];

/**
 * Chức năng tìm kiếm sản phẩm
 */
document.addEventListener("DOMContentLoaded", function() {
    // Lấy các phần tử DOM cho tìm kiếm
    const searchInput = document.querySelector(".search-container input[type='text']");
    const searchButton = document.querySelector(".search-container button");
    const productGrid = document.querySelector(".product-grid");
    const productCards = document.querySelectorAll(".product-card");
    
    // Thêm listener cho nút tìm kiếm
    searchButton.addEventListener("click", function() {
        performSearch();
    });
    
    // Thêm listener cho phím Enter trong ô tìm kiếm
    searchInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            performSearch();
        }
        
        // Nếu ô tìm kiếm trống, hiển thị tất cả sản phẩm
        if (searchInput.value === "") {
            resetSearch();
        }
    });
    
    /**
     * Thực hiện tìm kiếm sản phẩm
     */
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Nếu từ khóa tìm kiếm trống, hiển thị tất cả sản phẩm
        if (searchTerm === "") {
            resetSearch();
            return;
        }
        
        let matchFound = false;
        
        // Duyệt qua tất cả sản phẩm
        productCards.forEach(card => {
            const productName = card.querySelector(".product-info h3").textContent.toLowerCase();
            
            // Kiểm tra nếu tên sản phẩm chứa từ khóa tìm kiếm
            if (productName.includes(searchTerm)) {
                card.style.display = "block";
                matchFound = true;
            } else {
                card.style.display = "none";
            }
        });
        
        // Kiểm tra nếu có sản phẩm phù hợp
        if (!matchFound) {
            // Nếu không có container thông báo, tạo mới
            let noResultsMsg = document.getElementById("no-search-results");
            if (!noResultsMsg) {
                noResultsMsg = document.createElement("div");
                noResultsMsg.id = "no-search-results";
                noResultsMsg.style.textAlign = "center";
                noResultsMsg.style.padding = "20px";
                noResultsMsg.style.margin = "20px auto";
                noResultsMsg.style.backgroundColor = "#f8f8f8";
                noResultsMsg.style.borderRadius = "10px";
                noResultsMsg.style.maxWidth = "600px";
                productGrid.parentNode.insertBefore(noResultsMsg, productGrid.nextSibling);
            }
            
            // Hiển thị thông báo không tìm thấy
            noResultsMsg.textContent = `Không tìm thấy sản phẩm nào phù hợp với "${searchTerm}"`;
            noResultsMsg.style.display = "block";
        } else {
            // Ẩn thông báo không tìm thấy nếu có
            const noResultsMsg = document.getElementById("no-search-results");
            if (noResultsMsg) {
                noResultsMsg.style.display = "none";
            }
        }
    }
    
    /**
     * Đặt lại tìm kiếm và hiển thị tất cả sản phẩm
     */
    function resetSearch() {
        productCards.forEach(card => {
            card.style.display = "block";
        });
        
        // Ẩn thông báo không tìm thấy nếu có
        const noResultsMsg = document.getElementById("no-search-results");
        if (noResultsMsg) {
            noResultsMsg.style.display = "none";
        }
    }
});

// Tải giỏ hàng từ localStorage nếu có
if (localStorage.getItem("cart")) {
    cart = JSON.parse(localStorage.getItem("cart"));
    updateCartCount(calculateTotalQuantity());
}

/**
 * Tính tổng số lượng sản phẩm trong giỏ hàng
 * @returns {number} Tổng số lượng sản phẩm
 */
function calculateTotalQuantity() {
    let totalQuantity = 0;
    cart.forEach(item => {
        totalQuantity += item.quantity;
    });
    return totalQuantity;
}

/**
 * Cập nhật số lượng hiển thị trên icon giỏ hàng
 * @param {number} count - Số lượng sản phẩm
 */
function updateCartCount(count) {
    cartCount = count;
    const allCartCountElement = document.querySelectorAll("#cart-count");
    allCartCountElement.forEach(item => {
        item.textContent = cartCount;
    });
    localStorage.setItem("cartCount", cartCount);
}

// Thêm listener cho các nút "Thêm vào giỏ hàng"
buttons.forEach(button => {
    button.addEventListener("click", (event) => {
        // Lấy thông tin sản phẩm
        const product = event.target.parentElement;
        const productName = product.querySelector("h3").textContent;
        const productPrice = product.querySelector("p").textContent;
        const productImage = product.parentElement.querySelector("img").src;

        // Kiểm tra nếu sản phẩm đã có trong giỏ hàng
        let existingItem = cart.find(item => item.name === productName);

        if (existingItem) {
            // Nếu đã có, tăng số lượng
            existingItem.quantity++;
        } else {
            // Nếu chưa có, thêm sản phẩm mới
            cart.push({
                name: productName,
                price: productPrice,
                quantity: 1,
                image: productImage
            });
        }

        // Lưu giỏ hàng và cập nhật số lượng hiển thị
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount(calculateTotalQuantity());
    });
});