/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 04_Queries.sql
 MÔ TẢ: Truy vấn dữ liệu (SELECT) phục vụ nghiệp vụ
 ÁP DỤNG: Chương 3 - Ngôn ngữ T-SQL (Truy xuất dữ liệu SELECT, DML)
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- TRUY VẤN 1: Danh sách thiết bị có sẵn (Sinh viên xem)
-- Hiển thị: tên, tình trạng, số lượng khả dụng, danh mục, vị trí
-- ============================================================================
SELECT 
    d.DeviceID,
    d.TenThietBi,
    d.SerialNumber,
    dc.TenDanhMuc   AS DanhMuc,
    d.SoLuongTong,
    d.SoLuongKhaDung,
    d.TrangThai,
    d.ViTri
FROM Devices d
INNER JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
WHERE d.TrangThai = N'available' AND d.SoLuongKhaDung > 0
ORDER BY dc.TenDanhMuc, d.TenThietBi;
GO

-- ============================================================================
-- TRUY VẤN 2: Lịch sử mượn của 1 sinh viên (VD: UserID = 2 - Trần Thị Mai)
-- JOIN 3 bảng: BorrowRecords + Devices + BorrowRequests
-- ============================================================================
SELECT 
    br.RecordID,
    d.TenThietBi,
    br.SoLuongMuon,
    br.NgayMuon,
    br.NgayTraDuKien,
    br.NgayTraThucTe,
    br.TrangThai,
    CASE 
        WHEN br.NgayTraThucTe IS NOT NULL THEN N'Đã trả'
        WHEN br.NgayTraDuKien < GETDATE() THEN N'Quá hạn'
        ELSE N'Đang mượn'
    END AS TinhTrang,
    br.GhiChu
FROM BorrowRecords br
INNER JOIN Devices d ON br.DeviceID = d.DeviceID
WHERE br.UserID = 2
ORDER BY br.NgayMuon DESC;
GO

-- ============================================================================
-- TRUY VẤN 3: Danh sách yêu cầu mượn (Admin xem - tất cả trạng thái)
-- JOIN: BorrowRequests + Users + Devices
-- ============================================================================
SELECT 
    rq.RequestID,
    u.HoTen         AS SinhVien,
    u.Email,
    d.TenThietBi,
    rq.SoLuongMuon,
    rq.NgayMuon,
    rq.NgayTraDuKien,
    rq.MucDich,
    rq.TrangThai,
    rq.NgayTao       AS NgayGuiYeuCau
FROM BorrowRequests rq
INNER JOIN Users u   ON rq.UserID = u.UserID
INNER JOIN Devices d ON rq.DeviceID = d.DeviceID
ORDER BY 
    CASE rq.TrangThai 
        WHEN N'pending' THEN 0   -- Ưu tiên hiện pending trước
        WHEN N'approved' THEN 1 
        WHEN N'rejected' THEN 2 
        ELSE 3 
    END,
    rq.NgayTao DESC;
GO

-- ============================================================================
-- TRUY VẤN 4: Top thiết bị mượn nhiều nhất trong tháng hiện tại
-- Kỹ thuật: GROUP BY + COUNT + ORDER BY DESC + TOP
-- ============================================================================
SELECT TOP 10
    d.TenThietBi,
    dc.TenDanhMuc    AS DanhMuc,
    COUNT(br.RecordID) AS SoLanMuon,
    SUM(br.SoLuongMuon) AS TongSoLuongMuon
FROM BorrowRecords br
INNER JOIN Devices d ON br.DeviceID = d.DeviceID
INNER JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
WHERE MONTH(br.NgayMuon) = MONTH(GETDATE()) 
  AND YEAR(br.NgayMuon)  = YEAR(GETDATE())
GROUP BY d.TenThietBi, dc.TenDanhMuc
ORDER BY SoLanMuon DESC, TongSoLuongMuon DESC;
GO

-- ============================================================================
-- TRUY VẤN 5: Danh sách thiết bị đang quá hạn trả
-- Kỹ thuật: DATEDIFF, CASE, WHERE phức hợp
-- ============================================================================
SELECT 
    br.RecordID,
    u.HoTen          AS SinhVien,
    u.Email,
    u.Phone,
    d.TenThietBi,
    br.SoLuongMuon,
    br.NgayMuon,
    br.NgayTraDuKien,
    DATEDIFF(DAY, br.NgayTraDuKien, GETDATE()) AS SoNgayQuaHan
FROM BorrowRecords br
INNER JOIN Users u   ON br.UserID = u.UserID
INNER JOIN Devices d ON br.DeviceID = d.DeviceID
WHERE br.TrangThai IN (N'borrowed', N'overdue')
  AND br.NgayTraDuKien < CAST(GETDATE() AS DATE)
  AND br.NgayTraThucTe IS NULL
ORDER BY SoNgayQuaHan DESC;
GO

-- ============================================================================
-- TRUY VẤN 6: Thống kê tổng quan mượn-trả (Dashboard Admin)
-- Kỹ thuật: Subquery, Aggregate Functions
-- ============================================================================
SELECT 
    (SELECT COUNT(*) FROM BorrowRequests WHERE TrangThai = N'pending')  AS YeuCauChoDuyet,
    (SELECT COUNT(*) FROM BorrowRecords WHERE TrangThai = N'borrowed')  AS DangMuon,
    (SELECT COUNT(*) FROM BorrowRecords 
     WHERE TrangThai IN (N'borrowed', N'overdue') 
       AND NgayTraDuKien < CAST(GETDATE() AS DATE)
       AND NgayTraThucTe IS NULL)                                       AS QuaHan,
    (SELECT COUNT(*) FROM BorrowRecords WHERE TrangThai = N'returned')  AS DaTra,
    (SELECT COUNT(*) FROM Devices WHERE TrangThai = N'available')       AS ThietBiKhaDung;
GO

-- ============================================================================
-- TRUY VẤN 7: Thống kê mượn-trả theo từng tháng (năm hiện tại)
-- Kỹ thuật: GROUP BY tháng + Aggregate
-- ============================================================================
SELECT 
    MONTH(br.NgayMuon) AS Thang,
    COUNT(*)           AS TongLuotMuon,
    SUM(br.SoLuongMuon) AS TongSoLuong,
    SUM(CASE WHEN br.TrangThai = N'returned' THEN 1 ELSE 0 END) AS DaTra,
    SUM(CASE WHEN br.TrangThai = N'borrowed' THEN 1 ELSE 0 END) AS DangMuon,
    SUM(CASE WHEN br.TrangThai = N'overdue' THEN 1 ELSE 0 END)  AS QuaHan
FROM BorrowRecords br
WHERE YEAR(br.NgayMuon) = YEAR(GETDATE())
GROUP BY MONTH(br.NgayMuon)
ORDER BY Thang;
GO

-- ============================================================================
-- TRUY VẤN 8: Kiểm tra số thiết bị đang mượn của 1 sinh viên
-- Dùng để kiểm tra giới hạn mượn (max 5)
-- ============================================================================
DECLARE @UserID INT = 2;    -- Trần Thị Mai
DECLARE @MaxBorrow INT;

SELECT @MaxBorrow = ConfigValue 
FROM BorrowConfig 
WHERE ConfigKey = 'MAX_BORROW_PER_USER';

SELECT 
    u.HoTen,
    COUNT(br.RecordID) AS SoDangMuon,
    @MaxBorrow AS GioiHan,
    CASE 
        WHEN COUNT(br.RecordID) >= @MaxBorrow THEN N'❌ Đã đạt giới hạn'
        ELSE N'✅ Còn được mượn thêm ' + CAST(@MaxBorrow - COUNT(br.RecordID) AS VARCHAR) + N' thiết bị'
    END AS TrangThaiGioiHan
FROM Users u
LEFT JOIN BorrowRecords br ON u.UserID = br.UserID 
    AND br.TrangThai IN (N'borrowed', N'overdue')
WHERE u.UserID = @UserID
GROUP BY u.HoTen;
GO
