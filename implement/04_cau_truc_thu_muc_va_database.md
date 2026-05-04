# Cấu Trúc Thư Mục Và Lược Đồ Database

Tài liệu này chi tiết hóa cấu trúc thư mục của dự án và lược đồ cơ sở dữ liệu đang được sử dụng trong hệ thống.

---

## I. Cấu Trúc Thư Mục Dự Án (Project Structure)

Dự án được phân chia rõ ràng thành 3 phần chính nằm ở thư mục gốc:

### 1. Thư mục `TH` (Frontend)
Chứa mã nguồn giao diện người dùng, được xây dựng bằng **UmiJS** (React Framework).

```text
TH/
├── config/              # Cấu hình routes, plugins, themes của UmiJS
├── public/              # Các file tĩnh (hình ảnh, favicon...)
├── src/
│   ├── assets/          # File tĩnh sử dụng trong code
│   ├── components/      # Các React components dùng chung
│   ├── layouts/         # Bố cục giao diện (Header, Sidebar, Footer)
│   ├── locales/         # Hỗ trợ đa ngôn ngữ
│   ├── models/          # Quản lý state toàn cục (Dva/Umi model)
│   ├── pages/           # Các màn hình chính (Đăng nhập, Quản lý mượn, Danh sách thiết bị...)
│   ├── services/        # Các API service gọi lên Backend
│   ├── utils/           # Các hàm tiện ích dùng chung
│   ├── access.ts        # Phân quyền người dùng (Student vs Admin)
│   └── app.tsx          # File cấu hình khởi tạo app
├── package.json         # Danh sách thư viện frontend
└── tsconfig.json        # Cấu hình TypeScript
```

### 2. Thư mục `Be--web` (Backend)
Chứa mã nguồn máy chủ xử lý logic và kết nối database, được xây dựng bằng **Node.js** (Express).

```text
Be--web/
├── src/
│   ├── app/             # Core logic của ứng dụng
│   ├── configs/         # Cấu hình kết nối SQL Server, Mail, Joi validation
│   ├── handlers/        # Các hàm xử lý lỗi và middleware
│   ├── models/          # Khai báo các mô hình dữ liệu (tương thích DB)
│   ├── routes/          # Định tuyến các endpoints API
│   ├── tasks/           # Các background tasks (ví dụ: quét thiết bị quá hạn)
│   ├── utils/           # Các hàm tiện ích xử lý dữ liệu, gửi email...
│   ├── views/           # Các template email hoặc giao diện render (nếu có)
│   ├── index.js         # Điểm khởi đầu khởi tạo server
│   └── main.js          # File config/routes chính
└── package.json         # Danh sách thư viện backend (mssql, express, joi...)
```

### 3. Thư mục `Database` (SQL Scripts)
Chứa toàn bộ các scripts khởi tạo và quản lý cơ sở dữ liệu Microsoft SQL Server.

```text
Database/
├── 01_CreateDatabase.sql       # Script tạo Database
├── 02_CreateTables.sql         # Script tạo các Bảng (Tables)
├── 03_SeedData.sql             # Script nạp dữ liệu mẫu
├── 05_Views.sql                # Các Views hỗ trợ truy xuất dữ liệu
├── 06_StoredProcedures.sql     # Các thủ tục thực thi xử lý DB
└── erd_diagram.md              # Tài liệu lược đồ ERD (Mermaid)
```

---

## II. Lược Đồ Cơ Sở Dữ Liệu (Database Schema)

Dưới đây là cấu trúc chi tiết 9 bảng trong cơ sở dữ liệu hiện tại (đã chuyển đổi từ MongoDB sang MS SQL Server).

### 1. Bảng `Roles` (Nhóm quyền)
Lưu thông tin các quyền truy cập hệ thống.
- **RoleID** (`INT`, PK): Mã quyền.
- **RoleName** (`VARCHAR`): Tên quyền (Admin, Student...).
- **MoTa** (`NVARCHAR`): Mô tả quyền.
- **NgayTao** (`DATETIME`): Ngày tạo.

### 2. Bảng `Users` (Người dùng)
Lưu thông tin sinh viên và quản trị viên.
- **UserID** (`INT`, PK): Mã người dùng.
- **RoleID** (`INT`, FK): Nhóm quyền.
- **HoTen** (`NVARCHAR`): Họ và tên.
- **Username** (`VARCHAR`): Tên đăng nhập.
- **Email** (`VARCHAR`): Email nhận thông báo.
- **Phone** (`VARCHAR`): Số điện thoại.
- **GioiTinh** (`NVARCHAR`): Giới tính.
- **NgaySinh** (`DATE`): Ngày sinh.
- **PasswordHash** (`VARCHAR`): Mật khẩu băm.
- **TrangThai** (`NVARCHAR`): Trạng thái tài khoản (Hoạt động, Đã khóa).

### 3. Bảng `DeviceCategories` (Danh mục thiết bị)
Phân loại thiết bị trong kho.
- **CategoryID** (`INT`, PK): Mã danh mục.
- **TenDanhMuc** (`NVARCHAR`): Tên danh mục (Laptop, Máy chiếu...).
- **MoTa** (`NVARCHAR`): Mô tả danh mục.
- **NgayTao** (`DATETIME`): Ngày tạo danh mục.

### 4. Bảng `Devices` (Danh sách thiết bị)
Lưu trữ thông tin chi tiết từng loại thiết bị.
- **DeviceID** (`INT`, PK): Mã thiết bị.
- **CategoryID** (`INT`, FK): Danh mục thiết bị.
- **TenThietBi** (`NVARCHAR`): Tên thiết bị.
- **SerialNumber** (`VARCHAR`): Số series định danh.
- **SoLuongTong** (`INT`): Tổng số lượng thiết bị có trong kho.
- **SoLuongKhaDung** (`INT`): Số lượng thiết bị còn sẵn sàng để mượn.
- **TrangThai** (`NVARCHAR`): Tình trạng thiết bị (Còn hàng, Hết hàng, Đang sửa chữa).
- **ViTri** (`NVARCHAR`): Vị trí lưu trữ trong kho.

### 5. Bảng `BorrowRequests` (Yêu cầu mượn)
Lưu thông tin các lượt đăng ký mượn thiết bị của sinh viên đang chờ duyệt.
- **RequestID** (`INT`, PK): Mã yêu cầu.
- **UserID** (`INT`, FK): Mã sinh viên mượn.
- **DeviceID** (`INT`, FK): Mã thiết bị muốn mượn.
- **SoLuongMuon** (`INT`): Số lượng thiết bị yêu cầu.
- **NgayMuon** (`DATE`): Ngày bắt đầu mượn.
- **NgayTraDuKien** (`DATE`): Ngày trả dự kiến.
- **TrangThai** (`NVARCHAR`): Trạng thái yêu cầu (Chờ duyệt, Đã duyệt, Đã từ chối).

### 6. Bảng `BorrowRecords` (Bản ghi mượn trả chính thức)
Lưu thông tin khi yêu cầu mượn được duyệt và quá trình trả.
- **RecordID** (`INT`, PK): Mã bản ghi.
- **RequestID** (`INT`, FK): Mã yêu cầu liên kết.
- **UserID** (`INT`, FK): Mã sinh viên.
- **DeviceID** (`INT`, FK): Mã thiết bị.
- **SoLuongMuon** (`INT`): Số lượng đã mượn.
- **NgayTraDuKien** (`DATE`): Ngày trả dự kiến.
- **NgayTraThucTe** (`DATE`): Ngày trả thực tế (null nếu chưa trả).
- **TrangThai** (`NVARCHAR`): Trạng thái (Đang mượn, Đã trả, Quá hạn).

### 7. Bảng `BorrowConfig` (Cấu hình mượn)
Lưu các thông số cấu hình chung của hệ thống.
- **ConfigID** (`INT`, PK): Mã cấu hình.
- **ConfigKey** (`VARCHAR`): Tên cấu hình (MaxBorrowDays, MaxDevicesPerUser...).
- **ConfigValue** (`INT`): Giá trị cấu hình.
- **MoTa** (`NVARCHAR`): Mô tả cấu hình.

### 8. Bảng `EmailLogs` (Lịch sử gửi mail)
Ghi nhận các email đã gửi cho sinh viên hoặc admin.
- **LogID** (`INT`, PK): Mã log email.
- **UserID** (`INT`, FK): Người nhận.
- **RecordID** (`INT`, FK): Bản ghi mượn liên quan.
- **LoaiEmail** (`NVARCHAR`): Loại email (Duyệt, Nhắc nhở, Quá hạn...).
- **TieuDe** (`NVARCHAR`): Tiêu đề email.
- **TrangThai** (`NVARCHAR`): Trạng thái gửi (Thành công, Thất bại).

### 9. Bảng `OverdueAlerts` (Cảnh báo quá hạn)
Lưu thông tin cảnh báo trên hệ thống về các thiết bị trả trễ.
- **AlertID** (`INT`, PK): Mã cảnh báo.
- **RecordID** (`INT`, FK): Bản ghi mượn trả quá hạn.
- **LoaiCanhBao** (`NVARCHAR`): Mức độ/Loại cảnh báo.
- **NoiDung** (`NVARCHAR`): Nội dung chi tiết cảnh báo.
- **DaXuLy** (`BIT`): Đã được quản trị viên xử lý chưa (0/1).
