/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 98_ClearTransactions.sql
 MÔ TẢ: Xóa sạch toàn bộ dữ liệu giao dịch mẫu (BorrowRecords, Fines, v.v...)
       Khôi phục số lượng thiết bị khả dụng ban đầu về bằng số lượng tổng.
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- 1. Tắt tạm thời các ràng buộc kiểm tra và RLS
PRINT N'Bắt đầu dọn dẹp các bảng giao dịch...';

IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'UserBorrowRequestPolicy' AND is_enabled = 1)
BEGIN
    ALTER SECURITY POLICY UserBorrowRequestPolicy WITH (STATE = OFF);
    PRINT N'Đã tạm tắt Row-Level Security Policy.';
END

-- 2. Xóa các bảng phụ/liên kết tiền phạt, hư hỏng trước
DELETE FROM Fines;
DELETE FROM DeviceDamages;
DELETE FROM MaintenanceRecords;

-- 3. Xóa các bảng thông báo, email log, cảnh báo quá hạn
DELETE FROM Notifications;
IF OBJECT_ID('EmailLogs', 'U') IS NOT NULL DELETE FROM EmailLogs;
IF OBJECT_ID('OverdueAlerts', 'U') IS NOT NULL DELETE FROM OverdueAlerts;

-- 4. Xóa bảng lịch sử mượn trả và yêu cầu mượn thiết bị
DELETE FROM BorrowRecords;
DELETE FROM BorrowRequests;

-- Bật lại RLS sau khi xóa
IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'UserBorrowRequestPolicy')
BEGIN
    ALTER SECURITY POLICY UserBorrowRequestPolicy WITH (STATE = ON);
    PRINT N'Đã kích hoạt lại Row-Level Security Policy.';
END

-- 5. Thiết lập lại bộ đếm tự tăng (Identity) của khóa chính về 0
PRINT N'Đang cấu hình lại bộ đếm khóa chính tự tăng...';
DBCC CHECKIDENT ('Fines', RESEED, 0);
DBCC CHECKIDENT ('DeviceDamages', RESEED, 0);
DBCC CHECKIDENT ('MaintenanceRecords', RESEED, 0);
DBCC CHECKIDENT ('Notifications', RESEED, 0);
DBCC CHECKIDENT ('BorrowRecords', RESEED, 0);
DBCC CHECKIDENT ('BorrowRequests', RESEED, 0);

IF OBJECT_ID('EmailLogs', 'U') IS NOT NULL DBCC CHECKIDENT ('EmailLogs', RESEED, 0);
IF OBJECT_ID('OverdueAlerts', 'U') IS NOT NULL DBCC CHECKIDENT ('OverdueAlerts', RESEED, 0);

-- 6. Khôi phục số lượng thiết bị khả dụng (SoLuongKhaDung) về bằng số lượng tổng (SoLuongTong)
PRINT N'Đang khôi phục số lượng khả dụng của toàn bộ thiết bị...';
UPDATE Devices 
SET SoLuongKhaDung = SoLuongTong,
    SoLuongBaoTri = 0,
    SoLuongDangMuon = 0;

PRINT N'✅ Đã dọn dẹp sạch toàn bộ dữ liệu giao dịch thành công!';
GO
