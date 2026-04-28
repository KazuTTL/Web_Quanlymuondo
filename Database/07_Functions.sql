/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 07_Functions.sql
 MÔ TẢ: Hàm do người dùng định nghĩa (User Defined Functions)
 ÁP DỤNG: Chương 5 - Truy vấn SQL nâng cao (UDF)
           Xử lý tính toán phức tạp, tái sử dụng trong SELECT và WHERE
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- FUNCTION 1: fn_SoLuongDangMuon
-- Loại: Scalar Function
-- Mô tả: Tính tổng số thiết bị đang mượn của 1 sinh viên
-- Dùng để: Kiểm tra giới hạn mượn trước khi tạo yêu cầu
-- ============================================================================
CREATE OR ALTER FUNCTION fn_SoLuongDangMuon
(
    @UserID INT
)
RETURNS INT
AS
BEGIN
    DECLARE @SoLuong INT;
    
    SELECT @SoLuong = ISNULL(SUM(SoLuongMuon), 0)
    FROM BorrowRecords 
    WHERE UserID = @UserID 
      AND TrangThai IN (N'borrowed', N'overdue');
    
    RETURN @SoLuong;
END;
GO

-- ============================================================================
-- FUNCTION 2: fn_KiemTraGioiHan
-- Loại: Scalar Function
-- Mô tả: Kiểm tra sinh viên có vượt giới hạn mượn không
-- Trả về: 1 = CÓ THỂ mượn thêm, 0 = KHÔNG THỂ (đã đạt giới hạn)
-- ============================================================================
CREATE OR ALTER FUNCTION fn_KiemTraGioiHan
(
    @UserID      INT,
    @SoLuongMuonThem INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @SoDangMuon INT;
    DECLARE @MaxBorrow INT;
    
    SET @SoDangMuon = dbo.fn_SoLuongDangMuon(@UserID);
    
    SELECT @MaxBorrow = ConfigValue 
    FROM BorrowConfig 
    WHERE ConfigKey = 'MAX_BORROW_PER_USER';
    
    IF (@SoDangMuon + @SoLuongMuonThem) <= @MaxBorrow
        RETURN 1;   -- Có thể mượn
    
    RETURN 0;       -- Đã đạt giới hạn
END;
GO

-- ============================================================================
-- FUNCTION 3: fn_TinhSoNgayQuaHan
-- Loại: Scalar Function
-- Mô tả: Tính số ngày quá hạn của 1 bản ghi mượn
-- Trả về: Số ngày quá hạn (> 0 nếu quá hạn, 0 nếu chưa quá hạn hoặc đã trả)
-- ============================================================================
CREATE OR ALTER FUNCTION fn_TinhSoNgayQuaHan
(
    @RecordID INT
)
RETURNS INT
AS
BEGIN
    DECLARE @NgayTraDuKien DATE;
    DECLARE @NgayTraThucTe DATE;
    DECLARE @TrangThai NVARCHAR(20);
    DECLARE @SoNgay INT = 0;
    
    SELECT @NgayTraDuKien = NgayTraDuKien, 
           @NgayTraThucTe = NgayTraThucTe,
           @TrangThai = TrangThai
    FROM BorrowRecords WHERE RecordID = @RecordID;
    
    -- Nếu đã trả → tính quá hạn dựa trên ngày trả thực tế
    IF @NgayTraThucTe IS NOT NULL
    BEGIN
        SET @SoNgay = DATEDIFF(DAY, @NgayTraDuKien, @NgayTraThucTe);
        IF @SoNgay < 0 SET @SoNgay = 0;
    END
    -- Nếu chưa trả → tính dựa trên ngày hiện tại
    ELSE IF @TrangThai IN (N'borrowed', N'overdue')
    BEGIN
        SET @SoNgay = DATEDIFF(DAY, @NgayTraDuKien, GETDATE());
        IF @SoNgay < 0 SET @SoNgay = 0;
    END
    
    RETURN @SoNgay;
END;
GO

PRINT N'✅ Tạo 3 User Defined Functions thành công!';
GO

-- ============================================================================
-- VÍ DỤ SỬ DỤNG FUNCTIONS
-- ============================================================================

-- Kiểm tra số lượng đang mượn của sinh viên Mai (UserID = 2)
SELECT dbo.fn_SoLuongDangMuon(2) AS SoDangMuon;
GO

-- Kiểm tra Mai có thể mượn thêm 2 thiết bị không
SELECT 
    CASE dbo.fn_KiemTraGioiHan(2, 2)
        WHEN 1 THEN N'✅ Có thể mượn thêm'
        WHEN 0 THEN N'❌ Đã đạt giới hạn'
    END AS KetQua;
GO

-- Dùng function trong SELECT để hiển thị số ngày quá hạn
SELECT 
    br.RecordID,
    u.HoTen,
    d.TenThietBi,
    br.NgayTraDuKien,
    dbo.fn_TinhSoNgayQuaHan(br.RecordID) AS SoNgayQuaHan
FROM BorrowRecords br
INNER JOIN Users u   ON br.UserID = u.UserID
INNER JOIN Devices d ON br.DeviceID = d.DeviceID
WHERE br.TrangThai IN (N'borrowed', N'overdue');
GO
