/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 09_Security.sql
 MÔ TẢ: Bảo mật hệ thống - Quản lý tài khoản và phân quyền truy cập
 ÁP DỤNG: Chương 6 - Bảo mật và an toàn hệ thống
           Quản lý Logins/Users, Phân quyền truy cập
===============================================================================
*/

USE master;
GO

-- ============================================================================
-- 1. TẠO LOGIN (Server-level Authentication)
-- Login: Tài khoản đăng nhập vào SQL Server
-- ============================================================================

-- Login cho Quản trị viên
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'login_admin')
BEGIN
    CREATE LOGIN login_admin WITH PASSWORD = N'Admin@2025!Strong';
    PRINT N'✅ Tạo login_admin thành công.';
END
GO

-- Login cho Sinh viên
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'login_sinhvien')
BEGIN
    CREATE LOGIN login_sinhvien WITH PASSWORD = N'SinhVien@2025!Pass';
    PRINT N'✅ Tạo login_sinhvien thành công.';
END
GO

-- ============================================================================
-- 2. TẠO DATABASE USER (Database-level)
-- User: Tài khoản truy cập vào database cụ thể
-- ============================================================================
USE QuanLyMuonThietBi;
GO

-- User cho Admin
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'user_admin')
BEGIN
    CREATE USER user_admin FOR LOGIN login_admin;
    PRINT N'✅ Tạo user_admin thành công.';
END
GO

-- User cho Sinh viên
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'user_sinhvien')
BEGIN
    CREATE USER user_sinhvien FOR LOGIN login_sinhvien;
    PRINT N'✅ Tạo user_sinhvien thành công.';
END
GO

-- ============================================================================
-- 3. TẠO DATABASE ROLE (Nhóm quyền)
-- Role: Gom các quyền lại thành nhóm để dễ quản lý
-- ============================================================================

-- Role cho Admin
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'role_admin' AND type = 'R')
BEGIN
    CREATE ROLE role_admin;
    PRINT N'✅ Tạo role_admin thành công.';
END
GO

-- Role cho Sinh viên
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'role_sinhvien' AND type = 'R')
BEGIN
    CREATE ROLE role_sinhvien;
    PRINT N'✅ Tạo role_sinhvien thành công.';
END
GO

-- ============================================================================
-- 4. PHÂN QUYỀN CHO ROLE ADMIN
-- Admin: Toàn quyền quản lý
-- ============================================================================

-- Quyền trên tất cả bảng
GRANT SELECT, INSERT, UPDATE, DELETE ON Roles            TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON Users            TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON DeviceCategories TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON Devices          TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON BorrowRequests   TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON BorrowRecords    TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON BorrowConfig     TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON EmailLogs        TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON OverdueAlerts    TO role_admin;

-- Quyền trên Views
GRANT SELECT ON vw_ThietBiKhaDung          TO role_admin;
GRANT SELECT ON vw_YeuCauMuonChiTiet       TO role_admin;
GRANT SELECT ON vw_LichSuMuonTraSinhVien   TO role_admin;
GRANT SELECT ON vw_ThietBiQuaHan           TO role_admin;
GRANT SELECT ON vw_ThongKeThietBiTheoThang TO role_admin;

-- Quyền EXECUTE tất cả Stored Procedures
GRANT EXECUTE ON sp_TaoYeuCauMuon       TO role_admin;
GRANT EXECUTE ON sp_DuyetYeuCauMuon     TO role_admin;
GRANT EXECUTE ON sp_TuChoiYeuCau        TO role_admin;
GRANT EXECUTE ON sp_GhiNhanTraThietBi   TO role_admin;
GRANT EXECUTE ON sp_ThongKeThangHienTai TO role_admin;
GRANT EXECUTE ON sp_KiemTraQuaHan       TO role_admin;
GO

PRINT N'✅ Phân quyền cho role_admin thành công.';
GO

-- ============================================================================
-- 5. PHÂN QUYỀN CHO ROLE SINH VIÊN
-- Sinh viên: Chỉ xem thiết bị, tạo yêu cầu, xem lịch sử của mình
-- ============================================================================

-- Chỉ SELECT trên Views (không truy cập trực tiếp bảng)
GRANT SELECT ON vw_ThietBiKhaDung         TO role_sinhvien;
GRANT SELECT ON vw_LichSuMuonTraSinhVien  TO role_sinhvien;

-- Chỉ EXECUTE stored procedure tạo yêu cầu
GRANT EXECUTE ON sp_TaoYeuCauMuon TO role_sinhvien;

-- DENY các quyền nhạy cảm (từ chối rõ ràng)
DENY DELETE ON Devices         TO role_sinhvien;
DENY DELETE ON Users           TO role_sinhvien;
DENY INSERT, UPDATE, DELETE ON Roles TO role_sinhvien;
DENY INSERT, UPDATE, DELETE ON BorrowConfig TO role_sinhvien;
DENY SELECT ON BorrowConfig    TO role_sinhvien;
GO

PRINT N'✅ Phân quyền cho role_sinhvien thành công.';
GO

-- ============================================================================
-- 6. GÁN USER VÀO ROLE
-- ============================================================================
ALTER ROLE role_admin ADD MEMBER user_admin;
ALTER ROLE role_sinhvien ADD MEMBER user_sinhvien;
GO

PRINT N'✅ Gán user vào role thành công.';
GO

-- ============================================================================
-- 7. XEM TỔNG KẾT PHÂN QUYỀN
-- ============================================================================

-- Xem danh sách Logins
SELECT 
    name AS [Login Name],
    type_desc AS [Loại],
    create_date AS [Ngày Tạo]
FROM sys.server_principals 
WHERE name IN ('login_admin', 'login_sinhvien');
GO

-- Xem danh sách Users và Roles
USE QuanLyMuonThietBi;
GO

SELECT 
    dp.name AS [User/Role],
    dp.type_desc AS [Loại],
    ISNULL(sp.name, N'N/A') AS [Mapped Login]
FROM sys.database_principals dp
LEFT JOIN sys.server_principals sp ON dp.sid = sp.sid
WHERE dp.name IN ('user_admin', 'user_sinhvien', 'role_admin', 'role_sinhvien')
ORDER BY dp.type_desc;
GO

-- Xem quyền đã cấp
SELECT 
    dp.name AS [User/Role],
    o.name AS [Object],
    p.permission_name AS [Permission],
    p.state_desc AS [State]
FROM sys.database_permissions p
INNER JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id
LEFT JOIN sys.objects o ON p.major_id = o.object_id
WHERE dp.name IN ('role_admin', 'role_sinhvien')
ORDER BY dp.name, o.name;
GO

PRINT N'✅ Thiết lập bảo mật hoàn tất!';
GO
