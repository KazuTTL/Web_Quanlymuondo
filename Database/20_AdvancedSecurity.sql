USE QuanLyMuonThietBi;
GO

-- =====================================================
-- FILE 20: N?NG CAO SECURITY
-- Row-Level Security, Data Masking, Always Encrypted,
-- SQL Server Audit
-- =====================================================
-- M?n h?c: RIPT1307 - Qu?n tr? C? s? d? li?u n?ng cao
-- =====================================================

-- 1. Row-Level Security (RLS)
-- =====================================================

-- 1a. T?o h?m predicate
CREATE OR ALTER FUNCTION dbo.fn_TuongTrinhYeuCau(
    @UserID INT
)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN (
    SELECT 1 AS Access
    FROM dbo.Users
    WHERE UserID = @UserID
      AND (RoleID = 1
           OR UserID = CAST(SESSION_CONTEXT(N'UserID') AS INT))
);
GO

-- 1b. T?o security policy
CREATE SECURITY POLICY UserBorrowRequestPolicy
ADD FILTER PREDICATE dbo.fn_TuongTrinhYeuCau(UserID)
ON dbo.BorrowRequests
WITH (STATE = ON);
GO

-- Set session context khi user ??ng nh?p:
-- EXEC sp_set_session_context N'UserID', @UserID;

-- 2. Dynamic Data Masking
-- =====================================================

-- Che email
ALTER TABLE Users
ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');
GO

-- Che phone
ALTER TABLE Users
ALTER COLUMN Phone ADD MASKED WITH (FUNCTION = 'partial(0, "XXXX", 2)');
GO

-- Che PasswordHash
ALTER TABLE Users
ALTER COLUMN PasswordHash ADD MASKED WITH (FUNCTION = 'default()');
GO

-- C?p quy?n UNMASK cho admin:
-- GRANT UNMASK TO role_admin;

-- 3. Always Encrypted (v? d? — c?n t?o key tr??c trong SSMS)
-- =====================================================
-- T?o Column Master Key (th?c hi?n qua SSMS)
-- CREATE COLUMN MASTER KEY CMK_QLMTB
-- WITH (
--     KEY_STORE_PROVIDER_NAME = N'MSSQL_CERTIFICATE_STORE',
--     KEY_PATH = N'CurrentUser/My/...'
-- );
-- GO

-- T?o Column Encryption Key
-- CREATE COLUMN ENCRYPTION KEY CEK_QLMTB
-- WITH VALUES (
--     COLUMN_MASTER_KEY = CMK_QLMTB,
--     ALGORITHM = N'RSA_OAEP',
--     ENCRYPTED_VALUE = 0x...
-- );
-- GO

-- M? h?a c?t Email
-- ALTER TABLE Users
-- ALTER COLUMN Email VARCHAR(100)
-- ENCRYPTED WITH (
--     COLUMN_ENCRYPTION_KEY = CEK_QLMTB,
--     ENCRYPTION_TYPE = DETERMINISTIC,
--     ALGORITHM = N'AEAD_AES_256_CBC_HMAC_SHA_256'
-- );
-- GO

-- 4. SQL Server Audit (thay th? Audit Log th? c?ng)
-- =====================================================

-- T?o Server Audit (ch?y n?u c? quy?n sysadmin)
-- CREATE SERVER AUDIT Audit_QLMTB
-- TO FILE (FILEPATH = N'C:\SQLAudit\', MAXSIZE = 256 MB, MAX_FILES = 10)
-- WITH (STATE = ON);
-- GO

-- T?o Database Audit Specification
-- CREATE DATABASE AUDIT SPECIFICATION Audit_DB_QLMTB
-- FOR SERVER AUDIT Audit_QLMTB
-- ADD (SELECT, INSERT, UPDATE, DELETE ON OBJECT::Users BY public),
-- ADD (SELECT, INSERT, UPDATE, DELETE ON OBJECT::Devices BY public),
-- ADD (EXECUTE ON OBJECT::sp_TaoYeuCauMuon BY public)
-- WITH (STATE = ON);
-- GO

-- Xem audit log:
-- SELECT * FROM sys.fn_get_audit_file(N'C:\SQLAudit\*.sqlaudit', NULL, NULL);
-- GO

-- =====================================================
-- K?T THC FILE 20
-- =====================================================
