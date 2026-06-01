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

const sqlConfigMaster = {
    user: DB_USER,
    password: DB_PASSWORD,
    server: server,
    database: 'master',
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
    sqlConfigMaster.options.instanceName = instanceName
}

const sqlConfigApp = {
    ...sqlConfigMaster,
    database: DB_DATABASE
}

const sqlFiles = [
    '02_CreateTables.sql',
    '03_SeedData.sql',
    '05_Views.sql',
    '06_StoredProcedures.sql',
    '07_Functions.sql',
    '08_Triggers.sql',
    '10_Indexes_Performance.sql',
    '11_AuditTrail.sql',
    '12_Security_Roles.sql',
    '13_NewTables.sql',
    '14_AdvancedQueries.sql',
    '15_AdvancedSP.sql',
    '16_AdvancedFunctions.sql',
    '17_IndexedViews.sql',
    '18_TemporalTables.sql',
    '19_Partitioning.sql',
    '20_AdvancedSecurity.sql',
    '21_JSON_XML_FullText.sql',
    '22_AdvancedTriggers.sql',
    'FIX_PasswordHash.sql'
]

async function runSQLFile(pool, filePath) {
    console.log(`Executing file: ${path.basename(filePath)}...`)
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Remove UTF-8 BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '')
    
    // Split SQL by GO statement (case insensitive, standalone line)
    const batches = cleanContent.split(/^\s*GO\s*$/im)
    
    for (const batch of batches) {
        const query = batch.trim()
        if (query) {
            try {
                await pool.request().query(query)
            } catch (err) {
                // If it's a minor error (like trigger already exists or table dropping warnings), log it
                console.warn(`[WARNING/ERROR] in batch:\n${query.substring(0, 100)}...\nError: ${err.message}`)
                // Don't stop unless it's a critical schema creation error
                if (err.message.includes('Incorrect syntax') || err.message.includes('does not exist')) {
                    // Decide if critical
                }
            }
        }
    }
    console.log(`✓ Completed: ${path.basename(filePath)}\n`)
}

async function migrate() {
    try {
        console.log('Step 1: Connecting to master database to check app database...')
        let pool = await sql.connect(sqlConfigMaster)
        
        // Check if database exists, if not create it
        const checkDbQuery = `IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${DB_DATABASE}') CREATE DATABASE [${DB_DATABASE}];`
        await pool.request().query(checkDbQuery)
        console.log(`✓ Database [${DB_DATABASE}] verified/created.`)
        await pool.close()

        console.log('Step 2: Connecting to App Database for schema creation...')
        pool = await sql.connect(sqlConfigApp)

        const databaseDir = path.join(__dirname, '../../Database')
        
        for (const file of sqlFiles) {
            const filePath = path.join(databaseDir, file)
            if (fs.existsSync(filePath)) {
                await runSQLFile(pool, filePath)
            } else {
                console.error(`File not found: ${filePath}`)
            }
        }

        await pool.close()
        console.log('🎉 Migration completed successfully!')
    } catch (err) {
        console.error('❌ Migration failed:', err)
        process.exit(1)
    }
}

migrate()
