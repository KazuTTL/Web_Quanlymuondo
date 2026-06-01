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

async function testDelete(deviceId) {
    try {
        const pool = await sql.connect(sqlConfigApp)
        console.log(`Attempting to delete DeviceID: ${deviceId}...`)
        
        await pool.request().query(`DELETE FROM Devices WHERE DeviceID = ${deviceId}`)
        console.log('✓ Deleted successfully!')
        
        await pool.close()
    } catch (err) {
        console.error('❌ SQL Server Error on Delete:', err.message)
        console.error('Full Error:', err)
    }
}

const id = process.argv[2] || 17
testDelete(id)
