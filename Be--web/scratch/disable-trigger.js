const sql = require('mssql')

const sqlConfig = {
    user: 'sa',
    password: 'Cdkcmkvl123.',
    database: 'QuanLyMuonThietBi',
    server: 'localhost',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        instanceName: 'SQLEXPRESS'
    }
}

async function run() {
    try {
        console.log('Connecting to SQL Server...')
        const pool = await sql.connect(sqlConfig)
        console.log('Connected!')

        console.log('Disabling trigger trg_TuDongTaoThongBaoKhiDuyet...')
        await pool.request().query('DISABLE TRIGGER trg_TuDongTaoThongBaoKhiDuyet ON BorrowRequests;')
        console.log('Trigger disabled successfully!')
    } catch (err) {
        console.error('Error disabling trigger:', err.message)
    }
    process.exit(0)
}

run()
