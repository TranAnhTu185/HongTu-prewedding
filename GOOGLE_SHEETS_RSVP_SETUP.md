# Kết nối xác nhận tham dự với Google Sheets

Form RSVP gửi dữ liệu tới Google Apps Script Web App. Apps Script thêm mỗi phản hồi thành một dòng trong sheet `RSVP`.

## Cài đặt

1. Mở [Google Sheet RSVP của bạn](https://docs.google.com/spreadsheets/d/1SU899USPNtryqo89lqTXyF8SceGdHnulOsxD-TdLjno/edit).
2. Trong Sheet, chọn **Extensions → Apps Script**.
3. Thay nội dung `Code.gs` bằng mã trong [`google-apps-script/Code.gs`](google-apps-script/Code.gs), lưu lại. Script hiện mở trực tiếp Sheet có ID đã cấu hình trong mã.
4. Chọn **Deploy → New deployment → Web app**.
5. Chọn **Execute as: Me** và **Who has access: Anyone**, sau đó Deploy và cấp quyền Google Sheets khi được hỏi.
6. Sao chép URL Web App kết thúc bằng `/exec`.
7. Dán URL đó vào `rsvpEndpoint` trong `src/data/weddingConfig.js`.

Khi có phản hồi đầu tiên, script tự tạo tab `RSVP` cùng các cột thời gian, họ tên, tham dự, số khách và lời chúc. Sau khi sửa Apps Script, dùng **Deploy → Manage deployments → Edit → New version** để cập nhật Web App.

> Web App phải cho phép người dùng ẩn danh truy cập để khách không cần đăng nhập Google. Vì vậy URL endpoint có thể được gọi công khai; chỉ chia sẻ bảng tính với những người cần xem RSVP.
