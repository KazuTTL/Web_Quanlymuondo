/*
=================================================================================
HỆ THỐNG QUẢN LÝ MƯỢN THIẾT BỊ
FILE: 11_AuditTrail.sql
MÔ TẢ: Tạo bảng Audit Trail để ghi nhận mọi thay đổi dữ liệu
ÁP DỤNG: Chương 7 - Database Security & Audit
=================================================================================
*/

USE QuanLyMuonThietBi;
GO

-- ============================================================================
-- TABLE: AuditLogs - Lưu trữ lịch sử thay đổi
-- ============================================================================
CREATE TABLE AuditLogs
(
    AuditID         BIGINT IDENTITY(1,1)   NOT NULL,
    TableName      VARCHAR(100)        NOT NULL,
    RecordID      INT                 NOT NULL,
    Action       VARCHAR(20)         NOT NULL,  -- INSERT, UPDATE, DELETE
    ColumnName    VARCHAR(100)        NULL,
    OldValue     NVARCHAR(MAX)       NULL,
    NewValue     NVARCHAR(MAX)       NULL,
    UserID       INT                 NULL,   -- Người thực hiện (null nếu là system)
    IPAddress    VARCHAR(50)         NULL,
    Timestamp   DATETIME           NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_AuditLogs PRIMARY KEY (AuditID),
    CONSTRAINT CK_AuditLogs_Action CHECK (Action IN ('INSERT', 'UPDATE', 'DELETE'))
);
GO

-- Index cho việc truy vấn nhanh theo bảng và thời gian
CREATE NONCLUSTERED INDEX IX_AuditLogs_TableName_Timestamp
ON AuditLogs(TableName, Timestamp DESC);

CREATE NONCLUSTERED INDEX IX_AuditLogs_RecordID
ON AuditLogs(RecordID);
GO

-- ============================================================================
-- TRIGGER: trg_Audit_Users - Ghi log thay đổi Users
-- ============================================================================
CREATE OR ALTER TRIGGER trg_Audit_Users
ON Users
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AuditLogs (TableName, RecordID, Action, ColumnName, OldValue, NewValue, UserID, IPAddress)
    SELECT 
        'Users',
        COALESCE(i.UserID, d.UserID),
        CASE 
            WHEN i.UserID IS NOT NULL AND d.UserID IS NULL THEN 'INSERT'
            WHEN i.UserID IS NOT NULL AND d.UserID IS NOT NULL THEN 'UPDATE'
            ELSE 'DELETE'
        END,
        NULL,
        CASE 
            WHEN d.UserID IS NOT NULL THEN JSON_VALUE((SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), '$.PasswordHash')
            ELSE NULL
        END,
        CASE 
            WHEN i.UserID IS NOT NULL THEN JSON_VALUE((SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), '$.PasswordHash')
            ELSE NULL
        END,
        CAST(CONTEXT_INFO() AS INT),
        NULL
    FROM inserted i
    FULL OUTER JOIN deleted d ON i.UserID = d.UserID;
END;
GO

-- ============================================================================
-- TRIGGER: trg_Audit_Devices - Ghi log thay đổi Devices
-- ============================================================================
CREATE OR ALTER TRIGGER trg_Audit_Devices
ON Devices
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AuditLogs (TableName, RecordID, Action, ColumnName, OldValue, NewValue, UserID, IPAddress)
    SELECT 
        'Devices',
        COALESCE(i.DeviceID, d.DeviceID),
        CASE 
            WHEN i.DeviceID IS NOT NULL AND d.DeviceID IS NULL THEN 'INSERT'
            WHEN i.DeviceID IS NOT NULL AND d.DeviceID IS NOT NULL THEN 'UPDATE'
            ELSE 'DELETE'
        END,
        'SoLuongKhaDung',
        CAST(d.SoLuongKhaDung AS NVARCHAR(20)),
        CAST(i.SoLuongKhaDung AS NVARCHAR(20)),
        CAST(CONTEXT_INFO() AS INT),
        NULL
    FROM inserted i
    FULL OUTER JOIN deleted d ON i.DeviceID = d.DeviceID
    WHERE i.SoLuongKhaDung <> d.SoLuongKhaDung OR d.SoLuongKhaDung IS NULL;
END;
GO

-- ============================================================================
-- TRIGGER: trg_Audit_BorrowRequests - Ghi log thay đổi yêu cầu
-- ============================================================================
CREATE OR ALTER TRIGGER trg_Audit_BorrowRequests
ON BorrowRequests
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AuditLogs (TableName, RecordID, Action, ColumnName, OldValue, NewValue)
    SELECT 
        'BorrowRequests',
        i.RequestID,
        'UPDATE',
        'TrangThai',
        d.TrangThai,
        i.TrangThai
    FROM inserted i
    INNER JOIN deleted d ON i.RequestID = d.RequestID
    WHERE i.TrangThai <> d.TrangThai;
END;
GO

-- ============================================================================
-- TRIGGER: trg_Audit_BorrowRecords - Ghi log thay đổi bản ghi mượn
-- ============================================================================
CREATE OR ALTER TRIGGER trg_Audit_BorrowRecords
ON BorrowRecords
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AuditLogs (TableName, RecordID, Action, ColumnName, OldValue, NewValue)
    SELECT 
        'BorrowRecords',
        i.RecordID,
        'UPDATE',
        'TrangThai',
        d.TrangThai,
        i.TrangThai
    FROM inserted i
    INNER JOIN deleted d ON i.RecordID = d.RecordID
    WHERE i.TrangThai <> d.TrangThai OR (i.TrangThai = 'returned' AND d.TrangThai <> 'returned');
END;
GO

-- ============================================================================
-- VIEW: vw_AuditLogs_Recent - Xem log gần đây
-- ============================================================================
CREATE OR ALTER VIEW vw_AuditLogs_Recent
AS
SELECT TOP 100
    AuditID,
    TableName,
    RecordID,
    Action,
    ColumnName,
    OldValue,
    NewValue,
    Timestamp,
    CASE TableName
        WHEN 'Users' THEN (SELECT HoTen FROM Users u WHERE u.UserID = AuditLogs.RecordID)
        WHEN 'Devices' THEN (SELECT TenThietBi FROM Devices d WHERE d.DeviceID = AuditLogs.RecordID)
        WHEN 'BorrowRequests' THEN (SELECT TOP 1 'Request #' + CAST(RequestID AS VARCHAR) FROM BorrowRequests WHERE RequestID = AuditLogs.RecordID)
        WHEN 'BorrowRecords' THEN (SELECT TOP 1 'Record #' + CAST(RecordID AS VARCHAR) FROM BorrowRecords WHERE RecordID = AuditLogs.RecordID)
        ELSE NULL
    END AS RecordName
FROM AuditLogs
ORDER BY Timestamp DESC;
GO

-- ============================================================================
-- PROCEDURE: sp_XemLichSuThayDoi - Xem lịch sử thay đổi của 1 record
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_XemLichSuThayDoi
    @TableName VARCHAR(100),
    @RecordID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        AuditID,
        Action,
        ColumnName,
        OldValue,
        NewValue,
        Timestamp
    FROM AuditLogs
    WHERE TableName = @TableName AND RecordID = @RecordID
    ORDER BY Timestamp DESC;
END;
GO

PRINT N' ✓ Tạo Audit Trail thành công!';
GO