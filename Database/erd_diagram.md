# Lược Đồ ERD - Cơ Sở Dữ Liệu Quản Lý Mượn Thiết Bị

Lược đồ dưới đây phản ánh các bảng đang có trong script SQL hiện tại, gồm phần nghiệp vụ lõi, audit và security.

```mermaid
erDiagram
    Roles ||--o{ Users : "phân quyền"
    DeviceCategories ||--o{ Devices : "chứa"
    Users ||--o{ BorrowRequests : "tạo"
    Devices ||--o{ BorrowRequests : "được yêu cầu"
    BorrowRequests ||--o| BorrowRecords : "được duyệt thành"
    Users ||--o{ BorrowRecords : "mượn"
    Devices ||--o{ BorrowRecords : "được mượn"
    Users ||--o{ EmailLogs : "nhận"
    BorrowRecords ||--o{ EmailLogs : "kích hoạt"
    BorrowRecords ||--o{ OverdueAlerts : "sinh ra"
    Roles ||--o{ RolePermissions : "có"
    Permissions ||--o{ RolePermissions : "được gán"
    Users ||--o{ LoginLogs : "đăng nhập"

    Roles {
        INT RoleID PK
        VARCHAR RoleName
        NVARCHAR MoTa
        DATETIME NgayTao
    }

    Users {
        INT UserID PK
        INT RoleID FK
        NVARCHAR HoTen
        VARCHAR Username
        VARCHAR Email
        VARCHAR Phone
        NVARCHAR GioiTinh
        DATE NgaySinh
        NVARCHAR DiaChi
        VARCHAR Avatar
        VARCHAR PasswordHash
        NVARCHAR TrangThai
        BIT IsDeleted
        DATETIME NgayTao
        DATETIME NgayCapNhat
    }

    DeviceCategories {
        INT CategoryID PK
        NVARCHAR TenDanhMuc
        NVARCHAR MoTa
        DATETIME NgayTao
    }

    Devices {
        INT DeviceID PK
        INT CategoryID FK
        NVARCHAR TenThietBi
        VARCHAR SerialNumber
        NVARCHAR MoTa
        INT SoLuongTong
        INT SoLuongKhaDung
        INT SoLuongBaoTri
        INT SoLuongDangMuon
        NVARCHAR TrangThai
        VARCHAR HinhAnh
        NVARCHAR ViTri
        DATETIME NgayTao
        DATETIME NgayCapNhat
    }

    BorrowRequests {
        INT RequestID PK
        INT UserID FK
        INT DeviceID FK
        INT SoLuongMuon
        DATE NgayMuon
        DATE NgayTraDuKien
        NVARCHAR MucDich
        NVARCHAR GhiChu
        NVARCHAR TrangThai
        DATETIME NgayTao
        DATETIME NgayCapNhat
    }

    BorrowRecords {
        INT RecordID PK
        INT RequestID FK
        INT UserID FK
        INT DeviceID FK
        INT SoLuongMuon
        DATE NgayMuon
        DATE NgayTraDuKien
        DATE NgayTraThucTe
        NVARCHAR TrangThai
        NVARCHAR GhiChu
        DATETIME NgayTao
        DATETIME NgayCapNhat
    }

    BorrowConfig {
        INT ConfigID PK
        VARCHAR ConfigKey
        INT ConfigValue
        NVARCHAR MoTa
        DATETIME NgayCapNhat
    }

    EmailLogs {
        INT LogID PK
        INT UserID FK
        INT RecordID FK
        NVARCHAR LoaiEmail
        NVARCHAR TieuDe
        NVARCHAR NoiDung
        NVARCHAR TrangThai
        DATETIME NgayGui
    }

    OverdueAlerts {
        INT AlertID PK
        INT RecordID FK
        NVARCHAR LoaiCanhBao
        NVARCHAR NoiDung
        BIT DaXuLy
        DATETIME NgayTao
        DATETIME NgayXuLy
    }

    AuditLogs {
        BIGINT AuditID PK
        VARCHAR TableName
        INT RecordID
        VARCHAR Action
        VARCHAR ColumnName
        NVARCHAR OldValue
        NVARCHAR NewValue
        INT UserID
        VARCHAR IPAddress
        DATETIME Timestamp
    }

    Permissions {
        INT PermissionID PK
        VARCHAR PermissionName
        NVARCHAR Description
    }

    RolePermissions {
        INT RoleID PK, FK
        INT PermissionID PK, FK
    }

    LoginLogs {
        BIGINT LogID PK
        INT UserID FK
        VARCHAR Username
        BIT Success
        VARCHAR IPAddress
        NVARCHAR UserAgent
        DATETIME Timestamp
    }
```

### Ghi Chú
- `UserNotifications` được backend tạo runtime nếu chưa tồn tại, nên không nằm trong script khởi tạo ban đầu.
- `BorrowRequests` là yêu cầu chờ duyệt; khi được duyệt sẽ tạo `BorrowRecords`.
- `BorrowRecords` là nguồn cho thống kê, cảnh báo quá hạn và lịch sử mượn trả của sinh viên.
