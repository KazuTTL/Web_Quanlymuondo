import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/admin/validate'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import * as deviceController from '@/app/controllers/admin/device.controller'
import * as deviceRequest from '@/app/requests/admin/device.request'

const deviceRouter = Router()

// Kiểm tra token cho tất cả các routes
deviceRouter.use(asyncHandler(authMiddleware.checkValidToken))

// Lấy danh sách thiết bị
deviceRouter.get(
    '/',
    asyncHandler(deviceController.readAllDevices)
)

// Thống kê thiết bị
deviceRouter.get(
    '/statistics',
    asyncHandler(deviceController.getDeviceStatistics)
)

// ===== BORROW REQUEST MANAGEMENT ROUTES =====
import * as borrowRequestController from '@/app/controllers/admin/borrow-request.controller'

// Lấy tất cả yêu cầu mượn thiết bị
deviceRouter.get(
    '/borrow-requests',
    asyncHandler(borrowRequestController.getAllBorrowRequests)
)

// Lấy chi tiết yêu cầu mượn
deviceRouter.get(
    '/borrow-requests/:id',
    asyncHandler(borrowRequestController.getBorrowRequestById)
)

// Duyệt yêu cầu mượn thiết bị
deviceRouter.patch(
    '/borrow-requests/:id/approve',
    asyncHandler(borrowRequestController.approveRequest)
)

// Từ chối yêu cầu mượn thiết bị
deviceRouter.patch(
    '/borrow-requests/:id/reject',
    asyncHandler(borrowRequestController.rejectRequest)
)

// Admin xác nhận trả thiết bị
deviceRouter.put(
    '/borrow-requests/:id/return',
    asyncHandler(borrowRequestController.returnDevice)
)

// Tạo thiết bị mới
deviceRouter.post(
    '/',
    asyncHandler(validate(deviceRequest.createDevice)),
    asyncHandler(deviceController.createDevice)
)

// Lấy chi tiết thiết bị theo ID
deviceRouter.get(
    '/:id',
    asyncHandler(deviceController.readDeviceById)
)

// Cập nhật thiết bị
deviceRouter.put(
    '/:id',
    asyncHandler(validate(deviceRequest.updateDevice)),
    asyncHandler(deviceController.updateDevice)
)

// Xóa thiết bị
deviceRouter.delete(
    '/:id',
    asyncHandler(deviceController.deleteDevice)
)

export default deviceRouter
