import { db } from '@/configs'
import { abort } from '@/utils/helpers'

export const DEVICE_STATUS = {
    AVAILABLE: 'available',
    MAINTENANCE: 'maintenance',
    LOST: 'lost',
    BROKEN: 'broken',
    BORROWED: 'borrowed'
}

// Hàm map kết quả DB sang chuẩn Frontend
const mapDeviceToFE = (d) => ({
    ...d,
    id: d.DeviceID,        // FE dùng device.id cho routing
    _id: d.DeviceID,       // Legacy compatibility
    name: d.TenThietBi,
    description: d.MoTa,
    status: d.TrangThai,
    quantity: d.SoLuongTong,
    availableQuantity: d.SoLuongKhaDung,
    imageUrl: d.HinhAnh,
    category: d.DanhMuc || d.TenDanhMuc,
    location: d.ViTri,
    serialNumber: d.SerialNumber,
    borrowCount: d.SoLuotMuon || 0
})

// Lấy tất cả thiết bị theo query
export async function getAllDevices(query = {}) {
    try {
        console.log('Fetching devices with MSSQL')
        const result = await db.query('SELECT * FROM vw_ThietBiKhaDung')
        return result.recordset.map(mapDeviceToFE)
    } catch (error) {
        console.error('Error in getAllDevices:', error)
        abort(500, 'Lỗi khi lấy danh sách thiết bị.')
    }
}

// Thống kê số lượng thiết bị theo trạng thái
export async function getDeviceStatistics() {
    try {
        const result = await db.query('SELECT TrangThai, COUNT(*) as count FROM Devices GROUP BY TrangThai')
        const stats = {
            total: 0,
            available: 0,
            borrowed: 0,
            maintenance: 0,
            broken: 0,
            lost: 0
        }

        result.recordset.forEach(row => {
            stats.total += row.count
            if (typeof stats[row.TrangThai] !== 'undefined') {
                stats[row.TrangThai] = row.count
            }
        })
        return stats
    } catch (error) {
        abort(500, 'Lỗi khi lấy thống kê thiết bị.')
    }
}

// Lấy thiết bị theo ID
export async function getDeviceById(id) {
    try {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) abort(400, 'ID thiết bị không hợp lệ.')
        const result = await db.query(`
            SELECT d.*, c.TenDanhMuc 
            FROM Devices d 
            LEFT JOIN DeviceCategories c ON d.CategoryID = c.CategoryID
            WHERE d.DeviceID = ${parsedId}
        `)
        if (result.recordset.length === 0) {
            abort(404, 'Thiết bị không tồn tại.')
        }
        return mapDeviceToFE(result.recordset[0])
    } catch (error) {
        if (error.status) throw error
        abort(500, 'Lỗi khi lấy thiết bị theo ID.')
    }
}

// Tạo thiết bị mới
export async function createDevice(session, deviceData) {
    try {
        // Validate số lượng
        const totalQty = parseInt(deviceData.quantity) || 0
        const availQty = parseInt(deviceData.availableQuantity) ?? totalQty
        if (availQty > totalQty) {
            abort(400, `Số lượng khả dụng (${availQty}) không được lớn hơn tổng số lượng (${totalQty}).`)
        }

        // Cần truyền categoryID thay vì text Category
        const catResult = await db.query(`SELECT CategoryID FROM DeviceCategories WHERE TenDanhMuc = N'${deviceData.category}'`)
        let catId = 1
        if (catResult.recordset.length > 0) catId = catResult.recordset[0].CategoryID

        const query = `
            INSERT INTO Devices (TenThietBi, CategoryID, SoLuongTong, SoLuongKhaDung, MoTa, TrangThai, ViTri, SerialNumber, HinhAnh)
            VALUES (
                N'${deviceData.name}', 
                ${catId}, 
                ${totalQty}, 
                ${availQty}, 
                N'${deviceData.description || ''}', 
                '${DEVICE_STATUS.AVAILABLE}', 
                N'${deviceData.location || ''}', 
                '${deviceData.serialNumber || ''}', 
                '${deviceData.imageUrl || ''}'
            );
            SELECT TOP 1 * FROM Devices WHERE DeviceID = SCOPE_IDENTITY();
        `
        const result = await db.query(query)
        return mapDeviceToFE(result.recordset[0])
    } catch (error) {
        if (error.status) throw error
        console.error('Error in createDevice:', error)
        abort(500, error.message || 'Lỗi khi tạo thiết bị.')
    }
}

// Cập nhật thiết bị
export async function updateDevice(session, id, updateData) {
    try {
        const setQuery = []
        if (updateData.name) setQuery.push(`TenThietBi = N'${updateData.name}'`)

        let totalQty = updateData.quantity
        let availQty = updateData.availableQuantity

        if (typeof updateData.quantity !== 'undefined') {
            totalQty = updateData.quantity
        } else {
            const current = await db.query(`SELECT SoLuongTong FROM Devices WHERE DeviceID = ${id}`)
            totalQty = current.recordset[0]?.SoLuongTong
        }

        if (typeof updateData.availableQuantity !== 'undefined') {
            availQty = updateData.availableQuantity
        } else {
            const current = await db.query(`SELECT SoLuongKhaDung FROM Devices WHERE DeviceID = ${id}`)
            availQty = current.recordset[0]?.SoLuongKhaDung
        }

        if (availQty > totalQty) {
            totalQty = availQty
        }

        setQuery.push(`SoLuongTong = ${totalQty}`)
        setQuery.push(`SoLuongKhaDung = ${availQty}`)

        if (updateData.status) setQuery.push(`TrangThai = '${updateData.status}'`)
        if (updateData.description) setQuery.push(`MoTa = N'${updateData.description}'`)
        if (updateData.location) setQuery.push(`ViTri = N'${updateData.location}'`)
        if (updateData.serialNumber) setQuery.push(`SerialNumber = '${updateData.serialNumber}'`)

        if (setQuery.length === 0) return await getDeviceById(id)

        const query = `
            UPDATE Devices 
            SET ${setQuery.join(', ')}
            WHERE DeviceID = ${id};
            SELECT TOP 1 * FROM Devices WHERE DeviceID = ${id};
        `
        const result = await db.query(query)
        if (result.recordset.length === 0) abort(404, 'Thiết bị không tồn tại.')

        return mapDeviceToFE(result.recordset[0])
    } catch (error) {
        abort(500, 'Lỗi khi cập nhật thiết bị.')
    }
}

// Xóa thiết bị
export async function deleteDevice(session, id) {
    try {
        const activeBorrows = await db.query(`SELECT COUNT(*) as count FROM BorrowRecords WHERE DeviceID = ${id} AND TrangThai IN ('borrowed', 'overdue')`)
        if (activeBorrows.recordset[0].count > 0) {
            abort(400, 'Không thể xóa thiết bị đang có người mượn.')
        }

        await db.query(`DELETE FROM Devices WHERE DeviceID = ${id}`)
        return { message: 'Xóa thiết bị thành công.' }
    } catch (error) {

        abort(500, 'Lỗi khi xóa thiết bị.')
    }
}

// Lấy top thiết bị được mượn nhiều nhất
export async function getTopDevices(limit = 10) {
    try {
        const query = `
            SELECT TOP ${limit} 
                d.DeviceID, d.TenThietBi, c.TenDanhMuc, 
                d.SoLuongKhaDung, d.HinhAnh,
                COUNT(br.RecordID) as SoLuotMuon
            FROM Devices d
            LEFT JOIN DeviceCategories c ON d.CategoryID = c.CategoryID
            LEFT JOIN BorrowRecords br ON d.DeviceID = br.DeviceID
            GROUP BY d.DeviceID, d.TenThietBi, c.TenDanhMuc, d.SoLuongKhaDung, d.HinhAnh
            ORDER BY SoLuotMuon DESC
        `
        const result = await db.query(query)
        return result.recordset.map(mapDeviceToFE)
    } catch (error) {
        abort(500, 'Lỗi khi lấy danh sách thiết bị được mượn nhiều nhất.')
    }
}
