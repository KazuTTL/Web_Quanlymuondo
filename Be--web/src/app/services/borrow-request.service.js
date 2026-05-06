import { db } from '@/configs'
import { abort } from '@/utils/helpers'
import * as notificationService from '@/app/services/notification.service'

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
    id: r.RequestID,
    _id: r.RequestID,
    userId: r.UserID,
    deviceId: r.DeviceID,
    status: r.TrangThai,
    borrowDate: r.NgayMuon,
    returnDate: r.NgayTraDuKien,
    purpose: r.MucDich,
    note: r.GhiChu,
    createdAt: r.NgayTao,
    quantity: r.SoLuongMuon,
    device: {
        id: r.DeviceID,
        _id: r.DeviceID,
        name: r.TenThietBi,
        imageUrl: r.HinhAnh
    },
    user: {
        _id: r.UserID,
        name: r.HoTen || r.TenSinhVien,
        email: r.Email || r.EmailSinhVien,
        phone: r.Phone || r.SDTSinhVien
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
        if (error.status) throw error
        abort(500, 'Lỗi khi lấy danh sách yêu cầu mượn.')
    }
}

// Lấy yêu cầu mượn theo ID
export async function getBorrowRequestById(id) {
    try {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) abort(400, 'ID yêu cầu không hợp lệ.')
        const result = await db.query(`SELECT * FROM vw_YeuCauMuonChiTiet WHERE RequestID = ${parsedId}`)
        if (result.recordset.length === 0) abort(404, 'Không tìm thấy yêu cầu mượn.')
        return mapRequestToFE(result.recordset[0])
    } catch (error) {
        if (error.status) throw error
        abort(500, 'Lỗi khi lấy yêu cầu mượn.')
    }
}

// Lấy danh sách yêu cầu của người dùng
export async function getUserBorrowRequests(userId, { page = 1, limit = 10 } = {}) {
    try {
        const skip = (page - 1) * limit
        
        const countResult = await db.query(`SELECT COUNT(*) as total FROM BorrowRequests WHERE UserID = ${userId}`)
        const total = countResult.recordset[0].total

        const query = `
            SELECT * FROM vw_YeuCauMuonChiTiet 
            WHERE UserID = ${userId}
            ORDER BY NgayGuiYeuCau DESC
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
            SoLuongMuon: data.quantity || 1,
            NgayMuon: new Date(data.borrowDate),
            NgayTraDuKien: new Date(data.returnDate),
            MucDich: data.purpose || data.MucDich || 'Sử dụng cho học tập',
            GhiChu: data.note || data.GhiChu || null,
            KetQua: { type: 'nvarchar', length: 500, direction: 'output' }
        }

        // Gọi Stored Procedure
        const result = await db.execute('sp_TaoYeuCauMuon', params)
        const message = result.output?.KetQua || 'Tạo yêu cầu mượn thành công'
        
        if (message.includes('Người dùng không') || message.includes('Thiết bị không') || 
            message.includes('Số lượng') || message.includes('Ngày') || message.includes('Không đủ') ||
            message.includes('Đã đạt giới hạn')) {
            abort(400, message.trim())
        }

        return { message: message.trim() }
    } catch (error) {
        if (error.status) throw error
        console.error('Error creating borrow request:', error)
        abort(500, error.message || 'Lỗi khi tạo yêu cầu mượn.')
    }
}

// Cập nhật trạng thái yêu cầu mượn (Admin duyệt hoặc từ chối)
export async function updateBorrowRequestStatus(session, id, status, rejectReason = null) {
    let spName = ''
    try {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) abort(400, 'ID yêu cầu không hợp lệ.')

        if (status === BORROW_REQUEST_STATUS.APPROVED || status === 'approved') {
            spName = 'sp_DuyetYeuCauMuon'
        } else if (status === BORROW_REQUEST_STATUS.REJECTED || status === 'rejected') {
            spName = 'sp_TuChoiYeuCau'
        } else {
            abort(400, 'Trạng thái không hợp lệ.')
        }

        const params = { 
            RequestID: parsedId,
            KetQua: { type: 'nvarchar', length: 500, direction: 'output' }
        }
        if (rejectReason) {
            params.LyDo = rejectReason
        }
        
        const result = await db.execute(spName, params)
        
        const message = result.output?.KetQua || 'Cập nhật trạng thái thành công'
        console.log(`[SP ${spName}] Result:`, message)
        
        // Gửi notification cho user khi được duyệt
        if (status === 'approved') {
            try {
                const reqInfo = await db.query(`SELECT UserID, DeviceID FROM BorrowRequests WHERE RequestID = ${parsedId}`)
                if (reqInfo.recordset.length > 0) {
                    const { UserID, DeviceID } = reqInfo.recordset[0]
                    const deviceInfo = await db.query(`SELECT TenThietBi FROM Devices WHERE DeviceID = ${DeviceID}`)
                    const deviceName = deviceInfo.recordset[0]?.TenThietBi || 'Thiết bị'
                    await notificationService.createNotification(
                        UserID,
                        '✅ Yêu cầu mượn được duyệt',
                        `Yêu cầu mượn thiết bị "${deviceName}" của bạn đã được phê duyệt. Vui lòng đến nhận thiết bị.`
                    )
                }
            } catch (notifErr) {
                console.error('[Notification] Error creating approval notification:', notifErr)
            }
        }

        // Gửi notification khi bị từ chối
        if (status === 'rejected') {
            try {
                const reqInfo = await db.query(`SELECT UserID, DeviceID FROM BorrowRequests WHERE RequestID = ${parsedId}`)
                if (reqInfo.recordset.length > 0) {
                    const { UserID, DeviceID } = reqInfo.recordset[0]
                    const deviceInfo = await db.query(`SELECT TenThietBi FROM Devices WHERE DeviceID = ${DeviceID}`)
                    const deviceName = deviceInfo.recordset[0]?.TenThietBi || 'Thiết bị'
                    await notificationService.createNotification(
                        UserID,
                        '❌ Yêu cầu mượn bị từ chối',
                        `Yêu cầu mượn thiết bị "${deviceName}" của bạn đã bị từ chối.${rejectReason ? ' Lý do: ' + rejectReason : ''}`
                    )
                }
            } catch (notifErr) {
                console.error('[Notification] Error creating rejection notification:', notifErr)
            }
        }
        
        return { message, data: result }
    } catch (error) {
        if (error.status) throw error
        console.error(`[SP ${spName}] Error:`, error)
        abort(500, error.message || 'Lỗi khi cập nhật trạng thái yêu cầu mượn.')
    }
}

// Trả thiết bị (Admin only)
export async function returnDevice(id) {
    try {
        const parsedId = parseInt(id)
        if (isNaN(parsedId)) abort(400, 'ID yêu cầu không hợp lệ.')

        // Tìm bản ghi mượn đang hoạt động
        const recordQuery = await db.query(`
            SELECT RecordID, TrangThai 
            FROM BorrowRecords 
            WHERE RequestID = ${parsedId} AND TrangThai IN ('borrowed', 'overdue')
        `)
        
        if (recordQuery.recordset.length === 0) {
            const alreadyReturned = await db.query(`SELECT COUNT(*) as count FROM BorrowRecords WHERE RequestID = ${parsedId} AND TrangThai = 'returned'`)
            if (alreadyReturned.recordset[0].count > 0) {
                abort(400, 'Thiết bị này đã được xác nhận trả trước đó.')
            }
            abort(400, 'Không tìm thấy bản ghi mượn đang hoạt động cho yêu cầu này.')
        }

        const recordId = recordQuery.recordset[0].RecordID
        console.log(`[returnDevice] Processing RecordID: ${recordId} for RequestID: ${parsedId}`)
        
        const result = await db.execute('sp_GhiNhanTraThietBi', { 
            RecordID: recordId,
            KetQua: { type: 'nvarchar', length: 500, direction: 'output' }
        })
        
        const message = result.output?.KetQua || 'Ghi nhận trả thiết bị thành công'
        console.log('[SP sp_GhiNhanTraThietBi] Result:', message)
        return { message }
    } catch (error) {
        if (error.status) throw error
        console.error('Error returning device:', error)
        abort(500, error.message || 'Lỗi khi trả thiết bị.')
    }
}
