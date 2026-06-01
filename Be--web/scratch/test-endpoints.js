import { db, userLocalStorage } from '../src/configs/index.js'

async function run() {
    try {
        console.log('--- Test 1: Fetching vw_YeuCauMuonChiTiet ---')
        await userLocalStorage.run(1, async () => {
            try {
                const res = await db.query('SELECT * FROM vw_YeuCauMuonChiTiet')
                console.log('vw_YeuCauMuonChiTiet count:', res.recordset.length)
            } catch (err) {
                console.error('Error fetching vw_YeuCauMuonChiTiet:', err.message)
            }
        })

        console.log('\n--- Test 2: Fetching Devices ---')
        try {
            const res = await db.query('SELECT * FROM Devices')
            console.log('Devices count:', res.recordset.length)
        } catch (err) {
            console.error('Error fetching Devices:', err.message)
        }

        console.log('\n--- Test 3: Fetching Fines ---')
        try {
            const res = await db.query('SELECT * FROM Fines')
            console.log('Fines count:', res.recordset.length)
        } catch (err) {
            console.error('Error fetching Fines:', err.message)
        }

        console.log('\n--- Test 4: Fetching Users ---')
        try {
            const res = await db.query('SELECT * FROM Users')
            console.log('Users count:', res.recordset.length)
            if (res.recordset.length > 0) {
                console.log('First User:', {
                    UserID: res.recordset[0].UserID,
                    Email: res.recordset[0].Email,
                    Phone: res.recordset[0].Phone,
                    PasswordHash: res.recordset[0].PasswordHash ? '[PRESENT]' : '[NULL]'
                })
            }
        } catch (err) {
            console.error('Error fetching Users:', err.message)
        }

    } catch (err) {
        console.error('General error:', err)
    }
    process.exit(0)
}

run()
