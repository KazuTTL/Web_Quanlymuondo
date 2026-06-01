import { db } from '../src/configs/index.js'

async function run() {
    try {
        console.log('--- Checking BorrowConfig table ---')
        const res = await db.query('SELECT * FROM BorrowConfig')
        console.log('Rows:', res.recordset)
    } catch (err) {
        console.error('Error querying BorrowConfig:', err.message)
    }
    process.exit(0)
}

run()
