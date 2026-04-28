import * as borrowRequestService from '@/app/services/borrow-request.service'
import * as deviceService from '@/app/services/device.service'
import { abort } from '@/utils/helpers'

// Lấy danh sách yêu cầu mượn của user hiện tại
export async function getUserBorrowRequests(req, res) {
    const { page, limit, status } = req.query
    const requests = await borrowRequestService.getUserBorrowRequests(
        req.currentUser._id,
        {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            status
        }
    )
    res.json({
        message: 'Lấy danh sách yêu cầu mượn thành công',
        data: requests
    })
}

// Lấy chi tiết yêu cầu mượn
export async function getBorrowRequestById(req, res) {
    const borrowRequest = await borrowRequestService.getBorrowRequestById(req.params.id)

    // Kiểm tra quyền truy cập - chỉ user tạo yêu cầu mới xem được
    if (borrowRequest.userId.toString() !== req.currentUser._id.toString()) {
        return abort(403, 'Bạn không có quyền xem yêu cầu này')
    }

    res.json({
        message: 'Lấy thông tin yêu cầu mượn thành công',
        data: borrowRequest
    })
}

// User tạo yêu cầu mượn thiết bị - Gửi đến admin để duyệt
export async function createBorrowRequest(req, res) {
    const { deviceId, borrowDate, returnDate, purpose, note } = req.body
    
    // Kiểm tra thiết bị có tồn tại và available không
    const device = await deviceService.getDeviceById(deviceId)
    if (!device || device.status !== 'available') {
        return abort(400, 'Thiết bị không khả dụng hoặc không tồn tại')
    }
    
    // Kiểm tra user có yêu cầu pending nào cho thiết bị này không
    const existingRequest = await borrowRequestService.getAllBorrowRequests({
        userId: req.currentUser._id,
        deviceId,
        status: 'pending'
    })
    
    if (existingRequest.length > 0) {
        return abort(400, 'Bạn đã có yêu cầu mượn thiết bị này đang chờ duyệt')
    }
    
    // Tạo yêu cầu mượn với trạng thái PENDING
    const borrowRequest = await borrowRequestService.createBorrowRequest({
        deviceId,
        userId: req.currentUser._id,
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
        purpose,
        note
    })

    res.status(201).json({
        message: 'Đã gửi yêu cầu mượn thiết bị thành công. Vui lòng chờ admin duyệt.',
        data: borrowRequest
    })
}
