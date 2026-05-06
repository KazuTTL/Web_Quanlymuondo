import { db } from '@/configs'

export async function getDashboardStats() {
    try {
        const totalDevicesRes = await db.query('SELECT SUM(SoLuongTong) as total FROM Devices')
        const borrowedDevicesRes = await db.query("SELECT SUM(SoLuongMuon) as total FROM BorrowRecords WHERE TrangThai = 'borrowed'")
        const overdueDevicesRes = await db.query('SELECT COUNT(*) as total FROM vw_ThietBiQuaHan')
        const maintenanceDevicesRes = await db.query("SELECT SUM(SoLuongTong) as total FROM Devices WHERE TrangThai = 'maintenance'")

        return {
            totalDevices: totalDevicesRes.recordset[0].total || 0,
            borrowedDevices: borrowedDevicesRes.recordset[0].total || 0,
            overdueDevices: overdueDevicesRes.recordset[0].total || 0,
            maintenanceDevices: maintenanceDevicesRes.recordset[0].total || 0,
            pendingRequests: (await db.query("SELECT COUNT(*) as total FROM BorrowRequests WHERE TrangThai = 'pending'")).recordset[0].total || 0
        }
    } catch (error) {
        console.error(error)
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
        const result = await db.query(`SELECT TOP ${limit} * FROM vw_ThongKeThietBiTheoThang ORDER BY SoLanMuonTrongThang DESC`)
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
