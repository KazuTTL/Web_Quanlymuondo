const fs = require('fs')
const path = require('path')
const sql = require('mssql')
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
    },
    pool: {
        max: 1,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

if (instanceName) {
    sqlConfigApp.options.instanceName = instanceName
}

async function runCleanup() {
    try {
        console.log('Connecting to App Database for cleanup...')
        const pool = await sql.connect(sqlConfigApp)

        const cleanupFile = path.join(__dirname, '../../Database/98_ClearTransactions.sql')
        if (!fs.existsSync(cleanupFile)) {
            throw new Error(`File not found: ${cleanupFile}`)
        }

        console.log(`Executing file: ${path.basename(cleanupFile)}...`)
        const content = fs.readFileSync(cleanupFile, 'utf8')
        const cleanContent = content.replace(/^\uFEFF/, '')
        const batches = cleanContent.split(/^\s*GO\s*$/im)

        for (const batch of batches) {
            const query = batch.trim()
            if (query) {
                try {
                    await pool.request().query(query)
                } catch (err) {
                    console.warn(`[WARNING/ERROR] in batch:\n${query.substring(0, 100)}...\nError: ${err.message}`)
                }
            }
        }

        await pool.close()
        console.log('🎉 Cleanup completed successfully!')
    } catch (err) {
        console.error('❌ Cleanup failed:', err)
        process.exit(1)
    }
}

runCleanup()
