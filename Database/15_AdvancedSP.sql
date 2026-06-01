USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 15: STORED PROCEDURES M?I (N?NG CAO)
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- SP 1: sp_ThongKeTongHop — B?o c?o t?ng h?p ?a chi?u
-- =====================================================
CREATE OR ALTER PROCEDURE sp_ThongKeTongHop
    @TuNgay  DATE = NULL,
    @DenNgay DATE = NULL,
    @LoaiBaoCao NVARCHAR(20) = N'thang'
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @TuNgay = ISNULL(@TuNgay, DATEADD(MONTH, -12, GETDATE()));
    SET @DenNgay = ISNULL(@DenNgay, GETDATE());
    
    -- 1. T?ng quan KPI
    SELECT
        (SELECT COUNT(*) FROM Devices) AS TongThietBi,
        (SELECT SUM(SoLuongKhaDung) FROM Devices) AS TongKhaDung,
        (SELECT COUNT(*) FROM BorrowRequests WHERE TrangThai = N'pending') AS ChoDuyet,
        (SELECT COUNT(*) FROM BorrowRecords WHERE TrangThai = N'borrowed') AS DangMuon,
        (SELECT COUNT(*) FROM BorrowRecords WHERE NgayTraThucTe IS NULL 
            AND NgayTraDuKien < CAST(GETDATE() AS DATE)) AS QuaHan,
        (SELECT ISNULL(SUM(SoTien), 0) FROM Fines WHERE TrangThai = N'chua_thanh_toan') AS TongTienPhat;
    
    -- 2. Th?ng k? theo lo?i b?o c?o
    IF @LoaiBaoCao = N'thang'
    BEGIN
        SELECT 
            YEAR(br.NgayMuon) AS Nam,
            MONTH(br.NgayMuon) AS Thang,
            COUNT(DISTINCT br.RecordID) AS TongLuotMuon,
            COUNT(DISTINCT br.UserID) AS TongSinhVien,
            SUM(br.SoLuongMuon) AS TongSoLuong,
            AVG(DATEDIFF(DAY, br.NgayMuon, ISNULL(br.NgayTraThucTe, GETDATE()))) AS SoNgayMuonTrungBinh
        FROM BorrowRecords br
        WHERE br.NgayMuon BETWEEN @TuNgay AND @DenNgay
        GROUP BY YEAR(br.NgayMuon), MONTH(br.NgayMuon)
        ORDER BY Nam, Thang;
    END
    ELSE IF @LoaiBaoCao = N'danh_muc'
    BEGIN
        SELECT 
            dc.TenDanhMuc,
            COUNT(DISTINCT br.RecordID) AS SoLuotMuon,
            COUNT(DISTINCT br.UserID) AS SoSinhVien,
            SUM(br.SoLuongMuon) AS TongSoLuong
        FROM BorrowRecords br
        JOIN Devices d ON br.DeviceID = d.DeviceID
        JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
        WHERE br.NgayMuon BETWEEN @TuNgay AND @DenNgay
        GROUP BY dc.TenDanhMuc
        ORDER BY SoLuotMuon DESC;
    END
    
    -- 3. Top 10 thi?t b? m??n nhi?u
    SELECT TOP 10
        d.TenThietBi,
        dc.TenDanhMuc,
        COUNT(br.RecordID) AS SoLanMuon,
        SUM(br.SoLuongMuon) AS TongSoLuong,
        DENSE_RANK() OVER (ORDER BY COUNT(br.RecordID) DESC) AS XepHang
    FROM BorrowRecords br
    JOIN Devices d ON br.DeviceID = d.DeviceID
    JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
    WHERE br.NgayMuon BETWEEN @TuNgay AND @DenNgay
    GROUP BY d.TenThietBi, dc.TenDanhMuc
    ORDER BY SoLanMuon DESC;
END;
GO

-- SP 2: sp_PhanTrangDanhSach — Ph?n trang ??ng
-- =====================================================
CREATE OR ALTER PROCEDURE sp_PhanTrangDanhSach
    @TenBang    NVARCHAR(100),
    @Cot        NVARCHAR(500) = N'*',
    @DieuKien   NVARCHAR(500) = NULL,
    @SapXep     NVARCHAR(100) = N'NgayTao',
    @ThuTu      NVARCHAR(4) = N'DESC',
    @Trang      INT = 1,
    @SoDong     INT = 10,
    @TongSo     INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Sql NVARCHAR(MAX);
    DECLARE @Offset INT = (@Trang - 1) * @SoDong;
    
    -- ??m t?ng s? d?ng
    SET @Sql = N'SELECT @TongSo = COUNT(*) FROM ' + @TenBang;
    IF @DieuKien IS NOT NULL
        SET @Sql = @Sql + N' WHERE ' + @DieuKien;
    
    EXEC sp_executesql @Sql, N'@TongSo INT OUTPUT', @TongSo OUTPUT;
    
    -- L?y d? li?u trang hi?n t?i
    SET @Sql = N'SELECT ' + @Cot + N' FROM ' + @TenBang;
    IF @DieuKien IS NOT NULL
        SET @Sql = @Sql + N' WHERE ' + @DieuKien;
    
    SET @Sql = @Sql + N' ORDER BY ' + @SapXep + N' ' + @ThuTu;
    SET @Sql = @Sql + N' OFFSET ' + CAST(@Offset AS NVARCHAR) + N' ROWS';
    SET @Sql = @Sql + N' FETCH NEXT ' + CAST(@SoDong AS NVARCHAR) + N' ROWS ONLY';
    
    EXEC sp_executesql @Sql;
END;
GO

-- V? d?:
-- DECLARE @Total INT;
-- EXEC sp_PhanTrangDanhSach N'vw_YeuCauMuonChiTiet', N'*', N'TrangThai = N''pending''', N'NgayGuiYeuCau', N'DESC', 1, 20, @Total OUTPUT;
-- PRINT N'T?ng s?: ' + CAST(@Total AS VARCHAR);

-- SP 3: sp_BaoCaoTheoQuy — B?o c?o qu? v?i ROLLUP
-- =====================================================
CREATE OR ALTER PROCEDURE sp_BaoCaoTheoQuy
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @Nam = ISNULL(@Nam, YEAR(GETDATE()));
    
    -- B?o c?o theo qu? v?i ROLLUP
    SELECT 
        CASE 
            WHEN GROUPING(Quy) = 1 THEN N'T?NG C? N?M'
            ELSE N'Qu? ' + CAST(Quy AS NVARCHAR)
        END AS QuyBaoCao,
        ISNULL(CAST(Quy AS NVARCHAR), N'') AS Quy,
        COUNT(DISTINCT br.RecordID) AS TongLuotMuon,
        COUNT(DISTINCT br.UserID) AS TongSinhVien,
        SUM(br.SoLuongMuon) AS TongThietBiDaMuon,
        AVG(DATEDIFF(DAY, br.NgayMuon, ISNULL(br.NgayTraThucTe, GETDATE()))) AS NgayMuonTrungBinh,
        SUM(CASE WHEN br.TrangThai = N'overdue' THEN 1 ELSE 0 END) AS SoLuotQuaHan,
        SUM(CASE WHEN br.NgayTraThucTe IS NOT NULL THEN 1 ELSE 0 END) AS SoLuotDaTra
    FROM BorrowRecords br
    CROSS APPLY (SELECT CEILING(CAST(MONTH(br.NgayMuon) AS FLOAT) / 3) AS Quy) AS q
    WHERE YEAR(br.NgayMuon) = @Nam
    GROUP BY ROLLUP (q.Quy)
    ORDER BY GROUPING(q.Quy), q.Quy;
    
    -- So s?nh v?i qu? tr??c (d?ng LAG)
    WITH QuyData AS (
        SELECT 
            CEILING(CAST(MONTH(NgayMuon) AS FLOAT) / 3) AS Quy,
            YEAR(NgayMuon) AS Nam,
            COUNT(*) AS SoLuot
        FROM BorrowRecords
        WHERE YEAR(NgayMuon) IN (@Nam, @Nam - 1)
        GROUP BY YEAR(NgayMuon), CEILING(CAST(MONTH(NgayMuon) AS FLOAT) / 3)
    )
    SELECT 
        q1.Quy,
        q1.Nam,
        q1.SoLuot,
        q2.SoLuot AS NamTruoc,
        (q1.SoLuot - ISNULL(q2.SoLuot, 0)) AS ChenhLech,
        CASE WHEN q2.SoLuot > 0 
            THEN CAST((q1.SoLuot - q2.SoLuot) * 100.0 / q2.SoLuot AS DECIMAL(10,2))
            ELSE NULL 
        END AS PhanTramThayDoi
    FROM QuyData q1
    LEFT JOIN QuyData q2 ON q1.Quy = q2.Quy AND q2.Nam = @Nam - 1
    WHERE q1.Nam = @Nam
    ORDER BY q1.Quy;
END;
GO

-- SP 4: sp_ExportBaoCao — Xu?t b?o c?o JSON/XML
-- =====================================================
CREATE OR ALTER PROCEDURE sp_ExportBaoCao
    @DinhDang   NVARCHAR(10) = N'JSON',
    @TuNgay     DATE = NULL,
    @DenNgay    DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @TuNgay = ISNULL(@TuNgay, DATEADD(MONTH, -1, GETDATE()));
    SET @DenNgay = ISNULL(@DenNgay, GETDATE());
    
    IF @DinhDang = N'JSON'
    BEGIN
        SELECT 
            N'B?o c?o th?ng k? m??n thi?t b?' AS TenBaoCao,
            @TuNgay AS TuNgay,
            @DenNgay AS DenNgay,
            GETDATE() AS NgayXuat,
            (
                SELECT * FROM (
                    SELECT 
                        d.TenThietBi,
                        dc.TenDanhMuc,
                        COUNT(br.RecordID) AS SoLanMuon,
                        SUM(br.SoLuongMuon) AS TongSoLuong
                    FROM BorrowRecords br
                    JOIN Devices d ON br.DeviceID = d.DeviceID
                    JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
                    WHERE br.NgayMuon BETWEEN @TuNgay AND @DenNgay
                    GROUP BY d.TenThietBi, dc.TenDanhMuc
                ) AS data
                FOR JSON PATH
            ) AS ChiTiet
        FOR JSON PATH, ROOT(N'BaoCao');
    END
    ELSE IF @DinhDang = N'XML'
    BEGIN
        SELECT 
            d.TenThietBi AS '@Ten',
            dc.TenDanhMuc AS '@DanhMuc',
            COUNT(br.RecordID) AS 'SoLanMuon',
            SUM(br.SoLuongMuon) AS 'TongSoLuong'
        FROM BorrowRecords br
        JOIN Devices d ON br.DeviceID = d.DeviceID
        JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
        WHERE br.NgayMuon BETWEEN @TuNgay AND @DenNgay
        GROUP BY d.TenThietBi, dc.TenDanhMuc
        ORDER BY COUNT(br.RecordID) DESC
        FOR XML PATH('ThietBi'), ROOT('BaoCao');
    END
END;
GO

-- SP 5: sp_XuLyQuaHanVaPhat — X? l? qu? h?n v? t?o ph?t (Cursor)
-- =====================================================
CREATE OR ALTER PROCEDURE sp_XuLyQuaHanVaPhat
    @TienPhatMoiNgay DECIMAL(18,0) = 5000
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RecordID INT, @UserID INT, @DeviceName NVARCHAR(200);
    DECLARE @NgayTraDuKien DATE, @SoNgayQuaHan INT, @TienPhat DECIMAL(18,0);
    
    DECLARE cur_QuaHan CURSOR FOR
    SELECT 
        br.RecordID,
        br.UserID,
        d.TenThietBi,
        br.NgayTraDuKien,
        DATEDIFF(DAY, br.NgayTraDuKien, GETDATE()) AS SoNgayQuaHan
    FROM BorrowRecords br
    JOIN Devices d ON br.DeviceID = d.DeviceID
    WHERE br.TrangThai = N'borrowed'
      AND br.NgayTraDuKien < CAST(GETDATE() AS DATE)
      AND br.NgayTraThucTe IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM Fines f 
          WHERE f.RecordID = br.RecordID AND f.TrangThai = N'chua_thanh_toan'
      );
    
    OPEN cur_QuaHan;
    
    FETCH NEXT FROM cur_QuaHan INTO @RecordID, @UserID, @DeviceName, @NgayTraDuKien, @SoNgayQuaHan;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        UPDATE BorrowRecords 
        SET TrangThai = N'overdue', NgayCapNhat = GETDATE()
        WHERE RecordID = @RecordID;
        
        SET @TienPhat = @SoNgayQuaHan * @TienPhatMoiNgay;
        
        INSERT INTO Fines (UserID, RecordID, SoTien, LyDo, HanThanhToan)
        VALUES (@UserID, @RecordID, @TienPhat,
                FORMATMESSAGE(N'Qu? h?n tr? "%s" %d ng?y', @DeviceName, @SoNgayQuaHan),
                DATEADD(DAY, 30, GETDATE()));
        
        INSERT INTO Notifications (UserID, TieuDe, NoiDung, LoaiThongBao)
        VALUES (@UserID, N'C?nh b?o qu? h?n',
                FORMATMESSAGE(N'B?n ? qu? h?n tr? "%s" %d ng?y. S? ti?n ph?t: %s VN?. Vui l?ng thanh to?n tr??c %s.',
                    @DeviceName, @SoNgayQuaHan, FORMAT(@TienPhat, 'N0'),
                    FORMAT(DATEADD(DAY, 30, GETDATE()), 'dd/MM/yyyy')),
                N'qua_han');
        
        FETCH NEXT FROM cur_QuaHan INTO @RecordID, @UserID, @DeviceName, @NgayTraDuKien, @SoNgayQuaHan;
    END;
    
    CLOSE cur_QuaHan;
    DEALLOCATE cur_QuaHan;
    
    SELECT N'? x? l? qu? h?n v? t?o ph?t th?nh c?ng.' AS Message;
END;
GO

-- SP 6: sp_TaoYeuCauMuon_V2 — Phi?n b?n n?ng cao (TRY...CATCH + THROW)
-- =====================================================
CREATE OR ALTER PROCEDURE sp_TaoYeuCauMuon_V2
    @UserID         INT,
    @DeviceID       INT,
    @SoLuongMuon    INT,
    @NgayMuon       DATE,
    @NgayTraDuKien  DATE,
    @MucDich        NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        IF @SoLuongMuon <= 0
            THROW 50001, N'S? l??ng m??n ph?i l?n h?n 0.', 1;
        
        IF @NgayTraDuKien < @NgayMuon
            THROW 50002, N'Ng?y tr? ph?i sau ho?c b?ng ng?y m??n.', 1;
        
        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID AND TrangThai = N'ACTIVE' AND IsDeleted = 0)
            THROW 50003, N'T?i kho?n kh?ng t?n t?i ho?c ? b? kh?a.', 1;
        
        DECLARE @SoLuongKhaDung INT;
        SELECT @SoLuongKhaDung = SoLuongKhaDung
        FROM Devices WHERE DeviceID = @DeviceID;
        
        IF @SoLuongKhaDung IS NULL
            THROW 50004, N'Thi?t b? kh?ng t?n t?i.', 1;
        
        IF @SoLuongMuon > @SoLuongKhaDung
            THROW 50005, FORMATMESSAGE(N'Kh?ng ?? thi?t b?. C?n %d kh? d?ng.', @SoLuongKhaDung), 1;
        
        INSERT INTO BorrowRequests (UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, MucDich, TrangThai)
        VALUES (@UserID, @DeviceID, @SoLuongMuon, @NgayMuon, @NgayTraDuKien, @MucDich, N'pending');
        
        DECLARE @NewID INT = SCOPE_IDENTITY();
        
        INSERT INTO Notifications (UserID, TieuDe, NoiDung, LoaiThongBao)
        VALUES (@UserID, N'Y?u c?u m??n ? g?i', 
                FORMATMESSAGE(N'Y?u c?u m??n #%d ? g?i th?nh c?ng.', @NewID),
                N'he_thong');
        
        COMMIT;
        
        SELECT @NewID AS RequestID, N'T?o y?u c?u th?nh c?ng' AS Message;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        
        DECLARE @ErrorMsg NVARCHAR(4000) = FORMATMESSAGE(
            N'L?i %d: %s', ERROR_NUMBER(), ERROR_MESSAGE()
        );
        
        THROW;
    END CATCH
END;
GO

-- SP 7: sp_TimKiemThietBi — T?m ki?m n?ng cao (Full-Text Search)
-- =====================================================
CREATE OR ALTER PROCEDURE sp_TimKiemThietBi
    @TuKhoa     NVARCHAR(200),
    @DanhMuc    NVARCHAR(100) = NULL,
    @TrangThai  NVARCHAR(20) = NULL,
    @Top        INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Top)
        d.DeviceID,
        d.TenThietBi,
        d.SerialNumber,
        dc.TenDanhMuc,
        d.SoLuongKhaDung,
        d.TrangThai,
        d.ViTri,
        ft.RANK AS DoPhuHop
    FROM Devices d
    JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
    INNER JOIN FREETEXTTABLE(Devices, (TenThietBi, MoTa), @TuKhoa) ft
        ON d.DeviceID = ft.[KEY]
    WHERE (@DanhMuc IS NULL OR dc.TenDanhMuc = @DanhMuc)
      AND (@TrangThai IS NULL OR d.TrangThai = @TrangThai)
    ORDER BY ft.RANK DESC;
END;
GO

-- =====================================================
-- K?T THC FILE 15
-- =====================================================
