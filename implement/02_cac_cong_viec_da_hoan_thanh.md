# Các Chức Năng Và Công Việc Đã Hoàn Thành

Tính đến thời điểm hiện tại, dự án đã trải qua nhiều giai đoạn phát triển và bảo trì. Dưới đây là các phần việc chính đã được hoàn thiện.

## 1. Cơ Sở Dữ Liệu & Migration
- **Chuyển đổi Database thành công**: Đã hoàn tất việc di chuyển hệ thống cơ sở dữ liệu từ nền tảng MongoDB (NoSQL) sang Microsoft SQL Server (Relational Database).
- **Cấu trúc lại API Services**: Loại bỏ thư viện `Mongoose` ở phía backend và thay thế bằng thư viện `mssql` để kết nối với SQL Server.
- **Stored Procedures & Views**: Viết lại hoàn toàn các logic truy xuất cơ sở dữ liệu để gọi thông qua Stored Procedures và Views trên SQL Server thay vì query trực tiếp, nhằm tăng tính bảo mật và tối ưu hiệu suất.
- **Tương thích dữ liệu Frontend**: Mặc dù thay đổi hoàn toàn kiến trúc DB, nhưng định dạng JSON trả về từ backend vẫn được giữ nguyên tính tương thích, giúp Frontend không bị gãy vỡ (break) nhiều.

## 2. Quản Trị Hệ Thống (Backend)
- **Thiết lập môi trường**: Backend Node.js đã được cấu hình chạy ổn định, giao tiếp thành công với cả Frontend (UmiJS) và Database.
- **Khắc phục Crash**: Đã xử lý triệt để lỗi gây crash server liên quan đến thư viện `mssql` (lỗi `TypeError: dc.tracingChannel is not a function`), giúp backend duy trì trạng thái hoạt động liên tục.
- **Sửa lỗi Joi Validation**: Đã fix các lỗi validation chặn việc submit request từ Frontend, đảm bảo luồng dữ liệu đầu vào hợp lệ và được lưu vào cơ sở dữ liệu.

## 3. Giao Diện Admin (Dashboard)
- **Hoạt động của các tab**: Xử lý tình trạng báo lỗi khi chuyển qua lại giữa các tab trong trang quản trị, giúp UI mượt mà và không còn hiện tượng mất kết nối.
- **Sửa lỗi API Mapping**: Khắc phục các vấn đề liên quan đến việc hiển thị sai lệch dữ liệu do quá trình map data từ MS SQL trả về Frontend.
- **Chức năng Quản lý Thiết bị**: Tính năng tạo (thêm mới) thiết bị trên hệ thống admin đã hoạt động ổn định.
- **Quản lý Bản Ghi Mượn Trả**: Chức năng quản lý các lượt mượn (borrowing records) đã hoạt động cơ bản.
- **Xác thực và Đăng nhập**: Luồng đăng nhập và cấp quyền cho hệ thống đã có thể sử dụng bình thường.
