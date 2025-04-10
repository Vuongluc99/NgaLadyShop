import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Nhập tệp CSS

// Bởi vì app.js trống và index.html không có thẻ div gốc,
// kết xuất một trình giữ chỗ đơn giản trực tiếp vào thẻ body tạm thời
// để đáp ứng quá trình xây dựng (build).
// Một triển khai đúng đắn sẽ yêu cầu một phần tử gốc và một thành phần (component) App.
ReactDOM.render(
  <React.StrictMode>
    <h1>React App Placeholder</h1>
  </React.StrictMode>,
  document.body // Đang cố gắng kết xuất (render) vào thẻ body vì không có phần tử gốc nào tồn tại
);

// Nếu bạn muốn bắt đầu đo lường hiệu suất trong ứng dụng của bạn, hãy truyền vào một hàm (function)
// để ghi lại kết quả (log) (ví dụ: reportWebVitals(console.log))
// hoặc gửi đến một điểm cuối phân tích (analytics endpoint). Tìm hiểu thêm: https://bit.ly/CRA-vitals
// import reportWebVitals from './reportWebVitals'; // Giả sử reportWebVitals không tồn tại hoặc chưa cần thiết
// reportWebVitals();