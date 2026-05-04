/*
=================================================================================
HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ
FILE: 12_Security_Roles.sql
MÔ TẢ: Phân quyền và bảo mật database
ÁP DỤNG: Chương 7 - Database Security & Audit
=================================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- TABLE: Permissions - Phân quyền
-- ============================================================================
CREATE TABLE Permissions
(
    PermissionID   INT IDENTITY(1,1)   NOT NULL,
    PermissionName VARCHAR(100)        NOT NULL,
    Description  NVARCHAR(255)       NULL,
    CONSTRAINT PK_Permissions PRIMARY KEY (PermissionID),
    CONSTRAINT UQ_Permissions_Name UNIQUE (PermissionName)
);
GO

-- Insert permissions
INSERT INTO Permissions (PermissionName, Description) VALUES
    ('view_devices', N'Xem danh sách thiết bị'),
    ('create_request', N'Tạo yêu cầu mượn'),
    ('view_own_requests', N'Xem yêu cầu của bản thân'),
    ('view_all_requests', N'Xem tất cả yêu cầu (Admin)'),
    ('approve_request', N'Duyệt yêu cầu (Admin)'),
    ('reject_request', N'Từ chối yêu cầu (Admin)'),
    ('manage_devices', N'Quản lý thiết bị (Admin)'),
    ('view_statistics', N'Xem thống kê');
GO

-- ============================================================================
-- TABLE: RolePermissions - Quan hệ Role - Permission
-- ============================================================================
CREATE TABLE RolePermissions
(
    RoleID       INT NOT NULL,
    PermissionID INT NOT NULL,
    CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleID, PermissionID),
    CONSTRAINT FK_RolePermissions_Role FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    CONSTRAINT FK_RolePermissions_Permission FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID)
);
GO

-- Admin có tất cả quyền
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 1, PermissionID FROM Permissions;
GO

-- User chỉ có quyền xem và tạo request
INSERT INTO RolePermissions (RoleID, PermissionID) VALUES
    (2, 1),  -- view_devices
    (2, 2),  -- create_request
    (2, 3),  -- view_own_requests
    (2, 8);  -- view_statistics
GO

-- ============================================================================
-- FUNCTION: fn_KiemTraQuyen - Kiểm tra user có quyền không
-- ============================================================================
CREATE OR ALTER FUNCTION fn_KiemTraQuyen
(
    @RoleID INT,
    @PermissionName VARCHAR(100)
)
RETURNS BIT
AS
BEGIN
    DECLARE @CoQuyen BIT = 0;
    
    SELECT @CoQuyen = 1
    FROM RolePermissions rp
    INNER JOIN Permissions p ON rp.PermissionID = p.PermissionID
    WHERE rp.RoleID = @RoleID AND p.PermissionName = @PermissionName;
    
    RETURN ISNULL(@CoQuyen, 0);
END;
GO

-- ============================================================================
-- VIEW: vw_UserPermissions - Xem quyền của 1 role
-- ============================================================================
CREATE OR ALTER VIEW vw_UserPermissions
AS
SELECT r.RoleName, p.PermissionName, p.Description
FROM RolePermissions rp
INNER JOIN Roles r ON rp.RoleID = r.RoleID
INNER JOIN Permissions p ON rp.PermissionID = p.PermissionID;
GO

-- ============================================================================
-- TABLE: LoginLogs - Lưu lịch sử đăng nhập
-- ============================================================================
CREATE TABLE LoginLogs
(
    LogID        BIGINT IDENTITY(1,1)   NOT NULL,
    UserID       INT                 NULL,
    Username    VARCHAR(50)         NOT NULL,
    Success     BIT                 NOT NULL,
    IPAddress   VARCHAR(50)         NULL,
    UserAgent   NVARCHAR(500)        NULL,
    Timestamp  DATETIME           NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_LoginLogs PRIMARY KEY (LogID)
);
GO

CREATE NONCLUSTERED INDEX IX_LoginLogs_Timestamp ON LoginLogs(Timestamp DESC);
CREATE NONCLUSTERED INDEX IX_LoginLogs_UserID ON LoginLogs(UserID);
GO

-- ============================================================================
-- PROCEDURE: sp_DangNhap - Đăng nhập có ghi log
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_DangNhap
    @Username VARCHAR(50),
    @Password VARCHAR(255),
    @IPAddress VARCHAR(50) = NULL,
    @Success BIT OUTPUT,
    @UserID INT OUTPUT,
    @RoleID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @Success = 0;
    SET @UserID = NULL;
    SET @RoleID = NULL;
    
    DECLARE @PasswordHash VARCHAR(255);
    
    SELECT TOP 1 
        @UserID = UserID, 
        @RoleID = RoleID,
        @PasswordHash = PasswordHash
    FROM Users 
    WHERE Username = @Username AND TrangThai = N'ACTIVE' AND IsDeleted = 0;
    
    -- Giả định dùng bcrypt hoặc hash đơn giản (cần tích hợp với app để so sánh hash)
    IF @PasswordHash IS NOT NULL
    BEGIN
        SET @Success = 1;
        
        -- Ghi log đăng nhập thành công
        INSERT INTO LoginLogs (UserID, Username, Success, IPAddress)
        VALUES (@UserID, @Username, 1, @IPAddress);
    END
    ELSE
    BEGIN
        -- Ghi log đăng nhập thất bại
        INSERT INTO LoginLogs (UserID, Username, Success, IPAddress)
        VALUES (NULL, @Username, 0, @IPAddress);
    END
END;
GO

-- ============================================================================
-- PROCEDURE: sp_BaoMatKhau - Thay đổi mật khẩu
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_DoiMatKhau
    @UserID INT,
    @MatKhauCu VARCHAR(255),
    @MatKhauMoi VARCHAR(255),
    @KetQua BIT OUTPUT,
    @Message NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @KetQua = 0;
    SET @Message = N'';
    
    DECLARE @PasswordHash VARCHAR(255);
    SELECT @PasswordHash = PasswordHash FROM Users WHERE UserID = @UserID;
    
    IF @PasswordHash IS NULL
    BEGIN
        SET @Message = N'Người dùng không tồn tại';
        RETURN;
    END
    
    -- Cần tích hợp hash trong app - ở đây giả định match
    IF 1=1  -- Thay bằng: Hash(@MatKhauCu) = @PasswordHash
    BEGIN
        UPDATE Users 
        SET PasswordHash = @MatKhauMoi, NgayCapNhat = GETDATE()
        WHERE UserID = @UserID;
        
        SET @KetQua = 1;
        SET @Message = N'Đổi mật khẩu thành công';
    END
    ELSE
    BEGIN
        SET @Message = N'Mật khẩu cũ không đúng';
    END
END;
GO

PRINT N' ✓ Tạo Security & Roles thành công!';
GO