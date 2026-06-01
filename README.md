# Hệ Thống Quản Lý Mượn Thiết Bị

Hệ thống web cho phép sinh viên hoặc câu lạc bộ đăng ký mượn thiết bị từ kho của nhà trường. Quản trị viên xử lý duyệt yêu cầu, theo dõi tồn kho, ghi nhận trả thiết bị và xem thống kê.

## Công Nghệ
- Frontend: React + Vite + React Router + Axios + Chart.js
- Backend: Node.js + Express + MSSQL + bcrypt + jsonwebtoken + nodemailer + EJS
- Database: Microsoft SQL Server

## Cấu Trúc Repo
- `FE/`: giao diện người dùng hiện tại
- `Be--web/`: backend API và nghiệp vụ
- `Database/`: script SQL, views, stored procedures, security, audit
- `implement/`: tài liệu cũ, không còn phản ánh đúng trạng thái hiện tại

## Tính Năng Chính
- Sinh viên: đăng ký/đăng nhập, xem thiết bị, gửi yêu cầu mượn, xem yêu cầu của mình, xem lịch sử mượn trả, cập nhật hồ sơ, nhận thông báo trong hệ thống
- Admin: đăng nhập, dashboard thống kê, duyệt/từ chối yêu cầu, xác nhận trả thiết bị, CRUD thiết bị, xem biểu đồ thống kê, gửi nhắc nhở quá hạn

## Chạy Dự Án
### 1) Database
- Tạo database `QuanLyMuonThietBi` bằng `Database/01_CreateDatabase.sql`
- Chạy tiếp các file theo thứ tự:
  - `Database/02_CreateTables.sql`
  - `Database/03_SeedData.sql`
  - `Database/05_Views.sql`
  - `Database/06_StoredProcedures.sql`
  - `Database/07_Functions.sql`
  - `Database/08_Triggers.sql`
  - `Database/09_Security.sql` nếu muốn chạy phần security mở rộng
  - `Database/99_UpdateDB_V2.sql` để đồng bộ schema với code hiện tại
  - `Database/10_Indexes_Performance.sql`
  - `Database/11_AuditTrail.sql`
  - `Database/12_Security_Roles.sql`
- Lưu ý: `Database/01_CreateDatabase.sql` đang dùng đường dẫn `C:\SQLData\...`; đổi lại nếu máy bạn không có thư mục này.

### 2) Backend
- Tạo file `.env` từ `Be--web/.env.example`
- Cấu hình tối thiểu:
  - `APP_NAME`
  - `APP_URL_API=http://localhost:3456`
  - `APP_URL_CLIENT=http://localhost:5173`
  - `SECRET_KEY`
  - `LOGIN_EXPIRE_IN`
  - `DB_SERVER`
  - `DB_DATABASE`
  - `DB_USER`
  - `DB_PASSWORD`
  - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- Chạy:
  - `cd Be--web`
  - `npm install`
  - `npm start`
- Backend mặc định chạy ở `http://localhost:3456`

### 3) Frontend
- Chạy:
  - `cd FE`
  - `npm install`
  - `npm run dev`
- Frontend mặc định chạy ở `http://localhost:5173`
- Vite proxy `/api` về backend `http://localhost:3456`

## API Chính
Các endpoint bên dưới được frontend gọi qua tiền tố `/api`:

### Auth
- `POST /api/user/auth/login`
- `POST /api/user/auth/register`
- `POST /api/user/auth/logout`
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`

### Sinh Viên
- `GET /api/user/devices`
- `GET /api/user/devices/:id`
- `POST /api/user/borrow-requests`
- `GET /api/user/borrow-requests`
- `GET /api/user/borrow-requests/:id`
- `GET /api/user/borrow-records`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/user/notifications`
- `PATCH /api/user/notifications/:id/read`

### Admin
- `GET /api/admin/devices`
- `POST /api/admin/devices`
- `PUT /api/admin/devices/:id`
- `DELETE /api/admin/devices/:id`
- `GET /api/admin/borrow-requests`
- `GET /api/admin/borrow-requests/:id`
- `PATCH /api/admin/borrow-requests/:id/approve`
- `PATCH /api/admin/borrow-requests/:id/reject`
- `PATCH /api/admin/borrow-requests/:id/return`
- `GET /api/admin/stats`
- `GET /api/admin/stats/top-borrowed`
- `GET /api/admin/stats/overdue`
- `GET /api/admin/stats/due-soon`
- `POST /api/admin/overdue/remind`

## Database Hiện Tại
### Bảng lõi nghiệp vụ
- `Roles`
- `Users`
- `DeviceCategories`
- `Devices`
- `BorrowRequests`
- `BorrowRecords`
- `BorrowConfig`
- `EmailLogs`
- `OverdueAlerts`

### Bảng mở rộng
- `AuditLogs`
- `Permissions`
- `RolePermissions`
- `LoginLogs`

### View và SP đáng chú ý
- `vw_ThietBiKhaDung`
- `vw_YeuCauMuonChiTiet`
- `vw_LichSuMuonTraSinhVien`
- `vw_ThietBiQuaHan`
- `vw_ThongKeThietBiTheoThang`
- `sp_TaoYeuCauMuon`
- `sp_DuyetYeuCauMuon`
- `sp_TuChoiYeuCau`
- `sp_GhiNhanTraThietBi`
- `sp_ThongKeThangHienTai`
- `sp_KiemTraQuaHan`

## Ghi Chú Quan Trọng
- Backend hiện tạo thêm bảng `UserNotifications` ở runtime nếu bảng chưa tồn tại.
- Một số file cũ trong `implement/` và `Be--web/README.md` không còn khớp với code hiện tại và đã được loại bỏ.
- Nếu bạn đang đọc tài liệu để triển khai tiếp, ưu tiên code trong `FE/`, `Be--web/src/` và `Database/` thay vì tài liệu cũ.
