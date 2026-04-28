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
-- TẠO DATABASE VỚI CẤU TRÚC FILE LƯU TRỮ
-- .mdf (Primary Data File): Chứa dữ liệu chính
-- .ldf (Log Data File): Chứa nhật ký giao dịch (Transaction Log)
-- ============================================================================
CREATE DATABASE QuanLyMuonThietBi
ON PRIMARY
(
    NAME       = N'QLMTB_Data',              -- Tên logic của file dữ liệu
    FILENAME   = N'C:\SQLData\QLMTB_Data.mdf', -- Đường dẫn vật lý file .mdf
    SIZE       = 50MB,                        -- Kích thước ban đầu
    MAXSIZE    = 500MB,                       -- Kích thước tối đa
    FILEGROWTH = 10MB                         -- Mỗi lần tăng 10MB
)
LOG ON
(
    NAME       = N'QLMTB_Log',               -- Tên logic của file log
    FILENAME   = N'C:\SQLData\QLMTB_Log.ldf',  -- Đường dẫn vật lý file .ldf
    SIZE       = 20MB,                        -- Kích thước ban đầu
    MAXSIZE    = 200MB,                       -- Kích thước tối đa
    FILEGROWTH = 5MB                          -- Mỗi lần tăng 5MB
);
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

PRINT N'✅ Tạo database QuanLyMuonThietBi thành công!';
GO
