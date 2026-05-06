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
    -- Kiểm tra xem đã có bản ghi trả thiết bị chưa
    CASE 
        WHEN EXISTS (SELECT 1 FROM BorrowRecords br WHERE br.RequestID = rq.RequestID AND br.TrangThai = N'returned') THEN 1 
        ELSE 0 
    END AS DaTra
FROM BorrowRequests rq
INNER JOIN Users u              ON rq.UserID   = u.UserID
INNER JOIN Devices d            ON rq.DeviceID = d.DeviceID
INNER JOIN DeviceCategories dc  ON d.CategoryID = dc.CategoryID;
GO
