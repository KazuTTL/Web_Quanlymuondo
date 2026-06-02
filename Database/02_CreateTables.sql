/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 02_CreateTables.sql
 MÔ TẢ: Tạo và quản lý bảng (Tables) với đầy đủ ràng buộc toàn vẹn
 ÁP DỤNG: Chương 2 - Tạo lập CSDL (Tạo và quản lý Bảng)
           PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, DEFAULT, NOT NULL
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- BẢNG 1: Roles (Vai trò)
-- Quản lý vai trò người dùng: admin, user (sinh viên)
-- ============================================================================
CREATE TABLE Roles
(
    RoleID      INT IDENTITY(1,1)   NOT NULL,
    RoleName    VARCHAR(50)         NOT NULL,
    MoTa        NVARCHAR(255)       NULL,
    NgayTao     DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_Roles PRIMARY KEY (RoleID),
    CONSTRAINT UQ_Roles_RoleName UNIQUE (RoleName)
);
GO

-- ============================================================================
-- BẢNG 2: Users (Người dùng - gộp User + Admin từ NoSQL)
-- Lưu trữ thông tin sinh viên và quản trị viên
-- ============================================================================
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
GO
CREATE TABLE Users
(
    UserID       INT IDENTITY(1,1)   NOT NULL,
    HoTen        NVARCHAR(100)       NOT NULL,
    Username     VARCHAR(50)         NOT NULL,
    Email        VARCHAR(100)        NOT NULL,
    Phone        VARCHAR(15)         NULL,
    GioiTinh     NVARCHAR(10)        NULL,
    NgaySinh     DATE                NULL,
    DiaChi       NVARCHAR(255)       NULL,
    Avatar       VARCHAR(500)        NULL,
    PasswordHash VARCHAR(255)        NOT NULL,
    RoleID       INT                 NOT NULL,
    TrangThai    NVARCHAR(20)        NOT NULL DEFAULT N'ACTIVE',
    IsDeleted    BIT                 NOT NULL DEFAULT 0,
    NgayTao      DATETIME            NOT NULL DEFAULT GETDATE(),
    NgayCapNhat  DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_Users PRIMARY KEY (UserID),
    CONSTRAINT UQ_Users_Username UNIQUE (Username),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    CONSTRAINT CK_Users_TrangThai CHECK (TrangThai IN (N'ACTIVE', N'DE_ACTIVE')),
    CONSTRAINT CK_Users_Email CHECK (Email LIKE '%_@_%._%'),
    CONSTRAINT CK_Users_Phone CHECK (Phone IS NULL OR LEN(Phone) >= 10)
);
GO

-- ============================================================================
-- BẢNG 3: DeviceCategories (Danh mục thiết bị)
-- Chuẩn hóa 3NF: tách field category (string) từ Device thành bảng riêng
-- ============================================================================
CREATE TABLE DeviceCategories
(
    CategoryID   INT IDENTITY(1,1)   NOT NULL,
    TenDanhMuc   NVARCHAR(100)       NOT NULL,
    MoTa         NVARCHAR(500)       NULL,
    NgayTao      DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_DeviceCategories PRIMARY KEY (CategoryID),
    CONSTRAINT UQ_DeviceCategories_Ten UNIQUE (TenDanhMuc)
);
GO

-- ============================================================================
-- BẢNG 4: Devices (Thiết bị)
-- Quản lý thông tin thiết bị trong kho
-- ============================================================================
CREATE TABLE Devices
(
    DeviceID        INT IDENTITY(1,1)   NOT NULL,
    TenThietBi      NVARCHAR(200)       NOT NULL,
    SerialNumber    VARCHAR(100)        NOT NULL,
    MoTa            NVARCHAR(500)       NULL,
    CategoryID      INT                 NOT NULL,
    SoLuongTong     INT                 NOT NULL DEFAULT 0,
    SoLuongKhaDung  INT                 NOT NULL DEFAULT 0,
    SoLuongBaoTri   INT                 NOT NULL DEFAULT 0,
    SoLuongDangMuon INT                 NOT NULL DEFAULT 0,
    TrangThai       NVARCHAR(20)        NOT NULL DEFAULT N'available',
    HinhAnh         VARCHAR(500)        NULL,
    ViTri           NVARCHAR(200)       NOT NULL,
    NgayTao         DATETIME            NOT NULL DEFAULT GETDATE(),
    NgayCapNhat     DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_Devices PRIMARY KEY (DeviceID),
    CONSTRAINT UQ_Devices_SerialNumber UNIQUE (SerialNumber),
    CONSTRAINT FK_Devices_Categories FOREIGN KEY (CategoryID) 
        REFERENCES DeviceCategories(CategoryID),
    CONSTRAINT CK_Devices_TrangThai CHECK (
        TrangThai IN (N'available', N'maintenance', N'lost')
    ),
    CONSTRAINT CK_Devices_SoLuongTong CHECK (SoLuongTong >= 0),
    CONSTRAINT CK_Devices_SoLuongKhaDung CHECK (SoLuongKhaDung >= 0),
    CONSTRAINT CK_Devices_SoLuong CHECK (SoLuongKhaDung <= SoLuongTong)
);
GO

-- ============================================================================
-- BẢNG 5: BorrowRequests (Yêu cầu mượn thiết bị)
-- Sinh viên gửi yêu cầu mượn, admin duyệt/từ chối
-- ============================================================================
CREATE TABLE BorrowRequests
(
    RequestID       INT IDENTITY(1,1)   NOT NULL,
    UserID          INT                 NOT NULL,
    DeviceID        INT                 NOT NULL,
    SoLuongMuon     INT                 NOT NULL DEFAULT 1,
    NgayMuon        DATE                NOT NULL,
    NgayTraDuKien   DATE                NOT NULL,
    MucDich         NVARCHAR(500)       NOT NULL,
    GhiChu          NVARCHAR(500)       NULL,
    TrangThai       NVARCHAR(20)        NOT NULL DEFAULT N'pending',
    NgayTao         DATETIME            NOT NULL DEFAULT GETDATE(),
    NgayCapNhat     DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_BorrowRequests PRIMARY KEY (RequestID),
    CONSTRAINT FK_BorrowRequests_Users FOREIGN KEY (UserID) 
        REFERENCES Users(UserID),
    CONSTRAINT FK_BorrowRequests_Devices FOREIGN KEY (DeviceID) 
        REFERENCES Devices(DeviceID),
    CONSTRAINT CK_BorrowRequests_TrangThai CHECK (
        TrangThai IN (N'pending', N'approved', N'rejected', N'cancelled')
    ),
    CONSTRAINT CK_BorrowRequests_SoLuong CHECK (SoLuongMuon >= 1),
    CONSTRAINT CK_BorrowRequests_Ngay CHECK (NgayTraDuKien >= NgayMuon)
);
GO

-- ============================================================================
-- BẢNG 6: BorrowRecords (Bản ghi mượn - trả thiết bị)
-- Ghi nhận thực tế việc mượn và trả thiết bị
-- ============================================================================
CREATE TABLE BorrowRecords
(
    RecordID         INT IDENTITY(1,1)   NOT NULL,
    RequestID        INT                 NOT NULL,
    UserID           INT                 NOT NULL,
    DeviceID         INT                 NOT NULL,
    SoLuongMuon      INT                 NOT NULL DEFAULT 1,
    NgayMuon         DATE                NOT NULL,
    NgayTraDuKien    DATE                NOT NULL,
    NgayTraThucTe    DATE                NULL,      -- NULL = chưa trả
    TrangThai        NVARCHAR(20)        NOT NULL DEFAULT N'borrowed',
    GhiChu           NVARCHAR(500)       NULL,
    NgayTao          DATETIME            NOT NULL DEFAULT GETDATE(),
    NgayCapNhat      DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_BorrowRecords PRIMARY KEY (RecordID),
    CONSTRAINT FK_BorrowRecords_Requests FOREIGN KEY (RequestID) 
        REFERENCES BorrowRequests(RequestID),
    CONSTRAINT FK_BorrowRecords_Users FOREIGN KEY (UserID) 
        REFERENCES Users(UserID),
    CONSTRAINT FK_BorrowRecords_Devices FOREIGN KEY (DeviceID) 
        REFERENCES Devices(DeviceID),
    CONSTRAINT CK_BorrowRecords_TrangThai CHECK (
        TrangThai IN (N'borrowed', N'returned', N'overdue')
    ),
    CONSTRAINT CK_BorrowRecords_SoLuong CHECK (SoLuongMuon >= 1)
);
GO

-- ============================================================================
-- BẢNG 7: BorrowConfig (Cấu hình giới hạn mượn)
-- Lưu các tham số cấu hình: giới hạn số lượng mượn, thời gian mượn tối đa...
-- ============================================================================
CREATE TABLE BorrowConfig
(
    ConfigID     INT IDENTITY(1,1)   NOT NULL,
    ConfigKey    VARCHAR(100)        NOT NULL,
    ConfigValue  INT                 NOT NULL,
    MoTa         NVARCHAR(500)       NULL,
    NgayCapNhat  DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_BorrowConfig PRIMARY KEY (ConfigID),
    CONSTRAINT UQ_BorrowConfig_Key UNIQUE (ConfigKey),
    CONSTRAINT CK_BorrowConfig_Value CHECK (ConfigValue >= 0)
);
GO

-- ============================================================================
-- BẢNG 8: EmailLogs (Nhật ký gửi email)
-- Ghi lại lịch sử gửi email thông báo cho sinh viên
-- ============================================================================
CREATE TABLE EmailLogs
(
    LogID        INT IDENTITY(1,1)   NOT NULL,
    UserID       INT                 NOT NULL,
    RecordID     INT                 NULL,       -- Liên kết tới bản ghi mượn (nếu có)
    LoaiEmail    NVARCHAR(50)        NOT NULL,
    TieuDe       NVARCHAR(200)       NOT NULL,
    NoiDung      NVARCHAR(MAX)       NULL,
    TrangThai    NVARCHAR(20)        NOT NULL DEFAULT N'sent',
    NgayGui      DATETIME            NOT NULL DEFAULT GETDATE(),

    -- Ràng buộc
    CONSTRAINT PK_EmailLogs PRIMARY KEY (LogID),
    CONSTRAINT FK_EmailLogs_Users FOREIGN KEY (UserID) 
        REFERENCES Users(UserID),
    CONSTRAINT FK_EmailLogs_Records FOREIGN KEY (RecordID) 
        REFERENCES BorrowRecords(RecordID),
    CONSTRAINT CK_EmailLogs_LoaiEmail CHECK (
        LoaiEmail IN (N'approved', N'rejected', N'due_reminder', N'overdue_alert')
    ),
    CONSTRAINT CK_EmailLogs_TrangThai CHECK (
        TrangThai IN (N'sent', N'failed', N'pending')
    )
);
GO

-- ============================================================================
-- BẢNG 9: OverdueAlerts (Cảnh báo quá hạn trên hệ thống)
-- Lưu các cảnh báo quá hạn hiển thị trên dashboard admin
-- ============================================================================
CREATE TABLE OverdueAlerts
(
    AlertID      INT IDENTITY(1,1)   NOT NULL,
    RecordID     INT                 NOT NULL,
    LoaiCanhBao  NVARCHAR(50)        NOT NULL,
    NoiDung      NVARCHAR(500)       NOT NULL,
    DaXuLy       BIT                 NOT NULL DEFAULT 0,
    NgayTao      DATETIME            NOT NULL DEFAULT GETDATE(),
    NgayXuLy     DATETIME            NULL,

    -- Ràng buộc
    CONSTRAINT PK_OverdueAlerts PRIMARY KEY (AlertID),
    CONSTRAINT FK_OverdueAlerts_Records FOREIGN KEY (RecordID) 
        REFERENCES BorrowRecords(RecordID),
    CONSTRAINT CK_OverdueAlerts_Loai CHECK (
        LoaiCanhBao IN (N'overdue', N'near_due')
    )
);
GO

IF OBJECT_ID('OverdueAlerts', 'U') IS NOT NULL
    PRINT N' Tạo tất cả 9 bảng thành công!';
ELSE
    PRINT N' Lỗi: Có lỗi xảy ra trong quá trình tạo bảng!';
GO

-- Xem danh sách bảng đã tạo
SELECT 
    TABLE_NAME AS N'Tên Bảng',
    TABLE_TYPE AS N'Loại'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
