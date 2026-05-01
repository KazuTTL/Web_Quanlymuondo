/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 10_BackupRestore.sql
 MÔ TẢ: Sao lưu (Backup) và Khôi phục (Restore) dữ liệu
 ÁP DỤNG: Chương 6 - Bảo mật và an toàn hệ thống
           Chiến lược sao lưu và khôi phục khi gặp sự cố
===============================================================================
*/

USE master;
GO

-- ============================================================================
-- 1. FULL BACKUP - Sao lưu toàn bộ database
-- Mô tả: Sao lưu hoàn chỉnh tất cả dữ liệu và cấu trúc
-- Nên chạy: Hàng ngày hoặc hàng tuần (tùy mức độ quan trọng)
-- ============================================================================
BACKUP DATABASE QuanLyMuonThietBi
TO DISK = N'C:\SQLBackup\QLMTB_Full.bak'
WITH 
    FORMAT,                          -- Ghi đè file backup cũ
    INIT,                            -- Khởi tạo media set mới
    NAME = N'QuanLyMuonThietBi - Full Backup',
    DESCRIPTION = N'Sao lưu toàn bộ database QuanLyMuonThietBi',
    -- COMPRESSION, (Bỏ vì bản Express không hỗ trợ)
    STATS = 10;                      -- Hiển thị tiến độ mỗi 10%
GO

IF @@ERROR = 0 PRINT N' Full Backup thành công!';
ELSE PRINT N' Lỗi khi Full Backup!';
GO

-- ============================================================================
-- 2. DIFFERENTIAL BACKUP - Sao lưu phần thay đổi
-- Mô tả: Chỉ sao lưu dữ liệu đã thay đổi kể từ lần Full Backup cuối
-- Nên chạy: Hàng ngày (giữa các lần Full Backup)
-- Ưu điểm: Nhanh hơn và nhỏ hơn Full Backup
-- ============================================================================
BACKUP DATABASE QuanLyMuonThietBi
TO DISK = N'C:\SQLBackup\QLMTB_Diff.bak'
WITH 
    DIFFERENTIAL,                    -- Chỉ sao lưu phần thay đổi
    FORMAT,
    INIT,
    NAME = N'QuanLyMuonThietBi - Differential Backup',
    DESCRIPTION = N'Sao lưu phần thay đổi database QuanLyMuonThietBi',
    -- COMPRESSION,
    STATS = 10;
GO

IF @@ERROR = 0 PRINT N' Differential Backup thành công!';
ELSE PRINT N' Lỗi khi Differential Backup!';
GO

-- ============================================================================
-- 3. TRANSACTION LOG BACKUP - Sao lưu nhật ký giao dịch
-- Mô tả: Sao lưu transaction log để có thể khôi phục đến thời điểm cụ thể
-- Nên chạy: Mỗi giờ hoặc mỗi vài giờ
-- Yêu cầu: Database phải ở FULL Recovery Model
-- ============================================================================

-- Đặt Recovery Model = FULL
ALTER DATABASE QuanLyMuonThietBi SET RECOVERY FULL;
GO

BACKUP LOG QuanLyMuonThietBi
TO DISK = N'C:\SQLBackup\QLMTB_Log.trn'
WITH 
    FORMAT,
    INIT,
    NAME = N'QuanLyMuonThietBi - Transaction Log Backup',
    DESCRIPTION = N'Sao lưu nhật ký giao dịch',
    -- COMPRESSION,
    STATS = 10;
GO

IF @@ERROR = 0 PRINT N' Transaction Log Backup thành công!';
ELSE PRINT N' Lỗi khi Transaction Log Backup!';
GO

-- ============================================================================
-- 4. RESTORE DATABASE - Khôi phục từ Full Backup
-- Mô tả: Khôi phục toàn bộ database từ file backup
-- ⚠️ CẢNH BÁO: Sẽ ghi đè toàn bộ dữ liệu hiện tại!
-- ============================================================================

/*
-- ⚠️ BỎ COMMENT KHI CẦN KHÔI PHỤC (UNCOMMENT TO RESTORE)

-- Bước 1: Đặt database về SINGLE_USER để ngắt kết nối
ALTER DATABASE QuanLyMuonThietBi SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

-- Bước 2: Khôi phục từ Full Backup
RESTORE DATABASE QuanLyMuonThietBi
FROM DISK = N'C:\SQLBackup\QLMTB_Full.bak'
WITH 
    REPLACE,                         -- Ghi đè database hiện tại
    RECOVERY,                        -- Database sẵn sàng sử dụng sau restore
    STATS = 10;
GO

-- Bước 3: Đặt lại MULTI_USER
ALTER DATABASE QuanLyMuonThietBi SET MULTI_USER;
GO

IF @@ERROR = 0 PRINT N' Restore Database thành công!';
ELSE PRINT N' Lỗi khi Restore Database!';
*/

-- ============================================================================
-- 5. RESTORE VỚI DIFFERENTIAL - Khôi phục Full + Differential
-- ============================================================================

/*
-- ⚠️ BỎ COMMENT KHI CẦN KHÔI PHỤC

ALTER DATABASE QuanLyMuonThietBi SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

-- Bước 1: Restore Full Backup (NORECOVERY để chờ Differential)
RESTORE DATABASE QuanLyMuonThietBi
FROM DISK = N'C:\SQLBackup\QLMTB_Full.bak'
WITH 
    REPLACE,
    NORECOVERY,                      -- Chưa recovery, chờ bước tiếp theo
    STATS = 10;
GO

-- Bước 2: Restore Differential Backup
RESTORE DATABASE QuanLyMuonThietBi
FROM DISK = N'C:\SQLBackup\QLMTB_Diff.bak'
WITH 
    RECOVERY,                        -- Recovery sau bước cuối
    STATS = 10;
GO

ALTER DATABASE QuanLyMuonThietBi SET MULTI_USER;
GO

IF @@ERROR = 0 PRINT N' Restore Full + Differential thành công!';
ELSE PRINT N' Lỗi khi Restore Full + Differential!';
*/

-- ============================================================================
-- 6. XEM THÔNG TIN BACKUP
-- ============================================================================
SELECT 
    bs.database_name AS [Database],
    bs.backup_start_date AS [Bắt Đầu],
    bs.backup_finish_date AS [Kết Thúc],
    CASE bs.type
        WHEN 'D' THEN N'Full Backup'
        WHEN 'I' THEN N'Differential'
        WHEN 'L' THEN N'Transaction Log'
    END AS [Loại Backup],
    CAST(bs.backup_size / 1024.0 / 1024.0 AS DECIMAL(10,2)) AS [Kích Thước (MB)],
    bmf.physical_device_name AS [File Backup]
FROM msdb.dbo.backupset bs
INNER JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
WHERE bs.database_name = N'QuanLyMuonThietBi'
ORDER BY bs.backup_start_date DESC;
GO

-- ============================================================================
-- 7. CHIẾN LƯỢC BACKUP ĐỀ XUẤT
-- ============================================================================
/*
╔══════════════════════════════════════════════════════════════╗
║          CHIẾN LƯỢC SAO LƯU ĐỀ XUẤT                        ║
╠══════════════════════════════════════════════════════════════╣
║ Full Backup      : Mỗi Chủ Nhật lúc 02:00 AM               ║
║ Differential     : Mỗi ngày lúc 02:00 AM (T2-T7)           ║
║ Transaction Log  : Mỗi 2 giờ                                ║
║ Giữ backup       : 30 ngày gần nhất                         ║
║ Recovery Model   : FULL                                      ║
╚══════════════════════════════════════════════════════════════╝
*/

PRINT N' Thiết lập Backup/Restore hoàn tất!';
GO
