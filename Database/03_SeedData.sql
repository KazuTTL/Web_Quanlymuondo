/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 03_SeedData.sql
 MÔ TẢ: Dữ liệu mẫu (INSERT) cho tất cả các bảng
 ÁP DỤNG: Chương 3 - Ngôn ngữ T-SQL (DML: Insert)
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- 1. SEED Roles
-- ============================================================================
SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (RoleID, RoleName, MoTa) VALUES
    (1, 'admin',  N'Quản trị viên hệ thống'),
    (2, 'user',   N'Sinh viên / Câu lạc bộ');
SET IDENTITY_INSERT Roles OFF;
GO

-- ============================================================================
-- 2. SEED Users (password hash mẫu dùng bcrypt cho '123456')
-- ============================================================================
INSERT INTO Users (HoTen, Username, Email, Phone, GioiTinh, PasswordHash, RoleID, TrangThai) 
VALUES
    -- Admin
    (N'Nguyễn Văn Admin', 'admin', 'admin@school.edu.vn', '0901234567', N'Nam',
     '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01', 1, N'ACTIVE'),
    
    -- Sinh viên
    (N'Trần Thị Mai', 'mai.tran', 'mai.tran@student.edu.vn', '0912345678', N'Nữ',
     '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01', 2, N'ACTIVE'),
    
    (N'Lê Hoàng Nam', 'nam.le', 'nam.le@student.edu.vn', '0923456789', N'Nam',
     '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01', 2, N'ACTIVE'),
    
    (N'Phạm Minh Tuấn', 'tuan.pham', 'tuan.pham@student.edu.vn', '0934567890', N'Nam',
     '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01', 2, N'ACTIVE'),
    
    (N'Võ Thị Lan', 'lan.vo', 'lan.vo@student.edu.vn', '0945678901', N'Nữ',
     '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01', 2, N'ACTIVE');
GO

-- ============================================================================
-- 3. SEED DeviceCategories
-- ============================================================================
INSERT INTO DeviceCategories (TenDanhMuc, MoTa) VALUES
    (N'Máy tính xách tay',   N'Laptop cho lập trình, thiết kế'),
    (N'Máy chiếu',           N'Máy chiếu cho thuyết trình, hội thảo'),
    (N'Camera',              N'Máy ảnh, máy quay phim'),
    (N'Âm thanh',            N'Loa, micro, mixer'),
    (N'Thiết bị mạng',       N'Router, switch, cáp mạng'),
    (N'Khác',                N'Các thiết bị khác');
GO

-- ============================================================================
-- 4. SEED Devices
-- ============================================================================
INSERT INTO Devices (TenThietBi, SerialNumber, MoTa, CategoryID, SoLuongTong, SoLuongKhaDung, TrangThai, ViTri)
VALUES
    (N'Laptop Dell Latitude 5520',   'DELL-LAT-001', N'Laptop 15.6 inch, i7, 16GB RAM',    1, 10, 10, N'available', N'Phòng IT - Tầng 2'),
    (N'Laptop HP EliteBook 840',     'HP-ELB-002',   N'Laptop 14 inch, i5, 8GB RAM',       1, 8,  8,  N'available', N'Phòng IT - Tầng 2'),
    (N'Máy chiếu Epson EB-X51',     'EPS-X51-001',  N'Máy chiếu 3800 lumens, XGA',        2, 5,  5,  N'available', N'Kho thiết bị - Tầng 1'),
    (N'Máy chiếu BenQ MH560',       'BNQ-MH5-002',  N'Máy chiếu Full HD, 3800 lumens',    2, 3,  3,  N'available', N'Kho thiết bị - Tầng 1'),
    (N'Camera Canon EOS 90D',        'CAN-90D-001',  N'Máy ảnh DSLR, 32.5MP',             3, 4,  4,  N'available', N'Phòng truyền thông'),
    (N'Micro không dây Shure BLX24', 'SHR-BLX-001',  N'Bộ micro không dây UHF',           4, 6,  6,  N'available', N'Phòng sự kiện'),
    (N'Loa JBL EON715',             'JBL-EON-001',  N'Loa active 15 inch, 1300W',          4, 4,  4,  N'available', N'Phòng sự kiện'),
    (N'Router Cisco RV340',         'CIS-RV3-001',  N'Router VPN, Gigabit',                5, 3,  3,  N'available', N'Phòng IT - Tầng 2'),
    (N'Bảng vẽ Wacom Intuos',       'WAC-INT-001',  N'Bảng vẽ đồ họa, kích thước M',      6, 5,  5,  N'available', N'Phòng thiết kế'),
    (N'Ổ cứng di động WD 2TB',      'WDC-2TB-001',  N'Ổ cứng gắn ngoài USB 3.0',          6, 15, 15, N'available', N'Phòng IT - Tầng 2');
GO

-- ============================================================================
-- 5. SEED BorrowConfig - Giới hạn mượn tối đa 5 thiết bị
-- ============================================================================
INSERT INTO BorrowConfig (ConfigKey, ConfigValue, MoTa) VALUES
    ('MAX_BORROW_PER_USER',   5,  N'Số thiết bị tối đa mỗi sinh viên được mượn cùng lúc'),
    ('MAX_BORROW_DAYS',       30, N'Số ngày mượn tối đa cho mỗi lần mượn'),
    ('NEAR_DUE_DAYS',         2,  N'Số ngày trước hạn trả để gửi cảnh báo sắp đến hạn'),
    ('MAX_QUANTITY_PER_ITEM',  3,  N'Số lượng tối đa cho mỗi loại thiết bị trong 1 lần mượn');
GO

-- ============================================================================
-- 6. SEED BorrowRequests (Yêu cầu mẫu)
-- ============================================================================
INSERT INTO BorrowRequests (UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, MucDich, TrangThai, NgayTao)
VALUES
    -- Mai mượn laptop - đã duyệt
    (2, 1, 1, '2025-04-20', '2025-04-30', N'Làm đồ án môn học', N'approved', '2025-04-18'),
    -- Nam mượn máy chiếu - đang chờ duyệt
    (3, 3, 1, '2025-04-25', '2025-04-26', N'Thuyết trình cuối kỳ', N'pending', '2025-04-23'),
    -- Tuấn mượn camera - đã duyệt
    (4, 5, 1, '2025-04-15', '2025-04-22', N'Quay video câu lạc bộ', N'approved', '2025-04-14'),
    -- Lan mượn micro - đã từ chối
    (5, 6, 2, '2025-04-20', '2025-04-21', N'Tổ chức sự kiện', N'rejected', '2025-04-19'),
    -- Mai mượn thêm loa - đã duyệt
    (2, 7, 1, '2025-04-22', '2025-05-01', N'Sự kiện câu lạc bộ Âm nhạc', N'approved', '2025-04-21');
GO

-- ============================================================================
-- 7. SEED BorrowRecords (Bản ghi mượn-trả cho các yêu cầu đã duyệt)
-- ============================================================================
INSERT INTO BorrowRecords (RequestID, UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, NgayTraThucTe, TrangThai, GhiChu)
VALUES
    -- Mai mượn laptop - đang mượn
    (1, 2, 1, 1, '2025-04-20', '2025-04-30', NULL, N'borrowed', NULL),
    -- Tuấn mượn camera - đã trả
    (3, 4, 5, 1, '2025-04-15', '2025-04-22', '2025-04-21', N'returned', N'Trả đúng hạn'),
    -- Mai mượn loa - đang mượn (quá hạn nếu ngày hiện tại > 01/05)
    (5, 2, 7, 1, '2025-04-22', '2025-05-01', NULL, N'borrowed', NULL);
GO

-- ============================================================================
-- CẬP NHẬT SỐ LƯỢNG KHẢ DỤNG sau khi có bản ghi mượn
-- ============================================================================
-- Laptop Dell: 10 - 1 = 9 (Mai đang mượn 1)
UPDATE Devices SET SoLuongKhaDung = 9 WHERE DeviceID = 1;
-- Camera Canon: trả rồi nên vẫn 4
-- Loa JBL: 4 - 1 = 3 (Mai đang mượn 1)
UPDATE Devices SET SoLuongKhaDung = 3 WHERE DeviceID = 7;
GO

IF EXISTS (SELECT 1 FROM BorrowRecords)
    PRINT N' Đã thêm dữ liệu mẫu thành công!';
ELSE
    PRINT N' Lỗi: Có lỗi xảy ra trong quá trình thêm dữ liệu mẫu!';
GO

-- Kiểm tra dữ liệu
SELECT N'Roles' AS [Bảng], COUNT(*) AS [Số Dòng] FROM Roles
UNION ALL
SELECT N'Users', COUNT(*) FROM Users
UNION ALL
SELECT N'DeviceCategories', COUNT(*) FROM DeviceCategories
UNION ALL
SELECT N'Devices', COUNT(*) FROM Devices
UNION ALL
SELECT N'BorrowConfig', COUNT(*) FROM BorrowConfig
UNION ALL
SELECT N'BorrowRequests', COUNT(*) FROM BorrowRequests
UNION ALL
SELECT N'BorrowRecords', COUNT(*) FROM BorrowRecords;
GO
