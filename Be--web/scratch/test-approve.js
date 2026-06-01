import { db, userLocalStorage } from '../src/configs/index.js'

async function run() {
    try {
        await userLocalStorage.run(1, async () => {
            console.log('--- Current Pending Requests ---')
            const res = await db.query('SELECT * FROM BorrowRequests')
            console.log(res.recordset)

            if (res.recordset.length > 0) {
                const targetReqId = res.recordset[0].RequestID
                console.log(`\n--- Calling sp_DuyetYeuCauMuon for RequestID = ${targetReqId} ---`)
                
                const params = {
                    RequestID: targetReqId,
                    KetQua: { type: 'nvarchar', length: 500, direction: 'output' }
                }
                
                const result = await db.execute('sp_DuyetYeuCauMuon', params)
                console.log('Result Output:', result.output)
                console.log('Returned recordset:', result.recordset)

                console.log('\n--- Status After Approval ---')
                const resAfter = await db.query(`SELECT * FROM BorrowRequests WHERE RequestID = ${targetReqId}`)
                console.log(resAfter.recordset)
            }
        })
    } catch (err) {
        console.error('Error in test:', err)
    }
    process.exit(0)
}

run()
