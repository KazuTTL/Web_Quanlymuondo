USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 17: INDEXED VIEWS (MATERIALIZED VIEWS)
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- Y?u c?u:
-- - Ph?i c? SCHEMABINDING
-- - Ph?i d?ng COUNT_BIG thay v? COUNT
-- - C?c b?ng tham chi?u ph?i d?ng 2 ph?n (schema.table)

-- Indexed View 1: vw_DashboardThongKe
-- =====================================================
CREATE OR ALTER VIEW vw_DashboardThongKe
WITH SCHEMABINDING
AS
SELECT 
    YEAR(br.NgayMuon) AS Nam,
    MONTH(br.NgayMuon) AS Thang,
    dc.TenDanhMuc,
    COUNT_BIG(*) AS SoLuotMuon,
    SUM(br.SoLuongMuon) AS TongSoLuongMuon,
    COUNT_BIG(DISTINCT br.UserID) AS SoSinhVien
FROM dbo.BorrowRecords br
INNER JOIN dbo.Devices d ON br.DeviceID = d.DeviceID
INNER JOIN dbo.DeviceCategories dc ON d.CategoryID = dc.CategoryID
GROUP BY YEAR(br.NgayMuon), MONTH(br.NgayMuon), dc.TenDanhMuc;
GO

-- T?o UNIQUE CLUSTERED INDEX ?? materialize view
CREATE UNIQUE CLUSTERED INDEX IX_vw_DashboardThongKe
ON vw_DashboardThongKe (Nam, Thang, TenDanhMuc);
GO

-- Indexed View 2: vw_TonKhoHienTai
-- =====================================================
CREATE OR ALTER VIEW vw_TonKhoHienTai
WITH SCHEMABINDING
AS
SELECT 
    d.DeviceID,
    d.TenThietBi,
    dc.TenDanhMuc,
    d.SoLuongTong,
    d.SoLuongKhaDung,
    d.SoLuongTong - d.SoLuongKhaDung AS SoLuongDangMuon,
    d.SoLuongBaoTri,
    d.TrangThai
FROM dbo.Devices d
INNER JOIN dbo.DeviceCategories dc ON d.CategoryID = dc.CategoryID;
GO

CREATE UNIQUE CLUSTERED INDEX IX_vw_TonKhoHienTai
ON vw_TonKhoHienTai (DeviceID);
GO

-- =====================================================
-- K?T THC FILE 17
-- =====================================================
