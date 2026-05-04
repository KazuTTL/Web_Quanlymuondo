# Lược đồ ERD - Cơ sở dữ liệu Quản lý mượn thiết bị

Dưới đây là lược đồ Entity-Relationship (ERD) được tạo từ cấu trúc bảng trong thư mục Database, sử dụng cú pháp Mermaid. Lược đồ này thể hiện đầy đủ 9 bảng, các trường dữ liệu quan trọng và mối quan hệ (Foreign Keys) giữa chúng.

```mermaid
erDiagram
    %% Relationships
    Roles ||--o{ Users : "phân quyền cho"
    Users ||--o{ BorrowRequests : "tạo"
    Users ||--o{ BorrowRecords : "tham gia vào"
    Users ||--o{ EmailLogs : "nhận"
    
    DeviceCategories ||--o{ Devices : "chứa"
    Devices ||--o{ BorrowRequests : "được yêu cầu"
    Devices ||--o{ BorrowRecords : "được mượn"
    
    BorrowRequests ||--o| BorrowRecords : "tạo thành"
    
    BorrowRecords ||--o{ EmailLogs : "kích hoạt"
    BorrowRecords ||--o{ OverdueAlerts : "sinh ra"

    %% Tables
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
        VARCHAR PasswordHash
        NVARCHAR TrangThai
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
        INT SoLuongTong
        INT SoLuongKhaDung
        NVARCHAR TrangThai
        NVARCHAR ViTri
    }

    BorrowRequests {
        INT RequestID PK
        INT UserID FK
        INT DeviceID FK
        INT SoLuongMuon
        DATE NgayMuon
        DATE NgayTraDuKien
        NVARCHAR TrangThai
    }

    BorrowRecords {
        INT RecordID PK
        INT RequestID FK
        INT UserID FK
        INT DeviceID FK
        INT SoLuongMuon
        DATE NgayTraDuKien
        DATE NgayTraThucTe
        NVARCHAR TrangThai
    }

    BorrowConfig {
        INT ConfigID PK
        VARCHAR ConfigKey
        INT ConfigValue
        NVARCHAR MoTa
    }

    EmailLogs {
        INT LogID PK
        INT UserID FK
        INT RecordID FK
        NVARCHAR LoaiEmail
        NVARCHAR TieuDe
        NVARCHAR TrangThai
    }

    OverdueAlerts {
        INT AlertID PK
        INT RecordID FK
        NVARCHAR LoaiCanhBao
        NVARCHAR NoiDung
        BIT DaXuLy
    }
```

### Các mối quan hệ chính:
1. **Roles - Users (1:N):** Một nhóm quyền (Role) có thể được cấp cho nhiều người dùng.
2. **DeviceCategories - Devices (1:N):** Một danh mục chứa nhiều thiết bị.
3. **Users - BorrowRequests (1:N):** Một người dùng (Sinh viên) có thể tạo nhiều yêu cầu mượn.
4. **Devices - BorrowRequests (1:N):** Một thiết bị có thể nằm trong nhiều yêu cầu mượn khác nhau theo thời gian.
5. **BorrowRequests - BorrowRecords (1:1/N):** Khi một Yêu cầu mượn (`BorrowRequests`) được duyệt, nó sẽ trở thành một Bản ghi mượn (`BorrowRecords`) chính thức.
6. **BorrowRecords - EmailLogs (1:N):** Quá trình mượn trả có thể kích hoạt nhiều email nhắc nhở (Đến hạn, Quá hạn, Đã trả).
7. **BorrowRecords - OverdueAlerts (1:N):** Nếu quá hạn trả, hệ thống sẽ sinh ra các cảnh báo.
