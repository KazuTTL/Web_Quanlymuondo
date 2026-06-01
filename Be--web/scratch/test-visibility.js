import { db, userLocalStorage } from '../src/configs/index.js'

async function run() {
    try {
        console.log('--- TEST 1: Querying without user context (Admin/System) ---')
        // Let's query
        const resNoContext = await db.query('SELECT COUNT(*) as count FROM BorrowRequests')
        console.log('Result count without context:', resNoContext.recordset[0].count)

        console.log('\n--- TEST 2: Querying under Student context (UserID = 2) ---')
        await userLocalStorage.run(2, async () => {
            const resStudent = await db.query('SELECT COUNT(*) as count FROM BorrowRequests')
            console.log('Result count with Student context (UserID=2):', resStudent.recordset[0].count)
        })

        console.log('\n--- TEST 3: Querying under Admin context (UserID = 1) ---')
        await userLocalStorage.run(1, async () => {
            const resAdmin = await db.query('SELECT RequestID, UserID, DeviceID FROM BorrowRequests')
            console.log('Result count with Admin context (UserID=1):', resAdmin.recordset.length)
            console.log('Request Rows:', resAdmin.recordset)
            
            if (resAdmin.recordset.length > 0) {
                const targetUserId = resAdmin.recordset[0].UserID
                console.log(`\n--- TEST 4: Querying under Student context (UserID = ${targetUserId}) ---`)
                await userLocalStorage.run(targetUserId, async () => {
                    const resStudent = await db.query('SELECT RequestID, UserID, DeviceID FROM BorrowRequests')
                    console.log(`Result count with Student context (UserID=${targetUserId}):`, resStudent.recordset.length)
                    console.log('Returned Rows:', resStudent.recordset)
                })
            }
        })

    } catch (err) {
        console.error('Error during verification:', err)
    }
    process.exit(0)
}

run()
