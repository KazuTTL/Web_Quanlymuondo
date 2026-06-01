USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 14: K? THU?T SQL N?NG CAO
-- CTE, Window Functions, PIVOT, Dynamic SQL, APPLY,
-- GROUP BY ROLLUP/CUBE, MERGE
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- 1. CTE (Common Table Expressions)
-- =====================================================

-- 1a. CTE ??n gi?n: Top 5 sinh vi?n m??n nhi?u nh?t th?ng hi?n t?i
WITH ThongKeSinhVien AS (
    SELECT 
        u.UserID,
        u.HoTen,
        COUNT(br.RecordID) AS SoLanMuon,
        SUM(br.SoLuongMuon) AS TongSoLuongMuon,
        ROW_NUMBER() OVER (ORDER BY COUNT(br.RecordID) DESC) AS Hang
    FROM Users u
    JOIN BorrowRecords br ON u.UserID = br.UserID
    WHERE MONTH(br.NgayMuon) = MONTH(GETDATE())
      AND YEAR(br.NgayMuon) = YEAR(GETDATE())
    GROUP BY u.UserID, u.HoTen
)
SELECT * FROM ThongKeSinhVien WHERE Hang <= 5;
GO

-- 1b. CTE ?? quy (Recursive CTE): Chu?i m??n tr? li?n ti?p c?a thi?t b?
WITH BorrowChain AS (
    SELECT 
        br.RecordID,
        br.DeviceID,
        br.NgayMuon,
        br.NgayTraThucTe,
        br.TrangThai,
        1 AS Level
    FROM BorrowRecords br
    WHERE br.DeviceID = 1
      AND br.NgayMuon = (SELECT MIN(NgayMuon) FROM BorrowRecords WHERE DeviceID = 1)
    
    UNION ALL
    
    SELECT 
        br.RecordID,
        br.DeviceID,
        br.NgayMuon,
        br.NgayTraThucTe,
        br.TrangThai,
        bc.Level + 1
    FROM BorrowRecords br
    JOIN BorrowChain bc ON br.DeviceID = bc.DeviceID
        AND br.NgayMuon > bc.NgayMuon
    WHERE NOT EXISTS (
        SELECT 1 FROM BorrowRecords br2 
        WHERE br2.DeviceID = br.DeviceID 
          AND br2.NgayMuon > bc.NgayMuon 
          AND br2.NgayMuon < br.NgayMuon
    )
)
SELECT * FROM BorrowChain;
GO

-- 2. Window Functions
-- =====================================================

-- 2a. ROW_NUMBER: ?nh s? th? t? cho t?ng y?u c?u c?a sinh vi?n
SELECT 
    u.HoTen,
    rq.RequestID,
    rq.NgayTao,
    rq.TrangThai,
    ROW_NUMBER() OVER (PARTITION BY rq.UserID ORDER BY rq.NgayTao DESC) AS SoThuTu
FROM BorrowRequests rq
JOIN Users u ON rq.UserID = u.UserID;
GO

-- 2b. RANK / DENSE_RANK: X?p h?ng thi?t b? m??n nhi?u nh?t theo th?ng
SELECT 
    d.TenThietBi,
    MONTH(br.NgayMuon) AS Thang,
    COUNT(*) AS SoLuotMuon,
    RANK() OVER (PARTITION BY MONTH(br.NgayMuon) ORDER BY COUNT(*) DESC) AS XepHang,
    DENSE_RANK() OVER (PARTITION BY MONTH(br.NgayMuon) ORDER BY COUNT(*) DESC) AS XepHangDense
FROM BorrowRecords br
JOIN Devices d ON br.DeviceID = d.DeviceID
GROUP BY d.TenThietBi, MONTH(br.NgayMuon);
GO

-- 2c. LAG / LEAD: So s?nh s? l??ng m??n th?ng n?y v?i th?ng tr??c
WITH ThongKeThang AS (
    SELECT 
        YEAR(NgayMuon) AS Nam,
        MONTH(NgayMuon) AS Thang,
        COUNT(*) AS SoLuotMuon
    FROM BorrowRecords
    GROUP BY YEAR(NgayMuon), MONTH(NgayMuon)
)
SELECT 
    Nam, Thang, SoLuotMuon,
    LAG(SoLuotMuon) OVER (ORDER BY Nam, Thang) AS ThangTruoc,
    SoLuotMuon - LAG(SoLuotMuon) OVER (ORDER BY Nam, Thang) AS ChenhLech,
    LEAD(SoLuotMuon) OVER (ORDER BY Nam, Thang) AS ThangSau,
    AVG(SoLuotMuon) OVER (ORDER BY Nam, Thang ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS TrungBinh3Thang
FROM ThongKeThang;
GO

-- 2d. FIRST_VALUE / LAST_VALUE: Thi?t b? ??u v? cu?i trong m?i th?ng
SELECT DISTINCT
    MONTH(NgayMuon) AS Thang,
    FIRST_VALUE(d.TenThietBi) OVER (
        PARTITION BY MONTH(NgayMuon) 
        ORDER BY COUNT(*) DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS ThietBiMuonNhieuNhat,
    LAST_VALUE(d.TenThietBi) OVER (
        PARTITION BY MONTH(NgayMuon) 
        ORDER BY COUNT(*) DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS ThietBiMuonItNhat
FROM BorrowRecords br
JOIN Devices d ON br.DeviceID = d.DeviceID
GROUP BY MONTH(NgayMuon), d.TenThietBi;
GO

-- 2e. NTILE: Chia sinh vi?n th?nh 4 nh?m theo s? l?n m??n
SELECT 
    u.HoTen,
    COUNT(br.RecordID) AS SoLanMuon,
    NTILE(4) OVER (ORDER BY COUNT(br.RecordID) DESC) AS Nhom
FROM Users u
LEFT JOIN BorrowRecords br ON u.UserID = br.UserID
GROUP BY u.UserID, u.HoTen;
GO

-- 2f. CUME_DIST / PERCENT_RANK: Ph?n v? th?ng k?
SELECT 
    d.TenThietBi,
    d.SoLuongKhaDung,
    CUME_DIST() OVER (ORDER BY d.SoLuongKhaDung) AS PhanViTichLuy,
    PERCENT_RANK() OVER (ORDER BY d.SoLuongKhaDung) AS PhanTramXepHang
FROM Devices d;
GO

-- 2g. SUM/AVG v?i OVER: Running total
SELECT 
    br.NgayMuon,
    br.SoLuongMuon,
    SUM(br.SoLuongMuon) OVER (ORDER BY br.NgayMuon ROWS UNBOUNDED PRECEDING) AS TongLuyKe
FROM BorrowRecords br
ORDER BY br.NgayMuon;
GO

-- 3. PIVOT / UNPIVOT
-- =====================================================

-- 3a. PIVOT: Th?ng k? s? l??ng m??n theo tr?ng th?i t?ng th?ng
SELECT * FROM (
    SELECT 
        MONTH(br.NgayMuon) AS Thang,
        br.TrangThai,
        COUNT(*) AS SoLuot
    FROM BorrowRecords br
    WHERE YEAR(br.NgayMuon) = YEAR(GETDATE())
    GROUP BY MONTH(br.NgayMuon), br.TrangThai
) AS Nguon
PIVOT (
    SUM(SoLuot)
    FOR TrangThai IN ([borrowed], [returned], [overdue])
) AS PivotTable
ORDER BY Thang;
GO

-- 3b. PIVOT: Th?ng k? s? thi?t b? theo danh m?c v? tr?ng th?i
SELECT * FROM (
    SELECT 
        dc.TenDanhMuc,
        d.TrangThai,
        d.SoLuongTong
    FROM Devices d
    JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
) AS Nguon
PIVOT (
    SUM(SoLuongTong)
    FOR TrangThai IN ([available], [maintenance], [lost])
) AS PivotTable;
GO

-- 3c. UNPIVOT: Chuy?n c?t th?nh h?ng
SELECT DanhMuc, TrangThai, SoLuong
FROM (
    SELECT 
        TenDanhMuc,
        SoLuongTong,
        SoLuongKhaDung
    FROM DeviceCategories dc
    JOIN Devices d ON dc.CategoryID = d.CategoryID
) AS Nguon
UNPIVOT (
    SoLuong FOR TrangThai IN (SoLuongTong, SoLuongKhaDung)
) AS UnpivotTable;
GO

-- 4. Dynamic SQL
-- =====================================================

-- 4a. SP th?ng k? linh ho?t — c? th? truy?n t?n b?ng, c?t, ?i?u ki?n
CREATE OR ALTER PROCEDURE sp_ThongKeLinhHoat
    @TenBang        NVARCHAR(100),
    @CotHienThi     NVARCHAR(500) = N'*',
    @DieuKien       NVARCHAR(500) = NULL,
    @CotSapXep      NVARCHAR(100) = NULL,
    @Top            INT = NULL,
    @ThuTu          NVARCHAR(4) = N'DESC'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Sql NVARCHAR(MAX);
    
    SET @Sql = N'SELECT ';
    
    IF @Top IS NOT NULL
        SET @Sql = @Sql + N'TOP ' + CAST(@Top AS NVARCHAR) + N' ';
    
    SET @Sql = @Sql + @CotHienThi + N' FROM ' + @TenBang;
    
    IF @DieuKien IS NOT NULL
        SET @Sql = @Sql + N' WHERE ' + @DieuKien;
    
    IF @CotSapXep IS NOT NULL
        SET @Sql = @Sql + N' ORDER BY ' + @CotSapXep + N' ' + @ThuTu;
    
    BEGIN TRY
        PRINT N' SQL: ' + @Sql;
        EXEC sp_executesql @Sql;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(N'L?i Dynamic SQL: %s', 16, 1, @ErrorMessage);
    END CATCH
END;
GO

-- V? d? s? d?ng:
-- EXEC sp_ThongKeLinhHoat N'vw_ThietBiKhaDung', N'TenThietBi, SoLuongKhaDung', N'SoLuongKhaDung > 0', N'SoLuongKhaDung', 5;
-- EXEC sp_ThongKeLinhHoat N'vw_YeuCauMuonChiTiet', N'*', N'TrangThai = N''pending''', N'NgayGuiYeuCau', 10;

-- 4b. SP xu?t d? li?u ??ng ra JSON
CREATE OR ALTER PROCEDURE sp_XuatJson
    @TenBang    NVARCHAR(100),
    @DieuKien   NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Sql NVARCHAR(MAX);
    SET @Sql = N'SELECT * FROM ' + @TenBang;
    
    IF @DieuKien IS NOT NULL
        SET @Sql = @Sql + N' WHERE ' + @DieuKien;
    
    SET @Sql = @Sql + N' FOR JSON PATH, ROOT(N''data'')';
    
    EXEC sp_executesql @Sql;
END;
GO

-- 5. CROSS APPLY / OUTER APPLY
-- =====================================================

-- 5a. CROSS APPLY: L?y thi?t b? v? l?ch s? m??n g?n nh?t
SELECT 
    d.TenThietBi,
    d.SerialNumber,
    lichsu.*
FROM Devices d
CROSS APPLY (
    SELECT TOP 3
        br.NgayMuon,
        br.NgayTraDuKien,
        br.TrangThai,
        u.HoTen AS NguoiMuon
    FROM BorrowRecords br
    JOIN Users u ON br.UserID = u.UserID
    WHERE br.DeviceID = d.DeviceID
    ORDER BY br.NgayMuon DESC
) AS lichsu
WHERE d.TrangThai = N'available';
GO

-- 5b. OUTER APPLY: Thi?t b? v? th?ng tin b?o tr? (n?u c?)
SELECT 
    d.TenThietBi,
    d.SoLuongKhaDung,
    baotri.NgayBatDau,
    baotri.MoTa AS MoTaBaoTri
FROM Devices d
OUTER APPLY (
    SELECT TOP 1 *
    FROM MaintenanceRecords mr
    WHERE mr.DeviceID = d.DeviceID AND mr.TrangThai = N'dang_thuc_hien'
    ORDER BY mr.NgayBatDau DESC
) AS baotri;
GO

-- 6. GROUP BY ROLLUP / CUBE / GROUPING SETS
-- =====================================================

-- 6a. ROLLUP: B?o c?o t?ng h?p theo danh m?c v? tr?ng th?i (c? t?ng con)
SELECT 
    ISNULL(dc.TenDanhMuc, N'T?ng c?ng') AS DanhMuc,
    ISNULL(d.TrangThai, N'T?ng') AS TrangThai,
    SUM(d.SoLuongTong) AS TongSoLuong
FROM Devices d
JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
GROUP BY ROLLUP (dc.TenDanhMuc, d.TrangThai);
GO

-- 6b. CUBE: B?o c?o ?a chi?u
SELECT 
    ISNULL(dc.TenDanhMuc, N'T?ng') AS DanhMuc,
    ISNULL(d.TrangThai, N'T?ng') AS TrangThai,
    SUM(d.SoLuongTong) AS TongSoLuong,
    GROUPING(dc.TenDanhMuc) AS IsGroupedDM,
    GROUPING(d.TrangThai) AS IsGroupedTT
FROM Devices d
JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
GROUP BY CUBE (dc.TenDanhMuc, d.TrangThai)
ORDER BY GROUPING(dc.TenDanhMuc), GROUPING(d.TrangThai);
GO

-- 6c. GROUPING SETS: T?y ch?nh nh?m
SELECT 
    YEAR(br.NgayMuon) AS Nam,
    MONTH(br.NgayMuon) AS Thang,
    d.DeviceID,
    COUNT(*) AS SoLuotMuon
FROM BorrowRecords br
JOIN Devices d ON br.DeviceID = d.DeviceID
GROUP BY GROUPING SETS (
    (YEAR(br.NgayMuon), MONTH(br.NgayMuon)),
    (d.DeviceID),
    ()
);
GO

-- 7. MERGE (Upsert)
-- =====================================================
CREATE OR ALTER PROCEDURE sp_DongBoThietBi
    @DeviceID       INT = NULL,
    @TenThietBi     NVARCHAR(200),
    @SerialNumber   VARCHAR(100),
    @CategoryID     INT,
    @SoLuongTong    INT,
    @ViTri          NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    
    MERGE INTO Devices AS target
    USING (SELECT @DeviceID AS DeviceID, @TenThietBi AS TenThietBi, 
                  @SerialNumber AS SerialNumber, @CategoryID AS CategoryID,
                  @SoLuongTong AS SoLuongTong, @ViTri AS ViTri) AS source
    ON target.DeviceID = source.DeviceID
    
    WHEN MATCHED THEN
        UPDATE SET 
            TenThietBi = source.TenThietBi,
            SerialNumber = source.SerialNumber,
            CategoryID = source.CategoryID,
            SoLuongTong = source.SoLuongTong,
            ViTri = source.ViTri,
            NgayCapNhat = GETDATE()
    
    WHEN NOT MATCHED THEN
        INSERT (TenThietBi, SerialNumber, CategoryID, SoLuongTong, 
                SoLuongKhaDung, TrangThai, ViTri)
        VALUES (source.TenThietBi, source.SerialNumber, source.CategoryID,
                source.SoLuongTong, source.SoLuongTong, N'available', source.ViTri);
    
    OUTPUT inserted.DeviceID, $action AS HanhDong;
END;
GO

-- =====================================================
-- K?T THC FILE 14
-- =====================================================
