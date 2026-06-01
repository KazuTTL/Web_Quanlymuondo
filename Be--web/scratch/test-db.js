const sql = require('mssql')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

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

async function testQuery() {
    try {
        console.log('Connecting to database...')
        const pool = await sql.connect(sqlConfigApp)
        
        console.log('Querying Fines table...')
        const finesResult = await pool.request().query('SELECT * FROM Fines')
        console.log(`✓ Fines table contents (${finesResult.recordset.length} rows):`, finesResult.recordset)
        
        console.log('Querying Notifications table...')
        const notifResult = await pool.request().query('SELECT COUNT(*) as count FROM Notifications')
        console.log(`✓ Notifications table exists and contains ${notifResult.recordset[0].count} records.`)
        
        console.log('Calling sp_XuLyQuaHanVaPhat stored procedure...')
        const spResult = await pool.request().query('EXEC sp_XuLyQuaHanVaPhat @TienPhatMoiNgay = 5000')
        console.log('✓ sp_XuLyQuaHanVaPhat executed successfully!')
        console.log('Result:', spResult.recordset)

        await pool.close()
        console.log('✓ All database checks passed successfully!')
    } catch (err) {
        console.error('❌ Database query test failed:', err)
        process.exit(1)
    }
}

testQuery()
