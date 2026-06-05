USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 22: TRIGGERS M?I (N?NG CAO)
-- Tu?ng t?o th?ng b?o, ki?m tra s? l??ng, c?p nh?t t?n kho
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- Trigger 1: trg_TuDongTaoThongBaoKhiDuyet
-- T? ??ng t?o th?ng b?o khi duy?t/t? ch?i y?u c?u m??n
-- =====================================================
CREATE OR ALTER TRIGGER trg_TuDongTaoThongBaoKhiDuyet
ON BorrowRequests
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(TrangThai)
    BEGIN
        -- Duyệt yêu cầu
        INSERT INTO Notifications (UserID, TieuDe, NoiDung, LoaiThongBao, Link)
        SELECT 
            i.UserID,
            N'Yêu cầu mượn được duyệt',
            FORMATMESSAGE(N'Yêu cầu mượn #%d thiết bị "%s" đã được phê duyệt.', 
                i.RequestID, d.TenThietBi),
            N'duyet',
            FORMATMESSAGE(N'/my-requests/%d', i.RequestID)
        FROM inserted i
        INNER JOIN deleted del ON i.RequestID = del.RequestID
        JOIN Devices d ON i.DeviceID = d.DeviceID
        WHERE i.TrangThai = N'approved' AND del.TrangThai = N'pending';
        
        -- Từ chối yêu cầu
        INSERT INTO Notifications (UserID, TieuDe, NoiDung, LoaiThongBao)
        SELECT 
            i.UserID,
            N'Yêu cầu mượn bị từ chối',
            FORMATMESSAGE(N'Yêu cầu mượn #%d thiết bị "%s" đã bị từ chối. Lý do: %s', 
                i.RequestID, d.TenThietBi, ISNULL(i.GhiChu, N'Không có')),
            N'tu_choi'
        FROM inserted i
        INNER JOIN deleted del ON i.RequestID = del.RequestID
        JOIN Devices d ON i.DeviceID = d.DeviceID
        WHERE i.TrangThai = N'rejected' AND del.TrangThai = N'pending';
    END
END;
GO

-- Disable trigger by default to prevent duplicate notifications (backend already sends cleaner notifications)
DISABLE TRIGGER trg_TuDongTaoThongBaoKhiDuyet ON BorrowRequests;
GO

-- Trigger 2: trg_KiemTraSoLuongKhiCapNhatDevice
-- INSTEAD OF UPDATE: Ki?m tra s? l??ng kh? d?ng kh?ng ?m
-- =====================================================
CREATE OR ALTER TRIGGER trg_KiemTraSoLuongKhiCapNhatDevice
ON Devices
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE SoLuongKhaDung < 0
    )
    BEGIN
        THROW 51001, N'S? l??ng kh? d?ng kh?ng th? ?m.', 1;
        RETURN;
    END
    
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE SoLuongKhaDung > SoLuongTong
    )
    BEGIN
        THROW 51002, N'S? l??ng kh? d?ng kh?ng th? l?n h?n t?ng s? l??ng.', 1;
        RETURN;
    END
    
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE ISNULL(SoLuongBaoTri, 0) + ISNULL(SoLuongDangMuon, 0) + SoLuongKhaDung > SoLuongTong
    )
    BEGIN
        THROW 51003, N'T?ng b?o tr? + ?ang m??n + kh? d?ng v??t qu? t?ng s? l??ng.', 1;
        RETURN;
    END
    
    UPDATE d
    SET 
        d.TenThietBi = i.TenThietBi,
        d.SerialNumber = i.SerialNumber,
        d.MoTa = i.MoTa,
        d.CategoryID = i.CategoryID,
        d.SoLuongTong = i.SoLuongTong,
        d.SoLuongKhaDung = i.SoLuongKhaDung,
        d.SoLuongBaoTri = i.SoLuongBaoTri,
        d.SoLuongDangMuon = i.SoLuongDangMuon,
        d.TrangThai = i.TrangThai,
        d.HinhAnh = i.HinhAnh,
        d.ViTri = i.ViTri,
        d.NgayCapNhat = GETDATE()
    FROM Devices d
    INNER JOIN inserted i ON d.DeviceID = i.DeviceID;
END;
GO

-- Trigger 3: trg_TuDongCapNhatTonKhoKhiBaoTri
-- T? ??ng c?p nh?t s? l??ng kh? d?ng khi b?o tr?
-- =====================================================
CREATE OR ALTER TRIGGER trg_TuDongCapNhatTonKhoKhiBaoTri
ON MaintenanceRecords
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Khi thi?t b? b?t ??u b?o tr?: gi?m SoLuongKhaDung, t?ng SoLuongBaoTri
    IF UPDATE(NgayBatDau) OR EXISTS (SELECT 1 FROM inserted WHERE TrangThai = N'dang_thuc_hien')
    BEGIN
        UPDATE d
        SET 
            d.SoLuongBaoTri = d.SoLuongBaoTri + i.SoLuong,
            d.SoLuongKhaDung = d.SoLuongKhaDung - i.SoLuong,
            d.NgayCapNhat = GETDATE()
        FROM Devices d
        INNER JOIN (
            SELECT DeviceID, COUNT(*) AS SoLuong
            FROM inserted
            WHERE TrangThai = N'dang_thuc_hien'
            GROUP BY DeviceID
        ) i ON d.DeviceID = i.DeviceID;
    END
    
    -- Khi k?t th?c b?o tr?: t?ng l?i SoLuongKhaDung, gi?m SoLuongBaoTri
    IF UPDATE(NgayKetThuc) OR UPDATE(TrangThai)
    BEGIN
        UPDATE d
        SET 
            d.SoLuongBaoTri = CASE WHEN d.SoLuongBaoTri >= i.SoLuong THEN d.SoLuongBaoTri - i.SoLuong ELSE 0 END,
            d.SoLuongKhaDung = d.SoLuongKhaDung + i.SoLuong,
            d.NgayCapNhat = GETDATE()
        FROM Devices d
        INNER JOIN (
            SELECT DeviceID, COUNT(*) AS SoLuong
            FROM deleted
            WHERE TrangThai = N'dang_thuc_hien'
            GROUP BY DeviceID
        ) i ON d.DeviceID = i.DeviceID
        INNER JOIN inserted ins ON d.DeviceID = ins.DeviceID
        WHERE ins.TrangThai IN (N'hoan_thanh', N'huy');
    END
END;
GO

-- =====================================================
-- K?T THC FILE 22
-- =====================================================
