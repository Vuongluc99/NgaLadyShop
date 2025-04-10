/**
 * Slideshow - Xử lý hiệu ứng trượt hình ảnh
 * File này xử lý các chức năng liên quan đến slideshow trên trang chủ
 * Bao gồm điều khiển thủ công (nút trước/sau) và tự động chuyển slide
 */

// Khởi tạo biến chỉ mục slide hiện tại
let slideIndex = 1;
showSlides(slideIndex);

/**
 * Điều khiển nút trước/sau
 * @param {number} n - Hướng chuyển slide (1: tiếp theo, -1: trước đó)
 */
function plusSlides(n) {
  showSlides(slideIndex += n);
}

/**
 * Điều khiển chọn slide cụ thể từ nút tròn
 * @param {number} n - Số thứ tự của slide muốn hiển thị
 */
function currentSlide(n) {
  showSlides(slideIndex = n);
}

/**
 * Hiển thị slide được chỉ định
 * @param {number} n - Số thứ tự của slide cần hiển thị
 */
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  
  // Xử lý trường hợp vượt quá giới hạn số lượng slide
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  
  // Ẩn tất cả các slide
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  
  // Xóa trạng thái active của tất cả các nút tròn
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  
  // Hiển thị slide hiện tại và đánh dấu nút tròn tương ứng
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

/**
 * Tự động trượt slide
 * Hàm này tự động chuyển đổi giữa các slide sau mỗi khoảng thời gian
 */
function autoSlideshow() {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  
  // Ẩn tất cả các slide
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  
  // Tăng chỉ mục slide
  slideIndex++;
  
  // Kiểm tra và đảm bảo slideIndex không vượt quá số lượng slide
  if (slideIndex > slides.length) {slideIndex = 1}
  
  // Xóa trạng thái active của tất cả các nút tròn
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  
  // Hiển thị slide hiện tại và đánh dấu nút tròn tương ứng
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  
  // Thiết lập hẹn giờ để gọi lại hàm này sau 2 giây
  setTimeout(autoSlideshow, 5000); // Thay đổi ảnh sau 2 giây
}

// Bắt đầu tự động trượt slide khi trang web tải
autoSlideshow();