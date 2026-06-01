const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sql = require('mssql');

const DB_SERVER = process.env.DB_SERVER;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE || 'QuanLyMuonThietBi';

let server = DB_SERVER;
let instanceName;
if (DB_SERVER && DB_SERVER.includes('\\')) {
    const parts = DB_SERVER.split('\\');
    server = parts[0] === '.' ? 'localhost' : parts[0];
    instanceName = parts[1];
}

const config = {
    user: DB_USER,
    password: DB_PASSWORD,
    server,
    database: DB_DATABASE,
    options: { encrypt: true, trustServerCertificate: true }
};
if (instanceName) config.options.instanceName = instanceName;

async function run() {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('Connected to DB.');

        console.log('Updating vw_YeuCauMuonChiTiet to include DaTra column...');
        await pool.request().query(`
            CREATE OR ALTER VIEW vw_YeuCauMuonChiTiet
            AS
            SELECT 
                rq.RequestID,
                u.UserID,
                u.HoTen             AS TenSinhVien,
                u.Email             AS EmailSinhVien,
                u.Phone             AS SDTSinhVien,
                d.DeviceID,
                d.TenThietBi,
                d.SerialNumber,
                dc.TenDanhMuc       AS DanhMuc,
                rq.SoLuongMuon,
                rq.NgayMuon,
                rq.NgayTraDuKien,
                DATEDIFF(DAY, rq.NgayMuon, rq.NgayTraDuKien) AS SoNgayMuon,
                rq.MucDich,
                rq.GhiChu,
                rq.TrangThai,
                rq.NgayTao          AS NgayGuiYeuCau,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM BorrowRecords br 
                        WHERE br.RequestID = rq.RequestID 
                          AND br.TrangThai = N'returned'
                    ) THEN 1 
                    ELSE 0 
                END AS DaTra
            FROM BorrowRequests rq
            INNER JOIN Users u              ON rq.UserID   = u.UserID
            INNER JOIN Devices d            ON rq.DeviceID = d.DeviceID
            INNER JOIN DeviceCategories dc  ON d.CategoryID = dc.CategoryID;
        `);
        console.log('View updated successfully!');

        // Verify
        console.log('\nVerifying view has DaTra column...');
        const check = await pool.request().query(`
            SELECT TOP 3 RequestID, TrangThai, DaTra FROM vw_YeuCauMuonChiTiet
        `);
        console.log('Sample rows:', check.recordset);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (pool) await pool.close();
    }
}

run();
