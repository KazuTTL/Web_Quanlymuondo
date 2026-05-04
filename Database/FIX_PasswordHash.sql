-- =============================================================================
-- FIX: Cập nhật PasswordHash thật (bcrypt) cho các tài khoản mẫu
-- Mật khẩu: 123456
-- Chạy file này trong SQL Server Management Studio (SSMS)
-- =============================================================================

USE QuanLyMuonThietBi;
GO

-- Hash bcrypt thật của '123456' (salt rounds = 10)
UPDATE Users 
SET PasswordHash = '$2b$10$TtMDlfsJ24ttAJUXNY3oBezvPOEZ/ra68.vUT8tcMevB3/CBHrIyq'
WHERE Username IN ('admin', 'mai.tran', 'nam.le', 'tuan.pham', 'lan.vo');
GO

-- Kiểm tra lại
SELECT UserID, Username, HoTen, RoleID, TrangThai, 
       LEFT(PasswordHash, 20) + '...' AS PasswordHashPreview
FROM Users
WHERE Username IN ('admin', 'mai.tran', 'nam.le', 'tuan.pham', 'lan.vo');
GO

PRINT N'✅ Cập nhật mật khẩu thành công! Tất cả tài khoản dùng mật khẩu: 123456';
