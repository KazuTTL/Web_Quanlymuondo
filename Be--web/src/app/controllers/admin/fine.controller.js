import { db } from '@/configs'

export async function readAllFines(req, res) {
    try {
        const query = `
            SELECT 
                f.FineID,
                f.UserID,
                u.HoTen AS StudentName,
                u.Username,
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
            INNER JOIN Users u ON f.UserID = u.UserID
            LEFT JOIN BorrowRecords br ON f.RecordID = br.RecordID
            LEFT JOIN Devices d ON br.DeviceID = d.DeviceID
            ORDER BY f.NgayPhat DESC
        `
        const result = await db.query(query)
        res.json({
            message: 'Lấy danh sách tiền phạt thành công',
            data: result.recordset
        })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tiền phạt', error: error.message })
    }
}

export async function processOverdueFines(req, res) {
    try {
        const finePerDay = req.body.finePerDay || 5000
        const result = await db.query(`EXEC sp_XuLyQuaHanVaPhat @TienPhatMoiNgay = ${finePerDay}`)
        res.json({
            message: 'Xử lý phạt quá hạn thành công',
            data: result.recordset[0]
        })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi chạy xử lý phạt quá hạn', error: error.message })
    }
}
