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

        console.log('Step 1: Dropping UserBorrowRequestPolicy...')
        await pool.request().query(`
            IF EXISTS (SELECT * FROM sys.security_policies WHERE name = 'UserBorrowRequestPolicy')
            BEGIN
                DROP SECURITY POLICY UserBorrowRequestPolicy;
            END
        `)
        console.log('UserBorrowRequestPolicy dropped.')

        console.log('Step 2: Altering fn_TuongTrinhYeuCau...')
        await pool.request().query(`
            CREATE OR ALTER FUNCTION dbo.fn_TuongTrinhYeuCau(
                @UserID INT
            )
            RETURNS TABLE
            WITH SCHEMABINDING
            AS
            RETURN (
                SELECT 1 AS Access
                FROM dbo.Users u
                WHERE u.UserID = @UserID
                  AND (
                       EXISTS (
                           SELECT 1 FROM dbo.Users contextUser 
                           WHERE contextUser.UserID = CAST(SESSION_CONTEXT(N'UserID') AS INT)
                             AND contextUser.RoleID = 1
                       )
                       OR u.UserID = CAST(SESSION_CONTEXT(N'UserID') AS INT)
                  )
            );
        `)
        console.log('fn_TuongTrinhYeuCau altered.')

        console.log('Step 3: Creating UserBorrowRequestPolicy...')
        await pool.request().query(`
            CREATE SECURITY POLICY UserBorrowRequestPolicy
            ADD FILTER PREDICATE dbo.fn_TuongTrinhYeuCau(UserID)
            ON dbo.BorrowRequests
            WITH (STATE = ON);
        `)
        console.log('UserBorrowRequestPolicy created successfully!')

    } catch (err) {
        console.error('Error running migrations:', err)
    } finally {
        if (pool) {
            await pool.close()
        }
    }
}

run()
