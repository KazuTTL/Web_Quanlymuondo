USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 18: TEMPORAL TABLE (SYSTEM-VERSIONED)
-- Bi?n BorrowRecords th?nh System-Versioned Temporal Table
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- Ki?m tra xem ? b?t SYSTEM_VERSIONING ch?a
IF NOT EXISTS (
    SELECT 1 FROM sys.tables 
    WHERE object_id = OBJECT_ID('BorrowRecords') 
      AND temporal_type = 2  -- System-versioned temporal
)
BEGIN
    -- B??c 1: Th?m c?t th?i gian v?o BorrowRecords
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('BorrowRecords') AND name = 'SysStartTime')
    BEGIN
        ALTER TABLE BorrowRecords ADD
            SysStartTime DATETIME2 GENERATED ALWAYS AS ROW START HIDDEN NOT NULL DEFAULT SYSUTCDATETIME(),
            SysEndTime   DATETIME2 GENERATED ALWAYS AS ROW END   HIDDEN NOT NULL DEFAULT '9999-12-31 23:59:59.9999999',
            PERIOD FOR SYSTEM_TIME (SysStartTime, SysEndTime);
    END
    
    -- B??c 2: B?t System-Versioning
    ALTER TABLE BorrowRecords SET (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.BorrowRecords_History));
END
GO

-- Truy v?n l?ch s? (v? d? — kh?ng th?c thi t? ??ng)
-- =====================================================
-- Xem to?n b? l?ch s? thay ??i c?a 1 b?n ghi:
-- SELECT 
--     RecordID,
--     TrangThai,
--     NgayTraThucTe,
--     SysStartTime AS ThoiDiemBatDau,
--     SysEndTime AS ThoiDiemKetThuc
-- FROM BorrowRecords
-- FOR SYSTEM_TIME ALL
-- WHERE RecordID = 1
-- ORDER BY SysStartTime DESC;

-- Xem tr?ng th?i t?i 1 th?i ?i?m trong qu? kh?:
-- SELECT * FROM BorrowRecords
-- FOR SYSTEM_TIME AS OF '2025-04-25'
-- WHERE UserID = 2;

-- =====================================================
-- K?T THC FILE 18
-- =====================================================
