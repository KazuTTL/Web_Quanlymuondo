import { db } from '@/configs'

export async function readMyFines(req, res) {
    try {
        const userId = req.currentUser._id || req.currentUser.UserID
        const query = `
            SELECT 
                f.FineID,
                f.RecordID,
                f.DamageID,
                f.SoTien,
                f.LyDo,
                f.NgayPhat,
                f.HanThanhToan,
                f.NgayThanhToan,
                f.TrangThai,
                d.TenThietBi AS DeviceName
            FROM Fines f
            LEFT JOIN BorrowRecords br ON f.RecordID = br.RecordID
            LEFT JOIN Devices d ON br.DeviceID = d.DeviceID
            WHERE f.UserID = ${userId}
            ORDER BY f.NgayPhat DESC
        `
        const result = await db.query(query)
        res.json({
            message: 'Lấy danh sách tiền phạt của bạn thành công',
            data: result.recordset
        })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tiền phạt', error: error.message })
    }
}

export async function payFine(req, res) {
    try {
        const userId = req.currentUser._id || req.currentUser.UserID
        const fineId = req.params.id
        
        // Cập nhật trạng thái đóng tiền phạt
        const query = `
            UPDATE Fines 
            SET TrangThai = N'da_thanh_toan', NgayThanhToan = GETDATE()
            WHERE FineID = ${fineId} AND UserID = ${userId}
        `
        await db.query(query)
        res.json({
            message: 'Thanh toán tiền phạt thành công'
        })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thanh toán tiền phạt', error: error.message })
    }
}
