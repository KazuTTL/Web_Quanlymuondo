/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 08_Triggers.sql
 MÔ TẢ: Triggers - Ràng buộc toàn vẹn và tự động hóa
 ÁP DỤNG: Chương 5 - Truy vấn SQL nâng cao (Triggers)
           Cài đặt ràng buộc toàn vẹn và tự động hóa nghiệp vụ
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- TRIGGER 1: trg_KiemTraGioiHanMuon
-- Loại: INSTEAD OF INSERT trên BorrowRequests
-- Mô tả: Tự động kiểm tra giới hạn mượn (max 5) trước khi tạo yêu cầu
-- Ràng buộc: Sinh viên không được mượn quá 5 thiết bị cùng lúc
-- ============================================================================
CREATE OR ALTER TRIGGER trg_KiemTraGioiHanMuon
ON BorrowRequests
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserID INT, @SoLuongMuon INT;
    DECLARE @SoDangMuon INT, @MaxBorrow INT;
    
    SELECT @UserID = UserID, @SoLuongMuon = SoLuongMuon FROM inserted;
    
    -- Lấy giới hạn từ cấu hình
    SELECT @MaxBorrow = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'MAX_BORROW_PER_USER';
    
    -- Tính số đang mượn
    SET @SoDangMuon = dbo.fn_SoLuongDangMuon(@UserID);
    
    -- Kiểm tra giới hạn
    IF (@SoDangMuon + @SoLuongMuon) > @MaxBorrow
    BEGIN
        RAISERROR(N'Vượt giới hạn mượn! Đang mượn: %d/%d. Không thể mượn thêm %d thiết bị.', 
            16, 1, @SoDangMuon, @MaxBorrow, @SoLuongMuon);
        RETURN;
    END
    
    -- Kiểm tra OK → thực hiện INSERT
    INSERT INTO BorrowRequests (UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, MucDich, GhiChu, TrangThai, NgayTao, NgayCapNhat)
    SELECT UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, MucDich, GhiChu, TrangThai,
           ISNULL(NgayTao, GETDATE()), ISNULL(NgayCapNhat, GETDATE())
    FROM inserted;
END;
GO

-- ============================================================================
-- TRIGGER 2: trg_CapNhatTonKho_SauMuon
-- Loại: AFTER INSERT trên BorrowRecords
-- Mô tả: Khi tạo bản ghi mượn mới → tự động giảm SoLuongKhaDung
-- ============================================================================
CREATE OR ALTER TRIGGER trg_CapNhatTonKho_SauMuon
ON BorrowRecords
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Giảm số lượng khả dụng cho từng thiết bị được mượn
    UPDATE d
    SET d.SoLuongKhaDung = d.SoLuongKhaDung - i.SoLuongMuon,
        d.NgayCapNhat = GETDATE()
    FROM Devices d
    INNER JOIN inserted i ON d.DeviceID = i.DeviceID;
    
    -- Kiểm tra số lượng khả dụng không âm
    IF EXISTS (SELECT 1 FROM Devices WHERE SoLuongKhaDung < 0)
    BEGIN
        RAISERROR(N'Lỗi: Số lượng khả dụng không đủ!', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- ============================================================================
-- TRIGGER 3: trg_CapNhatTonKho_SauTra
-- Loại: AFTER UPDATE trên BorrowRecords
-- Mô tả: Khi trạng thái chuyển từ 'borrowed'/'overdue' → 'returned'
--         → tự động tăng lại SoLuongKhaDung
-- ============================================================================
CREATE OR ALTER TRIGGER trg_CapNhatTonKho_SauTra
ON BorrowRecords
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Chỉ xử lý khi có thay đổi trạng thái → 'returned'
    IF UPDATE(TrangThai)
    BEGIN
        UPDATE d
        SET d.SoLuongKhaDung = d.SoLuongKhaDung + i.SoLuongMuon,
            d.NgayCapNhat = GETDATE()
        FROM Devices d
        INNER JOIN inserted i ON d.DeviceID = i.DeviceID
        INNER JOIN deleted del ON del.RecordID = i.RecordID
        WHERE i.TrangThai = N'returned' 
          AND del.TrangThai IN (N'borrowed', N'overdue');
        
        -- Kiểm tra số lượng khả dụng không vượt tổng
        IF EXISTS (SELECT 1 FROM Devices WHERE SoLuongKhaDung > SoLuongTong)
        BEGIN
            RAISERROR(N'Lỗi: Số lượng khả dụng vượt quá tổng!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
    END
END;
GO

-- ============================================================================
-- TRIGGER 4: trg_TuDongCanhBaoQuaHan
-- Loại: AFTER UPDATE trên BorrowRecords
-- Mô tả: Khi trạng thái chuyển thành 'overdue' → tự động tạo cảnh báo
-- ============================================================================
CREATE OR ALTER TRIGGER trg_TuDongCanhBaoQuaHan
ON BorrowRecords
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(TrangThai)
    BEGIN
        -- Tạo cảnh báo cho các bản ghi vừa chuyển sang overdue
        INSERT INTO OverdueAlerts (RecordID, LoaiCanhBao, NoiDung)
        SELECT 
            i.RecordID,
            N'overdue',
            N'Bản ghi #' + CAST(i.RecordID AS NVARCHAR) + N' đã quá hạn trả. '
                + N'Hạn trả: ' + CONVERT(NVARCHAR, i.NgayTraDuKien, 103)
        FROM inserted i
        INNER JOIN deleted del ON del.RecordID = i.RecordID
        WHERE i.TrangThai = N'overdue' AND del.TrangThai = N'borrowed'
          AND NOT EXISTS (
              SELECT 1 FROM OverdueAlerts oa 
              WHERE oa.RecordID = i.RecordID AND oa.LoaiCanhBao = N'overdue' AND oa.DaXuLy = 0
          );
    END
END;
GO

IF OBJECT_ID('trg_TuDongCanhBaoQuaHan', 'TR') IS NOT NULL
    PRINT N' Tạo 4 Triggers thành công!';
ELSE
    PRINT N' Lỗi: Có lỗi xảy ra trong quá trình tạo Triggers!';
GO

-- ============================================================================
-- XEM DANH SÁCH TRIGGERS
-- ============================================================================
SELECT 
    t.name AS [Tên Trigger],
    OBJECT_NAME(t.parent_id) AS [Bảng],
    te.type_desc AS [Loại Sự Kiện],
    t.is_instead_of_trigger AS [Instead Of?]
FROM sys.triggers t
INNER JOIN sys.trigger_events te ON t.object_id = te.object_id
ORDER BY OBJECT_NAME(t.parent_id), t.name;
GO
