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
    const { deviceId, borrowDate, returnDate, purpose, note, quantity } = req.body
    
    // Kiểm tra thiết bị có tồn tại không
    const device = await deviceService.getDeviceById(deviceId)
    if (!device) {
        return abort(400, 'Thiết bị không tồn tại')
    }
    
    // Kiểm tra số lượng khả dụng
    const availableQty = device.availableQuantity || device.quantity || 0
    const requestedQty = quantity || 1
    if (requestedQty > availableQty) {
        return abort(400, `Chỉ còn ${availableQty} thiết bị khả dụng.`)
    }
    
    // Tạo yêu cầu mượn với trạng thái PENDING
    const borrowRequest = await borrowRequestService.createBorrowRequest({
        deviceId,
        userId: req.currentUser._id,
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
        purpose,
        note,
        quantity: requestedQty
    })

    res.status(201).json({
        message: 'Đã gửi yêu cầu mượn thiết bị thành công. Vui lòng chờ admin duyệt.',
        data: borrowRequest
    })
}
