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

        const username = `test_pure_${Date.now()}`
        const email = `test_pure_${Date.now()}@example.com`
        const phone = '0912345678'
        const dob = '2001-05-15'
        const gender = 'male'
        const hash = '$2a$10$abcdefghijklmnopqrstuv'

        const queryStr = `
            INSERT INTO Users (HoTen, Username, Email, Phone, GioiTinh, NgaySinh, PasswordHash, RoleID, TrangThai)
            VALUES (N'Test Pure', '${username}', '${email}', '${phone}', N'${gender}', '${dob}', '${hash}', 2, 'ACTIVE');
        `
        
        console.log('Executing insert...')
        await pool.request().query(queryStr)
        console.log('Insert succeeded!')

        // Let's also test inserting into Students
        const userIdResult = await pool.request().query(`SELECT UserID FROM Users WHERE Username = '${username}'`)
        const newUserId = userIdResult.recordset[0].UserID
        console.log('New User ID:', newUserId)

        const studentQuery = `
            INSERT INTO Students (UserID, MaSinhVien, TrangThaiHocTap)
            VALUES (${newUserId}, 'ST_${Date.now()}', N'dang_hoc');
        `
        console.log('Executing student insert...')
        await pool.request().query(studentQuery)
        console.log('Student insert succeeded!')

    } catch (err) {
        console.error('ERROR OCCURRED:')
        console.error('Message:', err.message)
        console.error('Code:', err.code)
        console.error('Class:', err.class)
        console.error('State:', err.state)
        console.error('Procedure:', err.procedure)
        console.error('Line:', err.lineNumber)
    }
    process.exit(0)
}

run()
