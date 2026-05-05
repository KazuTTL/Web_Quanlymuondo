import { db } from '@/configs'
import { abort } from '@/utils/helpers'
import * as emailService from '@/app/services/email.service'

export const BORROW_REQUEST_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
}

export const BORROW_RECORD_STATUS = {
    BORROWED: 'borrowed',
    RETURNED: 'returned',
    OVERDUE: 'overdue'
}

// Map kết quả sang Frontend
const mapRequestToFE = (r) => ({
    ...r,
    _id: r.RequestID,
    userId: r.UserID,
    deviceId: r.DeviceID,
    status: r.TrangThai,
    borrowDate: r.NgayMuon,
    returnDate: r.NgayTraDuKien,
    purpose: r.MucDich,
    note: r.GhiChu,
    createdAt: r.NgayTao,
    device: {
        _id: r.DeviceID,
        name: r.TenThietBi,
        imageUrl: r.HinhAnh
    },
    user: {
        _id: r.UserID,
        name: r.HoTen,
        email: r.Email,
        phone: r.Phone
    }
})

// Lấy tất cả yêu cầu mượn
export async function getAllBorrowRequests(query = {}) {
    try {
        let sql = 'SELECT * FROM vw_YeuCauMuonChiTiet'
        if (query.status) {
            sql += ` WHERE TrangThai = N'${query.status}'`
        }
        sql += ' ORDER BY NgayGuiYeuCau DESC'
        const result = await db.query(sql)
        return result.recordset.map(mapRequestToFE)
    } catch (error) {
        abort(500, 'Lỗi khi lấy danh sách yêu cầu mượn.')
    }
}

// Lấy yêu cầu mượn theo ID
export async function getBorrowRequestById(id) {
    try {
        const result = await db.query(`SELECT * FROM vw_YeuCauMuonChiTiet WHERE RequestID = ${id}`)
        if (result.recordset.length === 0) abort(404, 'Không tìm thấy yêu cầu mượn.')
        return mapRequestToFE(result.recordset[0])
    } catch (error) {
        abort(500, 'Lỗi khi lấy yêu cầu mượn.')
    }
}

// Lấy danh sách yêu cầu của người dùng
export async function getUserBorrowRequests(userId, { page = 1, limit = 10, sort = { createdAt: -1 } } = {}) {
    try {
        const skip = (page - 1) * limit
        
        const countResult = await db.query(`SELECT COUNT(*) as total FROM BorrowRequests WHERE UserID = ${userId}`)
        const total = countResult.recordset[0].total

        const query = `
            SELECT * FROM vw_YeuCauMuonChiTiet 
            WHERE UserID = ${userId}
            ORDER BY NgayTao DESC
            OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY
        `
        const result = await db.query(query)

        return {
            data: result.recordset.map(mapRequestToFE),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error('Error getting user borrow requests:', error)
        abort(500, 'Lỗi khi lấy yêu cầu mượn của người dùng.')
    }
}

// Tạo yêu cầu mượn
export async function createBorrowRequest(data) {
    try {
        const params = {
            UserID: data.userId,
            DeviceID: data.deviceId,
            SoLuongMuon: data.quantity || data.SoLuongMuon || 1,
            NgayMuon: new Date(data.borrowDate),
            NgayTraDuKien: new Date(data.returnDate),
            MucDich: data.purpose || data.MucDich || '',
            GhiChu: data.note || data.GhiChu || ''
        }

        // Gọi Stored Procedure
        const result = await db.execute('sp_TaoYeuCauMuon', params)

        return { message: 'Tạo yêu cầu mượn thành công', data: result }
    } catch (error) {
        console.error('Error creating borrow request:', error)
        abort(500, error.message || 'Lỗi khi tạo yêu cầu mượn.')
    }
}

// Cập nhật trạng thái yêu cầu mượn
export async function updateBorrowRequestStatus(session, id, status, rejectReason = null) {
    try {
        let spName = ''
        if (status === BORROW_REQUEST_STATUS.APPROVED || status === 'approved') {
            spName = 'sp_DuyetYeuCauMuon'
        } else if (status === BORROW_REQUEST_STATUS.REJECTED || status === 'rejected') {
            spName = 'sp_TuChoiYeuCau'
        } else {
            abort(400, 'Trạng thái không hợp lệ.')
        }

        const params = { 
            RequestID: id,
            KetQua: { type: 'nvarchar', length: 500, direction: 'output' }
        }
        if (rejectReason) {
            params.LyDo = rejectReason
        }
        
        const result = await db.execute(spName, params)
        
        const message = result.output?.KetQua || 'Cập nhật trạng thái thành công'
        console.log(`[SP ${spName}] Result:`, message)
        return { message, data: result }
    } catch (error) {
        console.error(`[SP ${spName}] Error:`, error)
        abort(500, error.message || 'Lỗi khi cập nhật trạng thái yêu cầu mượn.')
    }
}

// Trả thiết bị (Admin only)
export async function returnDevice(id) {
    try {
        // Tìm bản ghi mượn đang hoạt động (borrowed hoặc overdue)
        const recordQuery = await db.query(`
            SELECT RecordID, TrangThai 
            FROM BorrowRecords 
            WHERE RequestID = ${id} AND TrangThai IN ('borrowed', 'overdue')
        `)
        
        if (recordQuery.recordset.length === 0) {
            // Kiểm tra xem có bản ghi nào đã trả chưa
            const alreadyReturned = await db.query(`SELECT COUNT(*) as count FROM BorrowRecords WHERE RequestID = ${id} AND TrangThai = 'returned'`)
            if (alreadyReturned.recordset[0].count > 0) {
                abort(400, 'Thiết bị này đã được xác nhận trả trước đó.')
            }
            abort(400, 'Không tìm thấy bản ghi mượn đang hoạt động cho yêu cầu này.')
        }

        const recordId = recordQuery.recordset[0].RecordID
        console.log(`[returnDevice] Processing RecordID: ${recordId} for RequestID: ${id}`)
        
        const result = await db.execute('sp_GhiNhanTraThietBi', { 
            RecordID: recordId,
            KetQua: { type: 'nvarchar', length: 500, direction: 'output' }
        })
        
        const message = result.output?.KetQua || 'Ghi nhận trả thiết bị thành công'
        console.log('[SP sp_GhiNhanTraThietBi] Result:', message)
        return { message }
    } catch (error) {
        console.error('Error returning device:', error)
        abort(500, error.message || 'Lỗi khi trả thiết bị.')
    }
}
