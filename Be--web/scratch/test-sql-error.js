import { db } from '../src/configs/index.js'

async function run() {
    try {
        console.log('Running test query...')
        // Let's try running the insert statement directly
        const username = `test_db_${Date.now()}`
        const email = `test_db_${Date.now()}@example.com`
        const phone = '0912345678'
        const dob = '2001-05-15'
        const gender = 'male'
        const hash = '$2a$10$abcdefghijklmnopqrstuv'

        const queryStr = `
            INSERT INTO Users (HoTen, Username, Email, Phone, GioiTinh, NgaySinh, PasswordHash, RoleID, TrangThai)
            VALUES (N'Test Name', '${username}', '${email}', '${phone}', N'${gender}', '${dob}', '${hash}', 2, 'ACTIVE');
        `
        
        await db.query(queryStr)
        console.log('Query succeeded!')
    } catch (err) {
        console.error('SQL Error Message:', err.message)
        console.error('SQL Error Code:', err.code)
        console.error('SQL Error Number:', err.number)
        console.error('SQL Error State:', err.state)
        console.error('SQL Error:', err)
    }
    process.exit(0)
}

run()
