/*
===============================================================================
 HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ - EQUIPMENT BORROWING MANAGEMENT SYSTEM
 FILE: 06_StoredProcedures.sql
 MÔ TẢ: Thủ tục lưu trữ (Stored Procedures) - Đóng gói logic nghiệp vụ
 ÁP DỤNG: Chương 5 - Truy vấn SQL nâng cao
           Khai báo biến, cấu trúc điều khiển, Stored Procedures
===============================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- SP 1: sp_TaoYeuCauMuon
-- Mô tả: Sinh viên tạo yêu cầu mượn thiết bị
-- Logic: Kiểm tra giới hạn mượn (max 5), kiểm tra tồn kho, kiểm tra ngày hợp lệ
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_TaoYeuCauMuon
    @UserID         INT,
    @DeviceID       INT,
    @SoLuongMuon    INT,
    @NgayMuon       DATE,
    @NgayTraDuKien  DATE,
    @MucDich        NVARCHAR(500),
    @GhiChu         NVARCHAR(500) = NULL,
    @KetQua         NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    EXEC sp_set_session_context N'UserID', @UserID;
    
    -- Khai báo biến
    DECLARE @SoDangMuon INT;
    DECLARE @MaxBorrow INT;
    DECLARE @MaxDays INT;
    DECLARE @MaxPerItem INT;
    DECLARE @SoLuongKhaDung INT;
    DECLARE @TrangThaiDevice NVARCHAR(20);
    DECLARE @NewRequestID INT;
    
    -- Lấy cấu hình giới hạn
    SELECT @MaxBorrow = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'MAX_BORROW_PER_USER';
    SELECT @MaxDays = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'MAX_BORROW_DAYS';
    SELECT @MaxPerItem = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'MAX_QUANTITY_PER_ITEM';
    
    -- Kiểm tra user tồn tại và active
    IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID AND TrangThai = N'ACTIVE' AND IsDeleted = 0)
    BEGIN
        SET @KetQua = N' Người dùng không tồn tại hoặc đã bị khóa.';
        RETURN;
    END
    
    -- Kiểm tra thiết bị tồn tại
    SELECT @SoLuongKhaDung = SoLuongKhaDung, @TrangThaiDevice = TrangThai
    FROM Devices WHERE DeviceID = @DeviceID;
    
    IF @SoLuongKhaDung IS NULL
    BEGIN
        SET @KetQua = N' Thiết bị không tồn tại.';
        RETURN;
    END
    
    -- Kiểm tra thiết bị có đang khả dụng
    IF @TrangThaiDevice != N'available'
    BEGIN
        SET @KetQua = N' Thiết bị đang bảo trì hoặc đã mất.';
        RETURN;
    END
    
    -- Kiểm tra số lượng mượn cho mỗi loại thiết bị
    IF @SoLuongMuon > @MaxPerItem
    BEGIN
        SET @KetQua = N' Số lượng mượn tối đa cho mỗi loại thiết bị là ' + CAST(@MaxPerItem AS VARCHAR) + N'.';
        RETURN;
    END
    
    -- Kiểm tra tồn kho
    IF @SoLuongMuon > @SoLuongKhaDung
    BEGIN
        SET @KetQua = N' Không đủ thiết bị. Số lượng khả dụng: ' + CAST(@SoLuongKhaDung AS VARCHAR) + N'.';
        RETURN;
    END
    
    -- Kiểm tra ngày hợp lệ
    IF @NgayMuon < CAST(GETDATE() AS DATE)
    BEGIN
        SET @KetQua = N' Ngày mượn không được ở quá khứ.';
        RETURN;
    END
    
    IF @NgayTraDuKien < @NgayMuon
    BEGIN
        SET @KetQua = N' Ngày trả phải sau ngày mượn.';
        RETURN;
    END
    
    -- Kiểm tra thời hạn mượn tối đa
    IF DATEDIFF(DAY, @NgayMuon, @NgayTraDuKien) > @MaxDays
    BEGIN
        SET @KetQua = N' Thời hạn mượn tối đa là ' + CAST(@MaxDays AS VARCHAR) + N' ngày.';
        RETURN;
    END
    
    -- Kiểm tra giới hạn mượn (tối đa 5 thiết bị cùng lúc)
    SELECT @SoDangMuon = COUNT(*) 
    FROM BorrowRecords 
    WHERE UserID = @UserID AND TrangThai IN (N'borrowed', N'overdue');
    
    IF (@SoDangMuon + @SoLuongMuon) > @MaxBorrow
    BEGIN
        SET @KetQua = N' Đã đạt giới hạn mượn. Đang mượn: ' + CAST(@SoDangMuon AS VARCHAR) 
            + N'/' + CAST(@MaxBorrow AS VARCHAR) + N'. Không thể mượn thêm ' + CAST(@SoLuongMuon AS VARCHAR) + N'.';
        RETURN;
    END
    
    -- Tất cả kiểm tra OK → Tạo yêu cầu
    INSERT INTO BorrowRequests (UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, MucDich, GhiChu, TrangThai)
    VALUES (@UserID, @DeviceID, @SoLuongMuon, @NgayMuon, @NgayTraDuKien, @MucDich, @GhiChu, N'pending');
    
    SET @NewRequestID = SCOPE_IDENTITY();
    SET @KetQua = N' Tạo yêu cầu mượn thành công! Mã yêu cầu: ' + CAST(@NewRequestID AS VARCHAR);
END;
GO

-- ============================================================================
-- SP 2: sp_DuyetYeuCauMuon
-- Mô tả: Admin duyệt yêu cầu → tạo BorrowRecord + giảm tồn kho
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_DuyetYeuCauMuon
    @RequestID     INT,
    @KetQua        NVARCHAR(500) OUTPUT,
    @ContextUserID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @ContextUserID IS NOT NULL
    BEGIN
        EXEC sp_set_session_context N'UserID', @ContextUserID;
    END
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @UserID INT, @DeviceID INT, @SoLuongMuon INT;
        DECLARE @NgayMuon DATE, @NgayTraDuKien DATE;
        DECLARE @TrangThaiHienTai NVARCHAR(20);
        DECLARE @SoLuongKhaDung INT;
        
        -- Lấy thông tin yêu cầu
        SELECT @UserID = UserID, @DeviceID = DeviceID, @SoLuongMuon = SoLuongMuon,
               @NgayMuon = NgayMuon, @NgayTraDuKien = NgayTraDuKien, @TrangThaiHienTai = TrangThai
        FROM BorrowRequests WHERE RequestID = @RequestID;
        
        IF @TrangThaiHienTai IS NULL
        BEGIN
            SET @KetQua = N' Yêu cầu không tồn tại.';
            ROLLBACK;
            RETURN;
        END
        
        IF @TrangThaiHienTai != N'pending'
        BEGIN
            SET @KetQua = N' Yêu cầu không ở trạng thái chờ duyệt (hiện tại: ' + @TrangThaiHienTai + N').';
            ROLLBACK;
            RETURN;
        END
        
        -- Kiểm tra tồn kho lần cuối
        SELECT @SoLuongKhaDung = SoLuongKhaDung FROM Devices WHERE DeviceID = @DeviceID;
        IF @SoLuongMuon > @SoLuongKhaDung
        BEGIN
            SET @KetQua = N' Không đủ tồn kho. Khả dụng: ' + CAST(@SoLuongKhaDung AS VARCHAR);
            ROLLBACK;
            RETURN;
        END
        
        -- 1. Cập nhật trạng thái yêu cầu → approved
        UPDATE BorrowRequests 
        SET TrangThai = N'approved', NgayCapNhat = GETDATE()
        WHERE RequestID = @RequestID;
        
        -- 2. Tạo bản ghi mượn (Trigger trg_CapNhatTonKho_SauMuon tự động giảm SoLuongKhaDung)
        INSERT INTO BorrowRecords (RequestID, UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, TrangThai)
        VALUES (@RequestID, @UserID, @DeviceID, @SoLuongMuon, @NgayMuon, @NgayTraDuKien, N'borrowed');
        
        COMMIT;
        SET @KetQua = N' Duyệt yêu cầu #' + CAST(@RequestID AS VARCHAR) + N' thành công!';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        SET @KetQua = N' Lỗi: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- ============================================================================
-- SP 3: sp_TuChoiYeuCau
-- Mô tả: Admin từ chối yêu cầu mượn
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_TuChoiYeuCau
    @RequestID     INT,
    @LyDo          NVARCHAR(500) = NULL,
    @KetQua        NVARCHAR(500) OUTPUT,
    @ContextUserID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @ContextUserID IS NOT NULL
    BEGIN
        EXEC sp_set_session_context N'UserID', @ContextUserID;
    END
    
    DECLARE @TrangThaiHienTai NVARCHAR(20);
    
    SELECT @TrangThaiHienTai = TrangThai 
    FROM BorrowRequests WHERE RequestID = @RequestID;
    
    IF @TrangThaiHienTai IS NULL
    BEGIN
        SET @KetQua = N' Yêu cầu không tồn tại.';
        RETURN;
    END
    
    IF @TrangThaiHienTai != N'pending'
    BEGIN
        SET @KetQua = N' Chỉ có thể từ chối yêu cầu đang chờ duyệt.';
        RETURN;
    END
    
    UPDATE BorrowRequests 
    SET TrangThai = N'rejected', 
        GhiChu = ISNULL(@LyDo, GhiChu),
        NgayCapNhat = GETDATE()
    WHERE RequestID = @RequestID;
    
    SET @KetQua = N' Đã từ chối yêu cầu #' + CAST(@RequestID AS VARCHAR);
END;
GO

-- ============================================================================
-- SP 4: sp_GhiNhanTraThietBi
-- Mô tả: Admin ghi nhận sinh viên trả thiết bị → cập nhật tồn kho
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_GhiNhanTraThietBi
    @RecordID   INT,
    @GhiChu     NVARCHAR(500) = NULL,
    @KetQua     NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @DeviceID INT, @SoLuongMuon INT, @TrangThaiHienTai NVARCHAR(20);
        
        SELECT @DeviceID = DeviceID, @SoLuongMuon = SoLuongMuon, @TrangThaiHienTai = TrangThai
        FROM BorrowRecords WHERE RecordID = @RecordID;
        
        IF @TrangThaiHienTai IS NULL
        BEGIN
            SET @KetQua = N' Bản ghi mượn không tồn tại.';
            ROLLBACK;
            RETURN;
        END
        
        IF @TrangThaiHienTai = N'returned'
        BEGIN
            SET @KetQua = N' Thiết bị đã được trả trước đó.';
            ROLLBACK;
            RETURN;
        END
        
        -- 1. Cập nhật bản ghi mượn → returned (Trigger trg_CapNhatTonKho_SauTra tự động tăng SoLuongKhaDung)
        UPDATE BorrowRecords 
        SET TrangThai = N'returned', 
            NgayTraThucTe = CAST(GETDATE() AS DATE),
            GhiChu = ISNULL(@GhiChu, GhiChu),
            NgayCapNhat = GETDATE()
        WHERE RecordID = @RecordID;
        
        COMMIT;
        SET @KetQua = N' Ghi nhận trả thiết bị thành công! Bản ghi #' + CAST(@RecordID AS VARCHAR);
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SET @KetQua = N' Lỗi: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- ============================================================================
-- SP 5: sp_ThongKeThangHienTai
-- Mô tả: Thống kê thiết bị mượn nhiều trong tháng hiện tại
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_ThongKeThangHienTai
    @Thang INT = NULL,     -- NULL = tháng hiện tại
    @Nam   INT = NULL      -- NULL = năm hiện tại
AS
BEGIN
    SET NOCOUNT ON;
    
    SET @Thang = ISNULL(@Thang, MONTH(GETDATE()));
    SET @Nam   = ISNULL(@Nam, YEAR(GETDATE()));
    
    -- Thống kê tổng quan
    SELECT 
        @Thang AS Thang,
        @Nam AS Nam,
        COUNT(DISTINCT br.RecordID) AS TongLuotMuon,
        COUNT(DISTINCT br.UserID)   AS TongSinhVienMuon,
        SUM(br.SoLuongMuon)        AS TongSoLuongMuon
    FROM BorrowRecords br
    WHERE MONTH(br.NgayMuon) = @Thang AND YEAR(br.NgayMuon) = @Nam;
    
    -- Top thiết bị mượn nhiều
    SELECT 
        d.TenThietBi,
        dc.TenDanhMuc AS DanhMuc,
        COUNT(br.RecordID)   AS SoLanMuon,
        SUM(br.SoLuongMuon) AS TongSoLuong
    FROM BorrowRecords br
    INNER JOIN Devices d ON br.DeviceID = d.DeviceID
    INNER JOIN DeviceCategories dc ON d.CategoryID = dc.CategoryID
    WHERE MONTH(br.NgayMuon) = @Thang AND YEAR(br.NgayMuon) = @Nam
    GROUP BY d.TenThietBi, dc.TenDanhMuc
    ORDER BY SoLanMuon DESC;
END;
GO

-- ============================================================================
-- SP 6: sp_KiemTraQuaHan
-- Mô tả: Kiểm tra các bản ghi quá hạn → cập nhật trạng thái + tạo cảnh báo
-- Chạy tự động hoặc Admin gọi thủ công
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_KiemTraQuaHan
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SoQuaHan INT = 0;
    DECLARE @SoSapDenHan INT = 0;
    DECLARE @NearDueDays INT;
    
    SELECT @NearDueDays = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'NEAR_DUE_DAYS';
    
    -- 1. Cập nhật trạng thái quá hạn cho các bản ghi borrowed
    UPDATE BorrowRecords 
    SET TrangThai = N'overdue', NgayCapNhat = GETDATE()
    WHERE TrangThai = N'borrowed' 
      AND NgayTraDuKien < CAST(GETDATE() AS DATE)
      AND NgayTraThucTe IS NULL;
    
    SET @SoQuaHan = @@ROWCOUNT;
    
    -- 2. Tạo cảnh báo quá hạn (nếu chưa có)
    INSERT INTO OverdueAlerts (RecordID, LoaiCanhBao, NoiDung)
    SELECT 
        br.RecordID,
        N'overdue',
        N'Sinh viên ' + u.HoTen + N' quá hạn trả "' + d.TenThietBi 
            + N'" ' + CAST(DATEDIFF(DAY, br.NgayTraDuKien, GETDATE()) AS NVARCHAR) + N' ngày.'
    FROM BorrowRecords br
    INNER JOIN Users u   ON br.UserID = u.UserID
    INNER JOIN Devices d ON br.DeviceID = d.DeviceID
    WHERE br.TrangThai = N'overdue'
      AND NOT EXISTS (
          SELECT 1 FROM OverdueAlerts oa 
          WHERE oa.RecordID = br.RecordID AND oa.LoaiCanhBao = N'overdue' AND oa.DaXuLy = 0
      );
    
    -- 3. Tạo cảnh báo sắp đến hạn
    INSERT INTO OverdueAlerts (RecordID, LoaiCanhBao, NoiDung)
    SELECT 
        br.RecordID,
        N'near_due',
        N'Sinh viên ' + u.HoTen + N' sắp đến hạn trả "' + d.TenThietBi 
            + N'" vào ngày ' + CONVERT(NVARCHAR, br.NgayTraDuKien, 103) + N'.'
    FROM BorrowRecords br
    INNER JOIN Users u   ON br.UserID = u.UserID
    INNER JOIN Devices d ON br.DeviceID = d.DeviceID
    WHERE br.TrangThai = N'borrowed'
      AND DATEDIFF(DAY, GETDATE(), br.NgayTraDuKien) BETWEEN 0 AND @NearDueDays
      AND NOT EXISTS (
          SELECT 1 FROM OverdueAlerts oa 
          WHERE oa.RecordID = br.RecordID AND oa.LoaiCanhBao = N'near_due' AND oa.DaXuLy = 0
      );
    
    -- Kết quả
    PRINT N'✅ Kiểm tra quá hạn hoàn tất.';
    PRINT N'   - Cập nhật quá hạn: ' + CAST(@SoQuaHan AS VARCHAR) + N' bản ghi.';
    
    SELECT * FROM OverdueAlerts WHERE DaXuLy = 0 ORDER BY NgayTao DESC;
END;
GO

IF OBJECT_ID('sp_KiemTraQuaHan', 'P') IS NOT NULL
    PRINT N' Tạo 6 Stored Procedures thành công!';
ELSE
    PRINT N' Lỗi: Có lỗi xảy ra trong quá trình tạo Stored Procedures!';
GO
