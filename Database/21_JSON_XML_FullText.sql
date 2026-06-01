USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 21: JSON / XML PROCESSING + FULL-TEXT SEARCH
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- PH?N 1: JSON HANDLING
-- =====================================================

-- 1a. Th?m c?t Metadata d?ng JSON v?o BorrowRequests
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('BorrowRequests') AND name = 'Metadata')
BEGIN
    ALTER TABLE BorrowRequests ADD Metadata NVARCHAR(MAX) NULL;
END
GO

-- R?ng bu?c ph?i l? JSON h?p l?
ALTER TABLE BorrowRequests ADD CONSTRAINT CK_MetadataJson 
    CHECK (Metadata IS NULL OR ISJSON(Metadata) = 1);
GO

-- V? d? l?u metadata JSON:
UPDATE BorrowRequests SET Metadata = N'{
    "phuongThucLienHe": "email",
    "coVanHocTap": "Nguy?n V?n A",
    "ghiChuNhanh": "C?n g?p cho cu?i tu?n"
}' WHERE RequestID = 1;
GO

-- 1b. Truy v?n JSON
SELECT 
    RequestID,
    JSON_VALUE(Metadata, '$.phuongThucLienHe') AS PhuongThucLienHe,
    JSON_VALUE(Metadata, '$.coVanHocTap') AS CoVanHocTap
FROM BorrowRequests
WHERE ISJSON(Metadata) = 1;
GO

-- 1c. M? JSON th?nh rows (OPENJSON)
SELECT 
    RequestID,
    [key] AS ThongTin,
    value AS GiaTri
FROM BorrowRequests
CROSS APPLY OPENJSON(Metadata)
WHERE RequestID = 1;
GO

-- 1d. Modify JSON
UPDATE BorrowRequests 
SET Metadata = JSON_MODIFY(Metadata, '$.trangThaiDuyet', 'da_duyet_nhanh')
WHERE RequestID = 1;
GO

-- 1e. FOR JSON PATH: T?y ch?nh c?u tr?c JSON
SELECT 
    u.HoTen AS [SinhVien.HoTen],
    u.Email AS [SinhVien.Email],
    d.TenThietBi AS [ThietBi.Ten],
    br.SoLuongMuon AS [SoLuong],
    br.NgayMuon AS [NgayMuon],
    br.TrangThai AS [TrangThai]
FROM BorrowRecords br
JOIN Users u ON br.UserID = u.UserID
JOIN Devices d ON br.DeviceID = d.DeviceID
WHERE br.UserID = 2
FOR JSON PATH, ROOT(N'LichSuMuon');
GO

-- 1f. FOR JSON AUTO: T? ??ng nesting d?a tr?n JOIN
SELECT * FROM BorrowRecords br
JOIN Devices d ON br.DeviceID = d.DeviceID
WHERE br.UserID = 2
FOR JSON AUTO, ROOT(N'Data');
GO

-- PH?N 2: XML HANDLING
-- =====================================================

-- FOR XML PATH: T?o c?u tr?c XML t?y ch?nh
SELECT 
    u.HoTen AS [Ngu?iD?ng/T?n],
    u.Email AS [Ngu?iD?ng/Email],
    (
        SELECT 
            d.TenThietBi AS [T?n],
            br.SoLuongMuon AS [S?L??ng],
            br.TrangThai AS [Tr?ngTh?i]
        FROM BorrowRecords br
        JOIN Devices d ON br.DeviceID = d.DeviceID
        WHERE br.UserID = u.UserID
        FOR XML PATH('Thi?tB?'), TYPE
    ) AS [DanhS?chM??n]
FROM Users u
WHERE u.RoleID = 2
FOR XML PATH('SinhVi?n'), ROOT('DanhS?ch');
GO

-- PH?N 3: FULL-TEXT SEARCH
-- =====================================================

-- 3a. Ki?m tra Full-Text Search ? c?i ??t ch?a
SELECT SERVERPROPERTY('IsFullTextInstalled') AS FullTextInstalled;
GO

-- 3b. T?o Full-Text Catalog (n?u ch?a c?)
IF NOT EXISTS (SELECT 1 FROM sys.fulltext_catalogs WHERE name = 'FT_QLMTB')
BEGIN
    CREATE FULLTEXT CATALOG FT_QLMTB AS DEFAULT;
END
GO

-- 3c. T?o Full-Text Index tr?n b?ng Devices
IF NOT EXISTS (SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Devices'))
BEGIN
    CREATE FULLTEXT INDEX ON Devices(
        TenThietBi LANGUAGE 0x0000,
        MoTa LANGUAGE 0x0000
    )
    KEY INDEX PK_Devices
    ON FT_QLMTB
    WITH (CHANGE_TRACKING AUTO);
END
GO

-- 3d. T?o Full-Text Index tr?n b?ng Users
IF NOT EXISTS (SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('Users'))
BEGIN
    CREATE FULLTEXT INDEX ON Users(
        HoTen LANGUAGE 0x042A,
        Email LANGUAGE 0x0000
    )
    KEY INDEX PK_Users
    ON FT_QLMTB
    WITH (CHANGE_TRACKING AUTO);
END
GO

-- 3e. CONTAINS: T?m ki?m ch?nh x?c
SELECT * FROM Devices 
WHERE CONTAINS(TenThietBi, '"Laptop" AND "Dell"');
GO

-- 3f. FREETEXT: T?m ki?m g?n ?ng
SELECT * FROM Devices
WHERE FREETEXT(TenThietBi, N'm?y t?nh x?ch tay dell');
GO

-- 3g. CONTAINSTABLE: T?m ki?m c? ranking
SELECT 
    d.*,
    ct.RANK AS DoPhuHop
FROM Devices d
INNER JOIN CONTAINSTABLE(Devices, (TenThietBi, MoTa), N'"laptop" OR "m?y chi?u"') ct
    ON d.DeviceID = ct.[KEY]
ORDER BY ct.RANK DESC;
GO

-- 3h. FREETEXTTABLE: T?m ki?m ng? ngh?a
SELECT 
    d.TenThietBi,
    ft.RANK AS DoPhuHop
FROM Devices d
INNER JOIN FREETEXTTABLE(Devices, (TenThietBi, MoTa), N'dell laptop i7') ft
    ON d.DeviceID = ft.[KEY]
ORDER BY ft.RANK DESC;
GO

-- =====================================================
-- K?T THC FILE 21
-- =====================================================
