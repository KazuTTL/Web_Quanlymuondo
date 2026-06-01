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
        const pool = await sql.connect(sqlConfig)
        console.log('Connected!')

        const res = await pool.request().query(`
            SELECT DeviceID, TenThietBi, SoLuongTong, SoLuongKhaDung, SoLuongDangMuon, SoLuongBaoTri,
                   (SoLuongTong - (SoLuongKhaDung + SoLuongDangMuon + SoLuongBaoTri)) as diff
            FROM Devices
            WHERE SoLuongTong != (SoLuongKhaDung + SoLuongDangMuon + SoLuongBaoTri)
        `)
        console.log('Mismatched rows:', res.recordset)

    } catch (err) {
        console.error('Error:', err)
    }
    process.exit(0)
}

run()
