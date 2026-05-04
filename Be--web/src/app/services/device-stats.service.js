import { db } from '@/configs'

export async function getDashboardStats() {
    try {
        const totalResult = await db.query('SELECT SUM(SoLuongTong) as totalDevices FROM Devices')
        const pendingResult = await db.query("SELECT COUNT(*) as pendingRequests FROM BorrowRequests WHERE TrangThai = 'pending'")
        const borrowedResult = await db.query("SELECT COUNT(*) as borrowedDevices FROM BorrowRecords WHERE TrangThai = 'borrowed'")
        const overdueResult = await db.query("SELECT COUNT(*) as overdueDevices FROM BorrowRecords WHERE TrangThai = 'borrowed' AND NgayTraDuKien < GETDATE()")
        
        return {
            totalDevices: totalResult.recordset[0].totalDevices || 0,
            pendingRequests: pendingResult.recordset[0].pendingRequests || 0,
            borrowedDevices: borrowedResult.recordset[0].borrowedDevices || 0,
            overdueDevices: overdueResult.recordset[0].overdueDevices || 0
        }
    } catch (error) {
        console.error(error)
        return { totalDevices: 0, pendingRequests: 0, borrowedDevices: 0, overdueDevices: 0 }
    }
}

export async function getTopBorrowedDevices(limit = 10) {
    try {
        const result = await db.query(`SELECT TOP ${limit} * FROM vw_ThongKeThietBiTheoThang ORDER BY SoLanMuonTrongThang DESC`)
        return result.recordset.map(r => ({
            deviceId: r.DeviceID,
            deviceName: r.TenThietBi,
            borrowCount: r.SoLanMuonTrongThang
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}

// Lấy danh sách thiết bị quá hạn
export async function getOverdueBorrows() {
    try {
        const result = await db.query('SELECT * FROM vw_ThietBiQuaHan')
        return result.recordset.map(r => ({
            _id: r.RecordID,
            borrowRequestId: {
                _id: r.RequestID,
                user: { name: r.HoTen, email: r.Email, phone: r.Phone },
                device: { name: r.TenThietBi }
            },
            status: r.TrangThai,
            returnDate: r.NgayTraDuKien,
            overdueDays: r.SoNgayQuaHan
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}

// Lấy danh sách thiết bị sắp đến hạn (mặc định 3 ngày)
export async function getDueSoonBorrows(daysThreshold = 3) {
    try {
        // Tạm thời dùng truy vấn tương tự với SQL
        const query = `
            SELECT br.RecordID, u.HoTen, u.Email, u.Phone, d.TenThietBi, br.NgayTraDuKien, br.TrangThai
            FROM BorrowRecords br
            JOIN Users u ON br.UserID = u.UserID
            JOIN Devices d ON br.DeviceID = d.DeviceID
            WHERE br.TrangThai = 'borrowed' 
            AND DATEDIFF(day, GETDATE(), br.NgayTraDuKien) BETWEEN 0 AND ${daysThreshold}
        `
        const result = await db.query(query)
        return result.recordset.map(r => ({
            _id: r.RecordID,
            borrowRequestId: {
                user: { name: r.HoTen, email: r.Email, phone: r.Phone },
                device: { name: r.TenThietBi }
            },
            status: r.TrangThai,
            returnDate: r.NgayTraDuKien
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}
