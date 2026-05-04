# HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ

## 📋 Tổng Quan

**Tên dự án:** Equipment Borrowing Management System  
**Mô tả:** Hệ thống web cho phép sinh viên/câu lạc bộ đăng ký mượn thiết bị từ kho của nhà trường  
**Công nghệ:**
- Frontend: React + Vite (Neo-Brutalism)
- Backend: Node.js + Express
- Database: MS SQL Server

---

## 🚀 Tính Năng

### Sinh Viên (User)
- ✅ Đăng nhập/đăng ký tài khoản
- ✅ Xem danh sách thiết bị có sẵn (tên, tình trạng, số lượng)
- ✅ Gửi yêu cầu mượn (chọn ngày mượn - trả, số lượng, mục đích)
- ✅ Xem lịch sử/yêu cầu của bản thân
- ✅ Nhận email thông báo khi được duyệt/từ chối
- ✅ Nhắc nhở khi sắp đến hạn trả

### Quản Trị Viên (Admin)
- ✅ Đăng nhập/đăng xuất
- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý yêu cầu (xem, duyệt, từ chối)
- ✅ Quản lý thiết bị (thêm, sửa, xóa, cập nhật số lượng)
- ✅ Ghi nhận trả thiết bị (cập nhật tồn kho)
- ✅ Thống kê thiết bị mượn nhiều trong tháng
- ✅ Email tự động cảnh báo quá hạn
- ✅ Hiển thị cảnh báo trên hệ thống

---

## 📁 Cấu Trúc Thư Mục

```
RIPT1307-Nhom-12-KTHP/
├── FE/                          # Frontend mới (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── student/         # Pages cho sinh viên
│   │   │   └── admin/           # Pages cho admin
│   │   ├── services/api.js       # API service
│   │   ├── styles.css          # Neo-Brutalism styles
│   │   ├── App.jsx             # Main app
│   │   └── main.jsx            # Entry point
│   └── package.json
│
├── TH/                          # Frontend cũ (UmiJS)
├── Be--web/                     # Backend (Node.js)
│   └── src/
│       ├── routes/             # API routes
│       ├── controllers/         # Business logic
│       ├── services/           # Data access
│       └── tasks/              # Scheduled tasks (email)
│
├── Database/                    # SQL Scripts
│   ├── 01_CreateDatabase.sql
│   ├── 02_CreateTables.sql
│   ├── 03_SeedData.sql
│   ├── 05_Views.sql
│   ├── 06_StoredProcedures.sql
│   ├── 07_Functions.sql
│   ├── 08_Triggers.sql
│   ├── 10_Indexes_Performance.sql   # NEW
│   ├── 11_AuditTrail.sql           # NEW
│   └── 12_Security_Roles.sql      # NEW
│
└── implement/                   # Tài liệu
    ├── 01_tong_quan_du_an.md
    ├── 02_cac_cong_viec_da_hoan_thanh.md
    ├── 03_tinh_nang_chua_hoan_thien_va_trong_tam.md
    └── 04_cau_truc_thu_muc_va_database.md
```

---

## 🛠️ Cách Chạy Dự Án

### 1. Yêu Cầu
- Node.js 18+
- MS SQL Server (SQL Express hoặc bản đầy đủ)
- .NET Framework (cho SQL Server)

### 2. Database Setup
```bash
# Chạy các file SQL theo thứ tự:
1. 01_CreateDatabase.sql
2. 02_CreateTables.sql
3. 03_SeedData.sql
4. 05_Views.sql
5. 06_StoredProcedures.sql
7. 10_Indexes_Performance.sql    # Optional - tăng hiệu suất
8. 11_AuditTrail.sql           # Optional - ghi log thay đổi
9. 12_Security_Roles.sql      # Optional - phân quyền
```

### 3. Backend
```bash
cd Be--web
npm install
npm start
# Backend chạy ở http://localhost:3456
```

### 4. Frontend (FE mới)
```bash
cd FE
npm install
npm run dev
# Frontend chạy ở http://localhost:5173
```

---

## 🔑 Tài Khoản Test

| Vai trò | Username | Password | Ghi chú |
|--------|----------|----------|---------|
| Admin  | admin    | (hash)   | Admin hệ thống |
| User   | mai.tran | (hash)   | Sinh viên test |
| User   | nam.le   | (hash)   | Sinh viên test |

**Lưu ý:** Password được hash bằng bcrypt. Sử dụng tài khoản đã tạo sẵn trong seed data hoặc đăng ký tài khoản mới.

---

## 📡 API Endpoints

### Auth
- `POST /api/user/auth/login` - Đăng nhập user
- `POST /api/user/auth/register` - Đăng ký user
- `POST /api/admin/auth/login` - Đăng nhập admin

### Devices
- `GET /api/user/devices` - Danh sách thiết bị
- `GET /api/user/devices/:id` - Chi tiết thiết bị
- `GET /api/admin/devices` - Danh sách thiết bị (admin)
- `POST /api/admin/devices` - Thêm thiết bị
- `PUT /api/admin/devices/:id` - Sửa thiết bị
- `DELETE /api/admin/devices/:id` - Xóa thiết bị

### Borrow Requests
- `POST /api/user/borrow-requests` - Tạo yêu cầu mượn
- `GET /api/user/devices/my-requests` - Yêu cầu của tôi
- `GET /api/admin/borrow-requests` - Tất cả yêu cầu
- `PATCH /api/admin/borrow-requests/:id/approve` - Duyệt
- `PATCH /api/admin/borrow-requests/:id/reject` - Từ chối
- `PATCH /api/admin/borrow-requests/:id/return` - Xác nhận trả

### Statistics
- `GET /api/admin/stats` - Thống kê tổng quan

---

## 🗄️ Database

### Tables (9 bảng)
1. **Roles** - Vai trò người dùng
2. **Users** - Tài khoản
3. **DeviceCategories** - Danh mục thiết bị
4. **Devices** - Thiết bị
5. **BorrowRequests** - Yêu cầu mượn
6. **BorrowRecords** - Bản ghi mượn-trả
7. **BorrowConfig** - Cấu hình giới hạn
8. **EmailLogs** - Lịch sử email
9. **OverdueAlerts** - Cảnh báo quá hạn

### Stored Procedures (6 SP)
- `sp_TaoYeuCauMuon` - Tạo yêu cầu (kiểm tra giới hạn)
- `sp_DuyetYeuCauMuon` - Duyệt yêu cầu
- `sp_TuChoiYeuCau` - Từ chối
- `sp_GhiNhanTraThietBi` - Ghi nhận trả
- `sp_ThongKeThangHienTai` - Thống kê tháng
- `sp_KiemTraQuaHan` - Kiểm tra quá hạn

### Functions (3 UDF)
- `fn_SoLuongDangMuon` - Số đang mượn
- `fn_KiemTraGioiHan` - Kiểm tra giới hạn
- `fn_TinhSoNgayQuaHan` - Tính ngày quá hạn

### Views (5 views)
- `vw_ThietBiKhaDung` - Thiết bị khả dụng
- `vw_YeuCauMuonChiTiet` - Yêu cầu chi tiết
- `vw_LichSuMuonTraSinhVien` - Lịch sử SV
- `vw_ThietBiQuaHan` - Thiết bị quá hạn
- `vw_ThongKeThietBiTheoThang` - Thống kê tháng

---

## 📝 Thiết Kế Neo-Brutalism

- Màu chủ đạo: Đen (#0a0a0a) + Trắng (#ffffff)
- Màu accent: Cam (#ff6b35)
- Viền: 3px solid black
- Bóng: 4px 4px 0 black
- Font: Courier New (monospace)
- Các button có hiệu ứng nhấn, bóng di chuyển

---

## 📧 Email (Tự động)

Hệ thống gửi email tự động:
- Khi yêu cầu được duyệt
- Khi yêu cầu bị từ chối
- Nhắc nhở sắp đến hạn trả (2 ngày trước)
- Cảnh báo quá hạn

Cấu hình email trong `Be--web/.env`:
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🔧 Cấu Hình

### Backend (.env)
```env
HOST=localhost
PORT=3456
DB_SERVER=.\\SQLEXPRESS
DB_DATABASE=QuanLyMuonThietBi
DB_USER=sa
DB_PASSWORD=your-password
```

### Frontend (vite.config.js)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3456',
    changeOrigin: true
  }
}
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra credentials trong .env
3. Kiểm tra log console (F12)
4. Kiểm tra Network tab trong DevTools

---

## 📄 License

MIT License - Dự án học tập

---

**Created for: RIPT1307 - Quản trị Cơ sở dữ liệu nâng cao**