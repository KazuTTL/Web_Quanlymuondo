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

        console.log('\n--- Test Status Distribution Query ---')
        const statusResult = await pool.request().query(`
            SELECT TrangThai, SUM(SoLuongTong) as count 
            FROM Devices 
            GROUP BY TrangThai
        `)
        console.log('Original Status distribution rows:', statusResult.recordset)

        console.log('\n--- Test Physical Inventory Status Query ---')
        const physResult = await pool.request().query(`
            SELECT 
                SUM(SoLuongKhaDung) as available,
                SUM(SoLuongDangMuon) as borrowed,
                SUM(SoLuongBaoTri) as maintenance
            FROM Devices
        `)
        console.log('Physical Inventory values:', physResult.recordset[0])

        console.log('\n--- Test Borrowing Trend Query ---')
        const trendResult = await pool.request().query(`
            SELECT 
                FORMAT(NgayMuon, 'yyyy-MM') as month, 
                COUNT(*) as count 
            FROM BorrowRecords 
            GROUP BY FORMAT(NgayMuon, 'yyyy-MM')
            ORDER BY month ASC
        `)
        console.log('Trend rows with FORMAT:', trendResult.recordset)

        console.log('\n--- Check all records in BorrowRecords ---')
        const allRecords = await pool.request().query(`
            SELECT COUNT(*) as total FROM BorrowRecords
        `)
        console.log('Total records in BorrowRecords:', allRecords.recordset[0].total)

        console.log('\n--- Sample records in BorrowRecords ---')
        const samples = await pool.request().query(`
            SELECT TOP 5 RecordID, NgayMuon, TrangThai FROM BorrowRecords
        `)
        console.log('Sample records:', samples.recordset)

    } catch (err) {
        console.error('Error:', err)
    }
    process.exit(0)
}

run()
