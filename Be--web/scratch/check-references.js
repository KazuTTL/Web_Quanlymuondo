const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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

const sqlConfigApp = {
    user: DB_USER,
    password: DB_PASSWORD,
    server: server,
    database: DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
};

if (instanceName) {
    sqlConfigApp.options.instanceName = instanceName;
}

async function checkReferences(deviceId) {
    try {
        const pool = await sql.connect(sqlConfigApp);
        
        console.log(`Checking references for DeviceID: ${deviceId}...`);
        
        const tables = [
            'BorrowRequests',
            'BorrowRecords',
            'DeviceDamages',
            'MaintenanceRecords',
            'DeviceReservations',
            'DeviceImages'
        ];
        
        console.log('Querying table names and row counts...');
        const tablesResult = await pool.request().query(`
            SELECT 
                t.name AS TableName,
                p.rows AS NumRows
            FROM sys.tables t
            INNER JOIN sys.partitions p ON t.object_id = p.object_id
            WHERE p.index_id IN (0,1)
            ORDER BY t.name
        `);
        console.log('Database Tables:', tablesResult.recordset);
        
        await pool.close();
    } catch (err) {
        console.error('❌ Error checking references:', err);
    }
}

const id = process.argv[2] || 17;
checkReferences(id);
