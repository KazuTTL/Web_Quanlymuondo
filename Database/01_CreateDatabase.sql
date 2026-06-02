/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 01_CreateDatabase.sql
 MÔ TẢ: Tạo cơ sở dữ liệu với cấu trúc file lưu trữ (.mdf, .ldf)
 ÁP DỤNG: Chương 1 - Tổng quan MS SQL Server
           Chương 2 - Tạo lập CSDL (cấu trúc file lưu trữ)
===============================================================================
*/

-- Kiểm tra và xóa database cũ nếu tồn tại
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyMuonThietBi')
BEGIN
    ALTER DATABASE QuanLyMuonThietBi SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QuanLyMuonThietBi;
END
GO

-- ============================================================================
-- TẠO DATABASE VỚI CẤU TRÚC FILE LƯU TRỮ DỰA TRÊN ĐƯỜNG DẪN MẶC ĐỊNH HỆ THỐNG
-- Tự động tương thích cả Windows và Linux (Docker)
-- ============================================================================
DECLARE @default_data_path NVARCHAR(520);
SELECT @default_data_path = SUBSTRING(physical_name, 1, CHARINDEX(N'master.mdf', LOWER(physical_name)) - 1)
FROM master.sys.master_files
WHERE database_id = 1 AND file_id = 1;

DECLARE @sql NVARCHAR(MAX);
SET @sql = N'CREATE DATABASE QuanLyMuonThietBi
ON PRIMARY
(
    NAME       = N''QLMTB_Data'',
    FILENAME   = N''' + @default_data_path + N'QLMTB_Data.mdf'',
    SIZE       = 50MB,
    MAXSIZE    = 500MB,
    FILEGROWTH = 10MB
)
LOG ON
(
    NAME       = N''QLMTB_Log'',
    FILENAME   = N''' + @default_data_path + N'QLMTB_Log.ldf'',
    SIZE       = 20MB,
    MAXSIZE    = 200MB,
    FILEGROWTH = 5MB
);';

EXEC sp_executesql @sql;
GO

-- Chuyển sang sử dụng database vừa tạo
USE QuanLyMuonThietBi;
GO

-- Xác nhận tạo thành công
SELECT 
    name AS [Tên Database],
    create_date AS [Ngày Tạo],
    compatibility_level AS [Compatibility Level],
    collation_name AS [Collation]
FROM sys.databases 
WHERE name = N'QuanLyMuonThietBi';
GO

-- Xem thông tin file lưu trữ
SELECT 
    name AS [Tên Logic],
    physical_name AS [Đường Dẫn Vật Lý],
    type_desc AS [Loại File],
    size * 8 / 1024 AS [Kích Thước (MB)],
    max_size * 8 / 1024 AS [Kích Thước Tối Đa (MB)]
FROM sys.database_files;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyMuonThietBi')
    PRINT N' Tạo database QuanLyMuonThietBi thành công!';
ELSE
    PRINT N' Lỗi: Không thể tạo database QuanLyMuonThietBi!';
GO
