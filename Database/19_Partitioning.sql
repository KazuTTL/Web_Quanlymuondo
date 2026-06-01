USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 19: PARTITIONING (PH?N V?NG D? LI?U)
-- Ph?n v?ng BorrowRecords theo th?ng
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- NOTE: C?c b??c d??i ?y y?u c?u quy?n sysadmin.
-- Ch?y t?ng b??c m?t v? ki?m tra k?t qu?.

-- B??c 1: T?o c?c filegroup (ch?y n?u c? quy?n)
-- =====================================================
-- ALTER DATABASE QuanLyMuonThietBi ADD FILEGROUP FG_2024;
-- ALTER DATABASE QuanLyMuonThietBi ADD FILEGROUP FG_2025_Q1;
-- ALTER DATABASE QuanLyMuonThietBi ADD FILEGROUP FG_2025_Q2;
-- ALTER DATABASE QuanLyMuonThietBi ADD FILEGROUP FG_2025_Q3;
-- ALTER DATABASE QuanLyMuonThietBi ADD FILEGROUP FG_2025_Q4;
-- ALTER DATABASE QuanLyMuonThietBi ADD FILEGROUP FG_2026;
-- GO

-- B??c 2: Th?m file d? li?u v?o filegroup (t?y ch?nh ???ng d?n)
-- =====================================================
-- ALTER DATABASE QuanLyMuonThietBi ADD FILE (
--     NAME = N'Data_2025_Q1',
--     FILENAME = N'C:\SQLData\QLMTB_2025_Q1.ndf',
--     SIZE = 100MB, MAXSIZE = 1GB, FILEGROWTH = 50MB
-- ) TO FILEGROUP FG_2025_Q1;
-- GO
-- ... (t??ng t? cho c?c filegroup kh?c)

-- B??c 3: H?m ph?n v?ng theo ng?y
-- =====================================================
CREATE PARTITION FUNCTION pf_NgayMuon (DATE)
AS RANGE RIGHT
FOR VALUES (
    '2024-12-31',
    '2025-03-31',
    '2025-06-30',
    '2025-09-30',
    '2025-12-31'
);
GO

-- B??c 4: Scheme ph?n v?ng
-- =====================================================
CREATE PARTITION SCHEME ps_NgayMuon
AS PARTITION pf_NgayMuon
TO (
    [PRIMARY],     -- Partition 1: < 2025
    [PRIMARY],     -- Partition 2: Q1/2025
    [PRIMARY],     -- Partition 3: Q2/2025
    [PRIMARY],     -- Partition 4: Q3/2025
    [PRIMARY],     -- Partition 5: Q4/2025
    [PRIMARY]      -- Partition 6: >= 2026
);
GO

-- B??c 5: T?o l?i clustered index tr?n scheme ph?n v?ng
-- =====================================================
-- NOTE: C?n DROP clustered index hi?n t?i tr??c (n?u c?)
-- CREATE CLUSTERED INDEX IX_BorrowRecords_NgayMuon
-- ON BorrowRecords(NgayMuon)
-- ON ps_NgayMuon(NgayMuon);
-- GO

-- B??c 6: Ki?m tra d? li?u n?m ? partition n?o
-- =====================================================
SELECT 
    $partition.pf_NgayMuon(NgayMuon) AS PartitionNumber,
    COUNT(*) AS SoDong
FROM BorrowRecords
GROUP BY $partition.pf_NgayMuon(NgayMuon)
ORDER BY PartitionNumber;
GO

-- B??c 7: Switch partition (v? d? — di chuy?n d? li?u c? sang b?ng archive)
-- =====================================================
-- ALTER TABLE BorrowRecords SWITCH PARTITION 1 TO BorrowRecords_Archive;
-- GO

-- =====================================================
-- K?T THC FILE 19
-- =====================================================
