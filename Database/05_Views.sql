/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 05_Views.sql
 MÔ TẢ: Tạo bảng ảo (Views) phục vụ nghiệp vụ
 ÁP DỤNG: Chương 4 - Tạo bảng ảo (Views)
           Khái niệm, lợi ích và cách sử dụng View trong thực tế
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- VIEW 1: vw_ThietBiKhaDung
-- Mô tả: Danh sách thiết bị đang có sẵn cho sinh viên xem
-- Lợi ích: Ẩn logic phức tạp, sinh viên chỉ cần SELECT * FROM vw_ThietBiKhaDung
-- ============================================================================
CREATE OR ALTER VIEW vw_ThietBiKhaDung
AS
SELECT 
    d.DeviceID,
    d.TenThietBi,
    d.SerialNumber,
    dc.TenDanhMuc       AS DanhMuc,
    d.MoTa,
    d.SoLuongTong,
    d.SoLuongKhaDung,
    d.TrangThai,
    d.ViTri,
    d.HinhAnh
FROM Devices d
INNER JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
WHERE d.TrangThai = N'available' AND d.SoLuongKhaDung > 0;
GO

-- ============================================================================
-- VIEW 2: vw_YeuCauMuonChiTiet
-- Mô tả: Yêu cầu mượn kèm thông tin sinh viên và thiết bị (cho Admin)
-- Lợi ích: Thay thế JOIN phức tạp, Admin dùng trực tiếp
-- ============================================================================
CREATE OR ALTER VIEW vw_YeuCauMuonChiTiet
AS
SELECT 
    rq.RequestID,
    -- Thông tin sinh viên
    u.UserID,
    u.HoTen             AS TenSinhVien,
    u.Email              AS EmailSinhVien,
    u.Phone              AS SDTSinhVien,
    -- Thông tin thiết bị
    d.DeviceID,
    d.TenThietBi,
    d.SerialNumber,
    dc.TenDanhMuc        AS DanhMuc,
    -- Chi tiết yêu cầu
    rq.SoLuongMuon,
    rq.NgayMuon,
    rq.NgayTraDuKien,
    DATEDIFF(DAY, rq.NgayMuon, rq.NgayTraDuKien) AS SoNgayMuon,
    rq.MucDich,
    rq.GhiChu,
    rq.TrangThai,
    rq.NgayTao           AS NgayGuiYeuCau
FROM BorrowRequests rq
INNER JOIN Users u              ON rq.UserID   = u.UserID
INNER JOIN Devices d            ON rq.DeviceID = d.DeviceID
INNER JOIN DeviceCategories dc  ON d.CategoryID = dc.CategoryID;
GO

-- ============================================================================
-- VIEW 3: vw_LichSuMuonTraSinhVien
-- Mô tả: Lịch sử mượn-trả của sinh viên (dùng cho cả SV và Admin)
-- Lợi ích: Hiển thị trạng thái tự động (đang mượn / quá hạn / đã trả)
-- ============================================================================
CREATE OR ALTER VIEW vw_LichSuMuonTraSinhVien
AS
SELECT 
    br.RecordID,
    -- Thông tin sinh viên
    u.UserID,
    u.HoTen              AS TenSinhVien,
    u.Email,
    -- Thông tin thiết bị
    d.TenThietBi,
    dc.TenDanhMuc         AS DanhMuc,
    -- Chi tiết mượn-trả
    br.SoLuongMuon,
    br.NgayMuon,
    br.NgayTraDuKien,
    br.NgayTraThucTe,
    br.TrangThai,
    -- Tình trạng tự động tính toán
    CASE 
        WHEN br.NgayTraThucTe IS NOT NULL THEN N'Đã trả'
        WHEN br.NgayTraDuKien < CAST(GETDATE() AS DATE) THEN N'Quá hạn'
        ELSE N'Đang mượn'
    END AS TinhTrangHienTai,
    -- Số ngày quá hạn (nếu có)
    CASE 
        WHEN br.NgayTraThucTe IS NULL AND br.NgayTraDuKien < CAST(GETDATE() AS DATE) 
        THEN DATEDIFF(DAY, br.NgayTraDuKien, GETDATE())
        ELSE 0
    END AS SoNgayQuaHan,
    br.GhiChu
FROM BorrowRecords br
INNER JOIN Users u              ON br.UserID   = u.UserID
INNER JOIN Devices d            ON br.DeviceID = d.DeviceID
INNER JOIN DeviceCategories dc  ON d.CategoryID = dc.CategoryID;
GO

-- ============================================================================
-- VIEW 4: vw_ThietBiQuaHan
-- Mô tả: Danh sách thiết bị đang quá hạn trả (cho Admin dashboard)
-- Lợi ích: Admin nhanh chóng xem các trường hợp cần xử lý
-- ============================================================================
CREATE OR ALTER VIEW vw_ThietBiQuaHan
AS
SELECT 
    br.RecordID,
    u.HoTen              AS TenSinhVien,
    u.Email,
    u.Phone,
    d.TenThietBi,
    d.SerialNumber,
    br.SoLuongMuon,
    br.NgayMuon,
    br.NgayTraDuKien,
    DATEDIFF(DAY, br.NgayTraDuKien, GETDATE()) AS SoNgayQuaHan,
    br.GhiChu
FROM BorrowRecords br
INNER JOIN Users u   ON br.UserID   = u.UserID
INNER JOIN Devices d ON br.DeviceID = d.DeviceID
WHERE br.TrangThai IN (N'borrowed', N'overdue')
  AND br.NgayTraDuKien < CAST(GETDATE() AS DATE)
  AND br.NgayTraThucTe IS NULL;
GO

-- ============================================================================
-- VIEW 5: vw_ThongKeThietBiTheoThang
-- Mô tả: Thống kê thiết bị mượn nhiều nhất theo tháng hiện tại
-- Lợi ích: Dùng cho báo cáo, thống kê hàng tháng
-- ============================================================================
CREATE OR ALTER VIEW vw_ThongKeThietBiTheoThang
AS
SELECT 
    d.DeviceID,
    d.TenThietBi,
    dc.TenDanhMuc         AS DanhMuc,
    d.SoLuongTong,
    d.SoLuongKhaDung,
    COUNT(br.RecordID)    AS SoLanMuonTrongThang,
    SUM(br.SoLuongMuon)  AS TongSoLuongMuon
FROM Devices d
INNER JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
LEFT JOIN BorrowRecords br ON d.DeviceID = br.DeviceID
    AND MONTH(br.NgayMuon) = MONTH(GETDATE())
    AND YEAR(br.NgayMuon) = YEAR(GETDATE())
GROUP BY d.DeviceID, d.TenThietBi, dc.TenDanhMuc, d.SoLuongTong, d.SoLuongKhaDung;
GO

-- ============================================================================
-- KIỂM TRA: Liệt kê tất cả Views đã tạo
-- ============================================================================
SELECT 
    TABLE_NAME AS [Tên View],
    TABLE_TYPE AS [Loại]
FROM INFORMATION_SCHEMA.VIEWS
ORDER BY TABLE_NAME;
GO

IF OBJECT_ID('vw_ThongKeThietBiTheoThang', 'V') IS NOT NULL
    PRINT N' Tạo 5 Views thành công!';
ELSE
    PRINT N' Lỗi: Có lỗi xảy ra trong quá trình tạo Views!';
GO

-- ============================================================================
-- VÍ DỤ SỬ DỤNG VIEWS
-- ============================================================================
-- Sinh viên xem thiết bị có sẵn
-- SELECT * FROM vw_ThietBiKhaDung;

-- Admin xem yêu cầu mượn pending
-- SELECT * FROM vw_YeuCauMuonChiTiet WHERE TrangThai = N'pending';

-- Sinh viên xem lịch sử mượn của mình (UserID = 2)
-- SELECT * FROM vw_LichSuMuonTraSinhVien WHERE UserID = 2;

-- Admin xem thiết bị quá hạn
-- SELECT * FROM vw_ThietBiQuaHan;

-- Thống kê thiết bị mượn nhiều tháng này
-- SELECT * FROM vw_ThongKeThietBiTheoThang ORDER BY SoLanMuonTrongThang DESC;
