import { db } from '@/configs'

export async function getDashboardStats() {
    try {
        const [totalDevicesRes, borrowedDevicesRes, overdueDevicesRes, maintenanceDevicesRes, pendingRes] = await Promise.all([
            db.query('SELECT SUM(SoLuongTong) as total FROM Devices'),
            db.query("SELECT COUNT(*) as total FROM BorrowRecords WHERE TrangThai = N'borrowed'"),
            db.query('SELECT COUNT(*) as total FROM vw_ThietBiQuaHan'),
            db.query('SELECT SUM(SoLuongBaoTri) as total FROM Devices'),
            db.query("SELECT COUNT(*) as total FROM BorrowRequests WHERE TrangThai = N'pending'")
        ])

        return {
            totalDevices: totalDevicesRes.recordset[0].total || 0,
            borrowedDevices: borrowedDevicesRes.recordset[0].total || 0,
            overdueDevices: overdueDevicesRes.recordset[0].total || 0,
            maintenanceDevices: maintenanceDevicesRes.recordset[0].total || 0,
            pendingRequests: pendingRes.recordset[0].total || 0
        }
    } catch (error) {
        console.error('[getDashboardStats] Error:', error)
        return { totalDevices: 0, borrowedDevices: 0, overdueDevices: 0, maintenanceDevices: 0, pendingRequests: 0 }
    }
}

export async function getDeviceStatusDistribution() {
    try {
        const result = await db.query(`
            SELECT TrangThai, SUM(SoLuongTong) as count 
            FROM Devices 
            GROUP BY TrangThai
        `)
        return result.recordset.map(r => ({
            label: r.TrangThai === 'available' ? 'Sẵn sàng' : r.TrangThai === 'maintenance' ? 'Bảo trì' : r.TrangThai === 'lost' ? 'Mất' : r.TrangThai,
            value: r.count
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getCategoryDistribution() {
    try {
        const result = await db.query(`
            SELECT c.TenDanhMuc, SUM(d.SoLuongTong) as count 
            FROM Devices d
            JOIN DeviceCategories c ON d.CategoryID = c.CategoryID
            GROUP BY c.TenDanhMuc
        `)
        return result.recordset.map(r => ({
            label: r.TenDanhMuc,
            value: r.count
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getTopDevicesMonthly(limit = 10) {
    try {
        const result = await db.query(`
            SELECT TOP ${limit} d.TenThietBi, COUNT(br.RecordID) as SoLanMuonTrongThang
            FROM BorrowRecords br
            JOIN Devices d ON br.DeviceID = d.DeviceID
            WHERE MONTH(br.NgayMuon) = MONTH(GETDATE()) AND YEAR(br.NgayMuon) = YEAR(GETDATE())
            GROUP BY d.TenThietBi
            ORDER BY SoLanMuonTrongThang DESC
        `)
        return result.recordset.map(r => ({
            label: r.TenThietBi,
            value: r.SoLanMuonTrongThang
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getTopUsersMonthly(limit = 10) {
    try {
        const result = await db.query(`
            SELECT TOP ${limit} u.HoTen, COUNT(br.RecordID) as borrowCount
            FROM BorrowRecords br
            JOIN Users u ON br.UserID = u.UserID
            WHERE MONTH(br.NgayMuon) = MONTH(GETDATE()) AND YEAR(br.NgayMuon) = YEAR(GETDATE())
            GROUP BY u.HoTen
            ORDER BY borrowCount DESC
        `)
        return result.recordset.map(r => ({
            label: r.HoTen,
            value: r.borrowCount
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getBorrowingTrend() {
    try {
        const result = await db.query(`
            SELECT 
                FORMAT(NgayMuon, 'yyyy-MM') as month, 
                COUNT(*) as count 
            FROM BorrowRecords 
            GROUP BY FORMAT(NgayMuon, 'yyyy-MM')
            ORDER BY month ASC
        `)
        return result.recordset.map(r => ({
            label: r.month,
            value: r.count
        }))
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getOverdueBorrows() {
    try {
        const result = await db.query(`
            SELECT 
                br.RecordID, br.DeviceID, br.UserID,
                br.NgayMuon, br.NgayHenTra,
                DATEDIFF(day, br.NgayHenTra, GETDATE()) as overdueDays,
                u.HoTen as userName, u.Email as userEmail, u.Phone as userPhone,
                d.TenThietBi as deviceName
            FROM BorrowRecords br
            JOIN Users u ON br.UserID = u.UserID
            JOIN Devices d ON br.DeviceID = d.DeviceID
            WHERE br.TrangThai = N'borrowed' 
              AND br.NgayHenTra < GETDATE()
            ORDER BY overdueDays DESC
        `)
        return result.recordset.map(r => ({
            recordId: r.RecordID,
            overdueDays: r.overdueDays,
            user: { name: r.userName, email: r.userEmail, phone: r.userPhone },
            device: { name: r.deviceName },
            borrowRequestId: { userId: r.UserID }
        }))
    } catch (error) {
        console.error('[getOverdueBorrows] Error:', error)
        return []
    }
}

export async function getDueSoonBorrows(daysThreshold = 3) {
    try {
        const result = await db.query(`
            SELECT 
                br.RecordID, br.DeviceID, br.UserID,
                br.NgayMuon, br.NgayHenTra,
                DATEDIFF(day, GETDATE(), br.NgayHenTra) as daysLeft,
                u.HoTen as userName, u.Email as userEmail, u.Phone as userPhone,
                d.TenThietBi as deviceName
            FROM BorrowRecords br
            JOIN Users u ON br.UserID = u.UserID
            JOIN Devices d ON br.DeviceID = d.DeviceID
            WHERE br.TrangThai = N'borrowed'
              AND br.NgayHenTra >= GETDATE()
              AND DATEDIFF(day, GETDATE(), br.NgayHenTra) <= ${daysThreshold}
            ORDER BY br.NgayHenTra ASC
        `)
        return result.recordset.map(r => ({
            recordId: r.RecordID,
            daysLeft: r.daysLeft,
            user: { name: r.userName, email: r.userEmail, phone: r.userPhone },
            device: { name: r.deviceName },
            borrowRequestId: { userId: r.UserID }
        }))
    } catch (error) {
        console.error('[getDueSoonBorrows] Error:', error)
        return []
    }
}

