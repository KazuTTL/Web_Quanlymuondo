const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const sql = require('mssql')

const DB_SERVER = process.env.DB_SERVER
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE || 'QuanLyMuonThietBi'

let server = DB_SERVER
let instanceName

if (DB_SERVER && DB_SERVER.includes('\\')) {
    const parts = DB_SERVER.split('\\')
    server = parts[0] === '.' ? 'localhost' : parts[0]
    instanceName = parts[1]
}

const sqlConfigApp = {
    user: DB_USER,
    password: DB_PASSWORD,
    server: server,
    database: DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
}

if (instanceName) {
    sqlConfigApp.options.instanceName = instanceName
}

async function run() {
    let pool
    try {
        pool = await sql.connect(sqlConfigApp)
        console.log('Connected to database.')

        console.log('Step 1: Re-creating sp_TaoYeuCauMuon...')
        await pool.request().query(`
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
                
                DECLARE @SoDangMuon INT;
                DECLARE @MaxBorrow INT;
                DECLARE @MaxDays INT;
                DECLARE @MaxPerItem INT;
                DECLARE @SoLuongKhaDung INT;
                DECLARE @TrangThaiDevice NVARCHAR(20);
                DECLARE @NewRequestID INT;
                
                SELECT @MaxBorrow = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'MAX_BORROW_PER_USER';
                SELECT @MaxDays = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'MAX_BORROW_DAYS';
                SELECT @MaxPerItem = ConfigValue FROM BorrowConfig WHERE ConfigKey = 'MAX_QUANTITY_PER_ITEM';
                
                IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID AND TrangThai = N'ACTIVE' AND IsDeleted = 0)
                BEGIN
                    SET @KetQua = N' Người dùng không tồn tại hoặc đã bị khóa.';
                    RETURN;
                END
                
                SELECT @SoLuongKhaDung = SoLuongKhaDung, @TrangThaiDevice = TrangThai
                FROM Devices WHERE DeviceID = @DeviceID;
                
                IF @SoLuongKhaDung IS NULL
                BEGIN
                    SET @KetQua = N' Thiết bị không tồn tại.';
                    RETURN;
                END
                
                IF @TrangThaiDevice != N'available'
                BEGIN
                    SET @KetQua = N' Thiết bị đang bảo trì hoặc đã mất.';
                    RETURN;
                END
                
                IF @SoLuongMuon > @MaxPerItem
                BEGIN
                    SET @KetQua = N' Số lượng mượn tối đa cho mỗi loại thiết bị là ' + CAST(@MaxPerItem AS VARCHAR) + N'.';
                    RETURN;
                END
                
                IF @SoLuongMuon > @SoLuongKhaDung
                BEGIN
                    SET @KetQua = N' Không đủ thiết bị. Số lượng khả dụng: ' + CAST(@SoLuongKhaDung AS VARCHAR) + N'.';
                    RETURN;
                END
                
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
                
                IF DATEDIFF(DAY, @NgayMuon, @NgayTraDuKien) > @MaxDays
                BEGIN
                    SET @KetQua = N' Thời hạn mượn tối đa là ' + CAST(@MaxDays AS VARCHAR) + N' ngày.';
                    RETURN;
                END
                
                SELECT @SoDangMuon = COUNT(*) 
                FROM BorrowRecords 
                WHERE UserID = @UserID AND TrangThai IN (N'borrowed', N'overdue');
                
                IF (@SoDangMuon + @SoLuongMuon) > @MaxBorrow
                BEGIN
                    SET @KetQua = N' Đã đạt giới hạn mượn. Đang mượn: ' + CAST(@SoDangMuon AS VARCHAR) 
                        + N'/' + CAST(@MaxBorrow AS VARCHAR) + N'. Không thể mượn thêm ' + CAST(@SoLuongMuon AS VARCHAR) + N'.';
                    RETURN;
                END
                
                INSERT INTO BorrowRequests (UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, MucDich, GhiChu, TrangThai)
                VALUES (@UserID, @DeviceID, @SoLuongMuon, @NgayMuon, @NgayTraDuKien, @MucDich, @GhiChu, N'pending');
                
                SET @NewRequestID = SCOPE_IDENTITY();
                SET @KetQua = N' Tạo yêu cầu mượn thành công! Mã yêu cầu: ' + CAST(@NewRequestID AS VARCHAR);
            END;
        `)
        console.log('sp_TaoYeuCauMuon updated.')

        console.log('Step 2: Re-creating sp_DuyetYeuCauMuon...')
        await pool.request().query(`
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
                    
                    SELECT @SoLuongKhaDung = SoLuongKhaDung FROM Devices WHERE DeviceID = @DeviceID;
                    IF @SoLuongMuon > @SoLuongKhaDung
                    BEGIN
                        SET @KetQua = N' Không đủ tồn kho. Khả dụng: ' + CAST(@SoLuongKhaDung AS VARCHAR);
                        ROLLBACK;
                        RETURN;
                    END
                    
                    UPDATE BorrowRequests 
                    SET TrangThai = N'approved', NgayCapNhat = GETDATE()
                    WHERE RequestID = @RequestID;
                    
                    INSERT INTO BorrowRecords (RequestID, UserID, DeviceID, SoLuongMuon, NgayMuon, NgayTraDuKien, TrangThai)
                    VALUES (@RequestID, @UserID, @DeviceID, @SoLuongMuon, @NgayMuon, @NgayTraDuKien, N'borrowed');
                    
                    UPDATE Devices 
                    SET SoLuongKhaDung = SoLuongKhaDung - @SoLuongMuon, NgayCapNhat = GETDATE()
                    WHERE DeviceID = @DeviceID;
                    
                    COMMIT;
                    SET @KetQua = N' Duyệt yêu cầu #' + CAST(@RequestID AS VARCHAR) + N' thành công!';
                END TRY
                BEGIN CATCH
                    IF @@TRANCOUNT > 0 ROLLBACK;
                    SET @KetQua = N' Lỗi: ' + ERROR_MESSAGE();
                END CATCH
            END;
        `)
        console.log('sp_DuyetYeuCauMuon updated.')

        console.log('Step 3: Re-creating sp_TuChoiYeuCau...')
        await pool.request().query(`
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
        `)
        console.log('sp_TuChoiYeuCau updated.')

    } catch (err) {
        console.error('Error running migrations:', err)
    } finally {
        if (pool) {
            await pool.close()
        }
    }
}

run()
