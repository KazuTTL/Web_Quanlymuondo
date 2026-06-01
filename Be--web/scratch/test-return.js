import { db, userLocalStorage } from '../src/configs/index.js';
import * as borrowRequestService from '../src/app/services/borrow-request.service.js';

async function run() {
    try {
        await userLocalStorage.run(1, async () => {
            // Lấy danh sách approved requests
            console.log('--- Approved Requests ---');
            const approved = await db.query("SELECT * FROM vw_YeuCauMuonChiTiet WHERE TrangThai = 'approved'");
            console.log('Approved requests:', approved.recordset.map(r => ({
                RequestID: r.RequestID,
                TrangThai: r.TrangThai,
                DaTra: r.DaTra
            })));

            // Lấy BorrowRecords
            console.log('\n--- BorrowRecords ---');
            const records = await db.query("SELECT * FROM BorrowRecords");
            console.log('BorrowRecords:', records.recordset.map(r => ({
                RecordID: r.RecordID,
                RequestID: r.RequestID,
                TrangThai: r.TrangThai
            })));

            if (records.recordset.length > 0) {
                const borrowedRecord = records.recordset.find(r => r.TrangThai === 'borrowed');
                if (borrowedRecord) {
                    const requestId = borrowedRecord.RequestID;
                    console.log(`\n--- Calling returnDevice for RequestID = ${requestId} ---`);
                    
                    const result = await borrowRequestService.returnDevice(requestId);
                    console.log('Return Result:', result);

                    console.log('\n--- Checking DaTra in view AFTER return ---');
                    const afterReturn = await db.query(`SELECT RequestID, TrangThai, DaTra FROM vw_YeuCauMuonChiTiet WHERE RequestID = ${requestId}`);
                    console.log('After return:', afterReturn.recordset);
                } else {
                    console.log('No borrowed records found (already returned?)');
                    // Check trực tiếp DB
                    const allRec = await db.query("SELECT * FROM BorrowRecords");
                    console.log('All records status:', allRec.recordset.map(r => ({ RecordID: r.RecordID, TrangThai: r.TrangThai })));
                }
            } else {
                console.log('No BorrowRecords found. Need to approve a request first.');
            }
        });
    } catch (err) {
        console.error('Test error:', err);
    }
    process.exit(0);
}

run();
