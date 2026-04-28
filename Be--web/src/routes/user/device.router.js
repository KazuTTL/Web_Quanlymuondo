import { Router } from 'express'
import { asyncHandler } from '@/utils/helpers'
import validate from '@/app/middleware/user/validate'
import * as authMiddleware from '@/app/middleware/user/auth.middleware'
import * as deviceController from '@/app/controllers/user/device.controller'
import * as deviceRequest from '@/app/requests/user/device.request'

const deviceRouter = Router()

// Kiểm tra token cho tất cả các routes
deviceRouter.use(asyncHandler(authMiddleware.checkValidToken))

// Lấy danh sách thiết bị có sẵn
deviceRouter.get(
    '/',
    asyncHandler(deviceController.getAllDevices)
)

// Lấy danh sách thiết bị nổi bật
deviceRouter.get(
    '/top',
    asyncHandler(deviceController.getTopDevices)
)

// Lấy chi tiết thiết bị theo ID
deviceRouter.get(
    '/:id',
    asyncHandler(deviceController.getDeviceById)
)

// Lấy danh sách yêu cầu mượn của user
deviceRouter.get(
    '/my-requests',
    asyncHandler(deviceController.getMyBorrowRequests)
)

export default deviceRouter
