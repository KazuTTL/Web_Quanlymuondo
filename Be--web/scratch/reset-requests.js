import { db, userLocalStorage } from '../src/configs/index.js'

async function run() {
    try {
        await userLocalStorage.run(1, async () => {
            console.log('--- Resetting Request Statuses ---')
            await db.query('DELETE FROM BorrowRecords')
            await db.query("UPDATE BorrowRequests SET TrangThai = 'pending'")
            console.log('Reset complete.')

            console.log('\n--- Status Before ---')
            const resBefore = await db.query('SELECT RequestID, TrangThai FROM BorrowRequests')
            console.log(resBefore.recordset)

            console.log('\n--- Calling sp_DuyetYeuCauMuon with Admin context (UserID = 1) ---')
            const params = {
                RequestID: 1,
                KetQua: { type: 'nvarchar', length: 500, direction: 'output' },
                ContextUserID: 1
            }
            const result = await db.execute('sp_DuyetYeuCauMuon', params)
            console.log('SP Output:', result.output)

            console.log('\n--- Status After ---')
            const resAfter = await db.query('SELECT RequestID, TrangThai FROM BorrowRequests')
            console.log(resAfter.recordset)

            console.log('\n--- BorrowRecords created ---')
            const records = await db.query('SELECT * FROM BorrowRecords')
            console.log(records.recordset)
        })
    } catch (err) {
        console.error('Error in test:', err)
    }
    process.exit(0)
}

run()
