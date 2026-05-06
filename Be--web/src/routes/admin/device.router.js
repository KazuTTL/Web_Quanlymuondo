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
