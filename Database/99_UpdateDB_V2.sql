USE QuanLyMuonThietBi;
GO

-- 1. Thêm cột SoLuongBaoTri và SoLuongDangMuon vào bảng Devices
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Devices') AND name = 'SoLuongBaoTri')
BEGIN
    ALTER TABLE Devices ADD SoLuongBaoTri INT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Devices') AND name = 'SoLuongDangMuon')
BEGIN
    ALTER TABLE Devices ADD SoLuongDangMuon INT NOT NULL DEFAULT 0;
END
GO

-- 2. Cập nhật View vw_YeuCauMuonChiTiet để bao gồm thông tin đã trả
CREATE OR ALTER VIEW vw_YeuCauMuonChiTiet
AS
SELECT 
    rq.RequestID,
    u.UserID,
    u.HoTen             AS TenSinhVien,
    u.Email              AS EmailSinhVien,
    u.Phone              AS SDTSinhVien,
    d.DeviceID,
    d.TenThietBi,
    d.SerialNumber,
    dc.TenDanhMuc        AS DanhMuc,
    rq.SoLuongMuon,
    rq.NgayMuon,
    rq.NgayTraDuKien,
    DATEDIFF(DAY, rq.NgayMuon, rq.NgayTraDuKien) AS SoNgayMuon,
    rq.MucDich,
    rq.GhiChu,
    rq.TrangThai,
    rq.NgayTao           AS NgayGuiYeuCau,
    CASE 
        WHEN EXISTS (SELECT 1 FROM BorrowRecords br WHERE br.RequestID = rq.RequestID AND br.TrangThai = N'returned') THEN 1 
        ELSE 0 
    END AS DaTra
FROM BorrowRequests rq
INNER JOIN Users u              ON rq.UserID   = u.UserID
INNER JOIN Devices d            ON rq.DeviceID = d.DeviceID
INNER JOIN DeviceCategories dc  ON d.CategoryID = dc.CategoryID;
GO

-- =====================================================
-- PHẦN 3: CHẠY CÁC FILE NÂNG CAO (13-22)
-- =====================================================

PRINT N'Đang chạy 13_NewTables.sql...';
GO
:r .\13_NewTables.sql
GO

PRINT N'Đang chạy 14_AdvancedQueries.sql...';
GO
:r .\14_AdvancedQueries.sql
GO

PRINT N'Đang chạy 15_AdvancedSP.sql...';
GO
:r .\15_AdvancedSP.sql
GO

PRINT N'Đang chạy 16_AdvancedFunctions.sql...';
GO
:r .\16_AdvancedFunctions.sql
GO

PRINT N'Đang chạy 17_IndexedViews.sql...';
GO
:r .\17_IndexedViews.sql
GO

PRINT N'Đang chạy 18_TemporalTables.sql...';
GO
:r .\18_TemporalTables.sql
GO

PRINT N'Đang chạy 19_Partitioning.sql...';
GO
:r .\19_Partitioning.sql
GO

PRINT N'Đang chạy 20_AdvancedSecurity.sql...';
GO
:r .\20_AdvancedSecurity.sql
GO

PRINT N'Đang chạy 21_JSON_XML_FullText.sql...';
GO
:r .\21_JSON_XML_FullText.sql
GO

PRINT N'Đang chạy 22_AdvancedTriggers.sql...';
GO
:r .\22_AdvancedTriggers.sql
GO

PRINT N'Hoàn tất nâng cấp database!';
GO
