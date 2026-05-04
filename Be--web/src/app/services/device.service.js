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
    _id: d.DeviceID,
    name: d.TenThietBi,
    description: d.MoTa,
    status: d.TrangThai,
    quantity: d.SoLuongTong,
    availableQuantity: d.SoLuongKhaDung,
    imageUrl: d.HinhAnh,
    category: d.DanhMuc || d.TenDanhMuc,
    location: d.ViTri || d.ViTriLuuTru,
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
        const result = await db.query(`
            SELECT d.*, c.TenDanhMuc 
            FROM Devices d 
            LEFT JOIN DeviceCategories c ON d.CategoryID = c.CategoryID
            WHERE d.DeviceID = ${id}
        `)
        if (result.recordset.length === 0) {
            abort(404, 'Thiết bị không tồn tại.')
        }
        return mapDeviceToFE(result.recordset[0])
    } catch (error) {
        abort(500, 'Lỗi khi lấy thiết bị theo ID.')
    }
}

// Tạo thiết bị mới
export async function createDevice(session, deviceData) {
    try {
        // Cần truyền categoryID thay vì text Category. Giả sử mặc định là 1 nếu ko tìm thấy
        const catResult = await db.query(`SELECT CategoryID FROM DeviceCategories WHERE TenDanhMuc = N'${deviceData.category}'`)
        let catId = 1
        if (catResult.recordset.length > 0) catId = catResult.recordset[0].CategoryID

        const query = `
            INSERT INTO Devices (TenThietBi, CategoryID, SoLuongTong, SoLuongKhaDung, MoTa, TrangThai, ViTriLuuTru, SerialNumber, HinhAnh)
            OUTPUT inserted.*
            VALUES (
                N'${deviceData.name}', 
                ${catId}, 
                ${deviceData.quantity || 0}, 
                ${deviceData.quantity || 0}, 
                N'${deviceData.description || ''}', 
                '${DEVICE_STATUS.AVAILABLE}', 
                N'${deviceData.location || ''}', 
                '${deviceData.serialNumber || ''}', 
                '${deviceData.imageUrl || ''}'
            )
        `
        const result = await db.query(query)
        return mapDeviceToFE(result.recordset[0])
    } catch (error) {
        console.error('Error in createDevice:', error)
        abort(500, error.message || 'Lỗi khi tạo thiết bị.')
    }
}

// Cập nhật thiết bị
export async function updateDevice(session, id, updateData) {
    try {
        // Chỉ hỗ trợ cập nhật một số trường cơ bản để test
        const setQuery = []
        if (updateData.name) setQuery.push(`TenThietBi = N'${updateData.name}'`)
        if (typeof updateData.quantity !== 'undefined') {
            setQuery.push(`SoLuongTong = ${updateData.quantity}`)
            // Giả lập cập nhật số lượng khả dụng
            setQuery.push(`SoLuongKhaDung = ${updateData.quantity}`)
        }
        if (updateData.status) setQuery.push(`TrangThai = '${updateData.status}'`)
        if (updateData.description) setQuery.push(`MoTa = N'${updateData.description}'`)

        if (setQuery.length === 0) return await getDeviceById(id)

        const query = `
            UPDATE Devices 
            SET ${setQuery.join(', ')}
            OUTPUT inserted.*
            WHERE DeviceID = ${id}
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
        const check = await db.query(`SELECT SoLuongKhaDung, SoLuongTong FROM Devices WHERE DeviceID = ${id}`)
        if (check.recordset.length === 0) abort(404, 'Thiết bị không tồn tại.')
        
        if (check.recordset[0].SoLuongKhaDung < check.recordset[0].SoLuongTong) {
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
