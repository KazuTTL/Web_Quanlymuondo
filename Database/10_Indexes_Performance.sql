/*
=================================================================================
HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ
FILE: 10_Indexes_Performance.sql
MÔ TẢ: Tạo Indexes để tối ưu hiệu suất truy vấn
ÁP DỤNG: Chương 6 - Indexing và Performance Tuning
=================================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- INDEXES CHO BORROW REQUESTS - Các truy vấn tìm kiếm theo User, Device, Status
-- ============================================================================
CREATE NONCLUSTERED INDEX IX_BorrowRequests_UserID 
ON BorrowRequests(UserID) 
INCLUDE (DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, TrangThai);
GO

CREATE NONCLUSTERED INDEX IX_BorrowRequests_DeviceID 
ON BorrowRequests(DeviceID) 
INCLUDE (UserID, SoLuongMuon, TrangThai);
GO

CREATE NONCLUSTERED INDEX IX_BorrowRequests_TrangThai_NgayTao
ON BorrowRequests(TrangThai, NgayTao DESC);
GO

-- ============================================================================
-- INDEXES CHO BORROW RECORDS - Truy vấn theo User, Device, Status, Date
-- ============================================================================
CREATE NONCLUSTERED INDEX IX_BorrowRecords_UserID 
ON BorrowRecords(UserID) 
INCLUDE (DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, TrangThai, NgayTraThucTe);
GO

CREATE NONCLUSTERED INDEX IX_BorrowRecords_DeviceID 
ON BorrowRecords(DeviceID);
GO

CREATE NONCLUSTERED INDEX IX_BorrowRecords_TrangThai_NgayMuon
ON BorrowRecords(TrangThai, NgayMuon DESC);
GO

CREATE NONCLUSTERED INDEX IX_BorrowRecords_NgayTraDuKien
ON BorrowRecords(NgayTraDuKien)
WHERE TrangThai IN (N'borrowed', N'overdue');
GO

-- ============================================================================
-- INDEXES CHO DEVICES - Tìm kiếm theo Category, Status
-- ============================================================================
CREATE NONCLUSTERED INDEX IX_Devices_CategoryID 
ON Devices(CategoryID) 
INCLUDE (TenThietBi, SoLuongTong, SoLuongKhaDung, TrangThai);
GO

CREATE NONCLUSTERED INDEX IX_Devices_TrangThai_SoLuongKhaDung
ON Devices(TrangThai, SoLuongKhaDung);
GO

-- ============================================================================
-- INDEXES CHO USERS - Tìm kiếm nhanh theo username, email
-- ============================================================================
CREATE NONCLUSTERED INDEX IX_Users_Username 
ON Users(Username) 
INCLUDE (HoTen, Email, RoleID, TrangThai);
GO

CREATE NONCLUSTERED INDEX IX_Users_Email 
ON Users(Email);
GO

CREATE NONCLUSTERED INDEX IX_Users_RoleID 
ON Users(RoleID);
GO

-- ============================================================================
-- KIỂM TRA INDEXES ĐÃ TẠO
-- ============================================================================
SELECT 
    i.name AS IndexName,
    t.name AS TableName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    i.is_primary_key AS IsPrimaryKey
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.is_ms_shipped = 0
ORDER BY t.name, i.name;
GO

IF (SELECT COUNT(*) FROM sys.indexes WHERE name LIKE 'IX_%') > 0
    PRINT N' ✓ Tạo Indexes thành công!';
ELSE
    PRINT N' ⚠ Có lỗi!';
GO