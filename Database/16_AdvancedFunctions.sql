USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 16: FUNCTIONS M?I (N?NG CAO)
-- Inline TVF, Multi-statement TVF, Scalar n?ng cao
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- Function 1: fn_ThongKeTheoKhungGio (Inline Table-Valued Function)
-- =====================================================
CREATE OR ALTER FUNCTION fn_ThongKeTheoKhungGio
(
    @TuNgay  DATE,
    @DenNgay DATE
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        CASE 
            WHEN DATEPART(HOUR, br.NgayMuon) BETWEEN 6 AND 11 THEN N'S?ng (6-11h)'
            WHEN DATEPART(HOUR, br.NgayMuon) BETWEEN 12 AND 13 THEN N'Tr?a (12-13h)'
            WHEN DATEPART(HOUR, br.NgayMuon) BETWEEN 14 AND 17 THEN N'Chi?u (14-17h)'
            ELSE N'T?i (18-23h)'
        END AS KhungGio,
        COUNT(*) AS SoLuotMuon,
        COUNT(DISTINCT br.UserID) AS SoSinhVien,
        SUM(br.SoLuongMuon) AS TongSoLuong
    FROM BorrowRecords br
    WHERE br.NgayMuon BETWEEN @TuNgay AND @DenNgay
    GROUP BY 
        CASE 
            WHEN DATEPART(HOUR, br.NgayMuon) BETWEEN 6 AND 11 THEN N'S?ng (6-11h)'
            WHEN DATEPART(HOUR, br.NgayMuon) BETWEEN 12 AND 13 THEN N'Tr?a (12-13h)'
            WHEN DATEPART(HOUR, br.NgayMuon) BETWEEN 14 AND 17 THEN N'Chi?u (14-17h)'
            ELSE N'T?i (18-23h)'
        END
);
GO

-- S? d?ng:
-- SELECT * FROM fn_ThongKeTheoKhungGio('2025-01-01', '2025-12-31');

-- Function 2: fn_LichSuThietBi (Multi-Statement Table-Valued Function)
-- =====================================================
CREATE OR ALTER FUNCTION fn_LichSuThietBi
(
    @DeviceID INT
)
RETURNS @KetQua TABLE
(
    RecordID        INT,
    NgayMuon        DATE,
    NgayTraDuKien   DATE,
    NgayTraThucTe   DATE,
    TrangThai       NVARCHAR(20),
    TinhTrang       NVARCHAR(50),
    NguoiMuon       NVARCHAR(100),
    Email           VARCHAR(100),
    SoNgayMuon      INT,
    SoNgayQuaHan    INT
)
AS
BEGIN
    INSERT INTO @KetQua
    SELECT 
        br.RecordID,
        br.NgayMuon,
        br.NgayTraDuKien,
        br.NgayTraThucTe,
        br.TrangThai,
        CASE 
            WHEN br.NgayTraThucTe IS NOT NULL THEN N'? tr?'
            WHEN br.NgayTraDuKien < CAST(GETDATE() AS DATE) THEN N'Qu? h?n'
            ELSE N'?ang m??n'
        END AS TinhTrang,
        u.HoTen AS NguoiMuon,
        u.Email,
        DATEDIFF(DAY, br.NgayMuon, ISNULL(br.NgayTraThucTe, GETDATE())) AS SoNgayMuon,
        CASE 
            WHEN br.NgayTraThucTe IS NULL AND br.NgayTraDuKien < GETDATE()
            THEN DATEDIFF(DAY, br.NgayTraDuKien, GETDATE())
            WHEN br.NgayTraThucTe IS NOT NULL AND br.NgayTraThucTe > br.NgayTraDuKien
            THEN DATEDIFF(DAY, br.NgayTraDuKien, br.NgayTraThucTe)
            ELSE 0
        END AS SoNgayQuaHan
    FROM BorrowRecords br
    JOIN Users u ON br.UserID = u.UserID
    WHERE br.DeviceID = @DeviceID
    ORDER BY br.NgayMuon DESC;
    
    RETURN;
END;
GO

-- S? d?ng:
-- SELECT * FROM fn_LichSuThietBi(1);

-- Function 3: fn_TinhTienPhat (Scalar — n?ng cao, l?y ti?n)
-- =====================================================
CREATE OR ALTER FUNCTION fn_TinhTienPhat
(
    @RecordID INT
)
RETURNS DECIMAL(18,0)
AS
BEGIN
    DECLARE @TienPhat DECIMAL(18,0) = 0;
    DECLARE @NgayTraDuKien DATE, @NgayTraThucTe DATE;
    DECLARE @SoNgayQuaHan INT;
    DECLARE @TienPhatMoiNgay DECIMAL(18,0) = 5000;
    DECLARE @TienPhatToiDa DECIMAL(18,0) = 200000;
    
    SELECT @NgayTraDuKien = NgayTraDuKien, @NgayTraThucTe = NgayTraThucTe
    FROM BorrowRecords WHERE RecordID = @RecordID;
    
    IF @NgayTraThucTe IS NOT NULL AND @NgayTraThucTe > @NgayTraDuKien
        SET @SoNgayQuaHan = DATEDIFF(DAY, @NgayTraDuKien, @NgayTraThucTe);
    ELSE IF @NgayTraThucTe IS NULL AND @NgayTraDuKien < CAST(GETDATE() AS DATE)
        SET @SoNgayQuaHan = DATEDIFF(DAY, @NgayTraDuKien, GETDATE());
    ELSE
        SET @SoNgayQuaHan = 0;
    
    -- Ph?t l?y ti?n:
    -- Ng?y 1-3: 5000?/ng?y
    -- Ng?y 4-7: 10000?/ng?y
    -- Ng?y 8+:  15000?/ng?y (t?i ?a 200.000?)
    IF @SoNgayQuaHan > 0
    BEGIN
        DECLARE @Ngay1 INT = CASE WHEN @SoNgayQuaHan >= 3 THEN 3 ELSE @SoNgayQuaHan END;
        DECLARE @Ngay2 INT = CASE WHEN @SoNgayQuaHan > 3 THEN CASE WHEN @SoNgayQuaHan >= 7 THEN 4 ELSE @SoNgayQuaHan - 3 END ELSE 0 END;
        DECLARE @Ngay3 INT = CASE WHEN @SoNgayQuaHan > 7 THEN @SoNgayQuaHan - 7 ELSE 0 END;
        
        SET @TienPhat = @Ngay1 * 5000 + @Ngay2 * 10000 + @Ngay3 * 15000;
        
        IF @TienPhat > @TienPhatToiDa
            SET @TienPhat = @TienPhatToiDa;
    END
    
    RETURN @TienPhat;
END;
GO

-- Function 4: fn_DanhSachSinhVienQuaHan (Inline TVF)
-- =====================================================
CREATE OR ALTER FUNCTION fn_DanhSachSinhVienQuaHan
(
    @SoNgayQuaHan INT = 1
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        u.UserID,
        u.HoTen,
        u.Email,
        u.Phone,
        COUNT(br.RecordID) AS SoLuotQuaHan,
        SUM(dbo.fn_TinhTienPhat(br.RecordID)) AS TongTienPhat,
        MAX(DATEDIFF(DAY, br.NgayTraDuKien, GETDATE())) AS SoNgayQuaHanMax
    FROM BorrowRecords br
    JOIN Users u ON br.UserID = u.UserID
    WHERE br.TrangThai = N'overdue'
      AND DATEDIFF(DAY, br.NgayTraDuKien, GETDATE()) >= @SoNgayQuaHan
    GROUP BY u.UserID, u.HoTen, u.Email, u.Phone
    HAVING SUM(dbo.fn_TinhTienPhat(br.RecordID)) > 0
);
GO

-- S? d?ng:
-- SELECT * FROM fn_DanhSachSinhVienQuaHan(5);

-- =====================================================
-- K?T THC FILE 16
-- =====================================================
